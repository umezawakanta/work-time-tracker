// 銀行データの解析・正規化ユーティリティ

export interface BankTransaction {
  date: string;
  description: string;
  amount: number;
  balance: number;
  category?: string;
  bankName?: string;
  accountType?: string;
}

export interface ParsedBankData {
  transactions: BankTransaction[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
    transactionCount: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
  bankInfo: {
    name: string;
    accountType: string;
  };
}

// 銀行別のCSV形式定義
const BANK_FORMATS = {
  // 三菱UFJ銀行
  mufg: {
    name: '三菱UFJ銀行',
    columns: ['date', 'description', 'amount', 'balance'],
    dateFormat: 'YYYY/MM/DD',
    amountColumn: 2,
    balanceColumn: 3,
  },
  // 三井住友銀行
  smbc: {
    name: '三井住友銀行',
    columns: ['date', 'description', 'amount', 'balance'],
    dateFormat: 'YYYY/MM/DD',
    amountColumn: 2,
    balanceColumn: 3,
  },
  // みずほ銀行
  mizuho: {
    name: 'みずほ銀行',
    columns: ['date', 'description', 'amount', 'balance'],
    dateFormat: 'YYYY/MM/DD',
    amountColumn: 2,
    balanceColumn: 3,
  },
  // 楽天銀行
  rakuten: {
    name: '楽天銀行',
    columns: ['date', 'description', 'amount', 'balance'],
    dateFormat: 'YYYY/MM/DD',
    amountColumn: 2,
    balanceColumn: 3,
  },
  // デフォルト形式
  default: {
    name: 'その他',
    columns: ['date', 'description', 'amount', 'balance'],
    dateFormat: 'YYYY/MM/DD',
    amountColumn: 2,
    balanceColumn: 3,
  },
};

// 取引内容からカテゴリを自動判定
const categorizeTransaction = (description: string): string => {
  const desc = description.toLowerCase();

  // 収入カテゴリ
  if (desc.includes('給与') || desc.includes('給料') || desc.includes('salary')) {
    return 'salary';
  }
  if (desc.includes('ボーナス') || desc.includes('賞与')) {
    return 'bonus';
  }
  if (desc.includes('振込') && desc.includes('受取')) {
    return 'transfer_in';
  }
  if (desc.includes('利息') || desc.includes('利子')) {
    return 'interest';
  }

  // 支出カテゴリ
  if (desc.includes('家賃') || desc.includes('賃貸')) {
    return 'rent';
  }
  if (
    desc.includes('光熱費') ||
    desc.includes('電気') ||
    desc.includes('ガス') ||
    desc.includes('水道')
  ) {
    return 'utilities';
  }
  if (desc.includes('通信費') || desc.includes('電話') || desc.includes('インターネット')) {
    return 'communication';
  }
  if (desc.includes('保険') || desc.includes('生命保険') || desc.includes('損害保険')) {
    return 'insurance';
  }
  if (desc.includes('クレジット') || desc.includes('カード')) {
    return 'credit_card';
  }
  if (desc.includes('ATM') || desc.includes('手数料')) {
    return 'fees';
  }
  if (desc.includes('振込') && desc.includes('送金')) {
    return 'transfer_out';
  }
  if (desc.includes('買い物') || desc.includes('ショッピング')) {
    return 'shopping';
  }
  if (desc.includes('食費') || desc.includes('スーパー') || desc.includes('コンビニ')) {
    return 'food';
  }
  if (desc.includes('交通費') || desc.includes('電車') || desc.includes('バス')) {
    return 'transportation';
  }

  return 'other';
};

// 日付の正規化
const normalizeDate = (dateStr: string): string => {
  // 様々な日付形式に対応
  const formats = [
    /(\d{4})\/(\d{1,2})\/(\d{1,2})/, // YYYY/M/D
    /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-M-D
    /(\d{4})(\d{2})(\d{2})/, // YYYYMMDD
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      const [, year, month, day] = match;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  return dateStr; // パースできない場合はそのまま返す
};

// 金額の正規化
const normalizeAmount = (amountStr: string): number => {
  // カンマや円マークを除去
  const cleaned = amountStr.replace(/[,円]/g, '');
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : amount;
};

// 銀行名の自動判定
const detectBankName = (csvText: string): string => {
  const text = csvText.toLowerCase();

  if (text.includes('三菱') || text.includes('mufg')) return 'mufg';
  if (text.includes('三井住友') || text.includes('smbc')) return 'smbc';
  if (text.includes('みずほ') || text.includes('mizuho')) return 'mizuho';
  if (text.includes('楽天') || text.includes('rakuten')) return 'rakuten';

  return 'default';
};

// CSVファイルの解析
export const parseBankCSV = (csvText: string, bankName?: string): ParsedBankData => {
  const lines = csvText.split('\n').filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error('有効なCSVデータが見つかりません');
  }

  // 銀行名の自動判定
  const detectedBank = bankName || detectBankName(csvText);
  const bankFormat =
    BANK_FORMATS[detectedBank as keyof typeof BANK_FORMATS] || BANK_FORMATS.default;

  const transactions: BankTransaction[] = [];
  let totalIncome = 0;
  let totalExpense = 0;
  let minDate = '';
  let maxDate = '';

  // ヘッダー行をスキップしてデータを解析
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // CSVの各列を分割（カンマ区切り、ダブルクォート対応）
    const columns = line.split(',').map((col) => {
      const cleaned = col.trim();
      return cleaned.startsWith('"') && cleaned.endsWith('"') ? cleaned.slice(1, -1) : cleaned;
    });

    if (columns.length < 4) continue;

    try {
      const date = normalizeDate(columns[0]);
      const description = columns[1];
      const amount = normalizeAmount(columns[bankFormat.amountColumn]);
      const balance = normalizeAmount(columns[bankFormat.balanceColumn]);

      const transaction: BankTransaction = {
        date,
        description,
        amount,
        balance,
        category: categorizeTransaction(description),
        bankName: bankFormat.name,
        accountType: 'checking', // デフォルトは普通預金
      };

      transactions.push(transaction);

      // 収支の計算
      if (amount > 0) {
        totalIncome += amount;
      } else {
        totalExpense += Math.abs(amount);
      }

      // 日付範囲の更新
      if (!minDate || date < minDate) minDate = date;
      if (!maxDate || date > maxDate) maxDate = date;
    } catch (err) {
      console.warn('Failed to parse line:', line, err);
    }
  }

