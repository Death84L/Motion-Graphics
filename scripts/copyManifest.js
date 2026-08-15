import fs from 'fs';
import path from 'path';

// 1. Format and copy manifest.json into dist/
const rootManifestPath = path.resolve('manifest.json');
const distManifestPath = path.resolve('dist', 'manifest.json');

if (fs.existsSync(rootManifestPath)) {
  const content = JSON.parse(fs.readFileSync(rootManifestPath, 'utf-8'));
  
  // In dist/, main is index.html directly
  const distContent = {
    ...content,
    main: 'index.html',
    host: {
      app: 'premierepro',
      minVersion: '25.6.0',
    },
    entrypoints: content.entrypoints?.map((ep) => ({
      ...ep,
      main: 'index.html',
    })) || [{ type: 'panel', id: 'motionStudioPanel', name: 'Motion Studio', main: 'index.html' }],
  };

  fs.writeFileSync(distManifestPath, JSON.stringify(distContent, null, 2), 'utf-8');
  console.log('✓ Successfully generated dist/manifest.json for Adobe Premiere Pro UXP!');
}

// 2. Post-process dist/index.html to remove 'crossorigin' attribute for UXP compatibility
const distHtmlPath = path.resolve('dist', 'index.html');
if (fs.existsSync(distHtmlPath)) {
  let html = fs.readFileSync(distHtmlPath, 'utf-8');
  // Remove crossorigin attribute which can cause local file CORS blocks in UXP WebView
  html = html.replace(/\scrossorigin(="[^"]*")?/g, '');
  fs.writeFileSync(distHtmlPath, html, 'utf-8');
  console.log('✓ Cleaned crossorigin attributes in dist/index.html for UXP WebView compatibility!');
}

// 3. Mirror dist/assets to ./assets so loading either root manifest.json or dist/manifest.json works 100%
const distAssetsDir = path.resolve('dist', 'assets');
const rootAssetsDir = path.resolve('assets');
if (fs.existsSync(distAssetsDir)) {
  if (!fs.existsSync(rootAssetsDir)) {
    fs.mkdirSync(rootAssetsDir, { recursive: true });
  }
  const files = fs.readdirSync(distAssetsDir);
  for (const file of files) {
    fs.copyFileSync(path.join(distAssetsDir, file), path.join(rootAssetsDir, file));
  }
  console.log('✓ Mirrored dist/assets to ./assets for root manifest compatibility!');
}

