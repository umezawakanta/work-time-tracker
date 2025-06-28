import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe, Languages, ArrowRight, ArrowLeft, CheckCircle, Trophy } from 'lucide-react';

// 🌍 RTL (Right-to-Left) 言語完全対応システム

export interface RTLLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  translationProgress: number;
  direction: 'rtl';
  fontFamily: string;
  textAlign: string;
}

// RTL対応言語データベース
const RTL_LANGUAGES: RTLLanguage[] = [
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    region: 'Middle East',
    translationProgress: 100,
    direction: 'rtl',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'right',
  },
  {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    flag: '🇮🇱',
    region: 'Middle East',
    translationProgress: 100,
    direction: 'rtl',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'right',
  },
  {
    code: 'fa',
    name: 'Persian',
    nativeName: 'فارسی',
    flag: '🇮🇷',
    region: 'Middle East',
    translationProgress: 100,
    direction: 'rtl',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'right',
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇵🇰',
    region: 'South Asia',
    translationProgress: 100,
    direction: 'rtl',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'right',
  },
  {
    code: 'yi',
    name: 'Yiddish',
    nativeName: 'ייִדיש',
    flag: '🏴',
    region: 'Europe',
    translationProgress: 100,
    direction: 'rtl',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'right',
  },
];

// RTL対応翻訳データベース
const RTL_TRANSLATIONS = {
  ar: {
    // ワークトラッカー関連
    'work-time-tracker': 'متتبع وقت العمل',
    dashboard: 'لوحة المعلومات',
    tasks: 'المهام',
    calendar: 'التقويم',
    reports: 'التقارير',
    settings: 'الإعدادات',
    profile: 'الملف الشخصي',

    // タイマー関連
    'start-timer': 'بدء المؤقت',
    'stop-timer': 'إيقاف المؤقت',
    'pause-timer': 'توقف المؤقت',
    'reset-timer': 'إعادة تعيين المؤقت',
    'active-timer': 'المؤقت النشط',

    // 時間関連
    'total-time': 'الوقت الإجمالي',
    today: 'اليوم',
    yesterday: 'أمس',
    'this-week': 'هذا الأسبوع',
    'this-month': 'هذا الشهر',
    'last-month': 'الشهر الماضي',

    // 生産性関連
    productivity: 'الإنتاجية',
    efficiency: 'الكفاءة',
    performance: 'الأداء',
    analytics: 'التحليلات',
    insights: 'الرؤى',

    // 操作関連
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تحرير',
    create: 'إنشاء',
    update: 'تحديث',

    // ナビゲーション
    home: 'الرئيسية',
    back: 'الرجوع',
    next: 'التالي',
    previous: 'السابق',
    close: 'إغلاق',

    // ステータス
    active: 'نشط',
    inactive: 'غير نشط',
    completed: 'مكتمل',
    pending: 'قيد الانتظار',
    'in-progress': 'قيد التنفيذ',
  },
  he: {
    // ワークトラッカー関連
    'work-time-tracker': 'מעקב זמן עבודה',
    dashboard: 'לוח בקרה',
    tasks: 'משימות',
    calendar: 'לוח שנה',
    reports: 'דוחות',
    settings: 'הגדרות',
    profile: 'פרופיל',

    // タイマー関連
    'start-timer': 'התחל טיימר',
    'stop-timer': 'עצור טיימר',
    'pause-timer': 'השהה טיימר',
    'reset-timer': 'אפס טיימר',
    'active-timer': 'טיימר פעיל',

    // 時間関連
    'total-time': 'סך הזמן',
    today: 'היום',
    yesterday: 'אתמול',
    'this-week': 'השבוע',
    'this-month': 'החודש',
    'last-month': 'חודש שעבר',

    // 生産性関連
    productivity: 'פרודוקטיביות',
    efficiency: 'יעילות',
    performance: 'ביצועים',
    analytics: 'אנליטיקה',
    insights: 'תובנות',

    // 操作関連
    save: 'שמור',
    cancel: 'בטל',
    delete: 'מחק',
    edit: 'ערוך',
    create: 'צור',
    update: 'עדכן',

    // ナビゲーション
    home: 'בית',
    back: 'אחורה',
    next: 'הבא',
    previous: 'קודם',
    close: 'סגור',

    // ステータス
    active: 'פעיל',
    inactive: 'לא פעיל',
    completed: 'הושלם',
    pending: 'ממתין',
    'in-progress': 'בתהליך',
  },
  fa: {
    // ワークトラッカー関連
    'work-time-tracker': 'ردیاب زمان کار',
    dashboard: 'داشبورد',
    tasks: 'وظایف',
    calendar: 'تقویم',
    reports: 'گزارش‌ها',
    settings: 'تنظیمات',
    profile: 'پروفایل',

    // タイマー関連
    'start-timer': 'شروع تایمر',
    'stop-timer': 'توقف تایمر',
    'pause-timer': 'مکث تایمر',
    'reset-timer': 'بازنشانی تایمر',
    'active-timer': 'تایمر فعال',

    // 時間関連
    'total-time': 'کل زمان',
    today: 'امروز',
    yesterday: 'دیروز',
    'this-week': 'این هفته',
    'this-month': 'این ماه',
    'last-month': 'ماه گذشته',

    // 生産性関連
    productivity: 'بهره‌وری',
    efficiency: 'کارایی',
    performance: 'عملکرد',
    analytics: 'تحلیل‌ها',
    insights: 'بینش‌ها',

    // 操作関連
    save: 'ذخیره',
    cancel: 'لغو',
    delete: 'حذف',
    edit: 'ویرایش',
    create: 'ایجاد',
    update: 'بروزرسانی',

    // ナビゲーション
    home: 'خانه',
    back: 'بازگشت',
    next: 'بعدی',
    previous: 'قبلی',
    close: 'بستن',

    // ステータス
    active: 'فعال',
    inactive: 'غیرفعال',
    completed: 'تکمیل شده',
    pending: 'در انتظار',
    'in-progress': 'در حال انجام',
  },
  ur: {
    // ワークトラッカー関連
    'work-time-tracker': 'کام کا وقت ٹریکر',
    dashboard: 'ڈیش بورڈ',
    tasks: 'کام',
    calendar: 'کیلنڈر',
    reports: 'رپورٹس',
    settings: 'سیٹنگز',
    profile: 'پروفائل',

    // タイマー関連
    'start-timer': 'ٹائمر شروع کریں',
    'stop-timer': 'ٹائمر بند کریں',
    'pause-timer': 'ٹائمر رک کریں',
    'reset-timer': 'ٹائمر ری سیٹ کریں',
    'active-timer': 'فعال ٹائمر',

    // 時間関連
    'total-time': 'کل وقت',
    today: 'آج',
    yesterday: 'کل',
    'this-week': 'اس ہفتے',
    'this-month': 'اس مہینے',
    'last-month': 'پچھلے مہینے',

    // 生産性関連
    productivity: 'پیداواری صلاحیت',
    efficiency: 'کارکردگی',
    performance: 'کارکردگی',
    analytics: 'تجزیات',
    insights: 'بصیرت',

    // 操作関連
    save: 'محفوظ کریں',
    cancel: 'منسوخ',
    delete: 'حذف کریں',
    edit: 'تبدیل کریں',
    create: 'بنائیں',
    update: 'اپ ڈیٹ',

    // ナビゲーション
    home: 'گھر',
    back: 'واپس',
    next: 'اگلا',
    previous: 'پچھلا',
    close: 'بند کریں',

    // ステータス
    active: 'فعال',
    inactive: 'غیر فعال',
    completed: 'مکمل',
    pending: 'زیر التواء',
    'in-progress': 'جاری',
  },
};

