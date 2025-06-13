const mongoose = require('mongoose');
const Job = require('../models/Jobs');
const sources = require('./sources');

async function fetchAllJobs(){
    console.log('Job fetching started');
    try {
        for(const source of sources){
            try {
                const jobs = await source.fetch();
                let saved = 0;

                for (const jobData of jobs){
                    const result = await Job.updateOne(
                        {url: jobData.url},
                        {$setOnInsert: jobData},
                        {upsert: true}
                    );
                    if (result.upsertedCount > 0) saved++;
                }

                console.log(`[${source.name}] ${saved}/${jobs.length} new jobs saved.`);
            } catch (err){
                console.error(`[${source.name}] Error:`, err.message);
            }
        }
    } catch (err) {
        console.error('[Job Fetch] Fatal error:', err.message);
    }
}

module.exports = fetchAllJobs;