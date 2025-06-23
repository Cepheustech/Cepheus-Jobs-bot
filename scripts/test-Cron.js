// cron/testCron.js

const mongoose = require('mongoose');
const bot = require('../bot');
const User = require('../models/User');

async function runTest() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)

        console.log("✅ Connected to MongoDB");

        // Find one user to test bot
        const user = await User.findOne();
        if (user) {
            await bot.sendMessage(user.telegramId, `🚀 Test cron job ran at ${new Date().toLocaleString()}`);
            console.log(`✅ Message sent to ${user.telegramId}`);
        } else {
            console.log("⚠️ No users found to message.");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("❌ Error in testCron.js:", err);
    }
}

runTest();
