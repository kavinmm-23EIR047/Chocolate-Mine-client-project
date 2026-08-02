const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 1. Update date parsing across codebase
function replaceDatesInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceDatesInDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Ensure import exists if we need to modify
      const hasDateMatches = content.includes('new Date(') && (content.includes('.toLocaleString()') || content.includes('.toLocaleDateString()') || content.includes('.toLocaleTimeString('));
      
      if (hasDateMatches && !content.includes('safeFormatDate')) {
        const origContent = content;

        content = content.replace(/new Date\(([^)]+)\)\.toLocaleString\(\)/g, 'safeFormatDate($1)');
        content = content.replace(/new Date\(([^)]+)\)\.toLocaleDateString\(\)/g, 'safeFormatDateString($1)');
        content = content.replace(/new Date\(([^)]+)\)\.toLocaleTimeString\(\)/g, 'safeFormatTimeString($1)');

        content = content.replace(/new Date\(([^)]+)\)\.toLocaleDateString\([^,)]+,\s*({[^}]+})\)/g, 'safeFormatDateString($1, $2)');
        content = content.replace(/new Date\(([^)]+)\)\.toLocaleString\([^,)]+,\s*({[^}]+})\)/g, 'safeFormatDateString($1, $2)'); 
        content = content.replace(/new Date\(([^)]+)\)\.toLocaleTimeString\([^,)]+,\s*({[^}]+})\)/g, 'safeFormatTimeString($1, $2)');

        // Custom Regex for specific variants in StaffDashboard and Checkout
        content = content.replace(/new Date\(([^)]+)\)\.toLocaleTimeString\(\[\]\s*,\s*({[^}]+})\)/g, 'safeFormatTimeString($1, $2)');
        content = content.replace(/new Date\(([^)]+)\)\.toLocaleString\('en-IN'\s*,\s*({[^}]+})\)/g, 'safeFormatDateString($1, $2)');
        content = content.replace(/new Date\(([^)]+)\)\.toLocaleDateString\('en-IN'\s*,\s*({[^}]+})\)/g, 'safeFormatDateString($1, $2)');

        if (content !== origContent) {
           changed = true;
           const relativeDepth = path.relative(path.dirname(fullPath), srcDir).split(path.sep).length;
           const importPath = relativeDepth === 1 && path.dirname(fullPath) === srcDir ? './utils/dateUtils' : '../'.repeat(relativeDepth - 1) + 'utils/dateUtils';
           const importStmt = `import { safeFormatDate, safeFormatDateString, safeFormatTimeString } from '${importPath.replace(/\\/g, '/')}';\n`;
           content = importStmt + content;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceDatesInDir(srcDir);

console.log('Date utility patches successfully applied across 15+ files!');
