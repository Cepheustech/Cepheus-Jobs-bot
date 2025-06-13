const axios = require('axios');
const Parser = require('rss-parser');
const rssParser = new Parser();
const stripHtml = require('../utils/stripHtml');

function parseLevelFromTitle(title) {
    title = title.toLowerCase();
    if (title.includes('junior')) return 'Junior';
    if (title.includes('senior') || title.includes('mid-lead')) return 'Senior';
    return 'Intermediate';
}

module.exports = [
    {
        name: 'Remotive',
        fetch: async () => {
            const res = await axios.get('https://remotive.com/api/remote-jobs');
            return res.data.jobs.map(job => ({
                title: job.title,
                company: job.company_name,
                description: stripHtml(job.description),
                skills: job.tags || [],
                url: job.url,
                postedAt: new Date(job.publication_date),
                jobType: job.job_type,
                level: parseLevelFromTitle(job.title)
            }));
        }
    },
    {
        name: 'WeWorkRemotely',
        fetch: async () => {
            const feed = await rssParser.parseURL('https://weworkremotely.com/remote-jobs.rss', {
                headers: {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36'
                }
            });
            return feed.items.map(item => ({
                title: item.title,
                company: item.title.split('-')[0].trim(),
                description: stripHtml(item.contentSnippet || ''),
                skills: [],
                url: item.link,
                postedAt: new Date(item.pubDate),
                jobType: 'Remote', // WeWorkRemotely typically lists remote jobs
                level: parseLevelFromTitle(item.title) 
            }));
        }
    }
];