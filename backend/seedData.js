const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const SalesRecord = require('./models/SalesRecord');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Clear existing data (optional)
    await User.deleteMany({});
    await Product.deleteMany({});
    await SalesRecord.deleteMany({});
    console.log('Cleared existing data');

    // Create a test user
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    await user.save();
    console.log('Created test user');

    // Create test products
    const product1 = new Product({
      name: 'Laptop',
      sku: 'LAP001',
      description: 'High-performance laptop',
      price: 50000,
      quantity: 10,
      category: 'Electronics',
      user: user._id
    });

    const product2 = new Product({
      name: 'Mouse',
      sku: 'MOU001',
      description: 'Wireless mouse',
      price: 500,
      quantity: 50,
      category: 'Accessories',
      user: user._id
    });

    await product1.save();
    await product2.save();
    console.log('Created test products');

    // Create a test sales record
    const sale = new SalesRecord({
      product: product1._id,
      user: user._id,
      quantity: 2,
      totalAmount: 100000,
      paymentMethod: 'Card',
      notes: 'Test sale'
    });
    await sale.save();
    console.log('Created test sales record');

    console.log('\n✅ Sample data inserted successfully!');
    console.log('You can now check your MongoDB Atlas dashboard to see:');
    console.log('- users collection');
    console.log('- products collection');
    console.log('- salesrecords collection');
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
