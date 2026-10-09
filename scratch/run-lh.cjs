const { execSync } = require('child_process');
const fs = require('fs');

const pages = [
  { name: 'home', path: '/' },
  { name: 'blog-first-post', path: '/blog/first-post' },
  { name: 'services', path: '/services' },
  { name: 'work-os-dashboard', path: '/work/os-dashboard' }
];

const results = {};

for (const page of pages) {
  console.log(`Running lighthouse on ${page.name}...`);
  try {
    execSync(`npx lighthouse http://localhost:3000${page.path} --output json --output-path ./scratch/lh-${page.name}.json --chrome-flags="--headless"`, { stdio: 'inherit' });
    const data = JSON.parse(fs.readFileSync(`./scratch/lh-${page.name}.json`, 'utf8'));
    results[page.name] = Object.values(data.categories).map(c => `${c.title}: ${Math.round(c.score * 100)}`);
  } catch (e) {
    console.error(`Error on ${page.name}:`, e.message);
  }
}

console.log("\nLighthouse Results:");
console.log(JSON.stringify(results, null, 2));
