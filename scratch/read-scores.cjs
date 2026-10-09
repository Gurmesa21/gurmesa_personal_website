const fs = require('fs');
['home', 'blog-first-post', 'services', 'work-os-dashboard'].forEach(page => {
  const data = JSON.parse(fs.readFileSync(`docs/evidence/day13c/lighthouse-delta2-${page}.json`));
  console.log(`${page}:`, Object.values(data.categories).map(c => `${c.title}: ${c.score * 100}`));
});
