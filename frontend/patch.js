const fs = require('fs');
const path = 'src/context/AuthContext.jsx';
let content = fs.readFileSync(path, 'utf8');

const helpers = `
// Safe storage helpers
const safeGet = (storage, key) => { try { return storage.getItem(key); } catch(e) { return null; } };
const safeSet = (storage, key, val) => { try { storage.setItem(key, val); } catch(e) {} };
const safeRemove = (storage, key) => { try { storage.removeItem(key); } catch(e) {} };
const safeClear = (storage) => { try { storage.clear(); } catch(e) {} };
`;

// Insert helpers after imports
content = content.replace(/(import .*;\n)+/, (match) => match + '\n' + helpers);

// Replace sessionStorage.getItem('key')
content = content.replace(/sessionStorage\.getItem\((['"][^'"]+['"])\)/g, 'safeGet(sessionStorage, $1)');
content = content.replace(/localStorage\.getItem\((['"][^'"]+['"])\)/g, 'safeGet(localStorage, $1)');

content = content.replace(/sessionStorage\.setItem\((['"][^'"]+['"]),\s*(.+?)\)/g, 'safeSet(sessionStorage, $1, $2)');
content = content.replace(/localStorage\.setItem\((['"][^'"]+['"]),\s*(.+?)\)/g, 'safeSet(localStorage, $1, $2)');

content = content.replace(/sessionStorage\.removeItem\((['"][^'"]+['"])\)/g, 'safeRemove(sessionStorage, $1)');
content = content.replace(/localStorage\.removeItem\((['"][^'"]+['"])\)/g, 'safeRemove(localStorage, $1)');

content = content.replace(/sessionStorage\.clear\(\)/g, 'safeClear(sessionStorage)');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed AuthContext.jsx storage accesses');
