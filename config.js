require('dotenv').config();

module.exports = {
    botToken: process.env.BOT_TOKEN,
    mongoUri: process.env.MONGO_URI,
};