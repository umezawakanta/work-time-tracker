import React, { useState, useEffect, createContext, useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Globe,
  Languages,
  MapPin,
  Calendar,
  Clock,
  Users,
  Palette,
  Settings,
  Check,
  RefreshCw,
  Download,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  direction: 'ltr' | 'rtl';
  completeness: number; // 0-100%
  translators: number;
  lastUpdated: string;
  implemented: boolean;
  region: string;
  translationProgress: number;
}

interface Translation {
  key: string;
  original: string;
  translated: string;
  status: 'pending' | 'translated' | 'reviewed' | 'approved';
  context?: string;
  notes?: string;
}

interface CulturalAdaptation {
  language: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currencyFormat: string;
  weekStartDay: number; // 0 = Sunday, 1 = Monday
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: string[];
  imagePreferences: string[];
}

interface LocalizationStats {
  totalKeys: number;
  translatedKeys: number;
  reviewedKeys: number;
  approvedKeys: number;
  languages: number;
  translators: number;
  completionRate: number;
}

interface Translations {
  [languageCode: string]: Translation;
}

const MultiLanguageContext = createContext<{
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  languages: Language[];
}>({
  currentLanguage: 'ja',
  setLanguage: () => {},
  t: (key: string) => key,
  languages: [],
});

export const useTranslation = () => {
  const context = useContext(MultiLanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within MultiLanguageProvider');
  }
  return context;
};

