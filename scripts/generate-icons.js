const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes needed for PWA
const sizes = [72, 96, 120, 128, 144, 152, 180, 192, 384, 512];

// SVG template for QWEN logo icon
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#FAF8F3" rx="${size * 0.2}"/>
  
  <!-- Gold Circle Border -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.35}" fill="none" stroke="#D4AF37" stroke-width="${size * 0.04}"/>
  
  <!-- QWEN Text -->
  <text 
    x="${size / 2}" 
    y="${size / 2 + size * 0.08}" 
    font-family="'Playfair Display', serif" 
    font-weight="700" 
    font-size="${size * 0.2}" 
    fill="#1A1A1A" 
    text-anchor="middle">QWEN</text>
  
  <!-- Small decorative element -->
  <circle cx="${size / 2}" cy="${size * 0.75}" r="${size * 0.02}" fill="#D4AF37"/>
</svg>`;

// Generate SVG icons
console.log('Generating app icons...\n');

sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = `icon-${size}x${size}.png`;
  const svgFilename = `icon-${size}x${size}.svg`;
  
  // Save SVG (can be converted to PNG using a tool)
  fs.writeFileSync(path.join(iconsDir, svgFilename), svg);
  console.log(`✓ Created ${svgFilename}`);
});

// Generate Apple-specific icons
[120, 152, 180].forEach(size => {
  const svg = createSVG(size);
  const filename = `apple-icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`✓ Created ${filename}`);
});

console.log('\n✓ All icon SVG files generated successfully!');
console.log('\nNote: SVG files have been created. For production, you should:');
console.log('1. Convert SVG files to PNG using a tool like:');
console.log('   - ImageMagick: convert icon.svg icon.png');
console.log('   - Online tools: cloudconvert.com, convertio.co');
console.log('2. Or use a design tool like Figma/Photoshop to export as PNG');
console.log('\nFor now, browsers will use the SVG files which work well for PWA!');
