import React, { useState, useRef } from 'react';
import './CustomFontUpload.css';

interface CustomFontUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onFontUpload: (fontData: CustomFontData) => void;
}

interface CustomFontData {
  name: string;
  fontFamily: string;
  fontUrl: string;
  category: 'japanese' | 'english' | 'child-friendly';
  description?: string;
  tags?: string[];
}

const CustomFontUpload: React.FC<CustomFontUploadProps> = ({
  isOpen,
  onClose,
  onFontUpload
}) => {
  const [fontName, setFontName] = useState('');
  const [fontDescription, setFontDescription] = useState('');
  const [fontCategory, setFontCategory] = useState<'japanese' | 'english' | 'child-friendly'>('japanese');
  const [fontTags, setFontTags] = useState('');
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [fontUrl, setFontUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [previewText, setPreviewText] = useState('フォントプレビューサンプルテキスト');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // フォントファイルの形式をチェック
      const validTypes = ['font/woff', 'font/woff2', 'application/font-woff', 'application/font-woff2'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(woff|woff2|ttf|otf)$/i)) {
        setError('サポートされているフォント形式（WOFF、WOFF2、TTF、OTF）を選択してください。');
        return;
      }
      setFontFile(file);
      setError('');
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setFontUrl(url);
    
    // URLの妥当性をチェック
    try {
      new URL(url);
      setError('');
    } catch {
      if (url && !url.startsWith('data:')) {
        setError('有効なURLを入力してください。');
      }
    }
  };

  const generateFontFamily = (name: string) => {
    return name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + '-custom';
  };

  const handleUpload = async () => {
    if (!fontName.trim()) {
      setError('フォント名を入力してください。');
      return;
    }

    if (uploadMethod === 'file' && !fontFile) {
      setError('フォントファイルを選択してください。');
      return;
    }

    if (uploadMethod === 'url' && !fontUrl.trim()) {
      setError('フォントURLを入力してください。');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      let finalFontUrl = fontUrl;
      
      if (uploadMethod === 'file' && fontFile) {
        // ファイルをBase64に変換
        const arrayBuffer = await fontFile.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        const mimeType = fontFile.type || 'font/woff2';
        finalFontUrl = `data:${mimeType};base64,${base64}`;
      }

      const fontData: CustomFontData = {
        name: fontName.trim(),
        fontFamily: generateFontFamily(fontName),
        fontUrl: finalFontUrl,
        category: fontCategory,
        description: fontDescription.trim() || undefined,
        tags: fontTags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      // フォントを動的に読み込む
      await loadCustomFont(fontData);
      
      onFontUpload(fontData);
      
      // フォームをリセット
      setFontName('');
      setFontDescription('');
      setFontTags('');
      setFontFile(null);
      setFontUrl('');
      setPreviewText('フォントプレビューサンプルテキスト');
      
      onClose();
    } catch (err) {
      setError('フォントのアップロードに失敗しました。');
      console.error('Font upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const loadCustomFont = async (fontData: CustomFontData) => {
    return new Promise<void>((resolve, reject) => {
      const fontFace = new FontFace(fontData.fontFamily, `url(${fontData.fontUrl})`);
      
      fontFace.load().then(() => {
        document.fonts.add(fontFace);
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  };

  const handleReset = () => {
    setFontName('');
    setFontDescription('');
    setFontTags('');
    setFontFile(null);
    setFontUrl('');
    setPreviewText('フォントプレビューサンプルテキスト');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="custom-font-upload-overlay">
      <div className="custom-font-upload-modal">
        <div className="custom-font-upload-header">
          <h3>カスタムフォントアップロード</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="custom-font-upload-body">
          <div className="form-section">
            <h4>基本情報</h4>
            <div className="form-group">
              <label htmlFor="font-name">フォント名 *</label>
              <input
                id="font-name"
                type="text"
                value={fontName}
                onChange={(e) => setFontName(e.target.value)}
                placeholder="例: マイカスタムフォント"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="font-description">説明</label>
              <textarea
                id="font-description"
                value={fontDescription}
                onChange={(e) => setFontDescription(e.target.value)}
                placeholder="フォントの説明を入力してください"
                className="form-textarea"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="font-category">カテゴリ</label>
              <select
                id="font-category"
                value={fontCategory}
                onChange={(e) => setFontCategory(e.target.value as 'japanese' | 'english' | 'child-friendly')}
                className="form-select"
              >
                <option value="japanese">日本語</option>
                <option value="english">英語</option>
                <option value="child-friendly">こども向け</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="font-tags">タグ（カンマ区切り）</label>
              <input
                id="font-tags"
                type="text"
                value={fontTags}
                onChange={(e) => setFontTags(e.target.value)}
                placeholder="例: 可愛い, 手書き風, 丸文字"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-section">
            <h4>フォントファイル</h4>
            <div className="upload-method-selector">
              <label className="radio-label">
                <input
                  type="radio"
                  value="file"
                  checked={uploadMethod === 'file'}
                  onChange={(e) => setUploadMethod(e.target.value as 'file' | 'url')}
                />
                ファイルアップロード
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="url"
                  checked={uploadMethod === 'url'}
                  onChange={(e) => setUploadMethod(e.target.value as 'file' | 'url')}
                />
                URL指定
              </label>
            </div>

            {uploadMethod === 'file' ? (
              <div className="form-group">
                <label htmlFor="font-file">フォントファイル *</label>
                <input
                  ref={fileInputRef}
                  id="font-file"
                  type="file"
                  accept=".woff,.woff2,.ttf,.otf"
                  onChange={handleFileSelect}
                  className="form-file"
                />
                <div className="file-info">
                  サポート形式: WOFF, WOFF2, TTF, OTF
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="font-url">フォントURL *</label>
                <input
                  id="font-url"
                  type="url"
                  value={fontUrl}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/font.woff2"
                  className="form-input"
                />
              </div>
            )}
          </div>

          <div className="form-section">
            <h4>プレビュー</h4>
            <div className="form-group">
              <label htmlFor="preview-text">プレビューテキスト</label>
              <input
                id="preview-text"
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="font-preview">
              <p 
                style={{ 
                  fontFamily: fontName ? generateFontFamily(fontName) : 'inherit',
                  fontSize: '18px',
                  lineHeight: '1.6'
                }}
              >
                {previewText}
              </p>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="custom-font-upload-footer">
          <button 
            className="reset-button" 
            onClick={handleReset}
            disabled={isUploading}
          >
            リセット
          </button>
          <button 
            className="upload-button" 
            onClick={handleUpload}
            disabled={isUploading || !fontName.trim() || (uploadMethod === 'file' && !fontFile) || (uploadMethod === 'url' && !fontUrl.trim())}
          >
            {isUploading ? 'アップロード中...' : 'アップロード'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomFontUpload;
