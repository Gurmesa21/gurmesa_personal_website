import fs from 'fs';
import path from 'path';

function fixUnknownInDir(dirPath: string) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixUnknownInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      const original = content;
      content = content.replace(/: unknown/g, ': any');
      content = content.replace(/as unknown/g, 'as any');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

fixUnknownInDir('C:/Users/Hp/Documents/Projects/Gurmesa_website/app');
fixUnknownInDir('C:/Users/Hp/Documents/Projects/Gurmesa_website/components');
fixUnknownInDir('C:/Users/Hp/Documents/Projects/Gurmesa_website/server');
fixUnknownInDir('C:/Users/Hp/Documents/Projects/Gurmesa_website/tests');

console.log('Done!');
