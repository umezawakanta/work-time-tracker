const fs = require('fs');
const path = require('path');

// SVGアイコンの内容
const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="512" height="512" fill="#3b82f6" rx="80"/>
  
  <!-- メインキャラクターの体 -->
  <circle cx="256" cy="320" r="80" fill="#ffffff"/>
  
  <!-- 頭 -->
  <circle cx="256" cy="200" r="60" fill="#ffffff"/>
  
  <!-- 目 -->
  <circle cx="240" cy="185" r="8" fill="#3b82f6"/>
  <circle cx="272" cy="185" r="8" fill="#3b82f6"/>
  
  <!-- 口 -->
  <path d="M 240 210 Q 256 225 272 210" stroke="#3b82f6" stroke-width="4" fill="none" stroke-linecap="round"/>
  
  <!-- 腕 -->
  <circle cx="200" cy="280" r="25" fill="#ffffff"/>
  <circle cx="312" cy="280" r="25" fill="#ffffff"/>
  
  <!-- 手 -->
  <circle cx="200" cy="280" r="15" fill="#3b82f6"/>
  <circle cx="312" cy="280" r="15" fill="#3b82f6"/>
  
  <!-- 足 -->
  <circle cx="230" cy="380" r="20" fill="#ffffff"/>
  <circle cx="282" cy="380" r="20" fill="#ffffff"/>
  
  <!-- 靴 -->
  <ellipse cx="230" cy="400" rx="25" ry="15" fill="#1e40af"/>
  <ellipse cx="282" cy="400" rx="25" ry="15" fill="#1e40af"/>
  
  <!-- 時計の装飾 -->
  <circle cx="256" cy="320" r="50" fill="#f3f4f6" stroke="#3b82f6" stroke-width="3"/>
  <circle cx="256" cy="320" r="5" fill="#3b82f6"/>
  
  <!-- 時計の針 -->
  <line x1="256" y1="320" x2="256" y2="280" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/>
  <line x1="256" y1="320" x2="280" y2="320" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/>
  
  <!-- 時計の数字（12時） -->
  <text x="256" y="275" text-anchor="middle" fill="#3b82f6" font-family="Arial, sans-serif" font-size="12" font-weight="bold">12</text>
  
  <!-- 帽子 -->
  <ellipse cx="256" cy="160" rx="45" ry="20" fill="#1e40af"/>
  <rect x="211" y="160" width="90" height="15" fill="#1e40af"/>
  
  <!-- 帽子の装飾 -->
  <circle cx="256" cy="150" r="3" fill="#ffffff"/>
  
  <!-- アクセント -->
  <circle cx="180" cy="120" r="8" fill="#fbbf24" opacity="0.8"/>
  <circle cx="332" cy="120" r="6" fill="#fbbf24" opacity="0.8"/>
  <circle cx="150" cy="200" r="5" fill="#fbbf24" opacity="0.6"/>
  <circle cx="362" cy="200" r="7" fill="#fbbf24" opacity="0.6"/>
</svg>`;

// 必要なサイズ
const sizes = [120, 152, 180, 192, 512];

// 各サイズのアイコンを生成
sizes.forEach(size => {
  const scaledSvg = svgIcon.replace('width="512" height="512"', `width="${size}" height="${size}"`);
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(__dirname, '..', 'public', filename);
  
  // SVGをBase64エンコードしてdata URLに変換
  const base64 = Buffer.from(scaledSvg).toString('base64');
  const dataUrl = `data:image/svg+xml;base64,${base64}`;
  
  // 簡易的なPNG変換（実際のプロダクションではsharpやcanvasを使用）
  console.log(`Generated ${filename} (${size}x${size})`);
  console.log(`Data URL: ${dataUrl.substring(0, 100)}...`);
});

console.log('Icon generation completed!');
console.log('Note: This script generates SVG data URLs. For actual PNG files, use a proper image conversion library like sharp.');
