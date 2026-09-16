const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace standard console.error blocks for Gemini with something that checks for 429/503
const replacements = [
  {
    regex: /console\.error\('Error during AI duplicate evaluation:', err\);/g,
    replace: `
    const isQuota = err?.status === 429 || err?.status === 503 || err?.message?.includes('429') || err?.message?.includes('503');
    if (isQuota) {
      console.warn('Gemini API limit/unavailable (duplicate eval). Using fallback.');
    } else {
      console.error('Error during AI duplicate evaluation:', err?.message || err);
    }
`
  },
  {
    regex: /console\.error\('Failed to generate image via Gemini API:', err\);/g,
    replace: `
          const isQuota = err?.status === 429 || err?.status === 503 || err?.message?.includes('429') || err?.message?.includes('503');
          if (isQuota) {
            console.warn('Gemini API limit/unavailable (image gen). Falling back to unsplash.');
          } else {
            console.error('Failed to generate image via Gemini API:', err?.message || err);
          }
`
  },
  {
    regex: /console\.error\('Lỗi phân tích AI moderation:', error\);/g,
    replace: `
        const isQuota = error?.status === 429 || error?.status === 503 || error?.message?.includes('429') || error?.message?.includes('503');
        if (isQuota) {
          console.warn('Gemini API limit/unavailable (moderation). Allowing manual review.');
        } else {
          console.error('Lỗi phân tích AI moderation:', error?.message || error);
        }
`
  }
];

replacements.forEach(({regex, replace}) => {
  content = content.replace(regex, replace);
});

// Since we already patched the one in suggest-recipes and submit-recipe, let's verify if there are any others.
// Also check if any generic console.error logging `error` object remains.
// In submit-recipe: console.error('Error submitting recipe:', error);
content = content.replace(/console\.error\('Error submitting recipe:', error\);/g, `console.error('Error submitting recipe:', error?.message || error);`);

// In the other moderation block:
content = content.replace(/console\.error\('Lỗi trong quá trình kiểm duyệt AI:', err\);/g, `
          const isQuota = err?.status === 429 || err?.status === 503 || err?.message?.includes('429') || err?.message?.includes('503');
          if (isQuota) {
            console.warn('Gemini API limit/unavailable (admin moderation). Using fallback.');
          } else {
            console.error('Lỗi trong quá trình kiểm duyệt AI:', err?.message || err);
          }
`);


fs.writeFileSync('server.ts', content);
