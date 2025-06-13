require('dotenv').config();
const mongoose = require('mongoose');
const fetchAllJobs = require('../fetchJobs/fetchAllJobs');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
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
