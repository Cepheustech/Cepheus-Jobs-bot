const cron = require('node-cron');
const sendJobUpdate = require('../utils/sendJobUpdate.js');

cron.schedule('0 */6 * * *', () => {
    sendJobUpdate('6h');
});

cron.schedule('0 9 * * *', () => {
    sendJobUpdate('morning');
});

cron.schedule('0 15 * * *', () => {
    sendJobUpdate('afternoon');
});