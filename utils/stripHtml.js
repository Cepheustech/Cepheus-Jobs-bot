const { convert } = require('html-to-text');

function stripHtml(html) {
  return convert(html, {
    wordwrap: 130,
    selectors: [
      { selector: 'img', format: 'skip' }, // skip images
      { selector: 'a', options: { ignoreHref: true } }, // show link text but ignore actual link
    ],
    limits: {
      maxInputLength: 10000, // safety limit
    }
  });
}

module.exports = stripHtml;
