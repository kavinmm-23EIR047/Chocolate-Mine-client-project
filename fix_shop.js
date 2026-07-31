const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const targetPath = path.join(__dirname, 'frontend', 'src', 'pages', 'Shop.jsx');

console.log('Restoring Shop.jsx from Git...');
try {
  execSync(`git checkout -- "${targetPath}"`);
  console.log('Successfully restored Shop.jsx');
} catch (e) {
  console.error('Failed to git checkout Shop.jsx. Error:', e.message);
  process.exit(1);
}

console.log('Applying pagination change (100 items per page)...');
let content = fs.readFileSync(targetPath, 'utf8');

// The original file probably has a hardcoded ITEMS_PER_PAGE or pagination logic.
// If it uses ITEMS_PER_PAGE = 24 or similar, we replace it.
// If not, we just update the pagination state.
// We'll just try to safely find where ITEMS_PER_PAGE is.

if (content.includes('const ITEMS_PER_PAGE = 24;')) {
    content = content.replace('const ITEMS_PER_PAGE = 24;', 'const ITEMS_PER_PAGE = 100;');
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('Successfully updated ITEMS_PER_PAGE to 100.');
} else if (content.includes('const ITEMS_PER_PAGE = 12;')) {
    content = content.replace('const ITEMS_PER_PAGE = 12;', 'const ITEMS_PER_PAGE = 100;');
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('Successfully updated ITEMS_PER_PAGE to 100.');
} else {
    // Let's do a regex replacement just in case
    content = content.replace(/const ITEMS_PER_PAGE\s*=\s*\d+;/, 'const ITEMS_PER_PAGE = 100;');
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('Attempted regex replace for ITEMS_PER_PAGE.');
}

console.log('Done! Shop.jsx is fixed.');
