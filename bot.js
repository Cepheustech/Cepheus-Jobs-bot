const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const { botToken, mongoUri } = require('./config');
const User = require('./models/User');
const { callbackify } = require('util');
const Job = require('./models/Jobs');
const stripHtml = require('./utils/stripHtml');
require('./cron/notificationJobs'); // Import cron jobs for notifications
const cleanJobDescription = require('./utils/cleanJobDescription');

const cron = require('node-cron');
const fetchAllJobs = require('./fetchJobs/fetchAllJobs');
// Fetch jobs every 1 hours
cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled job fetch...');
    await fetchAllJobs();
});


mongoose.connect(mongoUri)
.then(()=> {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection Error:', err);
});

const bot = new TelegramBot(botToken, { polling: true });

bot.session = bot.session || {}; // track users currenct job index in memory


bot.onText(/\/start/, async(msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const firstName = msg.from.first_name;

    const existingUser = await User.findOne({telegramId});

    if(existingUser){
        bot.sendMessage(chatId, `Welcome back, ${existingUser.name}!`);
        showMainMenu(chatId);
        return;
    }

    //asking phone
    bot.sendMessage(chatId, " Please share your phone number to complete registeration:", {
        reply_markup: {
            keyboard: [[{
                text: 'Share Phone Number',
                request_contact: true
            }]],
            one_time_keyboard: true,
            resize_keyboard:true,
        }
    });

    // bot.sendMessage(chatId, `Hello ${firstName}! Welcome to the Remote Jobs Bot!`);
});

//handling contact

bot.on('contact',async(msg)=>{
    const contact = msg.contact;
    const telegramId = msg.from.id;
    const chatId = msg.chat.id;

    const newUser = new User({
        telegramId,
        name: `${contact.first_name || msg.from.first_name}`,
        phone: contact.phone_number,
    });

    await newUser.save();

    bot.sendMessage(chatId, `Thank you, ${newUser.name}! You're now registered.`);
    showMainMenu(chatId);
});

//main Menu

function showMainMenu(chatId) {
    bot.sendMessage(chatId, 'Main Menu:', {
        reply_markup: {
            keyboard: [
                ['Set My Preference', 'Schedule Update'],
                ['View Jobs', 'Saved'],
                ['Stop Notification', 'About Us']
            ],
            resize_keyboard: true
        }
    });
}

// Define job types and levels

const jobTypes = ['Software Development', 'Design', 'Customer Service', 'Marketing', 'Sales & Business', 'Project Management','Product', 'Data Analysis','DevOps','Human Resources','Writing','All others'];
const levels = ['Junior', 'Intermediate', 'Senior'];

// Set My Preference
bot.onText(/Set My Preference/, async (msg) =>{
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Choose your preferred job type:', {
        reply_markup: {
            inline_keyboard: jobTypes.map(type => [
                { text: type, callback_data: `pref_type_${type}`}
            ])
        }
    });
});

// Handle job type selection
bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const telegramId = callbackQuery.from.id;

    if(data.startsWith('pref_type_')){
        const selectedType = data.replace('pref_type_', '');

        bot.session = bot.session || {};
        bot.session[telegramId] = { jobType: selectedType };

        bot.sendMessage(chatId, `You selected job type: *${selectedType}* as job type.\n\nNow select your experience level:`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: levels.map(level => [
                    { text: level, callback_data: `pref_level_${level}` }
                ])
            }
        });
    }

    else if(data.startsWith('pref_level_')){
        const selectedLevel = data.replace('pref_level_', '');
        const jobType = bot.session?.[telegramId]?.jobType;
        if(!jobType){
            bot.sendMessage(chatId, 'Something went wrong. Please start again');
            return;
        }

        await User.findOneAndUpdate(
            { telegramId },
            { 
                preferences: {
                    jobType,
                    level: selectedLevel
                }
            },
            { new: true }
        );
        delete bot.session[telegramId];
        bot.sendMessage(chatId, `Preferences saved:\n\n*Job Type*: ${jobType}\n*Level*: ${selectedLevel}`, {
            parse_mode:'Markdown',
        });
    }

    //unsave and next saved job

    // if(data.startsWith('unsave_')){
    //     const jobId = data.replace('unsave_', '');
    //     await User.findOneAndUpdate(
    //         {telegramId},{$pull: { savejobs: jobId } }
    //     );
    //     bot.sendMessage(chatId, "Job unsaved");
    //     bot.session[telegramId].savedIndex++;
    //     savedSavedJob(chatId, telegramId);
    // }

    // if(data === 'next_saved'){
    //     bot.session[telegramId].savedIndex++;
    //     savedSavedJob(chatId, telegramId);
    // }

})

// Handle Schedule update button

bot.onText(/Schedule Update/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'choose when you`d like to receive job updates:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Morning (9 AM)', callback_data: 'notif_morning' }],
                [{ text: 'Afternoon (1 PM)', callback_data: 'notif_afternoon' }],
                [{ text: 'Every 6 Hours', callback_data: 'notif_6h' }]
            ]
        }
    });
});

bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const telegramId = callbackQuery.from.id;

    if(data.startsWith('notif_')){
        const preference = data.replace('notif_', '');
        await User.findOneAndUpdate(
            { telegramId },
            { notificationTime: preference },
            { new: true }
        );

        let label = {
            morning:'Morning (9 AM)',
            afternoon: 'Afternoon (1 PM)',
            '6h': 'Every 6 Hours'
        }
        bot.sendMessage(chatId, `Notification time set to: *${label[preference]}*`, {
            parse_mode: 'Markdown'
        });
    }
});

