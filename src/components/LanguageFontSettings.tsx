import React, { useState, useEffect } from 'react';
import { 
  japaneseFonts, 
  englishFonts, 
  childFriendlyFonts,
  FontSettings, 
  DEFAULT_FONT_SETTINGS,
  searchFonts,
  filterFonts,
  toggleFavorite,
  getFavoriteFonts,
  FontOption
} from '../constants/fonts';
import FontInfoModal from './FontInfoModal';
import { fontLoader } from '../utils/fontLoader';
import './LanguageFontSettings.css';

interface LanguageFontSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: FontSettings) => void;
  currentSettings: FontSettings;
}

const LanguageFontSettings: React.FC<LanguageFontSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings
}) => {
  const [settings, setSettings] = useState<FontSettings>(currentSettings);
  const [activeTab, setActiveTab] = useState<'japanese' | 'english' | 'child-friendly'>('japanese');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    subcategory: '',
    ageGroup: '',
    readability: ''
  });
  const [showFavorites, setShowFavorites] = useState(false);
  const [previewSize, setPreviewSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showFontInfo, setShowFontInfo] = useState(false);
  const [selectedFontInfo, setSelectedFontInfo] = useState<FontOption | null>(null);
  const [fontLoadingProgress, setFontLoadingProgress] = useState(0);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  // 表示するフォントリストを決定
  let currentFonts = japaneseFonts;
  if (activeTab === 'english') {
    currentFonts = englishFonts;
  } else if (activeTab === 'child-friendly') {
    currentFonts = childFriendlyFonts;
  } else if (showFavorites) {
    currentFonts = getFavoriteFonts(settings.favorites || []);
  }

  // 検索とフィルタを適用
  let filteredFonts = currentFonts;
  if (searchQuery) {
    filteredFonts = searchFonts(searchQuery, activeTab === 'child-friendly' ? 'child-friendly' : activeTab);
  }
  if (filters.subcategory || filters.ageGroup || filters.readability) {
    filteredFonts = filterFonts(filteredFonts, filters);
  }

  // フォントの遅延読み込み
  useEffect(() => {
    const loadFonts = async () => {
      const fontsToLoad = filteredFonts
        .filter(font => font.value !== 'system' && !fontLoader.isFontLoaded(font.value))
        .map(font => ({
          family: font.value.split(',')[0].replace(/['"]/g, ''),
          options: { weights: [400], display: 'swap' as const }
        }));

      if (fontsToLoad.length > 0) {
        try {
          await fontLoader.loadMultipleFonts(fontsToLoad);
        } catch (error) {
          console.warn('Font loading failed:', error);
        }
      }
    };

    if (isOpen && filteredFonts.length > 0) {
      loadFonts();
    }
  }, [isOpen, filteredFonts]);

  const handleFontChange = (category: 'japanese' | 'english', value: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleChildFontChange = (value: string) => {
    // こども向けフォントの場合、日本語と英語の両方に適用
    setSettings(prev => ({
      ...prev,
      japanese: value,
      english: value
    }));
  };

  const handleToggleFavorite = (fontValue: string) => {
    setSettings(prev => ({
      ...prev,
      favorites: toggleFavorite(fontValue, prev.favorites || [])
    }));
  };

  const handleShowFontInfo = (font: FontOption) => {
    setSelectedFontInfo(font);
    setShowFontInfo(true);
  };

  const handleCloseFontInfo = () => {
    setShowFontInfo(false);
    setSelectedFontInfo(null);
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleReset = () => {
    setSettings(DEFAULT_FONT_SETTINGS);
  };

  if (!isOpen) {
    return null;
  }

  const currentFont = activeTab === 'child-friendly' ? settings.japanese : settings[activeTab];

  return (
    <div className="language-font-modal-overlay">
      <div className="language-font-modal">
        <div className="language-font-header">
          <h3>言語別フォント設定</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="language-font-tabs">
          <button
            className={`tab-button ${activeTab === 'japanese' ? 'active' : ''}`}
            onClick={() => setActiveTab('japanese')}
          >
            🇯🇵 日本語フォント
          </button>
          <button
            className={`tab-button ${activeTab === 'english' ? 'active' : ''}`}
            onClick={() => setActiveTab('english')}
          >
            🇺🇸 英語フォント
          </button>
          <button
            className={`tab-button ${activeTab === 'child-friendly' ? 'active' : ''}`}
            onClick={() => setActiveTab('child-friendly')}
          >
            👶 こども向けフォント
          </button>
          <button
            className={`tab-button ${showFavorites ? 'active' : ''}`}
            onClick={() => setShowFavorites(!showFavorites)}
          >
            ⭐ お気に入り
          </button>
        </div>

        <div className="language-font-body">
          {/* 検索・フィルタ機能 */}
          <div className="font-search-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="フォントを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-controls">
              <select
                value={filters.subcategory}
                onChange={(e) => setFilters(prev => ({ ...prev, subcategory: e.target.value }))}
                className="filter-select"
                title="カテゴリでフィルタ"
              >
                <option value="">すべてのカテゴリ</option>
                <option value="rounded">丸文字</option>
                <option value="handwriting">手書き風</option>
                <option value="cute">可愛い</option>
                <option value="school">学校風</option>
                <option value="modern">モダン</option>
                <option value="classic">クラシック</option>
              </select>
              <select
                value={filters.ageGroup}
                onChange={(e) => setFilters(prev => ({ ...prev, ageGroup: e.target.value }))}
                className="filter-select"
                title="年齢層でフィルタ"
              >
                <option value="">すべての年齢</option>
                <option value="child">こども向け</option>
                <option value="teen">ティーン向け</option>
                <option value="adult">大人向け</option>
                <option value="all">全年齢</option>
              </select>
              <select
                value={filters.readability}
                onChange={(e) => setFilters(prev => ({ ...prev, readability: e.target.value }))}
                className="filter-select"
                title="読みやすさでフィルタ"
              >
                <option value="">すべての読みやすさ</option>
                <option value="high">読みやすい</option>
                <option value="medium">普通</option>
                <option value="low">読みにくい</option>
              </select>
            </div>
          </div>

          <div className="font-preview">
            <div className="preview-header">
              <h4>プレビュー</h4>
              <div className="preview-controls">
                <label htmlFor="preview-size">サイズ:</label>
                <select
                  id="preview-size"
                  value={previewSize}
                  onChange={(e) => setPreviewSize(e.target.value as 'small' | 'medium' | 'large')}
                  className="preview-size-select"
                >
                  <option value="small">小 (12px)</option>
                  <option value="medium">中 (16px)</option>
                  <option value="large">大 (20px)</option>
                </select>
              </div>
            </div>
            <div className="preview-content">
              <div className="preview-sample">
                <h5>日本語サンプル</h5>
                <p 
                  className="preview-japanese" 
                  style={{ 
                    fontFamily: settings.japanese === 'system' ? 'var(--japanese-font)' : settings.japanese,
                    fontSize: previewSize === 'small' ? '12px' : previewSize === 'large' ? '20px' : '16px'
                  }}
                >
                  可愛いキャラクターと一緒に作業時間を管理しよう！<br/>
                  今日も一日お疲れ様でした。明日も頑張りましょう！
                </p>
              </div>
              <div className="preview-sample">
                <h5>English Sample</h5>
                <p 
                  className="preview-english" 
                  style={{ 
                    fontFamily: settings.english === 'system' ? 'var(--english-font)' : settings.english,
                    fontSize: previewSize === 'small' ? '12px' : previewSize === 'large' ? '20px' : '16px'
                  }}
                >
                  Work Time Tracker with Cute Characters!<br/>
                  Great job today! Let's keep up the good work tomorrow!
                </p>
              </div>
              <div className="preview-samples">
                <div className="preview-sample">
                  <h6>数字・記号</h6>
                  <p 
                    className="preview-numbers" 
                    style={{ 
                      fontFamily: activeTab === 'japanese' ? (settings.japanese === 'system' ? 'var(--japanese-font)' : settings.japanese) : (settings.english === 'system' ? 'var(--english-font)' : settings.english),
                      fontSize: previewSize === 'small' ? '12px' : previewSize === 'large' ? '20px' : '16px'
                    }}
                  >
                    1234567890 !@#$%^&*() あいうえお カタカナ
                  </p>
                </div>
                <div className="preview-sample">
                  <h6>実際の使用例</h6>
                  <p 
                    className="preview-usage" 
                    style={{ 
                      fontFamily: activeTab === 'japanese' ? (settings.japanese === 'system' ? 'var(--japanese-font)' : settings.japanese) : (settings.english === 'system' ? 'var(--english-font)' : settings.english),
                      fontSize: previewSize === 'small' ? '12px' : previewSize === 'large' ? '20px' : '16px'
                    }}
                  >
                    {activeTab === 'japanese' ? 
                      '本棚 | メモ | 公開メモ | お仕事記録' : 
                      'Bookshelf | Memos | Public Memos | Work Records'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="font-options">
            {filteredFonts.map((font, index) => (
              <div key={`${font.value}-${activeTab}-${index}`} className="font-option-container">
                <label className="font-option">
                  <input
                    type="radio"
                    name={`font-${activeTab}`}
                    value={font.value}
                    checked={currentFont === font.value}
                    onChange={(e) => {
                      if (activeTab === 'child-friendly') {
                        handleChildFontChange(e.target.value);
                      } else {
                        handleFontChange(activeTab, e.target.value);
                      }
                    }}
                  />
                  <span
                    style={{
                      fontFamily: font.value === 'system' 
                        ? (activeTab === 'japanese' ? 'var(--japanese-font)' : 'var(--english-font)')
                        : font.value,
                    }}
                  >
                    {font.label}
                  </span>
                </label>
                <div className="font-actions">
                  <button
                    className={`favorite-button ${(settings.favorites || []).includes(font.value) ? 'favorited' : ''}`}
                    onClick={() => handleToggleFavorite(font.value)}
                    title="お気に入りに追加/削除"
                  >
                    ⭐
                  </button>
                  <button
                    className="info-button"
                    onClick={() => handleShowFontInfo(font)}
                    title="詳細情報を表示"
                  >
                    ℹ️
                  </button>
                </div>
                {font.description && (
                  <div className="font-description">
                    {font.description}
                  </div>
                )}
                {font.tags && font.tags.length > 0 && (
                  <div className="font-tags">
                    {font.tags.map((tag, index) => (
                      <span key={index} className="font-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {filteredFonts.length === 0 && (
              <div className="no-fonts-message">
                条件に合うフォントが見つかりませんでした。
              </div>
            )}
          </div>
        </div>

        <div className="language-font-footer">
          <button className="reset-button" onClick={handleReset}>
            リセット
          </button>
          <div className="footer-buttons">
            <button className="cancel-button" onClick={onClose}>
              キャンセル
            </button>
            <button className="save-button" onClick={handleSave}>
              保存
            </button>
          </div>
        </div>
      </div>

      {/* フォント情報モーダル */}
      <FontInfoModal
        isOpen={showFontInfo}
        onClose={handleCloseFontInfo}
        font={selectedFontInfo}
      />
    </div>
  );
};

export default LanguageFontSettings;
