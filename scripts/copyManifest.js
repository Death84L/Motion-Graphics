import fs from 'fs';
import path from 'path';

const src = path.resolve('manifest.json');
const dest = path.resolve('dist', 'manifest.json');

if (fs.existsSync(src)) {
  const content = JSON.parse(fs.readFileSync(src, 'utf-8'));
  content.main = 'index.html';
  if (content.entrypoints && content.entrypoints[0]) {
    content.entrypoints[0].main = 'index.html';
  }
  fs.writeFileSync(dest, JSON.stringify(content, null, 2), 'utf-8');
  console.log('✓ Successfully copied and formatted dist/manifest.json for Adobe Premiere Pro UXP!');
}
