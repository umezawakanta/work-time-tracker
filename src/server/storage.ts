import fs from 'fs';
import path from 'path';

// データディレクトリのパス
const DATA_DIR = path.join(process.cwd(), 'data');

// データディレクトリが存在しない場合は作成
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * データをファイルに保存
 */
export function saveData<T>(filename: string, data: Map<string, T[]>): void {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);

    // Mapをオブジェクトに変換
    const dataObject: Record<string, T[]> = {};
    data.forEach((value, key) => {
      dataObject[key] = value;
    });

    fs.writeFileSync(filePath, JSON.stringify(dataObject, null, 2));
    console.log(`データを保存しました: ${filename}.json`);
  } catch (error) {
    console.error(`データの保存に失敗しました: ${filename}`, error);
  }
}

/**
 * データをファイルから読み込み
 */
export function loadData<T>(filename: string): Map<string, T[]> {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);

    if (!fs.existsSync(filePath)) {
      console.log(`データファイルが存在しません: ${filename}.json`);
      return new Map<string, T[]>();
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const dataObject = JSON.parse(fileContent);

    // オブジェクトをMapに変換
    const dataMap = new Map<string, T[]>();
    Object.entries(dataObject).forEach(([key, value]) => {
      dataMap.set(key, value as T[]);
    });

    console.log(`データを読み込みました: ${filename}.json (${dataMap.size} 件)`);
    return dataMap;
  } catch (error) {
    console.error(`データの読み込みに失敗しました: ${filename}`, error);
    return new Map<string, T[]>();
  }
}

/**
 * 定期的にデータを保存する関数
 */
export function startAutoSave<T>(
  dataMap: Map<string, T[]>,
  filename: string,
  intervalMs: number = 30000 // 30秒間隔
): NodeJS.Timeout {
  return setInterval(() => {
    saveData(filename, dataMap);
  }, intervalMs);
}

/**
 * データを即座に保存
 */
export function saveDataImmediately<T>(dataMap: Map<string, T[]>, filename: string): void {
  saveData(filename, dataMap);
}
