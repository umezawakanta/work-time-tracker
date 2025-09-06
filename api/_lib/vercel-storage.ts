import fs from 'fs';
import path from 'path';

// Vercel環境でのデータディレクトリのパス
const DATA_DIR = path.join(process.cwd(), 'data');

// データディレクトリが存在しない場合は作成
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * データをファイルに保存（Vercel環境用）
 */
export function saveVercelData<T>(filename: string, data: Map<string, T[]>): void {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    
    // Mapをオブジェクトに変換
    const dataObject: Record<string, T[]> = {};
    data.forEach((value, key) => {
      dataObject[key] = value;
    });
    
    fs.writeFileSync(filePath, JSON.stringify(dataObject, null, 2));
    console.log(`[Vercel] データを保存しました: ${filename}.json`);
  } catch (error) {
    console.error(`[Vercel] データの保存に失敗しました: ${filename}`, error);
  }
}

/**
 * データをファイルから読み込み（Vercel環境用）
 */
export function loadVercelData<T>(filename: string): Map<string, T[]> {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`[Vercel] データファイルが存在しません: ${filename}.json`);
      return new Map<string, T[]>();
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const dataObject = JSON.parse(fileContent);
    
    // オブジェクトをMapに変換
    const dataMap = new Map<string, T[]>();
    Object.entries(dataObject).forEach(([key, value]) => {
      dataMap.set(key, value as T[]);
    });
    
    console.log(`[Vercel] データを読み込みました: ${filename}.json (${dataMap.size} 件)`);
    return dataMap;
  } catch (error) {
    console.error(`[Vercel] データの読み込みに失敗しました: ${filename}`, error);
    return new Map<string, T[]>();
  }
}

/**
 * データを即座に保存（Vercel環境用）
 */
export function saveVercelDataImmediately<T>(dataMap: Map<string, T[]>, filename: string): void {
  saveVercelData(filename, dataMap);
}
