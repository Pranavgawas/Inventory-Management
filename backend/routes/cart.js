const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { validate, cartValidators } = require('../middleware/validation');

// @route   GET api/cart
// @desc    Get customer's cart
// @access  Private (Customer only)
router.get('/', auth, checkRole('customer'), async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }
    
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/cart
// @desc    Add item to cart
// @access  Private (Customer only)
router.post('/', auth, checkRole('customer'), validate(cartValidators.addOrUpdate), async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    
    let newQuantity = quantity;
    if (itemIndex > -1) {
      newQuantity = cart.items[itemIndex].quantity + quantity;
    }

    if (product.quantity < newQuantity) {
      return res.status(400).json({ msg: 'Insufficient stock' });
    }
    
    if (itemIndex > -1) {
      // Update quantity
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/cart/:itemId
// @desc    Update cart item quantity
// @access  Private (Customer only)
router.put('/:itemId', auth, checkRole('customer'), validate(cartValidators.addOrUpdate), async (req, res) => {
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found in cart' });
    }

    const product = await Product.findById(item.product);
    if (product.quantity < quantity) {
      return res.status(400).json({ msg: 'Insufficient stock' });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/cart/:itemId
// @desc    Remove item from cart
// @access  Private (Customer only)
router.delete('/:itemId', auth, checkRole('customer'), async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/cart
// @desc    Clear entire cart
// @access  Private (Customer only)
router.delete('/', auth, checkRole('customer'), async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
