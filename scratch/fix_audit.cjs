const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, '../server/services');
const files = [
  'adminOverviewService.ts',
  'inquiryService.ts',
  'profileService.ts',
  'projectService.ts',
  'serviceService.ts',
  'technologyService.ts',
  'testimonialService.ts'
];

for (const file of files) {
  const filePath = path.join(servicesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let entityBase = file.replace('Service.ts', '');
  entityBase = entityBase.charAt(0).toUpperCase() + entityBase.slice(1);

  // Replace return prisma...create({ ... })
  content = content.replace(/(return\s+([a-zA-Z0-9\._]+)\.(create|update|delete|upsert)\(\s*\{[\s\S]*?\}\s*\)\s*;?)/g, (match, fullMatch, repo, action) => {
    // If it's a "findMany" or "findUnique", ignore. But we strictly matched create|update|delete|upsert.
    // Wait, what if there's multiple in the same file?
    let auditAction = action.toUpperCase();
    if (auditAction === 'UPSERT') auditAction = 'UPDATE';
    
    // Some returns don't have semicolon
    const cleanMatch = fullMatch.replace(/;?$/, '');
    
    return `const result = await ${cleanMatch};\n  await logAdminAction({ action: '${auditAction}', entity: '${entityBase}', entityId: result?.id || 'unknown' });\n  return result;`;
  });

  fs.writeFileSync(filePath, content);
}
console.log('Fixed audit logs');
