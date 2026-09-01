const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceImage = 'C:/Users/im_sa_sy8qn1m/.gemini/antigravity-ide/brain/2986897f-db03-4b62-9c7e-cfcab6f13ad4/.user_uploaded/media_1788297495601.jpg';
const resDir = path.resolve(__dirname, '../android/app/src/main/res');
const assetsDir = path.resolve(__dirname, '../assets');

async function generate() {
  console.log('Reading source image from:', sourceImage);
  const { data, info } = await sharp(sourceImage)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = 498; // Edge of the circular emblem
  const feather = 2.5;     // Anti-aliasing feather width in px

  // Create an RGBA buffer with masked alpha outside the circle
  const maskedBuffer = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * channels;
      const dstIdx = (y * width + x) * 4;

      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      maskedBuffer[dstIdx] = data[srcIdx];         // R
      maskedBuffer[dstIdx + 1] = data[srcIdx + 1]; // G
      maskedBuffer[dstIdx + 2] = data[srcIdx + 2]; // B

      let alpha = 255;
      if (dist >= outerRadius + feather) {
        alpha = 0;
      } else if (dist > outerRadius - feather) {
        const factor = (outerRadius + feather - dist) / (2 * feather);
        alpha = Math.round(255 * Math.max(0, Math.min(1, factor)));
      }
      maskedBuffer[dstIdx + 3] = alpha;
    }
  }

  // Master icon
  const masterIconBuffer = await sharp(maskedBuffer, {
    raw: { width, height, channels: 4 }
  })
    .png()
    .toBuffer();

  // Save assets/icon.png
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  fs.writeFileSync(path.join(assetsDir, 'icon.png'), masterIconBuffer);
  console.log('Saved assets/icon.png (1024x1024)');

  // Densities and sizes for Android
  const densities = [
    { name: 'mipmap-ldpi', launcher: 36, adaptive: 81 },
    { name: 'mipmap-mdpi', launcher: 48, adaptive: 108 },
    { name: 'mipmap-hdpi', launcher: 72, adaptive: 162 },
    { name: 'mipmap-xhdpi', launcher: 96, adaptive: 216 },
    { name: 'mipmap-xxhdpi', launcher: 144, adaptive: 324 },
    { name: 'mipmap-xxxhdpi', launcher: 192, adaptive: 432 },
  ];

  for (const density of densities) {
    const targetFolder = path.join(resDir, density.name);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    // 1. ic_launcher.png
    await sharp(masterIconBuffer)
      .resize(density.launcher, density.launcher)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher.png'));

    // 2. ic_launcher_round.png
    await sharp(masterIconBuffer)
      .resize(density.launcher, density.launcher)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_round.png'));

    // 3. ic_launcher_foreground.png (for adaptive icons)
    await sharp(masterIconBuffer)
      .resize(density.adaptive, density.adaptive)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_foreground.png'));

    // 4. ic_launcher_background.png (transparent background layer for adaptive icon)
    const emptyBg = Buffer.alloc(density.adaptive * density.adaptive * 4, 0);
    await sharp(emptyBg, {
      raw: { width: density.adaptive, height: density.adaptive, channels: 4 }
    })
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_background.png'));

    console.log(`Generated all icons for ${density.name} (launcher: ${density.launcher}px, adaptive: ${density.adaptive}px)`);
  }

  console.log('All Android icon variants successfully built!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
