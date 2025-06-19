const User = require('../models/User');
const Job = require('../models/Jobs');
const bot = require('../bot');

async function sendJobUpdate(pref){
    const users = await User.find({
        notificationTime: pref,
        isNotificationon: {$ne: false}
    });

    for (const user of users){
        const job = await job.findOne({
            jobType: user.preferences.jobType,
            level: user.preferences.level,
            _id: {$nin: user.viewedJobs, $nin: user.dislikedJobs, $nin: user.savejobs}
        }).sort({postedAt: -1});
    
        if (job) {
            const text = `*${job.title}* at *${job.company}*\n\n${job.description.slice(0, 400)}...`;
            bot.sendMessage(user.telegramId, text, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Apply', url: job.url}],
                        [{text: 'Save', callback_data: `save_${job._id}`}, {text: 'Skip', callback_data: 'dislike'}]
                    ]
                }
            });
        }else{
            bot.sendMessage(use.telegramId, "No new jobs matching your preference right now, Please check later.");
        }
    }
}

module.exports = sendJobUpdate;