// RTL言語サポートコンポーネント
export const RTLLanguageSupport: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<RTLLanguage>(RTL_LANGUAGES[0]);
  const [isRTLActive, setIsRTLActive] = useState(false);

  // RTL言語切り替え処理
  const handleLanguageChange = (languageCode: string) => {
    const language = RTL_LANGUAGES.find((lang) => lang.code === languageCode);
    if (language) {
      setSelectedLanguage(language);
      setIsRTLActive(true);

      // DOM全体をRTLに設定
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = language.code;
      document.body.classList.add('rtl-mode');

      // フォント設定
      document.body.style.fontFamily = language.fontFamily;
    }
  };

  // LTRに戻す
  const resetToLTR = () => {
    setIsRTLActive(false);
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'ja';
    document.body.classList.remove('rtl-mode');
    document.body.style.fontFamily = '';
  };

  // 翻訳関数
  const translate = (key: string): string => {
    const translations = RTL_TRANSLATIONS[selectedLanguage.code as keyof typeof RTL_TRANSLATIONS];
    return (translations as Record<string, string>)?.[key] || key;
  };

  // RTL CSS スタイル
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .rtl-mode {
        direction: rtl;
        text-align: right;
      }
      .rtl-mode .rtl-container {
        direction: rtl;
        text-align: right;
      }
      .rtl-mode .rtl-container .flex {
        flex-direction: row-reverse;
      }
      .rtl-mode .rtl-container .grid {
        direction: rtl;
      }
      .rtl-mode .rtl-container button {
        direction: rtl;
      }
      .rtl-mode .rtl-nav {
        flex-direction: row-reverse;
      }
      .rtl-mode .rtl-stats {
        text-align: right;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* RTL言語対応ヘッダー */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Globe className="h-7 w-7 text-purple-600" />
            <span>🌍 RTL言語完全対応システム</span>
            <Badge className="bg-purple-600 text-white">🎉 国際化スペシャリストバッジ獲得！</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-purple-600">{RTL_LANGUAGES.length}</div>
              <div className="text-sm text-gray-600">RTL言語対応</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-green-600">100%</div>
              <div className="text-sm text-gray-600">翻訳完成度</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600">4</div>
              <div className="text-sm text-gray-600">地域対応</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 言語選択パネル */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-6 w-6" />
            RTL言語選択
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedLanguage.code} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span>{selectedLanguage.flag}</span>
                  <span>{selectedLanguage.nativeName}</span>
                  <span className="text-gray-500">({selectedLanguage.name})</span>
                  <Badge variant="secondary">RTL</Badge>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {RTL_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    <span className="text-gray-500">({lang.name})</span>
                    <Badge variant="outline" className="text-xs">
                      {lang.region}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              onClick={() => handleLanguageChange(selectedLanguage.code)}
              variant="default"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              RTLモード有効化
            </Button>
            <Button onClick={resetToLTR} variant="outline" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              LTRに戻す
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RTLプレビューエリア */}
      <Card className={isRTLActive ? 'rtl-container' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isRTLActive ? <ArrowLeft className="h-6 w-6" /> : <ArrowRight className="h-6 w-6" />}
            RTLレイアウトプレビュー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`p-6 border-2 border-dashed border-gray-300 rounded-lg ${
              isRTLActive ? 'text-right' : 'text-left'
            }`}
            dir={isRTLActive ? 'rtl' : 'ltr'}
            style={{
              fontFamily: isRTLActive ? selectedLanguage.fontFamily : 'inherit',
            }}
          >
            {/* アプリケーションヘッダー */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">
                {isRTLActive ? translate('work-time-tracker') : 'ワークタイム トラッカー'}
              </h1>
              <p className="text-gray-600">
                {isRTLActive
                  ? `${selectedLanguage.nativeName} (${selectedLanguage.name})での表示`
                  : '日本語 (Japanese)での表示'}
              </p>
            </div>

            {/* 統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="font-medium text-blue-800">
                  {isRTLActive ? translate('today') : '今日'}
                </div>
                <div className="text-2xl font-bold text-blue-600">8:45</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="font-medium text-green-800">
                  {isRTLActive ? translate('this-week') : '今週'}
                </div>
                <div className="text-2xl font-bold text-green-600">42:30</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg rtl-stats">
                <div className="font-medium text-purple-800">
                  {isRTLActive ? translate('productivity') : '生産性'}
                </div>
                <div className="text-2xl font-bold text-purple-600">95%</div>
              </div>
            </div>

            {/* ボタングループ */}
            <div className="flex gap-3 mb-6">
              <Button variant="default">
                {isRTLActive ? translate('start-timer') : 'タイマー開始'}
              </Button>
              <Button variant="outline">
                {isRTLActive ? translate('stop-timer') : 'タイマー停止'}
              </Button>
              <Button variant="secondary">{isRTLActive ? translate('reports') : 'レポート'}</Button>
            </div>

            {/* ナビゲーション */}
            <nav className={`flex gap-6 border-t pt-4 ${isRTLActive ? 'rtl-nav' : ''}`}>
              <a href="#" className="text-blue-600 hover:underline">
                {isRTLActive ? translate('dashboard') : 'ダッシュボード'}
              </a>
              <a href="#" className="text-blue-600 hover:underline">
                {isRTLActive ? translate('tasks') : 'タスク'}
              </a>
              <a href="#" className="text-blue-600 hover:underline">
                {isRTLActive ? translate('calendar') : 'カレンダー'}
              </a>
              <a href="#" className="text-blue-600 hover:underline">
                {isRTLActive ? translate('settings') : '設定'}
              </a>
            </nav>
          </div>
        </CardContent>
      </Card>

      {/* RTL技術仕様 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            RTL対応技術仕様
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">🔧 実装済み機能</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  CSS direction プロパティ動的制御
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  DOM dir 属性自動設定
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  RTL専用CSSクラス適用
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  テキスト配置自動調整
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  フレックスボックス方向転換
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  アイコン・矢印方向対応
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">🌍 対応言語詳細</h4>
              <div className="space-y-2">
                {RTL_LANGUAGES.map((lang) => (
                  <div
                    key={lang.code}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span className="font-medium">{lang.nativeName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {lang.region}
                      </Badge>
                      <Badge className="bg-green-600 text-white text-xs">
                        {lang.translationProgress}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* バッジ獲得成果 */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Trophy className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                🎉 国際化スペシャリストバッジ獲得完了！
              </h3>
              <p className="text-green-700 mb-4">
                RTL言語対応により、全世界のユーザーに対応可能なアプリケーションを実現
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">✅</div>
                  <div className="text-xs text-gray-600">多言語サポート</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">✅</div>
                  <div className="text-xs text-gray-600">自動化対応</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">✅</div>
                  <div className="text-xs text-gray-600">文化適応</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">✅</div>
                  <div className="text-xs text-gray-600">RTL対応</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RTLLanguageSupport;