// Handle View Jobs button

bot.onText(/View Jobs/, async (msg)=>{
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    const user = await User.findOne({telegramId});
    if(!user || !user.preferences?.jobType || !user.preferences?.level){
        return bot.sendMessage(chatId, "Please set your preferences first using 'Set My Preference' option.");
    }
    const jobs = await Job.find({
        jobType: user.preferences.jobType,
        level: user.preferences.level,
        _id: { $nin: [...user.viewedJobs, ...user.dislikedJobs] }
    }).sort({postedAt: -1 }).lean();

    if(!jobs.length){
        return bot.sendMessage(chatId,"No jobs found matching your preferences yet.");
    }

    bot.session[telegramId] = {
        jobs,
        index: 0,
        currentJob: jobs[0]._id
    };

    sendJobCard(chatId, telegramId);
});

function sendJobCard(chatId, telegramId) {
    const session = bot.session[telegramId];
    if(!session || session.index >= session.jobs.length){
        return bot.sendMessage(chatId, "You`ve reached the end of available jobs for now.");
    }

    const job = session.jobs[session.index];
    const desc = stripHtml(job.description.slice(0, 1000));
    const cleanedDesc = cleanJobDescription(desc);

    const text = `*Job Title*: ${job.title}*\n*Company*: ${job.company}*\n Posted: ${new Date(job.postedAt).toDateString()}\n\n *Skills*: ${job.skills.join(', ')}\n\n *Company Description*\n${cleanedDesc}...`;

    bot.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{text: 'Apply', url:job.url}],
                [{text: 'Save', callback_data: `save_${job._id}` }, { text: 'Skip', callback_data: 'dislike'}]
            ]
        }
    });
}

// Handle Save and Dislike actions
bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const telegramId = callbackQuery.from.id;

    if(data.startsWith('save_')){
        const jobId = data.replace('save_', '');
        await User.findOneAndUpdate(
            { telegramId },
            { $addToSet: { savejobs: jobId, viewedJobs: jobId } }
        );
        bot.sendMessage(chatId, "Job saved successfully!");
        bot.session[telegramId].index++;
        sendJobCard(chatId, telegramId);
    }
    
    if(data === 'dislike') {
        const currentJob = bot.session[telegramId].currentJob;

        if(currentJob){
            await User.findOneAndUpdate(
                { telegramId },
                { $addToSet: { dislikedJobs: currentJob, viewedJobs: currentJob } }
            );
        }
       await bot.sendMessage(chatId, 'Skipped this job.');
        bot.session[telegramId].index++;
        sendJobCard(chatId, telegramId);
        return;
    }
});

// Handle saved jobs button
bot.onText(/Saved/, async (msg)=>{
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    const user = await User.findOne({telegramId});
    if(!user || !user.savejobs.length){
        return bot.sendMessage(chatId,"You haven't saved any jobs yet.");
    }

    const savejobs = await  Job.find({_id: {$in: user.savejobs} });

    if(!savejobs.length){
        return bot.sendMessage(chatId, "No matching job records found.");
    }

    bot.session[telegramId] = {
        savejobs,
        savedIndex: 0
    };
    savedSavedJob(chatId, telegramId);
});

function savedSavedJob(chatId, telegramId) {
    const session = bot.session[telegramId];
    const jobs = session.savejobs;
    const index = session.savedIndex;

    if(!jobs || index >= jobs.length){
        return bot.sendMessage(chatId,"You have reached the end of your saved jobs.");
    }

    const job = jobs[index];

    const text = `Saved Job*\n\n *${job.title}*\n *${job.company}*\n Posted: ${new Date(job.postedAt).toDateString()}\n\n *Skills*: ${job.skills.join(', ')}\n\n ${stripHtml(job.description.slice(0, 500))}...`;

    bot.sendMessage(chatId, text, {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Apply', url: job.url }],
                [{ text: 'Unsave', callback_data: `unsave_${job._id}` }, { text: 'Next', callback_data: 'next_saved' }]
            ]
        }
    });
}

bot.on('callback_query', async (callbackQuery) =>{
    const data = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const telegramId = callbackQuery.from.id;

    if(data.startsWith('unsave_')){
        const jobId = data.replace('unsave_', '');
        await User.findOneAndUpdate(
            {telegramId},{$pull: { savejobs: jobId } }
        );
        bot.sendMessage(chatId, "Job unsaved");
        bot.session[telegramId].savedIndex++;
        savedSavedJob(chatId, telegramId);
    }

    if(data === 'next_saved'){
        bot.session[telegramId].savedIndex++;
        savedSavedJob(chatId, telegramId);
    }
})

// handle stop notification button
bot.onText(/Stop Notification/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    const user = await User.findOne({telegramId});

    if(!user){
        return bot.sendMessage(chatId, "Please register first by pressing /start.");
    }

    if(!user.isNotificationon){
        await User.findOneAndUpdate(
        {telegramId},
        { isNotificationon: true }
       );
        return bot.sendMessage(chatId, "Notifications are Enabled.");

    }
    // Disable notifications
    if(user.isNotificationon){
        await User.findOneAndUpdate(
        {telegramId},
        { isNotificationon: false }
       );
        return bot.sendMessage(chatId, "Notifications are disabled.");
    }
    
    bot.sendMessage(chatId, "Job Notificaiton has been disabed. You can re-enable them anytime.");
});

