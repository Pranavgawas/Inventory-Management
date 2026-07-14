const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const Product = require('../models/Product');
const { validate, productValidators } = require('../middleware/validation');

// @route   GET api/products
// @desc    Get all products
// @access  Public (no authentication required)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ date: -1 });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/products
// @desc    Create a product
// @access  Private (Admin only)
router.post('/', auth, checkRole('admin'), validate(productValidators.createOrUpdate), async (req, res) => {
  const { name, sku, description, price, quantity, category } = req.body;

  try {
    let product = await Product.findOne({ sku });
    if (product) {
      return res.status(400).json({ msg: 'Product with this SKU already exists' });
    }

    const newProduct = new Product({
      user: req.user.id,
      name,
      sku,
      description,
      price,
      quantity,
      category
    });

    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/:id', auth, checkRole('admin'), validate(productValidators.createOrUpdate), async (req, res) => {
  const { name, sku, description, price, quantity, category } = req.body;

  // Build product object
  const productFields = {};
  if (name) productFields.name = name;
  if (sku) productFields.sku = sku;
  if (description) productFields.description = description;
  if (price) productFields.price = price;
  if (quantity) productFields.quantity = quantity;
  if (category) productFields.category = category;

  try {
    let product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ msg: 'Product not found' });

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: productFields },
      { new: true }
    );

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
