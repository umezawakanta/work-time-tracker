// 収入/支出判定の共通ユーティリティ

// 支出を示すキーワード
const EXPENSE_KEYWORDS = [
  '支出', '支払', '費用', '交通費', '食費', '光熱費',
  '家賃', '保険', '税金', '医療費', '教育費', '娯楽費',
  '通信費', '水道光熱費', 'ガソリン代', '駐車場代'
];

// 事前にコンパイルした正規表現パターンをキャッシュ
// この正規表現は、キーワードの前後が日本語（漢字: 一-龠, ひらがな: ぁ-ん, カタカナ: ァ-ン）や英数字でない場合にマッチします。
// これにより、例えば「交通費」などのキーワードが他の単語の一部として現れる場合（例:「交通整理」）は除外し、
// 日本語（漢字・ひらがな・カタカナ）および英数字以外の文字を表す文字クラスです。
const NON_JAPANESE_OR_LATIN_CHAR_CLASS = '[^一-龠ぁ-んァ-ンa-zA-Z0-9]';
const EXPENSE_KEYWORD_PATTERNS = EXPENSE_KEYWORDS.map(keyword => {
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|${NON_JAPANESE_OR_LATIN_CHAR_CLASS})${escapedKeyword}(?:${NON_JAPANESE_OR_LATIN_CHAR_CLASS}|$)`, 'u');
});

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
    // 事前にコンパイルした正規表現パターンを使用してキーワードをチェック
    if (EXPENSE_KEYWORD_PATTERNS.some(pattern => pattern.test(record.notes))) {
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