export const MultiLanguageSupport: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState('ja');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [culturalAdaptations, setCulturalAdaptations] = useState<CulturalAdaptation[]>([]);
  const [stats, setStats] = useState<LocalizationStats>({
    totalKeys: 0,
    translatedKeys: 0,
    reviewedKeys: 0,
    approvedKeys: 0,
    languages: 0,
    translators: 0,
    completionRate: 0,
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    initializeLanguages();
    initializeTranslations();
    initializeCulturalAdaptations();
    calculateStats();
  }, []);

  const initializeLanguages = () => {
    const supportedLanguages: Language[] = [
      {
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語',
        flag: '🇯🇵',
        rtl: false,
        direction: 'ltr',
        completeness: 100,
        translators: 1,
        lastUpdated: new Date().toISOString(),
        implemented: true,
        region: 'Asia',
        translationProgress: 100,
      },
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        rtl: false,
        direction: 'ltr',
        completeness: 95,
        translators: 3,
        lastUpdated: new Date(Date.now() - 86400000).toISOString(),
        implemented: true,
        region: 'Americas',
        translationProgress: 100,
      },
      {
        code: 'zh-CN',
        name: 'Chinese (Simplified)',
        nativeName: '简体中文',
        flag: '🇨🇳',
        rtl: false,
        direction: 'ltr',
        completeness: 85,
        translators: 2,
        lastUpdated: new Date(Date.now() - 172800000).toISOString(),
        implemented: true,
        region: 'Asia',
        translationProgress: 90,
      },
      {
        code: 'ko',
        name: 'Korean',
        nativeName: '한국어',
        flag: '🇰🇷',
        rtl: false,
        direction: 'ltr',
        completeness: 80,
        translators: 1,
        lastUpdated: new Date(Date.now() - 259200000).toISOString(),
        implemented: true,
        region: 'Asia',
        translationProgress: 85,
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
        rtl: false,
        direction: 'ltr',
        completeness: 75,
        translators: 2,
        lastUpdated: new Date(Date.now() - 345600000).toISOString(),
        implemented: true,
        region: 'Europe',
        translationProgress: 80,
      },
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        flag: '🇫🇷',
        rtl: false,
        direction: 'ltr',
        completeness: 70,
        translators: 1,
        lastUpdated: new Date(Date.now() - 432000000).toISOString(),
        implemented: true,
        region: 'Europe',
        translationProgress: 75,
      },
      {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
        flag: '🇩🇪',
        rtl: false,
        direction: 'ltr',
        completeness: 65,
        translators: 1,
        lastUpdated: new Date(Date.now() - 518400000).toISOString(),
        implemented: true,
        region: 'Europe',
        translationProgress: 70,
      },
      {
        code: 'pt',
        name: 'Portuguese',
        nativeName: 'Português',
        flag: '🇵🇹',
        rtl: false,
        direction: 'ltr',
        completeness: 60,
        translators: 1,
        lastUpdated: new Date(Date.now() - 777600000).toISOString(),
        implemented: true,
        region: 'Europe',
        translationProgress: 65,
      },
      {
        code: 'ru',
        name: 'Russian',
        nativeName: 'Русский',
        flag: '🇷🇺',
        rtl: false,
        direction: 'ltr',
        completeness: 55,
        translators: 1,
        lastUpdated: new Date(Date.now() - 864000000).toISOString(),
        implemented: true,
        region: 'Europe',
        translationProgress: 60,
      },
      {
        code: 'it',
        name: 'Italian',
        nativeName: 'Italiano',
        flag: '🇮🇹',
        rtl: false,
        direction: 'ltr',
        completeness: 50,
        translators: 1,
        lastUpdated: new Date(Date.now() - 950400000).toISOString(),
        implemented: true,
        region: 'Europe',
        translationProgress: 55,
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        flag: '🇸🇦',
        rtl: true,
        direction: 'rtl',
        completeness: 40,
        translators: 1,
        lastUpdated: new Date(Date.now() - 604800000).toISOString(),
        implemented: true,
        region: 'Middle East',
        translationProgress: 95,
      },
      {
        code: 'he',
        name: 'Hebrew',
        nativeName: 'עברית',
        flag: '🇮🇱',
        rtl: true,
        direction: 'rtl',
        completeness: 35,
        translators: 1,
        lastUpdated: new Date(Date.now() - 691200000).toISOString(),
        implemented: true,
        region: 'Middle East',
        translationProgress: 90,
      },
      {
        code: 'fa',
        name: 'Persian',
        nativeName: 'فارسی',
        flag: '🇮🇷',
        rtl: true,
        direction: 'rtl',
        completeness: 30,
        translators: 1,
        lastUpdated: new Date(Date.now() - 777600000).toISOString(),
        implemented: true,
        region: 'Middle East',
        translationProgress: 85,
      },
      {
        code: 'ur',
        name: 'Urdu',
        nativeName: 'اردو',
        flag: '🇵🇰',
        rtl: true,
        direction: 'rtl',
        completeness: 25,
        translators: 1,
        lastUpdated: new Date(Date.now() - 864000000).toISOString(),
        implemented: true,
        region: 'South Asia',
        translationProgress: 80,
      },
      {
        code: 'yi',
        name: 'Yiddish',
        nativeName: 'ייִדיש',
        flag: '🏴',
        rtl: true,
        direction: 'rtl',
        completeness: 20,
        translators: 1,
        lastUpdated: new Date(Date.now() - 950400000).toISOString(),
        implemented: true,
        region: 'Europe',
        translationProgress: 75,
      },
    ];

    setLanguages(supportedLanguages);
  };

  const initializeTranslations = () => {
    const sampleTranslations: Translation[] = [
      {
        key: 'common.welcome',
        original: 'Welcome',
        translated: 'ようこそ',
        status: 'approved',
        context: 'General greeting',
      },
      {
        key: 'common.save',
        original: 'Save',
        translated: '保存',
        status: 'approved',
        context: 'Button text',
      },
      {
        key: 'common.cancel',
        original: 'Cancel',
        translated: 'キャンセル',
        status: 'approved',
        context: 'Button text',
      },
      {
        key: 'todo.title',
        original: 'Todo List',
        translated: 'TODOリスト',
        status: 'approved',
        context: 'Page title',
      },
      {
        key: 'dashboard.analytics',
        original: 'Analytics Dashboard',
        translated: '分析ダッシュボード',
        status: 'approved',
        context: 'Page title',
      },
    ];

    setTranslations(sampleTranslations);
  };

  const initializeCulturalAdaptations = () => {
    const adaptations: CulturalAdaptation[] = [
      {
        language: 'ja',
        dateFormat: 'YYYY年MM月DD日',
        timeFormat: 'HH:mm',
        numberFormat: '1,234.56',
        currencyFormat: '¥1,234',
        weekStartDay: 1, // Monday
        colors: {
          primary: '#3B82F6',
          secondary: '#64748B',
          accent: '#EF4444',
        },
        fonts: ['Noto Sans JP', 'Hiragino Sans', 'Yu Gothic'],
        imagePreferences: ['business', 'minimal', 'clean'],
      },
      {
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12-hour',
        numberFormat: '1,234.56',
        currencyFormat: '$1,234',
        weekStartDay: 0, // Sunday
        colors: {
          primary: '#2563EB',
          secondary: '#475569',
          accent: '#DC2626',
        },
        fonts: ['Inter', 'Arial', 'Helvetica'],
        imagePreferences: ['professional', 'diverse', 'modern'],
      },
    ];

    setCulturalAdaptations(adaptations);
  };

  const calculateStats = () => {
    const totalKeys = 150; // 仮想的な翻訳キー総数
    const translatedKeys = 120;
    const reviewedKeys = 100;
    const approvedKeys = 85;

    setStats({
      totalKeys,
      translatedKeys,
      reviewedKeys,
      approvedKeys,
      languages: languages.length,
      translators: languages.reduce((sum, lang) => sum + lang.translators, 0),
      completionRate: Math.round((approvedKeys / totalKeys) * 100),
    });
  };

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
  };

  const exportTranslations = () => {
    const data = {
      languages,
      translations,
      culturalAdaptations,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translations-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const syncTranslations = async () => {
    // 翻訳同期のシミュレーション
    console.log('Syncing translations...');
    // 実際の実装では、翻訳APIやクラウドサービスと同期
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="w-8 h-8" />
            多言語サポート
          </h1>
          <p className="text-muted-foreground mt-2">10言語対応・文化的適応・自動翻訳システム</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncTranslations}>
            <RefreshCw className="w-4 h-4 mr-2" />
            同期
          </Button>
          <Button onClick={exportTranslations}>
            <Download className="w-4 h-4 mr-2" />
            エクスポート
          </Button>
        </div>
      </div>

      {/* 言語選択 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            言語選択
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={currentLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                      <Badge variant="outline">{lang.completeness}%</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              選択された言語: {languages.find((l) => l.code === currentLanguage)?.nativeName}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">対応言語数</p>
                <p className="text-2xl font-bold text-primary">{stats.languages}</p>
              </div>
              <Globe className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">完成率</p>
                <p className="text-2xl font-bold text-green-600">{stats.completionRate}%</p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">翻訳キー数</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.translatedKeys}/{stats.totalKeys}
                </p>
              </div>
              <Languages className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">翻訳者数</p>
                <p className="text-2xl font-bold text-purple-600">{stats.translators}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="languages">言語管理</TabsTrigger>
          <TabsTrigger value="translations">翻訳管理</TabsTrigger>
          <TabsTrigger value="cultural">文化的適応</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>翻訳進捗</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>承認済み</span>
                    <span>
                      {stats.approvedKeys}/{stats.totalKeys}
                    </span>
                  </div>
                  <Progress value={(stats.approvedKeys / stats.totalKeys) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>レビュー済み</span>
                    <span>
                      {stats.reviewedKeys}/{stats.totalKeys}
                    </span>
                  </div>
                  <Progress value={(stats.reviewedKeys / stats.totalKeys) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>翻訳済み</span>
                    <span>
                      {stats.translatedKeys}/{stats.totalKeys}
                    </span>
                  </div>
                  <Progress
                    value={(stats.translatedKeys / stats.totalKeys) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>言語別完成度</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {languages.slice(0, 6).map((lang) => (
                  <div key={lang.code} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </div>
                      <span>{lang.completeness}%</span>
                    </div>
                    <Progress value={lang.completeness} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>サポート言語一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {languages.map((lang) => (
                  <div key={lang.code} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <div className="font-semibold">{lang.nativeName}</div>
                          <div className="text-sm text-muted-foreground">{lang.name}</div>
                        </div>
                      </div>
                      <Badge variant={lang.completeness >= 90 ? 'default' : 'secondary'}>
                        {lang.completeness}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Progress value={lang.completeness} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{lang.translators} 翻訳者</span>
                        <span>最終更新: {new Date(lang.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>翻訳キー管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {translations.slice(0, 8).map((translation, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{translation.key}</code>
                      <Badge
                        variant={
                          translation.status === 'approved'
                            ? 'default'
                            : translation.status === 'reviewed'
                              ? 'secondary'
                              : translation.status === 'translated'
                                ? 'outline'
                                : 'destructive'
                        }
                      >
                        {translation.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">原文:</div>
                        <div className="text-muted-foreground">{translation.original}</div>
                      </div>
                      <div>
                        <div className="font-medium">翻訳:</div>
                        <div className="text-muted-foreground">{translation.translated}</div>
                      </div>
                    </div>
                    {translation.context && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        コンテキスト: {translation.context}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cultural" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>文化的適応設定</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {culturalAdaptations.map((adaptation) => (
                  <div key={adaptation.language} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">
                        {languages.find((l) => l.code === adaptation.language)?.flag}
                      </span>
                      <h3 className="font-semibold">
                        {languages.find((l) => l.code === adaptation.language)?.nativeName}
                      </h3>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">日付形式:</span>
                          <div className="text-muted-foreground">{adaptation.dateFormat}</div>
                        </div>
                        <div>
                          <span className="font-medium">時間形式:</span>
                          <div className="text-muted-foreground">{adaptation.timeFormat}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">数値形式:</span>
                          <div className="text-muted-foreground">{adaptation.numberFormat}</div>
                        </div>
                        <div>
                          <span className="font-medium">通貨形式:</span>
                          <div className="text-muted-foreground">{adaptation.currencyFormat}</div>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium">カラーパレット:</span>
                        <div className="flex gap-2 mt-1">
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: adaptation.colors.primary }}
                          />
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: adaptation.colors.secondary }}
                          />
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: adaptation.colors.accent }}
                          />
                        </div>
                      </div>

                      <div>
                        <span className="font-medium">フォント:</span>
                        <div className="text-muted-foreground">
                          {adaptation.fonts.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const MultiLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('ja');
  const [languages] = useState<Language[]>([
    {
      code: 'ja',
      name: 'Japanese',
      nativeName: '日本語',
      flag: '🇯🇵',
      rtl: false,
      direction: 'ltr',
      completeness: 100,
      translators: 1,
      lastUpdated: new Date().toISOString(),
      implemented: true,
      region: 'Asia',
      translationProgress: 100,
    },
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      rtl: false,
      direction: 'ltr',
      completeness: 95,
      translators: 3,
      lastUpdated: new Date().toISOString(),
      implemented: true,
      region: 'Americas',
      translationProgress: 100,
    },
  ]);

  const translations: Record<string, Record<string, string>> = {
    ja: {
      'common.welcome': 'ようこそ',
      'common.save': '保存',
      'common.cancel': 'キャンセル',
      'todo.title': 'TODOリスト',
    },
    en: {
      'common.welcome': 'Welcome',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'todo.title': 'Todo List',
    },
  };

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || key;
  };

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
  };

  return (
    <MultiLanguageContext.Provider value={{ currentLanguage, setLanguage, t, languages }}>
      {children}
    </MultiLanguageContext.Provider>
  );
};

export default MultiLanguageSupport;
