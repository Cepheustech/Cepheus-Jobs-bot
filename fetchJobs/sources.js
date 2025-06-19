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
            const res = await axios.get('https://remotive.com/api/remote-jobs?category=software-dev');
            return res.data.jobs.map(job => ({
                title: job.title,
                company: job.company_name,
                description: stripHtml(job.description),
                skills: job.tags || [],
                url: job.url,
                postedAt: new Date(job.publication_date),
                jobType: "Software Development", // Assuming all jobs are in software development
                level: parseLevelFromTitle(job.title)
            }));
        }
    },
    {
        name: 'Remotive',
        fetch: async () => {
            const res = await axios.get('https://remotive.com/api/remote-jobs?category=customer-support');
            return res.data.jobs.map(job => ({
                title: job.title,
                company: job.company_name,
                description: stripHtml(job.description),
                skills: job.tags || [],
                url: job.url,
                postedAt: new Date(job.publication_date),
                jobType: "Customer Service",
                level: parseLevelFromTitle(job.title)
            }));
        }
    },
    {
        name: 'Remotive',
        fetch: async () => {
            const res = await axios.get('https://remotive.com/api/remote-jobs?category=design');
            return res.data.jobs.map(job => ({
                title: job.title,
                company: job.company_name,
                description: stripHtml(job.description),
                skills: job.tags || [],
                url: job.url,
                postedAt: new Date(job.publication_date),
                jobType: "Design",
                level: parseLevelFromTitle(job.title)
            }));
        }
    },
    {
        name: 'Remotive',
        fetch: async () => {
            const res = await axios.get('https://remotive.com/api/remote-jobs?category=marketing');
            return res.data.jobs.map(job => ({
                title: job.title,
                company: job.company_name,
                description: stripHtml(job.description),
                skills: job.tags || [],
                url: job.url,
                postedAt: new Date(job.publication_date),
                jobType: "Marketing",
                level: parseLevelFromTitle(job.title)
            }));
        }
    },
    {
        name: 'Remotive',
        fetch: async () => {
            const res = await axios.get('https://remotive.com/api/remote-jobs?category=sales-business');
            return res.data.jobs.map(job => ({
                title: job.title,
                company: job.company_name,
                description: stripHtml(job.description),
                skills: job.tags || [],
                url: job.url,
                postedAt: new Date(job.publication_date),
                jobType: "Sales & Business",
                level: parseLevelFromTitle(job.title)
            }));
        }
    },
    {
        name: 'Remotive',
        fetch: async () => {
            const res = await axios.get('https://remotive.com/api/remote-jobs?category=project-management');
            return res.data.jobs.map(job => ({
                title: job.title,
                company: job.company_name,
                description: stripHtml(job.description),
                skills: job.tags || [],
                url: job.url,
                postedAt: new Date(job.publication_date),
                jobType: "Project Management",
                level: parseLevelFromTitle(job.title)
            }));
        }
    },
    {
        name: 'Remotive',
        fetch: async () => {
            const res = await axios.get('https://remotive.com/api/remote-jobs?category=product');
            return res.data.jobs.map(job => ({
                title: job.title,
                company: job.company_name,
                description: stripHtml(job.description),
                skills: job.tags || [],
                url: job.url,
                postedAt: new Date(job.publication_date),
                jobType: "Product",
                level: parseLevelFromTitle(job.title)
            }));
        }
    },
    {
        name: 'Remotive',
        fetch: async () => {
            const res = await axios.get('https://remotive.com/api/remote-jobs?category=data');
            return res.data.jobs.map(job => ({
                title: job.title,
                company: job.company_name,
                description: stripHtml(job.description),
                skills: job.tags || [],
                url: job.url,
                postedAt: new Date(job.publication_date),
                jobType: "Data Analysis",
                level: parseLevelFromTitle(job.title)
            }));
        }
    },
    {
        name: 'Remotive',
        fetch: async () => {
            const res = await axios.get('https://remotive.com/api/remote-jobs?category=devops');
            return res.data.jobs.map(job => ({
                title: job.title,
                company: job.company_name,
                description: stripHtml(job.description),
                skills: job.tags || [],
                url: job.url,
                postedAt: new Date(job.publication_date),
                jobType: "DevOps",
                level: parseLevelFromTitle(job.title)
            }));
        }
    },
    {
        name: 'Remotive',
        fetch: async () => {
            const res = await axios.get('https://remotive.com/api/remote-jobs?category=hr');
            return res.data.jobs.map(job => ({
                title: job.title,
                company: job.company_name,
                description: stripHtml(job.description),
                skills: job.tags || [],
                url: job.url,
                postedAt: new Date(job.publication_date),
                jobType: "Human Resources",
                level: parseLevelFromTitle(job.title)
            }));
        }
    },
    {
        name: 'Remotive',
        fetch: async () => {
            const res = await axios.get('https://remotive.com/api/remote-jobs?category=writing');
            return res.data.jobs.map(job => ({
                title: job.title,
                company: job.company_name,
                description: stripHtml(job.description),
                skills: job.tags || [],
                url: job.url,
                postedAt: new Date(job.publication_date),
                jobType: "Writing",
                level: parseLevelFromTitle(job.title)
            }));
        }
    },
    {
        name: 'Remotive',
        fetch: async () => {
            const res = await axios.get('https://remotive.com/api/remote-jobs?category=all-others');
            return res.data.jobs.map(job => ({
                title: job.title,
                company: job.company_name,
                description: stripHtml(job.description),
                skills: job.tags || [],
                url: job.url,
                postedAt: new Date(job.publication_date),
                jobType: "All others",
                level: parseLevelFromTitle(job.title)
            }));
        }
    }
    // {
    //     name: 'WeWorkRemotely',
    //     fetch: async () => {
    //         const feed = await rssParser.parseURL('https://weworkremotely.com/remote-jobs.rss', {
    //             headers: {
    //                   'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36'
    //             }
    //         });
    //         return feed.items.map(item => ({
    //             title: item.title,
    //             company: item.title.split('-')[0].trim(),
    //             description: stripHtml(item.contentSnippet || ''),
    //             skills: [],
    //             url: item.link,
    //             postedAt: new Date(item.pubDate),
    //             jobType: 'Remote', // WeWorkRemotely typically lists remote jobs
    //             level: parseLevelFromTitle(item.title) 
    //         }));
    //     }
    // }
];