require('dotenv').config();
const mongoose = require('mongoose');
const fetchAllJobs = require('../fetchJobs/fetchAllJobs');

const options ={
  serverSelectionTimeoutMS: 50000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  family: 4, // Use IPv4
}
async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log('✅ Connected to MongoDB');

    await fetchAllJobs();

  } catch (err) {
    console.error('❌ Failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed');
  }
}

run();
