import fs from 'fs';
import path from 'path';

function fixAnyInDir(dirPath: string) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixAnyInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      const original = content;
      content = content.replace(/: any/g, ': unknown');
      content = content.replace(/as any/g, 'as unknown');
      
      // Fix quotes in specific files
      if (fullPath.includes('page.tsx')) {
         content = content.replace(/"\{testimonial\.content\}"/g, '&quot;{testimonial.content}&quot;');
      }
      if (fullPath.includes('not-found.tsx')) {
         content = content.replace(/couldn't/g, 'couldn&apos;t');
      }
      if (fullPath.includes('TestimonialList.tsx')) {
         content = content.replace(/"\{t\.content\}"/g, '&quot;{t.content}&quot;');
      }

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

fixAnyInDir('C:/Users/Hp/Documents/Projects/Gurmesa_website/app');
fixAnyInDir('C:/Users/Hp/Documents/Projects/Gurmesa_website/components');
fixAnyInDir('C:/Users/Hp/Documents/Projects/Gurmesa_website/server');
fixAnyInDir('C:/Users/Hp/Documents/Projects/Gurmesa_website/tests');

// Fix the missing blockquote
const testimonialPath = 'C:/Users/Hp/Documents/Projects/Gurmesa_website/app/(admin)/admin/testimonials/[id]/page.tsx';
let testimonialContent = fs.readFileSync(testimonialPath, 'utf-8');
testimonialContent = testimonialContent.replace(
  /            &quot;\{t\.content\}&quot;/,
  `          <blockquote className="mt-4 p-4 italic border-l-4 bg-gray-50 text-gray-700">\n            &quot;{t.content}&quot;\n          </blockquote>`
);
fs.writeFileSync(testimonialPath, testimonialContent);

console.log('Done!');
