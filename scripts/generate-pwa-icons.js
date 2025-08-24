#!/usr/bin/env node

/**
 * PWAアイコン生成スクリプト
 * SVGファイルから必要なサイズのPNGアイコンを生成
 */

const fs = require('fs');
const path = require('path');

// 必要なアイコンサイズ
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

const SVG_TEMPLATE = `<svg width="{size}" height="{size}" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="brainGradient" cx="0.3" cy="0.3" r="0.7">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- 背景円 -->
  <circle cx="48" cy="48" r="44" fill="url(#brainGradient)" filter="url(#glow)" stroke="#ffffff" stroke-width="2"/>
  
  <!-- 簡略化された脳のアイコン -->
  <g transform="translate(20, 20)" fill="#ffffff" stroke="#f8fafc" stroke-width="1">
    <!-- メイン脳部分 -->
    <path d="M28 15 C35 8, 45 8, 50 15 C55 20, 55 30, 50 40 C45 50, 35 50, 28 40 C20 35, 20 25, 28 15 Z" opacity="0.9"/>
    
    <!-- 脳の溝（左側） -->
    <path d="M25 25 C30 20, 35 22, 40 25" fill="none" stroke="#e0e7ff" stroke-width="2" opacity="0.7"/>
    <path d="M22 32 C28 28, 33 30, 38 32" fill="none" stroke="#e0e7ff" stroke-width="2" opacity="0.7"/>
    
    <!-- 脳の溝（右側） -->
    <path d="M42 18 C47 15, 52 17, 55 22" fill="none" stroke="#e0e7ff" stroke-width="2" opacity="0.7"/>
    <path d="M44 28 C48 25, 52 27, 55 30" fill="none" stroke="#e0e7ff" stroke-width="2" opacity="0.7"/>
    
    <!-- 中心部のハイライト -->
    <circle cx="38" cy="28" r="3" fill="#f1f5f9" opacity="0.8"/>
    <circle cx="32" cy="22" r="2" fill="#f1f5f9" opacity="0.6"/>
    <circle cx="45" cy="35" r="2" fill="#f1f5f9" opacity="0.6"/>
  </g>
  
  <!-- 装飾的なドット -->
  <circle cx="15" cy="25" r="2" fill="#a5b4fc" opacity="0.6"/>
  <circle cx="81" cy="35" r="2" fill="#a5b4fc" opacity="0.6"/>
  <circle cx="20" cy="70" r="1.5" fill="#c7d2fe" opacity="0.5"/>
  <circle cx="76" cy="65" r="1.5" fill="#c7d2fe" opacity="0.5"/>
</svg>`;

async function generatePWAIcons() {
    console.log('🎨 PWAアイコン生成を開始...');

    const publicIconsDir = path.join(process.cwd(), 'public', 'icons');

    // iconsディレクトリが存在することを確認
    if (!fs.existsSync(publicIconsDir)) {
        fs.mkdirSync(publicIconsDir, { recursive: true });
    }

    // 各サイズのPNGファイルを生成（この例ではSVGとして保存）
    for (const size of ICON_SIZES) {
        const svgContent = SVG_TEMPLATE.replace(/\{size\}/g, size);
        const filename = `icon-${size}x${size}.svg`;
        const filepath = path.join(publicIconsDir, filename);

        fs.writeFileSync(filepath, svgContent);
        console.log(`✅ Generated: ${filename}`);
    }

    // ショートカット用のアイコンもチェック
    const shortcutIcons = ['task-icon-96x96.svg', 'brain-icon-96x96.svg', 'money-icon-96x96.svg', 'emergency-icon-96x96.svg'];

    for (const iconName of shortcutIcons) {
        const filepath = path.join(publicIconsDir, iconName);
        if (!fs.existsSync(filepath)) {
            console.log(`⚠️  Missing shortcut icon: ${iconName}`);
        } else {
            console.log(`✅ Shortcut icon exists: ${iconName}`);
        }
    }

    console.log('\n📋 PWAアイコン生成完了！');
    console.log('\n💡 ヒント: 本格的なPNGファイルが必要な場合は、以下のオンラインツールを使用してください：');
    console.log('   - https://cloudconvert.com/svg-to-png');
    console.log('   - https://convertio.co/svg-png/');
    console.log('\n🔧 または、Sharp.jsを使用したプログラム的変換も可能です：');
    console.log('   npm install sharp');
}

// 実行
if (require.main === module) {
    generatePWAIcons().catch(console.error);
}

module.exports = { generatePWAIcons }; 