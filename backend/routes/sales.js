const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const SalesRecord = require('../models/SalesRecord');
const { Parser } = require('json2csv');

// @route   GET api/sales
// @desc    View sales history with filters
// @access  Private (Staff/Admin only)
router.get('/', auth, checkRole('staff', 'admin'), async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    let query = {};

    // Date filtering
    if (period) {
      const now = new Date();
      let start;

      switch (period) {
        case 'daily':
          start = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'weekly':
          start = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'monthly':
          start = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }

      if (start) {
        query.saleDate = { $gte: start };
      }
    } else if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sales = await SalesRecord.find(query)
      .populate('product', 'name sku price')
      .populate('customer', 'username email')
      .populate('processedBy', 'username')
      .populate('order')
      .sort({ saleDate: -1 });

    // Calculate summary
    const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);

    res.json({
      count: sales.length,
      totalSales,
      totalQuantity,
      sales
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/sales/export
// @desc    Export sales report as CSV
// @access  Private (Admin only)
router.get('/export', auth, checkRole('admin'), async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    let query = {};

    // Same date filtering logic
    if (period) {
      const now = new Date();
      let start;

      switch (period) {
        case 'daily':
          start = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'weekly':
          start = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'monthly':
          start = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }

      if (start) {
        query.saleDate = { $gte: start };
      }
    } else if (startDate && endDate) {
      query.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sales = await SalesRecord.find(query)
      .populate('product', 'name sku')
      .populate('customer', 'username email')
      .populate('processedBy', 'username')
      .sort({ saleDate: -1 });

    // Format data for CSV
    const csvData = sales.map(sale => ({
      'Sale Date': new Date(sale.saleDate).toLocaleString(),
      'Product': sale.product.name,
      'SKU': sale.product.sku,
      'Customer': sale.customer.username,
      'Customer Email': sale.customer.email,
      'Quantity': sale.quantity,
      'Total Amount': sale.totalAmount,
      'Payment Method': sale.paymentMethod,
      'Processed By': sale.processedBy.username,
      'Notes': sale.notes || ''
    }));

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`sales-report-${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/sales
// @desc    Manually record a sale
// @access  Private (Staff/Admin only)
router.post('/', auth, checkRole('staff', 'admin'), async (req, res) => {
  const { orderId, productId, customerId, quantity, totalAmount, paymentMethod, notes } = req.body;

  try {
    const salesRecord = new SalesRecord({
      order: orderId,
      product: productId,
      customer: customerId,
      processedBy: req.user.id,
      quantity,
      totalAmount,
      paymentMethod,
      notes
    });

    await salesRecord.save();
    await salesRecord.populate('product customer processedBy');

    res.json(salesRecord);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
