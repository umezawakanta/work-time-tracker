import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { TransactionImportResult, CSVTransactionData } from '@/types/transaction';

interface TransactionCSVUploaderProps {
  onUploadComplete: (result: TransactionImportResult) => void;
  userId: string;
}

export const TransactionCSVUploader: React.FC<TransactionCSVUploaderProps> = ({
  onUploadComplete,
  userId,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 銀行口座データを取得
  const fetchBankAccounts = async () => {
    try {
      const response = await fetch(`/api/bank-accounts?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setBankAccounts(result.data || []);
        // メイン口座をデフォルトで選択
        const mainAccount = result.data?.find((account: any) => account.isMainAccount);
        if (mainAccount) {
          setSelectedAccountId(mainAccount._id);
        } else if (result.data?.length > 0) {
          setSelectedAccountId(result.data[0]._id);
        }
      } else {
        console.error('Failed to fetch bank accounts:', result.message);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, [userId]);

  // CSVテンプレートのダウンロード
  const downloadTemplate = () => {
    const csvContent = [
      '日付,取引内容,金額,カテゴリ,口座名',
      '2024-01-01,給与,300000,給与,メイン口座',
      '2024-01-02,コンビニ,500,食費,メイン口座',
      '2024-01-03,電車代,200,交通費,メイン口座',
      '2024-01-04,スーパー,3000,食費,メイン口座',
      '2024-01-05,ガソリン代,5000,交通費,メイン口座',
      '2024-01-06,外食,2500,食費,メイン口座',
      '2024-01-07,家賃,-80000,住居費,メイン口座',
      '2024-01-08,光熱費,-15000,光熱費,メイン口座',
      '2024-01-09,携帯代,-5000,通信費,メイン口座',
      '2024-01-10,ボーナス,100000,給与,メイン口座',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transaction_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 横浜銀行の取引明細CSVを解析
  const parseYokohamaBankTransactionCSV = (csvText: string): CSVTransactionData[] => {
    const lines = csvText.split('\n').filter((line) => line.trim());
    console.log('Yokohama Bank CSV - Total lines:', lines.length);

    // ヘッダー行を検出
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('年月日') || line.includes('日付') || line.includes('date')) {
        headerIndex = i;
        break;
      }
    }

    const delimiter = detectDelimiter(csvText);
    const headers = lines[headerIndex].split(delimiter).map((h) => h.trim());
    console.log('Yokohama Bank Headers detected:', headers);

    const transactions: CSVTransactionData[] = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(delimiter).map((v) => v.trim());
      console.log(`Yokohama Bank CSV - Line ${i}:`, values);

      if (values.length < headers.length) {
        console.log(
          `Yokohama Bank CSV - Line ${i} has insufficient columns:`,
          values.length,
          'expected:',
          headers.length
        );
        continue;
      }

      try {
        // 日付の解析
        let date = '';
        let amount = 0;
        let description = '';

        // 日付フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (header.includes('年月日') || header.includes('日付') || header.includes('date')) {
            date = values[j];
            break;
          }
        }

        // 金額フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (header.includes('金額') || header.includes('残高') || header.includes('amount')) {
            const amountStr = values[j].replace(/[^\d.-]/g, '');
            amount = parseFloat(amountStr) || 0;
            break;
          }
        }

        // 取引内容フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('内容') ||
            header.includes('摘要') ||
            header.includes('description')
          ) {
            description = values[j];
            break;
          }
        }

        console.log(
          `Yokohama Bank CSV - Parsed: date=${date}, description=${description}, amount=${amount}`
        );

        if (date && amount !== 0) {
          // 日付の形式を統一
          const dateObj = new Date(date);
          const formattedDate = dateObj.toISOString().split('T')[0];

          // カテゴリの自動判定
          let category = 'その他';
          const desc = description.toLowerCase();
          if (desc.includes('給与') || desc.includes('ボーナス')) category = '給与';
          else if (
            desc.includes('食費') ||
            desc.includes('コンビニ') ||
            desc.includes('スーパー') ||
            desc.includes('外食')
          )
            category = '食費';
          else if (desc.includes('交通費') || desc.includes('電車') || desc.includes('ガソリン'))
            category = '交通費';
          else if (desc.includes('住居費') || desc.includes('家賃')) category = '住居費';
          else if (desc.includes('光熱費') || desc.includes('電気') || desc.includes('ガス'))
            category = '光熱費';
          else if (desc.includes('通信費') || desc.includes('携帯')) category = '通信費';

          transactions.push({
            date: formattedDate,
            description: description || '取引',
            amount: amount,
            category: category,
            accountName: '横浜銀行口座',
          });
          console.log(
            `Yokohama Bank CSV - Added transaction:`,
            transactions[transactions.length - 1]
          );
        } else {
          console.log(`Yokohama Bank CSV - Skipped line ${i}: date=${date}, amount=${amount}`);
        }
      } catch (error) {
        console.error('Error parsing line:', line, error);
      }
    }

    console.log('Yokohama Bank CSV - Total transactions found:', transactions.length);
    return transactions;
  };

  // じぶん銀行の取引明細CSVを解析
  const parseJibunBankTransactionCSV = (csvText: string): CSVTransactionData[] => {
    const lines = csvText.split('\n').filter((line) => line.trim());
    console.log('Jibun Bank CSV - Total lines:', lines.length);

    // ヘッダー行を検出
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('年月日') || line.includes('日付') || line.includes('date')) {
        headerIndex = i;
        break;
      }
    }

    const delimiter = detectDelimiter(csvText);
    const headers = lines[headerIndex].split(delimiter).map((h) => h.trim());
    console.log('Jibun Bank Headers detected:', headers);

    const transactions: CSVTransactionData[] = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(delimiter).map((v) => v.trim());
      console.log(`Jibun Bank CSV - Line ${i}:`, values);

      if (values.length < headers.length) {
        console.log(
          `Jibun Bank CSV - Line ${i} has insufficient columns:`,
          values.length,
          'expected:',
          headers.length
        );
        continue;
      }

      try {
        // 日付の解析
        let date = '';
        let amount = 0;
        let description = '';

        // 日付フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (header.includes('年月日') || header.includes('日付') || header.includes('date')) {
            date = values[j];
            break;
          }
        }

        // 金額フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (header.includes('金額') || header.includes('残高') || header.includes('amount')) {
            const amountStr = values[j].replace(/[^\d.-]/g, '');
            amount = parseFloat(amountStr) || 0;
            break;
          }
        }

        // 取引内容フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('内容') ||
            header.includes('摘要') ||
            header.includes('description')
          ) {
            description = values[j];
            break;
          }
        }

        console.log(
          `Jibun Bank CSV - Parsed: date=${date}, description=${description}, amount=${amount}`
        );

        if (date && amount !== 0) {
          // 日付の形式を統一
          const dateObj = new Date(date);
          const formattedDate = dateObj.toISOString().split('T')[0];

          // カテゴリの自動判定
          let category = 'その他';
          const desc = description.toLowerCase();
          if (desc.includes('給与') || desc.includes('ボーナス')) category = '給与';
          else if (
            desc.includes('食費') ||
            desc.includes('コンビニ') ||
            desc.includes('スーパー') ||
            desc.includes('外食')
          )
            category = '食費';
          else if (desc.includes('交通費') || desc.includes('電車') || desc.includes('ガソリン'))
            category = '交通費';
          else if (desc.includes('住居費') || desc.includes('家賃')) category = '住居費';
          else if (desc.includes('光熱費') || desc.includes('電気') || desc.includes('ガス'))
            category = '光熱費';
          else if (desc.includes('通信費') || desc.includes('携帯')) category = '通信費';

          transactions.push({
            date: formattedDate,
            description: description || '取引',
            amount: amount,
            category: category,
            accountName: 'じぶん銀行口座',
          });
          console.log(`Jibun Bank CSV - Added transaction:`, transactions[transactions.length - 1]);
        } else {
          console.log(`Jibun Bank CSV - Skipped line ${i}: date=${date}, amount=${amount}`);
        }
      } catch (error) {
        console.error('Error parsing line:', line, error);
      }
    }

    console.log('Jibun Bank CSV - Total transactions found:', transactions.length);
    return transactions;
  };

  // 三井住友銀行CL口座の取引明細CSVを解析
  const parseSMBCLTransactionCSV = (csvText: string): CSVTransactionData[] => {
    const lines = csvText.split('\n').filter((line) => line.trim());
    console.log('SMBC CL CSV - Total lines:', lines.length);

    // ヘッダー行を検出
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('年月日') || line.includes('日付') || line.includes('date')) {
        headerIndex = i;
        break;
      }
    }

    const delimiter = detectDelimiter(csvText);
    const headers = lines[headerIndex].split(delimiter).map((h) => h.trim());
    console.log('SMBC CL Headers detected:', headers);

    const transactions: CSVTransactionData[] = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(delimiter).map((v) => v.trim());
      console.log(`SMBC CL CSV - Line ${i}:`, values);

      if (values.length < headers.length) {
        console.log(
          `SMBC CL CSV - Line ${i} has insufficient columns:`,
          values.length,
          'expected:',
          headers.length
        );
        continue;
      }

      try {
        // 日付の解析
        let date = '';
        let amount = 0;
        let description = '';

        // 日付フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (header.includes('年月日') || header.includes('日付') || header.includes('date')) {
            date = values[j];
            break;
          }
        }

        // 金額フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (header.includes('金額') || header.includes('残高') || header.includes('amount')) {
            const amountStr = values[j].replace(/[^\d.-]/g, '');
            amount = parseFloat(amountStr) || 0;
            break;
          }
        }

        // 取引内容フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('内容') ||
            header.includes('摘要') ||
            header.includes('description')
          ) {
            description = values[j];
            break;
          }
        }

        console.log(
          `SMBC CL CSV - Parsed: date=${date}, description=${description}, amount=${amount}`
        );

        if (date && amount !== 0) {
          // 日付の形式を統一
          const dateObj = new Date(date);
          const formattedDate = dateObj.toISOString().split('T')[0];

          // カテゴリの自動判定
          let category = 'その他';
          const desc = description.toLowerCase();
          if (desc.includes('給与') || desc.includes('ボーナス')) category = '給与';
          else if (
            desc.includes('食費') ||
            desc.includes('コンビニ') ||
            desc.includes('スーパー') ||
            desc.includes('外食')
          )
            category = '食費';
          else if (desc.includes('交通費') || desc.includes('電車') || desc.includes('ガソリン'))
            category = '交通費';
          else if (desc.includes('住居費') || desc.includes('家賃')) category = '住居費';
          else if (desc.includes('光熱費') || desc.includes('電気') || desc.includes('ガス'))
            category = '光熱費';
          else if (desc.includes('通信費') || desc.includes('携帯')) category = '通信費';

          transactions.push({
            date: formattedDate,
            description: description || '取引',
            amount: amount,
            category: category,
            accountName: '三井住友銀行CL口座',
          });
          console.log(`SMBC CL CSV - Added transaction:`, transactions[transactions.length - 1]);
        } else {
          console.log(`SMBC CL CSV - Skipped line ${i}: date=${date}, amount=${amount}`);
        }
      } catch (error) {
        console.error('Error parsing line:', line, error);
      }
    }

    console.log('SMBC CL CSV - Total transactions found:', transactions.length);
    return transactions;
  };

  // アコムのカードローンの取引明細CSVを解析
  const parseAcomCardLoanTransactionCSV = (csvText: string): CSVTransactionData[] => {
    const lines = csvText.split('\n').filter((line) => line.trim());
    console.log('Acom Card Loan CSV - Total lines:', lines.length);

    // ヘッダー行を検出
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('年月日') || line.includes('日付') || line.includes('date')) {
        headerIndex = i;
        break;
      }
    }

    const delimiter = detectDelimiter(csvText);
    const headers = lines[headerIndex].split(delimiter).map((h) => h.trim());
    console.log('Acom Card Loan Headers detected:', headers);

    const transactions: CSVTransactionData[] = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(delimiter).map((v) => v.trim());
      console.log(`Acom Card Loan CSV - Line ${i}:`, values);

      if (values.length < headers.length) {
        console.log(
          `Acom Card Loan CSV - Line ${i} has insufficient columns:`,
          values.length,
          'expected:',
          headers.length
        );
        continue;
      }

      try {
        // 日付の解析
        let date = '';
        let amount = 0;
        let description = '';

        // 日付フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (header.includes('年月日') || header.includes('日付') || header.includes('date')) {
            date = values[j];
            break;
          }
        }

        // 金額フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (header.includes('金額') || header.includes('残高') || header.includes('amount')) {
            const amountStr = values[j].replace(/[^\d.-]/g, '');
            amount = parseFloat(amountStr) || 0;
            break;
          }
        }

        // 取引内容フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('内容') ||
            header.includes('摘要') ||
            header.includes('description')
          ) {
            description = values[j];
            break;
          }
        }

        console.log(
          `Acom Card Loan CSV - Parsed: date=${date}, description=${description}, amount=${amount}`
        );

        if (date && amount !== 0) {
          // 日付の形式を統一
          const dateObj = new Date(date);
          const formattedDate = dateObj.toISOString().split('T')[0];

          // カテゴリの自動判定
          let category = 'その他';
          const desc = description.toLowerCase();
          if (desc.includes('返済') || desc.includes('利息')) category = '借金返済';
          else if (desc.includes('利用') || desc.includes('ショッピング'))
            category = 'ショッピング';
          else if (desc.includes('手数料')) category = '手数料';

          transactions.push({
            date: formattedDate,
            description: description || '取引',
            amount: amount,
            category: category,
            accountName: 'アコムカードローン',
          });
          console.log(
            `Acom Card Loan CSV - Added transaction:`,
            transactions[transactions.length - 1]
          );
        } else {
          console.log(`Acom Card Loan CSV - Skipped line ${i}: date=${date}, amount=${amount}`);
        }
      } catch (error) {
        console.error('Error parsing line:', line, error);
      }
    }

    console.log('Acom Card Loan CSV - Total transactions found:', transactions.length);
    return transactions;
  };

  // アコムのショッピングの取引明細CSVを解析
  const parseAcomShoppingTransactionCSV = (csvText: string): CSVTransactionData[] => {
    const lines = csvText.split('\n').filter((line) => line.trim());
    console.log('Acom Shopping CSV - Total lines:', lines.length);

    // ヘッダー行を検出
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('年月日') || line.includes('日付') || line.includes('date')) {
        headerIndex = i;
        break;
      }
    }

    const delimiter = detectDelimiter(csvText);
    const headers = lines[headerIndex].split(delimiter).map((h) => h.trim());
    console.log('Acom Shopping Headers detected:', headers);

    const transactions: CSVTransactionData[] = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(delimiter).map((v) => v.trim());
      console.log(`Acom Shopping CSV - Line ${i}:`, values);

      if (values.length < headers.length) {
        console.log(
          `Acom Shopping CSV - Line ${i} has insufficient columns:`,
          values.length,
          'expected:',
          headers.length
        );
        continue;
      }

      try {
        // 日付の解析
        let date = '';
        let amount = 0;
        let description = '';

        // 日付フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (header.includes('年月日') || header.includes('日付') || header.includes('date')) {
            date = values[j];
            break;
          }
        }

        // 金額フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (header.includes('金額') || header.includes('残高') || header.includes('amount')) {
            const amountStr = values[j].replace(/[^\d.-]/g, '');
            amount = parseFloat(amountStr) || 0;
            break;
          }
        }

        // 取引内容フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('内容') ||
            header.includes('摘要') ||
            header.includes('description')
          ) {
            description = values[j];
            break;
          }
        }

        console.log(
          `Acom Shopping CSV - Parsed: date=${date}, description=${description}, amount=${amount}`
        );

        if (date && amount !== 0) {
          // 日付の形式を統一
          const dateObj = new Date(date);
          const formattedDate = dateObj.toISOString().split('T')[0];

          // カテゴリの自動判定
          let category = 'その他';
          const desc = description.toLowerCase();
          if (desc.includes('ショッピング') || desc.includes('利用')) category = 'ショッピング';
          else if (desc.includes('返済') || desc.includes('支払い')) category = '借金返済';
          else if (desc.includes('手数料')) category = '手数料';

          transactions.push({
            date: formattedDate,
            description: description || '取引',
            amount: amount,
            category: category,
            accountName: 'アコムショッピング',
          });
          console.log(
            `Acom Shopping CSV - Added transaction:`,
            transactions[transactions.length - 1]
          );
        } else {
          console.log(`Acom Shopping CSV - Skipped line ${i}: date=${date}, amount=${amount}`);
        }
      } catch (error) {
        console.error('Error parsing line:', line, error);
      }
    }

    console.log('Acom Shopping CSV - Total transactions found:', transactions.length);
    return transactions;
  };

  // PayPayカードの取引明細CSVを解析
  const parsePayPayCardTransactionCSV = (csvText: string): CSVTransactionData[] => {
    const lines = csvText.split('\n').filter((line) => line.trim());
    console.log('PayPay Card CSV - Total lines:', lines.length);

    // ヘッダー行を検出
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (
        line.includes('年月日') ||
        line.includes('日付') ||
        line.includes('date') ||
        line.includes('paypay')
      ) {
        headerIndex = i;
        break;
      }
    }

    const delimiter = detectDelimiter(csvText);
    const headers = lines[headerIndex].split(delimiter).map((h) => h.trim());
    console.log('PayPay Card Headers detected:', headers);

    const transactions: CSVTransactionData[] = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(delimiter).map((v) => v.trim());
      console.log(`PayPay Card CSV - Line ${i}:`, values);

      if (values.length < headers.length) {
        console.log(
          `PayPay Card CSV - Line ${i} has insufficient columns:`,
          values.length,
          'expected:',
          headers.length
        );
        continue;
      }

      try {
        // 日付の解析
        let date = '';
        let amount = 0;
        let description = '';

        // 日付フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('年月日') ||
            header.includes('日付') ||
            header.includes('date') ||
            header.includes('利用日')
          ) {
            date = values[j];
            break;
          }
        }

        // 金額フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('金額') ||
            header.includes('利用額') ||
            header.includes('amount') ||
            header.includes('支払額')
          ) {
            const amountStr = values[j].replace(/[^\d.-]/g, '');
            amount = parseFloat(amountStr) || 0;
            break;
          }
        }

        // 取引内容フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('内容') ||
            header.includes('摘要') ||
            header.includes('description') ||
            header.includes('利用先') ||
            header.includes('店舗名')
          ) {
            description = values[j];
            break;
          }
        }

        console.log(
          `PayPay Card CSV - Parsed: date=${date}, description=${description}, amount=${amount}`
        );

        if (date && amount !== 0) {
          // 日付の形式を統一
          const dateObj = new Date(date);
          const formattedDate = dateObj.toISOString().split('T')[0];

          // カテゴリの自動判定
          let category = 'その他';
          const desc = description.toLowerCase();
          if (
            desc.includes('コンビニ') ||
            desc.includes('スーパー') ||
            desc.includes('外食') ||
            desc.includes('レストラン')
          )
            category = '食費';
          else if (
            desc.includes('電車') ||
            desc.includes('バス') ||
            desc.includes('タクシー') ||
            desc.includes('ガソリン')
          )
            category = '交通費';
          else if (
            desc.includes('ショッピング') ||
            desc.includes('買い物') ||
            desc.includes('デパート')
          )
            category = 'ショッピング';
          else if (
            desc.includes('光熱費') ||
            desc.includes('電気') ||
            desc.includes('ガス') ||
            desc.includes('水道')
          )
            category = '光熱費';
          else if (
            desc.includes('通信費') ||
            desc.includes('携帯') ||
            desc.includes('インターネット')
          )
            category = '通信費';
          else if (desc.includes('医療費') || desc.includes('病院') || desc.includes('薬局'))
            category = '医療費';
          else if (desc.includes('娯楽') || desc.includes('映画') || desc.includes('ゲーム'))
            category = '娯楽費';

          transactions.push({
            date: formattedDate,
            description: description || 'PayPayカード利用',
            amount: amount,
            category: category,
            accountName: 'PayPayカード',
          });
          console.log(
            `PayPay Card CSV - Added transaction:`,
            transactions[transactions.length - 1]
          );
        } else {
          console.log(`PayPay Card CSV - Skipped line ${i}: date=${date}, amount=${amount}`);
        }
      } catch (error) {
        console.error('Error parsing line:', line, error);
      }
    }

    console.log('PayPay Card CSV - Total transactions found:', transactions.length);
    return transactions;
  };

  // auPayカードの取引明細CSVを解析
  const parseAuPayCardTransactionCSV = (csvText: string): CSVTransactionData[] => {
    const lines = csvText.split('\n').filter((line) => line.trim());
    console.log('auPay Card CSV - Total lines:', lines.length);

    // ヘッダー行を検出
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (
        line.includes('年月日') ||
        line.includes('日付') ||
        line.includes('date') ||
        line.includes('aupay') ||
        line.includes('au pay')
      ) {
        headerIndex = i;
        break;
      }
    }

    const delimiter = detectDelimiter(csvText);
    const headers = lines[headerIndex].split(delimiter).map((h) => h.trim());
    console.log('auPay Card Headers detected:', headers);

    const transactions: CSVTransactionData[] = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(delimiter).map((v) => v.trim());
      console.log(`auPay Card CSV - Line ${i}:`, values);

      if (values.length < headers.length) {
        console.log(
          `auPay Card CSV - Line ${i} has insufficient columns:`,
          values.length,
          'expected:',
          headers.length
        );
        continue;
      }

      try {
        // 日付の解析
        let date = '';
        let amount = 0;
        let description = '';

        // 日付フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('年月日') ||
            header.includes('日付') ||
            header.includes('date') ||
            header.includes('利用日') ||
            header.includes('取引日')
          ) {
            date = values[j];
            break;
          }
        }

        // 金額フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('金額') ||
            header.includes('利用額') ||
            header.includes('amount') ||
            header.includes('支払額') ||
            header.includes('決済額')
          ) {
            const amountStr = values[j].replace(/[^\d.-]/g, '');
            amount = parseFloat(amountStr) || 0;
            break;
          }
        }

        // 取引内容フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('内容') ||
            header.includes('摘要') ||
            header.includes('description') ||
            header.includes('利用先') ||
            header.includes('店舗名') ||
            header.includes('加盟店名')
          ) {
            description = values[j];
            break;
          }
        }

        console.log(
          `auPay Card CSV - Parsed: date=${date}, description=${description}, amount=${amount}`
        );

        if (date && amount !== 0) {
          // 日付の形式を統一
          const dateObj = new Date(date);
          const formattedDate = dateObj.toISOString().split('T')[0];

          // カテゴリの自動判定
          let category = 'その他';
          const desc = description.toLowerCase();
          if (
            desc.includes('コンビニ') ||
            desc.includes('スーパー') ||
            desc.includes('外食') ||
            desc.includes('レストラン')
          )
            category = '食費';
          else if (
            desc.includes('電車') ||
            desc.includes('バス') ||
            desc.includes('タクシー') ||
            desc.includes('ガソリン')
          )
            category = '交通費';
          else if (
            desc.includes('ショッピング') ||
            desc.includes('買い物') ||
            desc.includes('デパート')
          )
            category = 'ショッピング';
          else if (
            desc.includes('光熱費') ||
            desc.includes('電気') ||
            desc.includes('ガス') ||
            desc.includes('水道')
          )
            category = '光熱費';
          else if (
            desc.includes('通信費') ||
            desc.includes('携帯') ||
            desc.includes('インターネット')
          )
            category = '通信費';
          else if (desc.includes('医療費') || desc.includes('病院') || desc.includes('薬局'))
            category = '医療費';
          else if (desc.includes('娯楽') || desc.includes('映画') || desc.includes('ゲーム'))
            category = '娯楽費';

          transactions.push({
            date: formattedDate,
            description: description || 'auPayカード利用',
            amount: amount,
            category: category,
            accountName: 'auPayカード',
          });
          console.log(`auPay Card CSV - Added transaction:`, transactions[transactions.length - 1]);
        } else {
          console.log(`auPay Card CSV - Skipped line ${i}: date=${date}, amount=${amount}`);
        }
      } catch (error) {
        console.error('Error parsing line:', line, error);
      }
    }

    console.log('auPay Card CSV - Total transactions found:', transactions.length);
    return transactions;
  };

  // 三菱UFJ証券の取引明細CSVを解析
  const parseMUFJSecuritiesTransactionCSV = (csvText: string): CSVTransactionData[] => {
    const lines = csvText.split('\n').filter((line) => line.trim());
    console.log('MUFJ Securities CSV - Total lines:', lines.length);

    // ヘッダー行を検出
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('年月日') || line.includes('日付') || line.includes('date')) {
        headerIndex = i;
        break;
      }
    }

    const delimiter = detectDelimiter(csvText);
    const headers = lines[headerIndex].split(delimiter).map((h) => h.trim());
    console.log('MUFJ Securities Headers detected:', headers);

    const transactions: CSVTransactionData[] = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(delimiter).map((v) => v.trim());
      console.log(`MUFJ Securities CSV - Line ${i}:`, values);

      if (values.length < headers.length) {
        console.log(
          `MUFJ Securities CSV - Line ${i} has insufficient columns:`,
          values.length,
          'expected:',
          headers.length
        );
        continue;
      }

      try {
        // 日付の解析
        let date = '';
        let amount = 0;
        let description = '';

        // 日付フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (header.includes('年月日') || header.includes('日付') || header.includes('date')) {
            date = values[j];
            break;
          }
        }

        // 金額フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (header.includes('金額') || header.includes('残高') || header.includes('amount')) {
            const amountStr = values[j].replace(/[^\d.-]/g, '');
            amount = parseFloat(amountStr) || 0;
            break;
          }
        }

        // 取引内容フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('内容') ||
            header.includes('摘要') ||
            header.includes('description')
          ) {
            description = values[j];
            break;
          }
        }

        console.log(
          `MUFJ Securities CSV - Parsed: date=${date}, description=${description}, amount=${amount}`
        );

        if (date && amount !== 0) {
          // 日付の形式を統一
          const dateObj = new Date(date);
          const formattedDate = dateObj.toISOString().split('T')[0];

          // カテゴリの自動判定
          let category = 'その他';
          const desc = description.toLowerCase();
          if (desc.includes('給与') || desc.includes('ボーナス')) category = '給与';
          else if (
            desc.includes('食費') ||
            desc.includes('コンビニ') ||
            desc.includes('スーパー') ||
            desc.includes('外食')
          )
            category = '食費';
          else if (desc.includes('交通費') || desc.includes('電車') || desc.includes('ガソリン'))
            category = '交通費';
          else if (desc.includes('住居費') || desc.includes('家賃')) category = '住居費';
          else if (desc.includes('光熱費') || desc.includes('電気') || desc.includes('ガス'))
            category = '光熱費';
          else if (desc.includes('通信費') || desc.includes('携帯')) category = '通信費';

          transactions.push({
            date: formattedDate,
            description: description || '取引',
            amount: amount,
            category: category,
            accountName: '三菱UFJ証券口座',
          });
          console.log(
            `MUFJ Securities CSV - Added transaction:`,
            transactions[transactions.length - 1]
          );
        } else {
          console.log(`MUFJ Securities CSV - Skipped line ${i}: date=${date}, amount=${amount}`);
        }
      } catch (error) {
        console.error('Error parsing line:', line, error);
      }
    }

    console.log('MUFJ Securities CSV - Total transactions found:', transactions.length);
    return transactions;
  };

  // 三井住友銀行の取引明細CSVを解析
  const parseSMBCTransactionCSV = (csvText: string): CSVTransactionData[] => {
    const lines = csvText.split('\n').filter((line) => line.trim());
    console.log('SMBC CSV - Total lines:', lines.length);

    // ヘッダー行を検出
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('年月日') || line.includes('日付') || line.includes('date')) {
        headerIndex = i;
        break;
      }
    }

    const delimiter = detectDelimiter(csvText);
    const headers = lines[headerIndex].split(delimiter).map((h) => h.trim());
    console.log('SMBC Headers detected:', headers);

    const transactions: CSVTransactionData[] = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(delimiter).map((v) => v.trim());
      console.log(`SMBC CSV - Line ${i}:`, values);

      if (values.length < headers.length) {
        console.log(
          `SMBC CSV - Line ${i} has insufficient columns:`,
          values.length,
          'expected:',
          headers.length
        );
        continue;
      }

      try {
        // 日付の解析
        let date = '';
        let amount = 0;
        let description = '';

        // 日付フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (header.includes('年月日') || header.includes('日付') || header.includes('date')) {
            date = values[j];
            break;
          }
        }

        // 金額フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (header.includes('金額') || header.includes('残高') || header.includes('amount')) {
            const amountStr = values[j].replace(/[^\d.-]/g, '');
            amount = parseFloat(amountStr) || 0;
            break;
          }
        }

        // 取引内容フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('内容') ||
            header.includes('摘要') ||
            header.includes('description')
          ) {
            description = values[j];
            break;
          }
        }

        console.log(
          `SMBC CSV - Parsed: date=${date}, description=${description}, amount=${amount}`
        );

        if (date && amount !== 0) {
          // 日付の形式を統一
          const dateObj = new Date(date);
          const formattedDate = dateObj.toISOString().split('T')[0];

          // カテゴリの自動判定
          let category = 'その他';
          const desc = description.toLowerCase();
          if (desc.includes('給与') || desc.includes('ボーナス')) category = '給与';
          else if (
            desc.includes('食費') ||
            desc.includes('コンビニ') ||
            desc.includes('スーパー') ||
            desc.includes('外食')
          )
            category = '食費';
          else if (desc.includes('交通費') || desc.includes('電車') || desc.includes('ガソリン'))
            category = '交通費';
          else if (desc.includes('住居費') || desc.includes('家賃')) category = '住居費';
          else if (desc.includes('光熱費') || desc.includes('電気') || desc.includes('ガス'))
            category = '光熱費';
          else if (desc.includes('通信費') || desc.includes('携帯')) category = '通信費';

          transactions.push({
            date: formattedDate,
            description: description || '取引',
            amount: amount,
            category: category,
            accountName: 'メイン口座',
          });
          console.log(`SMBC CSV - Added transaction:`, transactions[transactions.length - 1]);
        } else {
          console.log(`SMBC CSV - Skipped line ${i}: date=${date}, amount=${amount}`);
        }
      } catch (error) {
        console.error('Error parsing line:', line, error);
      }
    }

    console.log('SMBC CSV - Total transactions found:', transactions.length);
    return transactions;
  };

  // 区切り文字を自動検出
  const detectDelimiter = (text: string): string => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length < 2) return ',';

    const firstLine = lines[0];
    const delimiters = [',', '\t', ';', '|'];
    let bestDelimiter = ',';
    let maxColumns = 0;

    for (const delimiter of delimiters) {
      const columns = firstLine.split(delimiter).length;
      if (columns > maxColumns) {
        maxColumns = columns;
        bestDelimiter = delimiter;
      }
    }

    console.log(`Detected delimiter: ${bestDelimiter} (${maxColumns} columns)`);
    return bestDelimiter;
  };

  // 汎用CSVを解析
  const parseGenericCSV = (csvText: string): CSVTransactionData[] => {
    const lines = csvText.split('\n').filter((line) => line.trim());
    console.log('Generic CSV - Total lines:', lines.length);

    if (lines.length < 2) {
      console.log('Generic CSV - Not enough lines');
      return [];
    }

    const delimiter = detectDelimiter(csvText);
    const headers = lines[0].split(delimiter).map((h) => h.trim());
    console.log('Generic CSV - Headers:', headers);

    const transactions: CSVTransactionData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(delimiter).map((v) => v.trim());
      console.log(`Generic CSV - Line ${i}:`, values);

      // より柔軟な列数のチェック
      if (values.length < 3) {
        console.log(`Generic CSV - Line ${i} has too few columns:`, values.length);
        continue;
      }

      try {
        // 列数に応じて柔軟に処理
        const date = values[0];
        const description = values[1] || '';
        const amountStr = values[2] || '0';
        const category = values[3] || 'その他';
        const accountName = values[4] || 'メイン口座';

        const amount = parseFloat(amountStr.replace(/[^\d.-]/g, '')) || 0;
        console.log(
          `Generic CSV - Parsed: date=${date}, description=${description}, amount=${amount}`
        );

        if (date && description && amount !== 0) {
          transactions.push({
            date: date,
            description: description,
            amount: amount,
            category: category,
            accountName: accountName,
          });
          console.log(`Generic CSV - Added transaction:`, transactions[transactions.length - 1]);
        } else {
          console.log(
            `Generic CSV - Skipped line ${i}: date=${date}, description=${description}, amount=${amount}`
          );
        }
      } catch (error) {
        console.error('Error parsing line:', line, error);
      }
    }

    console.log('Generic CSV - Total transactions found:', transactions.length);
    return transactions;
  };

  // じぶん銀行の取引明細CSVを解析
  const parseJibunBankCSV = (csvText: string): CSVTransactionData[] => {
    const lines = csvText.split('\n').filter((line) => line.trim());
    console.log('Jibun Bank CSV - Total lines:', lines.length);

    // ヘッダー行を検出（じぶん銀行の特徴的なヘッダーを検索）
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (
        line.includes('取引日') ||
        line.includes('日付') ||
        line.includes('年月日') ||
        line.includes('date') ||
        line.includes('じぶん銀行')
      ) {
        headerIndex = i;
        break;
      }
    }

    const delimiter = detectDelimiter(csvText);
    const headers = lines[headerIndex].split(delimiter).map((h) => h.trim());
    console.log('Jibun Bank Headers detected:', headers);

    const transactions: CSVTransactionData[] = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(delimiter).map((v) => v.trim());
      console.log(`Jibun Bank CSV - Line ${i}:`, values);

      if (values.length < headers.length) {
        console.log(
          `Jibun Bank CSV - Line ${i} has insufficient columns:`,
          values.length,
          'expected:',
          headers.length
        );
        continue;
      }

      try {
        // 日付の解析
        let date = '';
        let amount = 0;
        let description = '';

        // 日付フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('取引日') ||
            header.includes('年月日') ||
            header.includes('日付') ||
            header.includes('date')
          ) {
            date = values[j];
            break;
          }
        }

        // 金額フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('金額') ||
            header.includes('入金') ||
            header.includes('出金') ||
            header.includes('amount') ||
            header.includes('残高')
          ) {
            const amountStr = values[j].replace(/[^\d.-]/g, '');
            amount = parseFloat(amountStr) || 0;
            break;
          }
        }

        // 取引内容フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('内容') ||
            header.includes('摘要') ||
            header.includes('取引内容') ||
            header.includes('備考') ||
            header.includes('description')
          ) {
            description = values[j];
            break;
          }
        }

        console.log(
          `Jibun Bank CSV - Parsed: date=${date}, description=${description}, amount=${amount}`
        );

        if (date && amount !== 0) {
          // 日付の形式を統一
          const dateObj = new Date(date);
          const formattedDate = dateObj.toISOString().split('T')[0];

          // カテゴリの自動判定
          let category = 'その他';
          const desc = description.toLowerCase();
          if (desc.includes('給与') || desc.includes('ボーナス')) category = '給与';
          else if (
            desc.includes('食費') ||
            desc.includes('コンビニ') ||
            desc.includes('スーパー') ||
            desc.includes('外食')
          )
            category = '食費';
          else if (desc.includes('交通費') || desc.includes('電車') || desc.includes('ガソリン'))
            category = '交通費';
          else if (desc.includes('住居費') || desc.includes('家賃')) category = '住居費';
          else if (desc.includes('光熱費') || desc.includes('電気') || desc.includes('ガス'))
            category = '光熱費';
          else if (desc.includes('通信費') || desc.includes('携帯')) category = '通信費';

          transactions.push({
            date: formattedDate,
            description: description || '取引',
            amount: amount,
            category: category,
            accountName: 'メイン口座',
          });
          console.log(`Jibun Bank CSV - Added transaction:`, transactions[transactions.length - 1]);
        } else {
          console.log(`Jibun Bank CSV - Skipped line ${i}: date=${date}, amount=${amount}`);
        }
      } catch (error) {
        console.error('Error parsing line:', line, error);
      }
    }

    console.log('Jibun Bank CSV - Total transactions found:', transactions.length);
    return transactions;
  };

  // 横浜銀行の取引明細CSVを解析
  const parseYokohamaBankCSV = (csvText: string): CSVTransactionData[] => {
    const lines = csvText.split('\n').filter((line) => line.trim());
    console.log('Yokohama Bank CSV - Total lines:', lines.length);

    // ヘッダー行を検出（横浜銀行の特徴的なヘッダーを検索）
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (
        line.includes('取引日') ||
        line.includes('日付') ||
        line.includes('年月日') ||
        line.includes('date')
      ) {
        headerIndex = i;
        break;
      }
    }

    const delimiter = detectDelimiter(csvText);
    const headers = lines[headerIndex].split(delimiter).map((h) => h.trim());
    console.log('Yokohama Bank Headers detected:', headers);

    const transactions: CSVTransactionData[] = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(delimiter).map((v) => v.trim());
      console.log(`Yokohama Bank CSV - Line ${i}:`, values);

      if (values.length < headers.length) {
        console.log(
          `Yokohama Bank CSV - Line ${i} has insufficient columns:`,
          values.length,
          'expected:',
          headers.length
        );
        continue;
      }

      try {
        // 日付の解析
        let date = '';
        let amount = 0;
        let description = '';

        // 日付フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('取引日') ||
            header.includes('年月日') ||
            header.includes('日付') ||
            header.includes('date')
          ) {
            date = values[j];
            break;
          }
        }

        // 金額フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('金額') ||
            header.includes('入金') ||
            header.includes('出金') ||
            header.includes('amount')
          ) {
            const amountStr = values[j].replace(/[^\d.-]/g, '');
            amount = parseFloat(amountStr) || 0;
            break;
          }
        }

        // 取引内容フィールドを探す
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j].toLowerCase();
          if (
            header.includes('内容') ||
            header.includes('摘要') ||
            header.includes('取引内容') ||
            header.includes('description')
          ) {
            description = values[j];
            break;
          }
        }

        console.log(
          `Yokohama Bank CSV - Parsed: date=${date}, description=${description}, amount=${amount}`
        );

        if (date && amount !== 0) {
          // 日付の形式を統一
          const dateObj = new Date(date);
          const formattedDate = dateObj.toISOString().split('T')[0];

          // カテゴリの自動判定
          let category = 'その他';
          const desc = description.toLowerCase();
          if (desc.includes('給与') || desc.includes('ボーナス')) category = '給与';
          else if (
            desc.includes('食費') ||
            desc.includes('コンビニ') ||
            desc.includes('スーパー') ||
            desc.includes('外食')
          )
            category = '食費';
          else if (desc.includes('交通費') || desc.includes('電車') || desc.includes('ガソリン'))
            category = '交通費';
          else if (desc.includes('住居費') || desc.includes('家賃')) category = '住居費';
          else if (desc.includes('光熱費') || desc.includes('電気') || desc.includes('ガス'))
            category = '光熱費';
          else if (desc.includes('通信費') || desc.includes('携帯')) category = '通信費';

          transactions.push({
            date: formattedDate,
            description: description || '取引',
            amount: amount,
            category: category,
            accountName: 'メイン口座',
          });
          console.log(
            `Yokohama Bank CSV - Added transaction:`,
            transactions[transactions.length - 1]
          );
        } else {
          console.log(`Yokohama Bank CSV - Skipped line ${i}: date=${date}, amount=${amount}`);
        }
      } catch (error) {
        console.error('Error parsing line:', line, error);
      }
    }

    console.log('Yokohama Bank CSV - Total transactions found:', transactions.length);
    return transactions;
  };

  // CSVファイルの解析
  const parseCSV = (csvText: string): CSVTransactionData[] => {
    // 銀行形式を判定
    const isSMBCFormat = csvText.includes('年月日') || csvText.includes('残高');
    const isYokohamaFormat = csvText.includes('取引日') || csvText.includes('横浜銀行');
    const isJibunFormat = csvText.includes('じぶん銀行') || csvText.includes('JIBUN BANK');
    const isSMBCLFormat = csvText.includes('三井住友銀行') && csvText.includes('CL');
    const isMUFJSecuritiesFormat = csvText.includes('三菱UFJ') || csvText.includes('証券');
    const isAcomCardLoanFormat = csvText.includes('アコム') && csvText.includes('カードローン');
    const isAcomShoppingFormat = csvText.includes('アコム') && csvText.includes('ショッピング');
    const isPayPayCardFormat =
      csvText.includes('PayPay') || csvText.includes('paypay') || csvText.includes('PAYPAY');
    const isAuPayCardFormat =
      csvText.includes('auPay') ||
      csvText.includes('au pay') ||
      csvText.includes('AUPay') ||
      csvText.includes('AU PAY');

    if (isSMBCFormat && !isSMBCLFormat) {
      console.log('Detected SMBC format');
      return parseSMBCTransactionCSV(csvText);
    } else if (isYokohamaFormat) {
      console.log('Detected Yokohama Bank format');
      return parseYokohamaBankTransactionCSV(csvText);
    } else if (isJibunFormat) {
      console.log('Detected Jibun Bank format');
      return parseJibunBankTransactionCSV(csvText);
    } else if (isSMBCLFormat) {
      console.log('Detected SMBC CL format');
      return parseSMBCLTransactionCSV(csvText);
    } else if (isMUFJSecuritiesFormat) {
      console.log('Detected MUFJ Securities format');
      return parseMUFJSecuritiesTransactionCSV(csvText);
    } else if (isAcomCardLoanFormat) {
      console.log('Detected Acom Card Loan format');
      return parseAcomCardLoanTransactionCSV(csvText);
    } else if (isAcomShoppingFormat) {
      console.log('Detected Acom Shopping format');
      return parseAcomShoppingTransactionCSV(csvText);
    } else if (isPayPayCardFormat) {
      console.log('Detected PayPay Card format');
      return parsePayPayCardTransactionCSV(csvText);
    } else if (isAuPayCardFormat) {
      console.log('Detected auPay Card format');
      return parseAuPayCardTransactionCSV(csvText);
    } else {
      console.log('Detected generic format');
      return parseGenericCSV(csvText);
    }
  };

  // データの検証
  const validateData = (data: CSVTransactionData[]): string[] => {
    const errors: string[] = [];

    data.forEach((item, index) => {
      const rowNum = index + 2; // ヘッダー行を考慮

      if (!item.date) {
        errors.push(`行${rowNum}: 日付が入力されていません`);
      }
      if (!item.description) {
        errors.push(`行${rowNum}: 取引内容が入力されていません`);
      }
      if (item.amount === 0) {
        errors.push(`行${rowNum}: 金額が0または入力されていません`);
      }
    });

    return errors;
  };

  // 文字コードを検出してテキストを読み込む
  const readFileWithEncoding = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // 文字コードを検出
    const encodings = ['shift_jis', 'utf-8', 'euc-jp', 'iso-2022-jp'];
    let detectedText = '';
    let detectedEncoding = 'utf-8';

    for (const encoding of encodings) {
      try {
        const decoder = new TextDecoder(encoding);
        const text = decoder.decode(uint8Array);

        // 日本語文字が正しくデコードされているかチェック
        if (
          text.includes('年月日') ||
          text.includes('日付') ||
          text.includes('金額') ||
          text.includes('内容')
        ) {
          detectedText = text;
          detectedEncoding = encoding;
          console.log(`Detected encoding: ${encoding}`);
          break;
        }
      } catch (error) {
        console.log(`Failed to decode with ${encoding}:`, error);
        continue;
      }
    }

    // どのエンコーディングでも成功しなかった場合はUTF-8でフォールバック
    if (!detectedText) {
      const decoder = new TextDecoder('utf-8');
      detectedText = decoder.decode(uint8Array);
      detectedEncoding = 'utf-8';
      console.log('Fallback to UTF-8 encoding');
    }

    return detectedText;
  };

  // ファイルアップロード処理
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!selectedAccountId) {
      toast.error('取引明細を紐付ける口座を選択してください');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // ファイルの読み込み（文字コード自動検出）
      const text = await readFileWithEncoding(file);
      console.log('File content preview:', text.substring(0, 500));
      console.log('File lines:', text.split('\n').length);

      // 文字化けチェック
      if (text.includes('') || text.includes('N◆◆') || text.includes('舵')) {
        console.warn('Possible character encoding issues detected');
        toast.warning(
          'ファイルの文字コードに問題がある可能性があります。Shift_JISで保存されたCSVファイルをアップロードしてください。'
        );
      }

      // CSVの解析
      const transactions = parseCSV(text);
      console.log('Parsed transactions:', transactions);
      console.log('Transaction count:', transactions.length);

      if (transactions.length === 0) {
        // より詳細なエラーメッセージを提供
        const lines = text.split('\n').filter((line) => line.trim());
        console.log('CSV lines:', lines);
        console.log('First few lines:', lines.slice(0, 5));

        if (lines.length === 0) {
          throw new Error('CSVファイルが空です');
        } else if (lines.length === 1) {
          throw new Error('CSVファイルにヘッダーのみで、データ行がありません');
        } else {
          throw new Error(
            `CSVファイルに${lines.length}行ありますが、有効な取引データが見つかりませんでした。ファイル形式を確認してください。`
          );
        }
      }

      // データの検証
      const errors = validateData(transactions);
      if (errors.length > 0) {
        throw new Error(`データの検証に失敗しました: ${errors.join(', ')}`);
      }

      setUploadProgress(50);

      // 選択された口座の情報を取得
      const selectedAccount = bankAccounts.find((account) => account._id === selectedAccountId);
      const accountName = selectedAccount
        ? `${selectedAccount.bankName} ${selectedAccount.branchName ? `${selectedAccount.branchName} ` : ''}${selectedAccount.accountName}`
        : '選択された口座';

      // 取引明細に口座情報を追加
      const transactionsWithAccount = transactions.map((tx) => ({
        ...tx,
        accountName: accountName,
        accountId: selectedAccountId,
      }));

      // サーバーに送信
      const response = await fetch('/api/transactions/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          transactions: transactionsWithAccount,
        }),
      });

      setUploadProgress(80);

      const result = await response.json();
      console.log('Import result:', result);

      if (result.success) {
        setUploadProgress(100);
        toast.success(`${result.importedCount}件の取引明細をインポートしました`);
        onUploadComplete(result);
      } else {
        throw new Error(result.message || 'インポートに失敗しました');
      }
    } catch (error) {
      console.error('CSV upload error:', error);
      toast.error(
        `CSVアップロードエラー: ${error instanceof Error ? error.message : '不明なエラー'}`
      );
      onUploadComplete({
        success: false,
        message: error instanceof Error ? error.message : '不明なエラー',
        importedCount: 0,
        errors: [],
        transactions: [],
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // ドラッグ&ドロップ処理
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">取引明細CSVインポート</h3>
        <p className="text-gray-600">
          日々の収支を把握するために、銀行の取引明細CSVファイルをアップロードしてください
        </p>
      </div>

      {/* テンプレートダウンロード */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">CSVテンプレートをダウンロード</h4>
              <p className="text-sm text-blue-700">
                正しい形式でCSVファイルを作成するためのテンプレートです
              </p>
            </div>
            <Button onClick={downloadTemplate} variant="outline" className="border-blue-300">
              <Download className="h-4 w-4 mr-2" />
              テンプレートをダウンロード
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 口座選択 */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              <h4 className="font-semibold text-purple-900">取引明細を紐付ける口座を選択</h4>
            </div>

            {loadingAccounts ? (
              <div className="flex items-center gap-2 text-purple-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="text-sm">口座情報を読み込み中...</span>
              </div>
            ) : bankAccounts.length === 0 ? (
              <div className="text-purple-700 text-sm">
                <p>登録されている口座がありません。</p>
                <p>先に「口座管理」タブで口座を登録してください。</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="口座を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account._id} value={account._id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>
                            {account.bankName} {account.branchName ? `${account.branchName} ` : ''}
                            {account.accountName}
                          </span>
                          {account.isMainAccount && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              メイン
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-purple-600">選択した口座に取引明細が紐付けられます</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* アップロードエリア */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <CardContent
          className="p-8 text-center"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                取引明細CSVファイルをアップロード
              </h4>
              <p className="text-gray-600 mb-4">
                ファイルをドラッグ&ドロップするか、クリックして選択してください
              </p>

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mb-4"
              >
                <FileText className="h-4 w-4 mr-2" />
                ファイルを選択
              </Button>
            </div>

            {/* 対応形式 */}
            <div className="text-sm text-gray-500">
              <p className="font-semibold mb-2">対応形式:</p>
              <ul className="space-y-1">
                <li>• 三井住友銀行の取引明細CSV</li>
                <li>• 横浜銀行の取引明細CSV</li>
                <li>• じぶん銀行の取引明細CSV</li>
                <li>• 三井住友銀行CL口座の取引明細CSV</li>
                <li>• 三菱UFJ証券の取引明細CSV</li>
                <li>• アコムカードローンの取引明細CSV</li>
                <li>• アコムショッピングの取引明細CSV</li>
                <li>• PayPayカードの取引明細CSV</li>
                <li>• auPayカードの取引明細CSV</li>
                <li>• 汎用CSV形式（日付,取引内容,金額,カテゴリ,口座名）</li>
                <li>• 文字エンコーディング: Shift_JIS, UTF-8, EUC-JP</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* プログレスバー */}
      {isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>アップロード中...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
