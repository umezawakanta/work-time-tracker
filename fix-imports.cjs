const fs = require('fs');
const path = require('path');

// 修正対象のディレクトリ
const apiDir = './api';

// 相対インポートを修正する関数
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 相対パスのインポートを修正
  const patterns = [
    // from '../utils/database' -> from '../utils/database.js'
    { from: /from ['"]\.\.\/utils\/database['"]/g, to: "from '../utils/database.js'" },
    { from: /from ['"]\.\.\/utils\/errorHandler['"]/g, to: "from '../utils/errorHandler.js'" },
    { from: /from ['"]\.\.\/utils\/schemas['"]/g, to: "from '../utils/schemas.js'" },
    { from: /from ['"]\.\.\/utils\/types['"]/g, to: "from '../utils/types.js'" },
    { from: /from ['"]\.\.\/utils\/validation['"]/g, to: "from '../utils/validation.js'" },
    { from: /from ['"]\.\.\/utils\/logger['"]/g, to: "from '../utils/logger.js'" },
    // その他の相対パス
    { from: /from ['"]\.\/([^'"]+)['"]/g, to: "from './$1.js'" },
  ];

  patterns.forEach(pattern => {
    if (pattern.from.test(content)) {
      content = content.replace(pattern.from, pattern.to);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in: ${filePath}`);
  }
}

// ディレクトリを再帰的に探索
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fixImports(filePath);
    }
  });
}

// 実行
console.log('Fixing ES module imports...');
walkDir(apiDir);
console.log('Done!');
