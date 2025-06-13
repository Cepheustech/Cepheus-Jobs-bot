const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: String,
    company: String,
    description: String,
    skills: [String],
    url: String,
    postedAt: Date,
    jobType: String,
    level: String
});

module.exports = mongoose.model('Job', jobSchema);