import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const targetDirs = ['src/assets/puzzle/gallery', 'src/assets/memory/themes'];
const supportedExt = new Set(['.png', '.jpg', '.jpeg', '.webp']);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      return [fullPath];
    })
  );
  return files.flat();
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!supportedExt.has(ext)) {
    return { filePath, optimized: false, skipped: true, reason: 'unsupported' };
  }

  const original = await fs.readFile(filePath);
  const pipeline = sharp(original, { failOn: 'none' }).rotate();

  let output;
  if (ext === '.png') {
    output = await pipeline.png({ compressionLevel: 9, effort: 10, palette: true, quality: 90 }).toBuffer();
  } else if (ext === '.webp') {
    output = await pipeline.webp({ quality: 82, effort: 6 }).toBuffer();
  } else {
    output = await pipeline.jpeg({ quality: 82, mozjpeg: true, progressive: true }).toBuffer();
  }

  if (output.length >= original.length) {
    return { filePath, optimized: false, skipped: true, reason: 'no-gain', before: original.length, after: original.length };
  }

  await fs.writeFile(filePath, output);
  return { filePath, optimized: true, before: original.length, after: output.length };
}

async function main() {
  const absoluteDirs = targetDirs.map((dir) => path.join(projectRoot, dir));
  const fileGroups = await Promise.all(absoluteDirs.map((dir) => walk(dir)));
  const files = fileGroups.flat();

  let optimizedCount = 0;
  let savedBytes = 0;

  for (const filePath of files) {
    const result = await optimizeImage(filePath);
    if (!result.optimized) {
      continue;
    }
    optimizedCount += 1;
    savedBytes += result.before - result.after;
  }

  const savedMb = (savedBytes / (1024 * 1024)).toFixed(2);
  console.log(`Optimized files: ${optimizedCount}`);
  console.log(`Saved: ${savedBytes} bytes (${savedMb} MB)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
