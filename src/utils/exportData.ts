/**
 * データエクスポート機能のためのユーティリティ関数
 */

// エクスポートするデータの型定義
export interface ExportableData {
  date?: string;
  account?: string;
  value?: number;
  type?: string;
  category?: string;
  growth?: number;
  [key: string]: unknown;
}

/**
 * データをCSV形式でエクスポートする
 * @param data エクスポートするデータ
 * @param filename ファイル名（拡張子なし）
 */
export const exportToCSV = (data: ExportableData[], filename: string): void => {
  if (!data || data.length === 0) {
    console.error('エクスポートするデータがありません');
    return;
  }

  try {
    // ヘッダー行を生成（最初のオブジェクトのキーを使用）
    const headers = Object.keys(data[0]);

    // CSVデータを生成
    let csvContent = headers.join(',') + '\n';

    // 各行のデータを追加
    data.forEach((item) => {
      const row = headers.map((header) => {
        const value = item[header];

        // 文字列の場合はダブルクォートで囲む
        if (typeof value === 'string') {
          // カンマを含む場合はダブルクォートでエスケープ
          return `"${value.replace(/"/g, '""')}"`;
        } else if (value === null || value === undefined) {
          return '';
        } else {
          return String(value);
        }
      });

      csvContent += row.join(',') + '\n';
    });

    // BOMを追加してUTF-8エンコーディングを明示
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });

    // ダウンロードリンクを作成
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    // リンクをクリックしてダウンロード開始
    document.body.appendChild(link);
    link.click();

    // クリーンアップ
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`CSVファイル "${filename}.csv" がエクスポートされました`);
  } catch (error) {
    console.error('CSVエクスポートエラー:', error);
  }
};

/**
 * データをPDF形式でエクスポートする
 * @param data エクスポートするデータ
 * @param filename ファイル名（拡張子なし）
 */
export const exportToPDF = (data: ExportableData[], filename: string): void => {
  if (!data || data.length === 0) {
    console.error('エクスポートするデータがありません');
    return;
  }

  try {
    // 注意: 実際のアプリではjsPDF等のライブラリを使用してPDFを生成します
    // このデモでは簡易的にPDFデータとしてHTMLを生成し、印刷ダイアログを表示します

    // 一時的なHTML要素を作成
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      throw new Error('ポップアップがブロックされています。ブラウザの設定を確認してください。');
    }

    // HTMLコンテンツを生成
    const headers = Object.keys(data[0]);

    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>資産/負債レポート</h1>
          <p>作成日: ${new Date().toLocaleDateString()}</p>
          
          <table>
            <thead>
              <tr>
                ${headers.map((header) => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
      `;

    // テーブルの行を追加
    data.forEach((item) => {
      htmlContent += '<tr>';

      headers.forEach((header) => {
        const value = item[header];
        htmlContent += `<td>${value !== undefined && value !== null ? value : ''}</td>`;
      });

      htmlContent += '</tr>';
    });

    // HTML終了タグを追加
    htmlContent += `
            </tbody>
          </table>
          
          <div class="footer">
            <p>※このレポートは情報提供のみを目的としており、投資や財務上の助言を構成するものではありません。</p>
          </div>
          
          <script>
            // ページロード完了後に印刷ダイアログを表示
            window.onload = function() {
              setTimeout(function() {
                window.print();
                // 印刷後に自動的に閉じる場合はコメントを外す
                // window.close();
              }, 1000);
            };
          </script>
        </body>
        </html>
      `;

    // HTMLをドキュメントに書き込み
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    console.log(`PDFファイル "${filename}.pdf" のエクスポート準備が完了しました`);
  } catch (error) {
    console.error('PDFエクスポートエラー:', error);
  }
};

/**
 * データをExcel形式でエクスポートする
 * @param data エクスポートするデータ
 * @param filename ファイル名（拡張子なし）
 */
export const exportToExcel = (data: ExportableData[], filename: string): void => {
  if (!data || data.length === 0) {
    console.error('エクスポートするデータがありません');
    return;
  }

  try {
    // 注意: 実際のアプリではSheetJS/xlsx等のライブラリを使用してExcelを生成します
    // このデモでは簡易的に実装するためCSVエクスポートにリダイレクトします
    console.log('Excel形式へのエクスポートはSheetJSライブラリが必要です');
    console.log('代わりにCSV形式でエクスポートします');

    exportToCSV(data, filename);
  } catch (error) {
    console.error('Excelエクスポートエラー:', error);
  }
};

/**
 * カスタムレポートをJSON形式でエクスポートする
 * @param data エクスポートするデータ
 * @param options レポートオプション
 * @param filename ファイル名（拡張子なし）
 */
export const exportCustomReport = (
  data: ExportableData[],
  options: {
    includeCharts?: boolean;
    includeSummary?: boolean;
    dateRange?: { start: Date; end: Date };
  },
  filename: string
): void => {
  if (!data || data.length === 0) {
    console.error('エクスポートするデータがありません');
    return;
  }

  try {
    // レポートデータを構築
    const reportData = {
      metadata: {
        title: 'カスタム資産・負債レポート',
        generated: new Date().toISOString(),
        options,
      },
      data,
    };

    // JSONに変換
    const jsonContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });

    // ダウンロードリンクを作成
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';

    // リンクをクリックしてダウンロード開始
    document.body.appendChild(link);
    link.click();

    // クリーンアップ
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`JSONレポート "${filename}.json" がエクスポートされました`);
  } catch (error) {
    console.error('カスタムレポートエクスポートエラー:', error);
  }
};
