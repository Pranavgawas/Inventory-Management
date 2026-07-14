const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const SalesRecord = require('../models/SalesRecord');
const { validate, orderValidators } = require('../middleware/validation');

// @route   POST api/orders
// @desc    Place order from cart
// @access  Private (Customer only)
router.post('/', auth, checkRole('customer'), async (req, res) => {
  const { paymentMethod, selectedItems } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product').session(session);
    
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    // Determine items to process
    console.log('Received selectedItems:', selectedItems);
    console.log('Cart items IDs:', cart.items.map(i => i._id.toString()));
    
    let itemsToProcess = [];
    if (selectedItems && Array.isArray(selectedItems) && selectedItems.length > 0) {
      itemsToProcess = cart.items.filter(item => selectedItems.includes(item._id.toString()));
      console.log('Items to process (filtered):', itemsToProcess.length);
      if (itemsToProcess.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ msg: 'No valid items selected from cart' });
      }
    } else {
      console.log('No selectedItems provided, processing all cart items');
      itemsToProcess = cart.items; // Default to all items
    }

    // Verify and reserve stock
    for (const item of itemsToProcess) {
      // Refresh product data to ensure latest stock
      const product = await Product.findById(item.product._id).session(session);
      
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ msg: `Product ${item.product.name} not found` });
      }

      if (product.quantity < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          msg: `Insufficient stock for ${product.name}` 
        });
      }

      // Deduct stock
      product.quantity -= item.quantity;
      await product.save({ session });
    }

    // Create order items
    const orderItems = itemsToProcess.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
      subtotal: item.product.price * item.quantity
    }));

    // Calculate total
    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Create order
    const order = new Order({
      customer: req.user.id,
      items: orderItems,
      totalAmount,
      status: 'pending',
      paymentMethod: paymentMethod || 'Cash'
    });

    await order.save({ session });

    // Update cart
    if (selectedItems && selectedItems.length > 0) {
      // Remove ONLY processed items
      cart.items = cart.items.filter(item => !selectedItems.includes(item._id.toString()));
    } else {
      // Clear entire cart
      cart.items = [];
    }
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    await order.populate('items.product');
    res.json(order);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders
// @desc    Get orders (customer: own orders, staff/admin: all orders)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let orders;
    
    if (req.user.role === 'customer') {
      orders = await Order.find({ customer: req.user.id })
        .populate('items.product')
        .populate('customer', 'username email')
        .populate('processedBy', 'username')
        .sort({ orderDate: -1 });
    } else {
      // Staff and Admin can see all orders
      orders = await Order.find()
        .populate('items.product')
        .populate('customer', 'username email')
        .populate('processedBy', 'username')
        .sort({ orderDate: -1 });
    }

    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('customer', 'username email')
      .populate('processedBy', 'username');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Customers can only view their own orders
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/orders/:id/process
// @desc    Process order (update status and create sales records)
// @access  Private (Staff/Admin only)
router.put('/:id/process', auth, checkRole('staff', 'admin'), validate(orderValidators.process), async (req, res) => {
  const { status, notes, paymentMethod } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).populate('items.product').session(session);
    
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Logic: 
    // If status is 'completed' and previous status was not 'completed', create sales record.
    // Stock is ALREADY deducted on placement.
    // If status is 'cancelled' and previous status was NOT 'cancelled', RETURN stock.
    
    if (status === 'cancelled' && order.status !== 'cancelled') {
      // Return stock
      for (const item of order.items) {
        const product = await Product.findById(item.product._id).session(session);
        if (product) {
          product.quantity += item.quantity;
          await product.save({ session });
        }
      }
    }

    // Update order status
    order.status = status || 'confirmed';
    order.processedBy = req.user.id;
    order.notes = notes;

    if (status === 'completed' && !order.completedDate) {
      order.completedDate = Date.now();

      // Create sales records
      for (const item of order.items) {
        // Create sales record
        const salesRecord = new SalesRecord({
          order: order._id,
          product: item.product._id,
          customer: order.customer,
          processedBy: req.user.id,
          quantity: item.quantity,
          totalAmount: item.subtotal,
          paymentMethod: order.paymentMethod, // Use order's payment method
          notes: notes
        });

        await salesRecord.save({ session });
      }
    }

    await order.save({ session });
    
    await session.commitTransaction();
    session.endSession();

    await order.populate('customer', 'username email');
    await order.populate('processedBy', 'username');

    res.json(order);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
