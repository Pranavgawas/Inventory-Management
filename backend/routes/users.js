const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @route   GET api/users/staff
// @desc    Get all staff accounts
// @access  Private (Admin only)
router.get('/staff', auth, checkRole('admin'), async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('-password');
    res.json(staff);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/staff
// @desc    Create staff account
// @access  Private (Admin only)
router.post('/staff', auth, checkRole('admin'), async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      username,
      email,
      password,
      role: 'staff',
      isActive: true
    });

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/staff/:id
// @desc    Edit staff account
// @access  Private (Admin only)
router.put('/staff/:id', auth, checkRole('admin'), async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findById(req.params.id);
    
    if (!user || user.role !== 'staff') {
      return res.status(404).json({ msg: 'Staff member not found' });
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password; // Will be hashed by pre-save hook

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/staff/:id/disable
// @desc    Disable/Enable staff access
// @access  Private (Admin only)
router.put('/staff/:id/disable', auth, checkRole('admin'), async (req, res) => {
  const { isActive } = req.body;

  try {
    let user = await User.findById(req.params.id);
    
    if (!user || user.role !== 'staff') {
      return res.status(404).json({ msg: 'Staff member not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/users/staff/:id
// @desc    Delete staff account
// @access  Private (Admin only)
router.delete('/staff/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    
    if (!user || user.role !== 'staff') {
      return res.status(404).json({ msg: 'Staff member not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Staff member removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
