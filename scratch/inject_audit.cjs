const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, '../server/services');
const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('Service.ts'));

for (const file of files) {
  if (file === 'blogService.ts' || file === 'siteSettingService.ts') continue;
  if (file === 'mediaService.ts') continue; // Not created yet

  const filePath = path.join(servicesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Inject import
  if (!content.includes(`import { logAdminAction }`)) {
    content = content.replace(/import \{ auth \}.*?;/, (match) => {
      return match + "\nimport { logAdminAction } from '@/lib/audit';";
    });
  }

  // Inject create
  content = content.replace(/(export const create[A-Za-z]+ = async .*? => \{\s+const session = await auth\(\);\s+if \(!session\) throw new Error\('Unauthorized'\);\s+)return ([a-zA-Z]+Repository\.create\(\{ data \}\);)/g, (match, p1, p2) => {
    return p1 + `const result = await ${p2.slice(0, -1)}\n  await logAdminAction({ action: 'CREATE', entity: '${file.replace('Service.ts', '')}', entityId: result.id });\n  return result;`;
  });

  // Inject update
  content = content.replace(/(export const update[A-Za-z]+ = async \(id: string, data: .*? => \{\s+const session = await auth\(\);\s+if \(!session\) throw new Error\('Unauthorized'\);\s+)return ([a-zA-Z]+Repository\.update\(\{ where: \{ id \}, data \}\);)/g, (match, p1, p2) => {
    return p1 + `const result = await ${p2.slice(0, -1)}\n  await logAdminAction({ action: 'UPDATE', entity: '${file.replace('Service.ts', '')}', entityId: id });\n  return result;`;
  });

  // Inject delete
  content = content.replace(/(export const delete[A-Za-z]+ = async \(id: string\) => \{\s+const session = await auth\(\);\s+if \(!session\) throw new Error\('Unauthorized'\);\s+)return ([a-zA-Z]+Repository\.delete\(\{ where: \{ id \} \}\);)/g, (match, p1, p2) => {
    return p1 + `const result = await ${p2.slice(0, -1)}\n  await logAdminAction({ action: 'DELETE', entity: '${file.replace('Service.ts', '')}', entityId: id });\n  return result;`;
  });

  fs.writeFileSync(filePath, content);
}
console.log('Injection done');
