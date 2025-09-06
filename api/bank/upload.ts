import { VercelRequest, VercelResponse } from '@vercel/node';

// 銀行データの型定義
interface BankTransaction {
  date: string;
  description: string;
  amount: number;
  balance: number;
  category?: string;
  bankName?: string;
  accountType?: string;
}

interface ParsedBankData {
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
  mufg: {
    name: '三菱UFJ銀行',
    amountColumn: 2,
    balanceColumn: 3,
  },
  smbc: {
    name: '三井住友銀行',
    amountColumn: 2,
    balanceColumn: 3,
  },
  mizuho: {
    name: 'みずほ銀行',
    amountColumn: 2,
    balanceColumn: 3,
  },
  rakuten: {
    name: '楽天銀行',
    amountColumn: 2,
    balanceColumn: 3,
  },
  default: {
    name: 'その他',
    amountColumn: 2,
    balanceColumn: 3,
  },
};

// 取引内容からカテゴリを自動判定
const categorizeTransaction = (description: string): string => {
  const desc = description.toLowerCase();

  if (desc.includes('給与') || desc.includes('給料')) return 'salary';
  if (desc.includes('ボーナス') || desc.includes('賞与')) return 'bonus';
  if (desc.includes('振込') && desc.includes('受取')) return 'transfer_in';
  if (desc.includes('利息') || desc.includes('利子')) return 'interest';
  if (desc.includes('家賃') || desc.includes('賃貸')) return 'rent';
  if (desc.includes('光熱費') || desc.includes('電気') || desc.includes('ガス')) return 'utilities';
  if (desc.includes('通信費') || desc.includes('電話')) return 'communication';
  if (desc.includes('保険')) return 'insurance';
  if (desc.includes('クレジット') || desc.includes('カード')) return 'credit_card';
  if (desc.includes('ATM') || desc.includes('手数料')) return 'fees';
  if (desc.includes('振込') && desc.includes('送金')) return 'transfer_out';
  if (desc.includes('買い物') || desc.includes('ショッピング')) return 'shopping';
  if (desc.includes('食費') || desc.includes('スーパー') || desc.includes('コンビニ'))
    return 'food';
  if (desc.includes('交通費') || desc.includes('電車') || desc.includes('バス'))
    return 'transportation';

  return 'other';
};

// 日付の正規化
const normalizeDate = (dateStr: string): string => {
  const formats = [
    /(\d{4})\/(\d{1,2})\/(\d{1,2})/,
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
    /(\d{4})(\d{2})(\d{2})/,
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      const [, year, month, day] = match;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  return dateStr;
};

// 金額の正規化
const normalizeAmount = (amountStr: string): number => {
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
const parseBankCSV = (csvText: string, bankName?: string): ParsedBankData => {
  const lines = csvText.split('\n').filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error('有効なCSVデータが見つかりません');
  }

  const detectedBank = bankName || detectBankName(csvText);
  const bankFormat =
    BANK_FORMATS[detectedBank as keyof typeof BANK_FORMATS] || BANK_FORMATS.default;

  const transactions: BankTransaction[] = [];
  let totalIncome = 0;
  let totalExpense = 0;
  let minDate = '';
  let maxDate = '';

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

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
        accountType: 'checking',
      };

      transactions.push(transaction);

      if (amount > 0) {
        totalIncome += amount;
      } else {
        totalExpense += Math.abs(amount);
      }

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

// データの検証
const validateBankData = (data: ParsedBankData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (data.transactions.length === 0) {
    errors.push('取引データがありません');
  }

  if (data.summary.dateRange.start === '' || data.summary.dateRange.end === '') {
    errors.push('有効な日付範囲がありません');
  }

  const hasInvalidAmounts = data.transactions.some(
    (t) => Math.abs(t.amount) > 10000000 || Math.abs(t.balance) > 100000000
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
const generateDataSummary = (data: ParsedBankData): string => {
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

// メモリ内ストア
const bankDataStore = new Map<string, ParsedBankData>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const { csvData, bankName, userId } = req.body;

    if (!csvData) {
      return res.status(400).json({
        success: false,
        message: 'CSVデータが必要です',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'ユーザーIDが必要です',
      });
    }

    // CSVデータを解析
    const parsedData = parseBankCSV(csvData, bankName);

    // データの検証
    const validation = validateBankData(parsedData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'データの検証に失敗しました',
        errors: validation.errors,
      });
    }

    // データをストアに保存
    const dataId = `bank_${userId}_${Date.now()}`;
    bankDataStore.set(dataId, parsedData);

    // 要約を生成
    const summary = generateDataSummary(parsedData);

    return res.status(200).json({
      success: true,
      data: {
        id: dataId,
        summary: parsedData.summary,
        bankInfo: parsedData.bankInfo,
        transactionCount: parsedData.transactions.length,
        dateRange: parsedData.summary.dateRange,
        textSummary: summary,
      },
    });
  } catch (error) {
    console.error('Error processing bank data:', error);
    return res.status(500).json({
      success: false,
      message: '銀行データの処理中にエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
