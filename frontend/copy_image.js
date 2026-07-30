import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = "C:\\Users\\KAVIN\\.gemini\\antigravity-ide\\brain\\f1bc2389-a10a-49d6-989a-a52426c45e58\\auth_background_1785394301662.png";
const destDir = path.join(__dirname, 'public', 'assets');
const dest = path.join(destDir, 'auth-bg.png');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, dest);
console.log('Image copied successfully');
