import React, { useState, useMemo } from 'react';
import './ShareButtonComponent.css';
import { APP_VERSION, getLatestChangelog } from '../constants/version';

interface ShareButtonComponentProps {
  className?: string;
}

// バージョン紹介文言の配列を生成する関数
const getVersionMessages = (version: string) => [
  `最新バージョン${version}で更新要望・不具合報告機能を追加！`,
  `v${version}でユーザビリティが大幅に向上しました！`,
  `新機能満載のv${version}をぜひお試しください！`,
  `v${version}でエラーハンドリングが改善されました！`,
  `最新アップデートv${version}でより使いやすく！`,
  `v${version}で新機能と改善が追加されました！`,
  `最新版v${version}でパフォーマンスが向上！`,
  `v${version}でコード品質が大幅に改善されました！`,
  `新バージョンv${version}で機能が充実！`,
  `v${version}でユーザーエクスペリエンスが向上！`
];




const ShareButtonComponent: React.FC<ShareButtonComponentProps> = ({ className = '' }) => {
  // バージョン紹介文言の配列をメモ化（APP_VERSIONは実行時に変更されないため）
  const versionMessages = useMemo(() => getVersionMessages(APP_VERSION), []);
  const [isOpen, setIsOpen] = useState(false);
  const [randomElements, setRandomElements] = useState(() => generateRandomElements());
  const [stats, setStats] = useState({
    userCount: 0,
    errorCount: 0,
    updateRequestCount: 0,
    linterErrorCount: 0,
    testErrorCount: 0,
    loading: true
  });

  const siteUrl = window.location.origin;
  
  // 統計データを取得する関数
  const loadStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 並列で複数のAPIを呼び出し
      const [adminUsersResponse, errorReportsResponse, publicMemosResponse, linterErrorsResponse, testResultsResponse] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/error-reports', { headers }),
        fetch('/api/memos/public', { headers }),
        fetch('/api/admin/linter-errors', { headers }),
        fetch('/api/admin/test-results', { headers })
      ]);

      let userCount = 0;
      let errorCount = 0;
      let updateRequestCount = 0;
      let linterErrorCount = 0;
      let testErrorCount = 0;

      // ユーザー数を取得
      if (adminUsersResponse.ok) {
        const adminData = await adminUsersResponse.json();
        userCount = adminData.users?.length || 0;
      }

      // エラー報告数を取得
      if (errorReportsResponse.ok) {
        const errorData = await errorReportsResponse.json();
        errorCount = errorData.errorReports?.length || 0;
      }

      // 更新要望数を取得
      if (publicMemosResponse.ok) {
        const memosData = await publicMemosResponse.json();
        updateRequestCount = (memosData.memos || []).filter((memo: any) => 
          memo.postType === 'update_request'
        ).length;
      }

      // リンターエラー数を取得
      if (linterErrorsResponse.ok) {
        const linterData = await linterErrorsResponse.json();
        linterErrorCount = linterData.errors?.length || 0;
      }

      // ユニットテストエラー数を取得
      if (testResultsResponse.ok) {
        const testData = await testResultsResponse.json();
        testErrorCount = testData.failed || 0;
      }

      setStats({
        userCount,
        errorCount,
        updateRequestCount,
        linterErrorCount,
        testErrorCount,
        loading: false
      });
    } catch (error) {
      console.error('統計データの取得に失敗しました:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  // コンポーネントマウント時に統計データを取得
  useEffect(() => {
    loadStats();
  }, []);

  // ランダムな要素を生成する関数
  function generateRandomElements() {
    const adjectives = ['可愛い', '素敵な', '楽しい', '便利な', '効率的な', '魅力的な', '実用的な', '革新的な', '優しい', '親しみやすい', '頼もしい', '面白い', '素晴らしい', '驚きの', '特別な', 'ユニークな'];
    const characters = ['キャラクター', '仲間', 'パートナー', 'お友達', 'アシスタント', 'サポーター', '相棒', 'チームメイト', 'ガイド', 'コーチ', 'メンター', 'バディ'];
    const activities = ['作業時間管理', '時間トラッキング', 'プロジェクト管理', 'タスク管理', '時間記録', '作業効率化', '生産性向上', '時間活用', 'スケジュール管理', '進捗管理', '目標達成', '成果向上'];
    const features = ['タイマー機能', 'メモ機能', '作業記録', '分析機能', 'レポート機能', 'カレンダー機能', '統計機能', '目標設定', '通知機能', 'データ可視化', 'エクスポート機能', 'カスタマイズ機能', '同期機能', 'バックアップ機能'];
    const benefits = ['効率的な作業管理', '時間の有効活用', '生産性の向上', '目標達成のサポート', '進捗の可視化', '習慣の定着', 'モチベーション維持', '成果の分析'];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    const randomFeatures = features.sort(() => 0.5 - Math.random()).slice(0, 3);
    const randomBenefit = benefits[Math.floor(Math.random() * benefits.length)];
    
    // バージョン紹介文言を動的に生成（メモ化された配列を使用）
    const randomVersionMessage = versionMessages[Math.floor(Math.random() * versionMessages.length)];
    
    return {
      adjective: randomAdjective,
      character: randomCharacter,
      activity: randomActivity,
      features: randomFeatures,
      benefit: randomBenefit,
      versionMessage: randomVersionMessage
    };
  }

  const siteTitle = `Work Time Tracker v${APP_VERSION} - ${randomElements.adjective}${randomElements.character}と一緒に${randomElements.activity}`;
  
  // 最新の更新履歴を取得
  const getLatestUpdateInfo = () => {
    const latestChangelog = getLatestChangelog();
    if (!latestChangelog) {
      return '';
    }
    
    const typeLabels = {
      bugfix: "🐛 バグ修正",
      feature: "✨ 新機能",
      improvement: "⚡ 改善",
      breaking: "💥 破壊的変更"
    };
    
    const typeLabel = typeLabels[latestChangelog.type];
    const changesText = latestChangelog.changes.slice(0, 2).join('、'); // 最初の2つの変更のみ表示
    
    return `\n\n🆕 最新更新 (v${latestChangelog.version}): ${typeLabel}\n${changesText}`;
  };
  
  // 統計データを含む説明文を生成
  const getStatsText = () => {
    if (stats.loading) {
      return '統計データを読み込み中...';
    }
    const statsParts = [];
    if (stats.userCount > 0) {
      statsParts.push(`👥 ${stats.userCount}名のユーザー`);
    }
    if (stats.errorCount > 0) {
      statsParts.push(`🐛 ${stats.errorCount}件の不具合報告`);
    }
    if (stats.updateRequestCount > 0) {
      statsParts.push(`💡 ${stats.updateRequestCount}件の更新要望`);
    }
    if (stats.linterErrorCount > 0) {
      statsParts.push(`🔍 ${stats.linterErrorCount}件のリンターエラー`);
    }
    if (stats.testErrorCount > 0) {
      statsParts.push(`🧪 ${stats.testErrorCount}件のテストエラー`);
    }
    return statsParts.length > 0 ? `\n\n📊 現在の状況: ${statsParts.join('、')}` : '';
  };
  
  // 基礎テキスト要素を生成するユーティリティ関数（メモ化）
  const baseTextElements = useMemo(() => {
    const intro = `${randomElements.adjective}${randomElements.character}と一緒に${randomElements.activity}ができるWebアプリです。`;
    const features = `${randomElements.features.join('、')}など、${randomElements.benefit}をサポートします。`;
    const promise = `ユーザーから要求があった機能をすぐに実装します！`;
    const versionMsg = `\n\n${randomElements.versionMessage}`;
    const latestUpdate = getLatestUpdateInfo();
    const statsText = getStatsText();
    
    return {
      intro,
      features,
      promise,
      versionMsg,
      latestUpdate,
      statsText
    };
  }, [randomElements, stats]);

  const getSiteDescription = () => {
    return `${baseTextElements.intro}${baseTextElements.features}${baseTextElements.promise}${baseTextElements.versionMsg}${baseTextElements.latestUpdate}${baseTextElements.statsText}`;
  };

  const siteDescription = getSiteDescription();
  
  /**
   * Twitter用の短縮テキストを生成
   * 文字数制限（280文字）を超える場合は統計情報と最新アップデート情報を省略
   */
  const generateTwitterText = () => {
    const baseText = baseTextElements.intro;
    const versionInfo = `${baseTextElements.versionMsg}${baseTextElements.latestUpdate}${baseTextElements.statsText}`;
    const fullText = `${siteTitle}\n\n${baseText}${versionInfo}\n\n${siteUrl}`;
    
    const maxTwitterLength = 280;
    if (fullText.length <= maxTwitterLength) {
      return fullText;
    }
    
    // 文字数制限を超える場合は短縮版を使用
    // Fallback: omit stats and latest update info for brevity
    const shortVersionInfo = baseTextElements.versionMsg;
    return `${siteTitle}\n\n${baseText}${shortVersionInfo}\n\n${siteUrl}`;
  };
  
  const finalTwitterText = generateTwitterText();

  const shareData = {
    title: siteTitle,
    text: siteDescription,
    url: siteUrl,
  };

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(siteUrl);
    const encodedTitle = encodeURIComponent(siteTitle);
    const encodedDescription = encodeURIComponent(siteDescription);
    const encodedTwitterText = encodeURIComponent(finalTwitterText);

    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTwitterText}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedDescription}`;
        break;
      case 'line':
        shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedDescription}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;
        break;
      case 'copy':
        try {
          const copyText = `${siteTitle}\n\n${siteDescription}\n\n${siteUrl}`;
          await navigator.clipboard.writeText(copyText);
          alert('テキストをコピーしました！');
          // コピー成功後に新しいランダム要素を生成
          setRandomElements(generateRandomElements());
          return;
        } catch (err) {
          console.error('コピーに失敗しました:', err);
          return;
        }
      case 'native':
        try {
          if (navigator.share) {
            await navigator.share(shareData);
            // ネイティブシェア成功後に新しいランダム要素を生成
            setRandomElements(generateRandomElements());
            return;
          }
        } catch (err) {
          console.error('ネイティブシェアに失敗しました:', err);
        }
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    // シェア処理完了後に新しいランダム要素を生成
    setRandomElements(generateRandomElements());
  };

  return (
    <div className={`share-button-container ${className}`}>
      <button
        className="share-button"
        onClick={() => {
          setRandomElements(generateRandomElements());
          setIsOpen(!isOpen);
        }}
        aria-label="シェア"
      >
        <i className="bi bi-share share-icon"></i>
        <span className="share-text">シェア</span>
      </button>

      {isOpen && (
        <div className="share-dropdown">
          <div className="share-dropdown-content">
            <div className="share-header">
              <h3>シェア</h3>
              <button
                className="close-button"
                onClick={() => setIsOpen(false)}
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            
            <div className="share-description">
              <p>{siteDescription}</p>
              
              {/* 更新履歴の表示 */}
              {(() => {
                const latest = getLatestChangelog();
                return latest && (
                  <div className="update-info">
                    <h4>🆕 最新更新</h4>
                    <div className="update-details">
                      <span className="update-version">v{latest.version}</span>
                      <span className="update-type">
                        {latest.type === 'bugfix' && '🐛 バグ修正'}
                        {latest.type === 'feature' && '✨ 新機能'}
                        {latest.type === 'improvement' && '⚡ 改善'}
                        {latest.type === 'breaking' && '💥 破壊的変更'}
                      </span>
                      <div className="update-changes">
                        {latest.changes.slice(0, 3).map((change, index) => (
                          <div key={index} className="update-change-item">• {change}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              {/* 統計データの表示 */}
              {!stats.loading && (stats.userCount > 0 || stats.errorCount > 0 || stats.updateRequestCount > 0 || stats.linterErrorCount > 0 || stats.testErrorCount > 0) && (
                <div className="stats-display">
                  <h4>📊 現在の状況</h4>
                  <div className="stats-grid">
                    {stats.userCount > 0 && (
                      <div className="stat-item">
                        <span className="stat-icon">👥</span>
                        <span className="stat-label">ユーザー</span>
                        <span className="stat-value">{stats.userCount}名</span>
                      </div>
                    )}
                    {stats.errorCount > 0 && (
                      <div className="stat-item">
                        <span className="stat-icon">🐛</span>
                        <span className="stat-label">不具合報告</span>
                        <span className="stat-value">{stats.errorCount}件</span>
                      </div>
                    )}
                    {stats.updateRequestCount > 0 && (
                      <div className="stat-item">
                        <span className="stat-icon">💡</span>
                        <span className="stat-label">更新要望</span>
                        <span className="stat-value">{stats.updateRequestCount}件</span>
                      </div>
                    )}
                    {stats.linterErrorCount > 0 && (
                      <div className="stat-item">
                        <span className="stat-icon">🔍</span>
                        <span className="stat-label">リンターエラー</span>
                        <span className="stat-value">{stats.linterErrorCount}件</span>
                      </div>
                    )}
                    {stats.testErrorCount > 0 && (
                      <div className="stat-item">
                        <span className="stat-icon">🧪</span>
                        <span className="stat-label">テストエラー</span>
                        <span className="stat-value">{stats.testErrorCount}件</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {stats.loading && (
                <div className="stats-loading">
                  <i className="bi bi-hourglass-split"></i>
                  統計データを読み込み中...
                </div>
              )}
            </div>

            <div className="share-buttons">
              <button
                className="share-option twitter"
                onClick={() => handleShare('twitter')}
              >
                <span className="share-option-icon">🐦</span>
                <span>Twitter</span>
              </button>

              <button
                className="share-option facebook"
                onClick={() => handleShare('facebook')}
              >
                <i className="bi bi-facebook share-option-icon"></i>
                <span>Facebook</span>
              </button>

              <button
                className="share-option line"
                onClick={() => handleShare('line')}
              >
                <span className="share-option-icon">💬</span>
                <span>LINE</span>
              </button>

              <button
                className="share-option linkedin"
                onClick={() => handleShare('linkedin')}
              >
                <span className="share-option-icon">💼</span>
                <span>LinkedIn</span>
              </button>

              <button
                className="share-option copy"
                onClick={() => handleShare('copy')}
              >
                <i className="bi bi-clipboard share-option-icon"></i>
                <span>URLコピー</span>
              </button>

              {typeof navigator.share === 'function' && (
                <button
                  className="share-option native"
                  onClick={() => handleShare('native')}
                >
                  <i className="bi bi-phone share-option-icon"></i>
                  <span>その他</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButtonComponent;