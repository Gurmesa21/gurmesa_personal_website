const fs = require('fs');
const path = require('path');

function fixImports(dir) {
  let entries = fs.readdirSync(dir, { withFileTypes: true });
  for (let entry of entries) {
    let fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fixImports(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content.replace(/from\s+['"](\.\.\/)+([^'"]+)['"]/g, (match, p1, p2) => {
        return "from '@/" + p2 + "'";
      });
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Updated', fullPath);
      }
    }
  }
}

fixImports('app/[locale]/(public)');
