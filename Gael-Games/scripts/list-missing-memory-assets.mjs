import fs from 'node:fs';
import path from 'node:path';

const j = JSON.parse(fs.readFileSync('src/consts/memory.json', 'utf8'));
const root = process.cwd();
const missing = [];
for (const theme of Object.values(j.themes ?? {})) {
  for (const [ck, card] of Object.entries(theme)) {
    if (ck === 'name' || !card?.imageUrl) continue;
    const p = String(card.imageUrl).replace(/^\//, ''); // src/assets/...
    const full = path.join(root, p);
    if (!fs.existsSync(full)) missing.push({ path: p, url: card.imageUrl, title: card.title });
  }
}
console.log(JSON.stringify({ count: missing.length, missing }, null, 2));
