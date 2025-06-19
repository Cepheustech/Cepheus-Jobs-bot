const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: {type: Number, required: true, unique: true },
    name: String,
    phone: String,
    preferences: {
        jobType: String,
        level: { type: String, enum: ['Junior', 'Intermediate', 'Senior'] },
    },
  
    isNotificationon: { type: Boolean, default: true},
    notificationTime: {
        type: String,
        enum: ['morning', 'afternoon', '6h'],
        default: 'morning'
    },
    savejobs: [String],
    viewedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    dislikedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);