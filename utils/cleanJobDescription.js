
function cleanJobDescription(desc) {
    if (!desc || typeof desc !== 'string') return '';

    const headingRegex = /^(Company Description|Apply Description|Description|Company Overview|about us|who we are)\s*[:-]?\s*/i;
    const cleaned = desc.replace(headingRegex, '').trim();
    
    return cleaned;
}

module.exports = cleanJobDescription;