import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Get list of all tracked files from git with exact casing
const gitFilesOutput = execSync('git ls-files', { encoding: 'utf-8' });
const gitFiles = gitFilesOutput.split(/\r?\n/).filter(Boolean).map(f => f.replace(/\\/g, '/'));
const gitFilesSet = new Set(gitFiles);
const lowerToGitFileMap = new Map();

for (const file of gitFiles) {
  lowerToGitFileMap.set(file.toLowerCase(), file);
}

// Find all source files to scan
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const resolveExtensions = ['', '.ts', '.tsx', '.js', '.jsx', '.json', '.css', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];

function getSourceFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = fullPath.replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git' && entry.name !== 'ci-clone') {
        results.push(...getSourceFiles(fullPath));
      }
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(relPath);
    }
  }
  return results;
}

const sourceFiles = getSourceFiles(process.cwd());

const importRegex = /(?:import|export)\s+(?:[\s\S]*?from\s+)?['"]([./@][^'"]+)['"]/g;
const dynamicImportRegex = /import\s*\(\s*['"]([./@][^'"]+)['"]\s*\)/g;
const requireRegex = /require\s*\(\s*['"]([./@][^'"]+)['"]\s*\)/g;

let mismatchCount = 0;
const mismatches = [];

for (const sourceFile of sourceFiles) {
  const content = fs.readFileSync(sourceFile, 'utf-8');
  const relSource = path.relative(process.cwd(), sourceFile).replace(/\\/g, '/');

  const matches = [
    ...content.matchAll(importRegex),
    ...content.matchAll(dynamicImportRegex),
    ...content.matchAll(requireRegex)
  ];

  for (const match of matches) {
    const importSpecifier = match[1];
    let resolvedBase = null;

    if (importSpecifier.startsWith('@/')) {
      // Root-relative
      resolvedBase = importSpecifier.slice(2);
    } else if (importSpecifier.startsWith('.')) {
      // Relative to source file directory
      const dir = path.dirname(relSource);
      resolvedBase = path.normalize(path.join(dir, importSpecifier)).replace(/\\/g, '/');
    }

    if (resolvedBase) {
      let matchedGitFile = null;
      let matchedExact = false;

      for (const ext of resolveExtensions) {
        const candidate = resolvedBase + ext;
        const candidateLower = candidate.toLowerCase();

        if (gitFilesSet.has(candidate)) {
          matchedExact = true;
          break;
        } else if (lowerToGitFileMap.has(candidateLower)) {
          matchedGitFile = lowerToGitFileMap.get(candidateLower);
        }
      }

      if (!matchedExact && matchedGitFile) {
        mismatches.push({
          source: relSource,
          import: importSpecifier,
          gitCase: matchedGitFile
        });
        mismatchCount++;
      }
    }
  }
}

if (mismatchCount > 0) {
  console.error(`Found ${mismatchCount} import case mismatch(es):`);
  for (const m of mismatches) {
    console.error(`  ${m.source}: imports "${m.import}", but git has "${m.gitCase}"`);
  }
  process.exit(1);
} else {
  console.log(`Case check PASSED: All imports match git ls-files casing exactly across ${sourceFiles.length} files.`);
  process.exit(0);
}
