import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = 'src/lib/assets/favicon.svg';
const staticDir = 'static';

async function generate() {
  if (!fs.existsSync(svgPath)) {
    console.error('SVG not found:', svgPath);
    process.exit(1);
  }

  const sizes = [192, 512];

  for (const size of sizes) {
    const dest = path.join(staticDir, `pwa-${size}x${size}.png`);
    console.log(`Generating ${dest}...`);
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(dest);
  }
  console.log('Done.');
}

generate();
