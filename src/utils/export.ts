import { Candidate } from '@/types';

/**
 * 候補者データをCSV形式でエクスポートする
 * @param candidates エクスポートする候補者データ配列
 */
export const exportCandidatesAsCSV = (candidates: Candidate[]): void => {
  if (!candidates || candidates.length === 0) {
    alert('エクスポートするデータがありません');
    return;
  }

  try {
    // ヘッダー行の作成
    const headers = [
      '氏名',
      '政党',
      '都道府県',
      '選挙区',
      '比例ブロック',
      '年齢',
      '性別',
      'ステータス',
      '支持率',
      'ウェブサイト',
      'Twitter',
      'Facebook',
      'Instagram',
      '最終更新日',
    ];

    // CSVデータの作成 - 明示的に型を定義
    const csvRows: string[] = [];

    // ヘッダー行を追加
    csvRows.push(headers.join(','));

    // 候補者データを追加
    for (const candidate of candidates) {
      const row = [
        // 値に「,」が含まれる場合は「"」で囲む
        `"${candidate.name}"`,
        `"${candidate.party}"`,
        candidate.prefecture ? `"${candidate.prefecture}"` : '',
        candidate.district !== null ? candidate.district : '',
        candidate.proportionalBlock ? `"${candidate.proportionalBlock}"` : '',
        candidate.age || '',
        candidate.gender
          ? candidate.gender === 'male'
            ? '男性'
            : candidate.gender === 'female'
              ? '女性'
              : 'その他'
          : '',
        candidate.status
          ? candidate.status === 'confirmed'
            ? '確定'
            : candidate.status === 'unofficial'
              ? '非公式'
              : '噂'
          : '',
        candidate.supportRate || '',
        candidate.website ? `"${candidate.website}"` : '',
        candidate.socialMedia?.twitter ? `"${candidate.socialMedia.twitter}"` : '',
        candidate.socialMedia?.facebook ? `"${candidate.socialMedia.facebook}"` : '',
        candidate.socialMedia?.instagram ? `"${candidate.socialMedia.instagram}"` : '',
        candidate.lastUpdated ? new Date(candidate.lastUpdated).toLocaleString('ja-JP') : '',
      ];
      csvRows.push(row.join(','));
    }

    // CSVデータを結合して一つの文字列にする
    const csvData = csvRows.join('\n');

    // BOMを追加して文字化けを防止
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvData], { type: 'text/csv;charset=utf-8;' });

    // ダウンロードリンクを作成
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);

    // 現在の日時を含むファイル名を設定
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `選挙候補者データ_${date}.csv`);

    // リンクをクリックしてダウンロード開始
    document.body.appendChild(link);
    link.click();

    // クリーンアップ
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('CSVエクスポート中にエラーが発生しました:', error);
    alert('エクスポート中にエラーが発生しました。もう一度お試しください。');
  }
};

/**
 * 候補者データをJSON形式でエクスポートする
 * @param candidates エクスポートする候補者データ配列
 */
export const exportCandidatesAsJSON = (candidates: Candidate[]): void => {
  if (!candidates || candidates.length === 0) {
    alert('エクスポートするデータがありません');
    return;
  }

  try {
    // JSONデータの作成（きれいに整形）
    const jsonData = JSON.stringify(candidates, null, 2);

    // BOMを追加して文字化けを防止
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + jsonData], { type: 'application/json;charset=utf-8;' });

    // ダウンロードリンクを作成
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);

    // 現在の日時を含むファイル名を設定
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `選挙候補者データ_${date}.json`);

    // リンクをクリックしてダウンロード開始
    document.body.appendChild(link);
    link.click();

    // クリーンアップ
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('JSONエクスポート中にエラーが発生しました:', error);
    alert('エクスポート中にエラーが発生しました。もう一度お試しください。');
  }
};

/**
 * 候補者データからレポートを生成する (プレミアム機能)
 * @param candidates レポートを生成する候補者データ配列
 * @param options レポート生成オプション
 */
export const generateCandidateReport = async (
  candidates: Candidate[],
  options: {
    format: 'pdf' | 'excel';
    includeCharts: boolean;
    includePredictions: boolean;
  }
): Promise<string | null> => {
  // この関数は実際にはバックエンドAPIを呼び出してレポートを生成する
  // フロントエンドではダウンロードリンクを返す
  try {
    // API呼び出しの代わりにダミーコード
    console.log('レポート生成中...', { candidates, options });

    // 実際の実装では、ここでバックエンドAPIを呼び出してレポートを生成する
    // const response = await reportApi.generateReport(candidates, options);
    // return response.data.downloadUrl;

    // デモ用：3秒待ってからダミーのダウンロードURLを返す
    return new Promise((resolve) => {
      setTimeout(() => {
        // 実際の実装ではサーバーからのURLを返す
        resolve('https://example.com/reports/dummy-report.pdf');
      }, 3000);
    });
  } catch (error) {
    console.error('レポート生成中にエラーが発生しました:', error);
    alert('レポート生成中にエラーが発生しました。もう一度お試しください。');
    return null;
  }
};
