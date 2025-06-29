import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// シンプルな翻訳辞書
const translations = {
  ja: {
    title: '🌍 言語切り替えテスト',
    current: '現在の言語',
    dashboard: 'ダッシュボード',
    tasks: 'タスク',
    settings: '設定',
    save: '保存',
    cancel: 'キャンセル',
    edit: '編集',
    language_switch: '言語切り替え',
    test_text: 'これは日本語のテストテキストです。',
  },
  en: {
    title: '🌍 Language Switch Test',
    current: 'Current Language',
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    settings: 'Settings',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    language_switch: 'Language Switch',
    test_text: 'This is English test text.',
  },
  zh: {
    title: '🌍 语言切换测试',
    current: '当前语言',
    dashboard: '仪表板',
    tasks: '任务',
    settings: '设置',
    save: '保存',
    cancel: '取消',
    edit: '编辑',
    language_switch: '语言切换',
    test_text: '这是中文测试文本。',
  },
  ko: {
    title: '🌍 언어 전환 테스트',
    current: '현재 언어',
    dashboard: '대시보드',
    tasks: '작업',
    settings: '설정',
    save: '저장',
    cancel: '취소',
    edit: '편집',
    language_switch: '언어 전환',
    test_text: '이것은 한국어 테스트 텍스트입니다.',
  },
};

const languages = {
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
};

export const QuickLanguageTest: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<keyof typeof translations>('ja');

  // 言語切り替え関数
  const switchLanguage = (lang: keyof typeof translations) => {
    setCurrentLang(lang);
    localStorage.setItem('quick-test-lang', lang);

    // ドキュメント言語も更新
    document.documentElement.lang = lang;

    console.log(`🌍 Language switched to: ${languages[lang].nativeName}`);
  };

  // 初期化時にlocalStorageから復元
  useEffect(() => {
    const saved = localStorage.getItem('quick-test-lang') as keyof typeof translations;
    if (saved && translations[saved]) {
      setCurrentLang(saved);
    }
  }, []);

  const t = (key: keyof typeof translations.ja) => {
    return translations[currentLang][key] || key;
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 言語選択ボタン */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('language_switch')}:</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(languages).map(([code, lang]) => (
                <Button
                  key={code}
                  onClick={() => switchLanguage(code as keyof typeof translations)}
                  variant={currentLang === code ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  {currentLang === code && (
                    <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                      ✓
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* 現在の言語表示 */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">{t('current')}:</p>
            <p className="text-lg font-bold text-blue-800">
              {languages[currentLang].flag} {languages[currentLang].nativeName} ({currentLang})
            </p>
          </div>

          {/* 翻訳テスト */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">ナビゲーション例:</h4>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded">
                  <strong>Dashboard:</strong> {t('dashboard')}
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <strong>Tasks:</strong> {t('tasks')}
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <strong>Settings:</strong> {t('settings')}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-lg">ボタン例:</h4>
              <div className="space-y-2">
                <Button className="w-full justify-start">{t('save')}</Button>
                <Button variant="outline" className="w-full justify-start">
                  {t('cancel')}
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  {t('edit')}
                </Button>
              </div>
            </div>
          </div>

          {/* テストテキスト */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-lg mb-2">テストテキスト:</h4>
            <p className="text-lg">{t('test_text')}</p>
          </div>

          {/* 動作ステータス */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✅ 動作状況:</span>
              <span className="text-green-800">
                言語切り替えが即座に反映されています！画面更新は不要です。
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
