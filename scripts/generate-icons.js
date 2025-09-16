const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// SVGアイコンの内容（最新のデザイン）
const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- 角丸の背景（iOSアイコン風） -->
  <rect width="512" height="512" fill="#1DA1F2" rx="112" ry="112"/>
  
  <!-- 体の黒い輪郭 -->
  <ellipse cx="256" cy="360" rx="135" ry="110" fill="#3a4556" stroke="#2c3344" stroke-width="12"/>
  
  <!-- 体の緑色部分 -->
  <ellipse cx="256" cy="360" rx="110" ry="85" fill="#4CAF50"/>
  
  <!-- 頭の黒い輪郭 -->
  <circle cx="256" cy="190" r="120" fill="#3a4556" stroke="#2c3344" stroke-width="12"/>
  
  <!-- 頭の黄色い顔 -->
  <circle cx="256" cy="190" r="95" fill="#FFD700"/>
  
  <!-- 左目 -->
  <circle cx="225" cy="175" r="10" fill="#1a1a1a"/>
  
  <!-- 右目 -->
  <circle cx="287" cy="175" r="10" fill="#1a1a1a"/>
  
  <!-- 口（大きく開いた黒い楕円） -->
  <ellipse cx="256" cy="215" rx="30" ry="25" fill="#1a1a1a"/>
</svg>`;

// 必要なサイズ
const sizes = [120, 152, 180, 192, 512];

// SVGをPNGに変換する関数
async function convertSvgToPng(svgContent, size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // SVGをBase64エンコードしてdata URLに変換
  const base64 = Buffer.from(svgContent).toString('base64');
  const dataUrl = `data:image/svg+xml;base64,${base64}`;
  
  try {
    // SVGを画像として読み込み
    const img = await loadImage(dataUrl);
    ctx.drawImage(img, 0, 0, size, size);
    
    // PNGとして保存
    const buffer = canvas.toBuffer('image/png');
    return buffer;
  } catch (error) {
    console.error(`Error converting SVG to PNG for size ${size}:`, error);
    return null;
  }
}

// 各サイズのアイコンを生成
async function generateIcons() {
  for (const size of sizes) {
    const scaledSvg = svgIcon.replace('width="512" height="512"', `width="${size}" height="${size}"`);
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(__dirname, '..', 'public', filename);
    
    console.log(`Generating ${filename} (${size}x${size})...`);
    
    const pngBuffer = await convertSvgToPng(scaledSvg, size);
    if (pngBuffer) {
      fs.writeFileSync(filepath, pngBuffer);
      console.log(`✅ Generated ${filename}`);
    } else {
      console.error(`❌ Failed to generate ${filename}`);
    }
  }
  
  console.log('🎉 Icon generation completed!');
}

// アイコン生成を実行
generateIcons().catch(console.error);
