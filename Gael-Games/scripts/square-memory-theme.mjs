import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.join(process.cwd(), 'src/assets/memory/themes');
const size = 512;

async function squareFile(filePath) {
  if (!/\.(png|jpe?g|webp)$/i.test(filePath)) {
    return;
  }
  const tmp = `${filePath}.square.tmp.png`;
  await sharp(filePath, { failOn: 'none' })
    .rotate()
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 9 })
    .toFile(tmp);
  await fs.unlink(filePath);
  const dest = filePath.replace(/\.(jpe?g|webp)$/i, '.png');
  await fs.rename(tmp, dest);
}

async function squareDir(sub) {
  const dir = path.join(root, sub);
  let names;
  try {
    names = await fs.readdir(dir);
  } catch {
    return;
  }
  for (const name of names) {
    const full = path.join(dir, name);
    const st = await fs.stat(full).catch(() => null);
    if (st?.isFile()) {
      await squareFile(full);
    }
  }
}

const themes = process.argv.slice(2);
if (themes.length === 0) {
  console.error('Usage: node scripts/square-memory-theme.mjs <themeDir> [...]');
  process.exit(1);
}

for (const t of themes) {
  await squareDir(t);
}
console.log('Squared to', size, 'px:', themes.join(', '));
