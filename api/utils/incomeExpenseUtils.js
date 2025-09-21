// 収入/支出判定の共通ユーティリティ

// 支出を示すキーワード
const EXPENSE_KEYWORDS = [
  '支出', '支払', '費用', '交通費', '食費', '光熱費',
  '家賃', '保険', '税金', '医療費', '教育費', '娯楽費',
  '通信費', '水道光熱費', 'ガソリン代', '駐車場代'
];

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
      const notes = record.notes;
      // 支出を示すキーワードをチェック（日本語なので大文字小文字の区別なし）
      if (EXPENSE_KEYWORDS.some(keyword => {
        // 正規表現でキーワードが単語境界または前後が非日本語文字の場合のみ一致
        // 特殊文字をエスケープしてから正規表現を作成
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`(?:^|[^一-龠ぁ-んァ-ンa-zA-Z0-9])${escapedKeyword}(?:[^一-龠ぁ-んァ-ンa-zA-Z0-9]|$)`);
        return pattern.test(notes);
      })) {
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
