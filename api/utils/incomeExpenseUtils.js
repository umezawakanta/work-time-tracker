// 収入/支出判定の共通ユーティリティ

// 支出を示すキーワード
const EXPENSE_KEYWORDS = [
  '支出', '支払', '費用', '交通費', '食費', '光熱費',
  '家賃', '保険', '税金', '医療費', '教育費', '娯楽費',
  '通信費', '水道光熱費', 'ガソリン代', '駐車場代'
];

// 最適化された単一の結合正規表現パターン
// この正規表現は、キーワードの前後が日本語（漢字: 一-龠, ひらがな: ぁ-ん, カタカナ: ァ-ン）や英数字でない場合にマッチします。
// これにより、例えば「交通費」などのキーワードが他の単語の一部として現れる場合（例:「交通整理」）は除外し、
// 独立したキーワードとしてのみ判定します。
const NON_JAPANESE_OR_LATIN_CHAR_CLASS = '[^一-龠ぁ-んァ-ンa-zA-Z0-9]';

// 遅延初期化で単一の結合正規表現を作成
let EXPENSE_KEYWORD_PATTERN = null;

function getExpenseKeywordPattern() {
  if (!EXPENSE_KEYWORD_PATTERN) {
    // エスケープされたキーワードを結合して単一の正規表現を作成
    const escapedKeywords = EXPENSE_KEYWORDS.map(keyword => 
      keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    ).join('|');
    
    // 単語境界ロジックの説明:
    // 1. (?:^|${NON_JAPANESE_OR_LATIN_CHAR_CLASS}) - キーワードの前が文字列の開始または非日本語/英数字文字
    // 2. (?:${escapedKeywords}) - エスケープされたキーワードのいずれか
    // 3. (?:${NON_JAPANESE_OR_LATIN_CHAR_CLASS}|$) - キーワードの後が非日本語/英数字文字または文字列の終了
    // 
    // 例:
    // ✅ "交通費" → マッチ（独立した単語）
    // ✅ "今日の交通費" → マッチ（前後に非日本語文字）
    // ❌ "交通整理" → マッチしない（「交通費」が含まれていない）
    // ❌ "交通費計算" → マッチしない（「費」の後に日本語文字）
    // これにより「交通費」は「交通整理」の一部としてではなく、独立した単語としてのみマッチする
    EXPENSE_KEYWORD_PATTERN = new RegExp(
      `(?:^|${NON_JAPANESE_OR_LATIN_CHAR_CLASS})(?:${escapedKeywords})(?:${NON_JAPANESE_OR_LATIN_CHAR_CLASS}|$)`,
      'u'
    );
  }
  return EXPENSE_KEYWORD_PATTERN;
}

/**
 * 記録のメモと金額から収入/支出のタイプを判定する
 * @param {Object} record - 記録オブジェクト
 * @param {string} record.notes - メモ
 * @param {number} record.amount - 金額
 * @returns {string} 'income' または 'expense'
 */
function determineIncomeExpenseType(record) {
  let newType = 'income'; // デフォルトは収入
  
  // メモの内容から支出を判定
  if (record.notes) {
    // 最適化された単一の結合正規表現パターンを使用してキーワードをチェック
    if (getExpenseKeywordPattern().test(record.notes)) {
      newType = 'expense';
    }
  }
  
  // 金額が負の場合は支出
  if (record.amount < 0) {
    newType = 'expense';
  }
  
  return newType;
}

/**
 * 複数の記録のタイプを一括判定する
 * @param {Array} records - 記録の配列
 * @returns {Array} 判定結果の配列
 */
function determineTypesForRecords(records) {
  return records.map(record => ({
    ...record,
    newType: determineIncomeExpenseType(record)
  }));
}

module.exports = {
  EXPENSE_KEYWORDS,
  determineIncomeExpenseType,
  determineTypesForRecords
};
