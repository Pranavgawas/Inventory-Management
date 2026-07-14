const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

const checkOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const count = await Order.countDocuments();
    console.log(`Total Orders: ${count}`);

    if (count > 0) {
      const orders = await Order.find().limit(5);
      console.log('Orders:', JSON.stringify(orders, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkOrders();
