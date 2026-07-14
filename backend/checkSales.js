const mongoose = require('mongoose');
const SalesRecord = require('./models/SalesRecord');
require('dotenv').config();

const checkSales = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const count = await SalesRecord.countDocuments();
    console.log(`Total Sales Records: ${count}`);

    if (count > 0) {
      const sales = await SalesRecord.find().sort({ saleDate: -1 }).limit(5);
      console.log('Latest 5 Sales:', JSON.stringify(sales, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkSales();