  if (transactions.length === 0) {
    throw new Error('有効な取引データが見つかりませんでした');
  }

  return {
    transactions,
    summary: {
      totalIncome,
      totalExpense,
      netAmount: totalIncome - totalExpense,
      transactionCount: transactions.length,
      dateRange: {
        start: minDate,
        end: maxDate,
      },
    },
    bankInfo: {
      name: bankFormat.name,
      accountType: 'checking',
    },
  };
};

// 取引データの検証
export const validateBankData = (data: ParsedBankData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (data.transactions.length === 0) {
    errors.push('取引データがありません');
  }

  if (data.summary.dateRange.start === '' || data.summary.dateRange.end === '') {
    errors.push('有効な日付範囲がありません');
  }

  // 異常な金額のチェック
  const hasInvalidAmounts = data.transactions.some(
    (t) =>
      Math.abs(t.amount) > 10000000 || // 1000万円以上
      Math.abs(t.balance) > 100000000 // 1億円以上
  );

  if (hasInvalidAmounts) {
    errors.push('異常な金額が検出されました');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// データの要約生成
export const generateDataSummary = (data: ParsedBankData): string => {
  const { summary, bankInfo } = data;
  const { totalIncome, totalExpense, netAmount, transactionCount, dateRange } = summary;

  return `
銀行: ${bankInfo.name}
期間: ${dateRange.start} ～ ${dateRange.end}
取引件数: ${transactionCount}件
収入合計: ${totalIncome.toLocaleString()}円
支出合計: ${totalExpense.toLocaleString()}円
差額: ${netAmount.toLocaleString()}円
  `.trim();
};
