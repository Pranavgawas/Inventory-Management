const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const Product = require('../models/Product');

// @route   GET api/products/low-stock
// @desc    Get products with low stock (quantity <= threshold)
// @access  Private (Staff/Admin only)
router.get('/low-stock', auth, checkRole('staff', 'admin'), async (req, res) => {
  try {
    const threshold = req.query.threshold || 10;
    
    const lowStockProducts = await Product.find({
      quantity: { $lte: threshold }
    }).sort({ quantity: 1 });

    res.json({
      count: lowStockProducts.length,
      threshold,
      products: lowStockProducts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/products/stock-summary
// @desc    Get stock level summary
// @access  Private (Staff/Admin only)
router.get('/stock-summary', auth, checkRole('staff', 'admin'), async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({ quantity: 0 });
    const lowStock = await Product.countDocuments({ quantity: { $gt: 0, $lte: 10 } });
    const inStock = await Product.countDocuments({ quantity: { $gt: 10 } });

    const totalValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      }
    ]);

    res.json({
      totalProducts,
      outOfStock,
      lowStock,
      inStock,
      totalInventoryValue: totalValue[0]?.total || 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
