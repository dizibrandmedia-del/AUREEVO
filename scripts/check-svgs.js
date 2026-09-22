const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'images', 'brands');
const files = fs.readdirSync(dir);

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  const hasViewBox = content.includes('viewBox=');
  
  if (!hasViewBox) {
    const widthMatch = content.match(/width="([^"]+)"/);
    const heightMatch = content.match(/height="([^"]+)"/);
    if (widthMatch && heightMatch) {
      const w = parseFloat(widthMatch[1]);
      const h = parseFloat(heightMatch[1]);
      content = content.replace('<svg ', `<svg viewBox="0 0 ${w} ${h}" `);
      fs.writeFileSync(path.join(dir, file), content, 'utf8');
      console.log(`[FIXED viewBox] ${file}: 0 0 ${w} ${h}`);
    } else {
      console.log(`[NO viewBox & NO dims] ${file}`);
    }
  } else {
    const vb = content.match(/viewBox="([^"]+)"/);
    console.log(`[OK viewBox] ${file}: ${vb ? vb[1] : 'found'}`);
  }
}
