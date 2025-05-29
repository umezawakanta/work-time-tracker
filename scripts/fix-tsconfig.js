#!/usr/bin/env node

import fs from 'fs-extra';

console.log(' tsconfig.jsonを修正中...\n');

async function fixTsConfig() {
  try {
    // 正しいtsconfig.jsonを作成
    const tsconfig = {
      "compilerOptions": {
        "target": "ES2020",
        "useDefineForClassFields": true,
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "module": "ESNext",
        "skipLibCheck": true,
        "moduleResolution": "bundler",
        "allowImportingTsExtensions": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "react-jsx",
        "strict": false,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true,
        "baseUrl": ".",
        "paths": {
          "@/*": ["./src/*"],
          "@/types/*": ["./src/types/*"],
          "@/lib/*": ["./src/lib/*"],
          "@/components/*": ["./src/components/*"],
          "@/core/*": ["./src/core/*"]
        },
        "noImplicitAny": false,
        "strictNullChecks": false,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true
      },
      "include": ["src"],
      "references": [{ "path": "./tsconfig.node.json" }]
    };
    
    // tsconfig.jsonを書き込み
    await fs.writeJson('tsconfig.json', tsconfig, { spaces: 2 });
    console.log(' tsconfig.jsonを修正しました');
    
    // tsconfig.node.jsonも確認/作成
    const tsconfigNode = {
      "compilerOptions": {
        "composite": true,
        "skipLibCheck": true,
        "module": "ESNext",
        "moduleResolution": "bundler",
        "allowSyntheticDefaultImports": true,
        "strict": true
      },
      "include": ["vite.config.ts"]
    };
    
    await fs.writeJson('tsconfig.node.json', tsconfigNode, { spaces: 2 });
    console.log(' tsconfig.node.jsonも修正しました');
    
  } catch (error) {
    console.error(' エラー:', error);
    process.exit(1);
  }
}

fixTsConfig();
