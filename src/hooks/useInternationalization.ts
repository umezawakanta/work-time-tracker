import React, { useState, useEffect, createContext, useContext } from 'react';

export type SupportedLocale = 'ja' | 'en' | 'zh' | 'ko';

export interface LocaleConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  currency: string;
  numberFormat: {
    decimal: string;
    thousands: string;
  };
}

export const SUPPORTED_LOCALES: Record<SupportedLocale, LocaleConfig> = {
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm',
    currency: 'JPY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'hh:mm A',
    currency: 'USD',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    direction: 'ltr',
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm',
    currency: 'CNY',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    direction: 'ltr',
    dateFormat: 'YYYY년 MM월 DD일',
    timeFormat: 'HH:mm',
    currency: 'KRW',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
  },
};

// 翻訳辞書の型定義
export interface TranslationDictionary {
  // 共通UI
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    confirm: string;
    yes: string;
    no: string;
    ok: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    home: string;
    settings: string;
    profile: string;
    logout: string;
    login: string;
  };

  // ナビゲーション
  navigation: {
    dashboard: string;
    calendar: string;
    tasks: string;
    analytics: string;
    reports: string;
    admin: string;
    integrated_dashboard: string;
    automation: string;
    work_time: string;
  };

  // タスク管理
  tasks: {
    title: string;
    create: string;
    edit: string;
    delete: string;
    complete: string;
    incomplete: string;
    priority: {
      high: string;
      medium: string;
      low: string;
    };
    status: {
      pending: string;
      inProgress: string;
      completed: string;
    };
    dueDate: string;
    description: string;
    category: string;
  };

  // アナリティクス
  analytics: {
    title: string;
    productivity: string;
    timeSpent: string;
    tasksCompleted: string;
    efficiency: string;
    trends: string;
    daily: string;
    weekly: string;
    monthly: string;
    export: string;
  };

  // バッジ・実績
  badges: {
    title: string;
    earned: string;
    progress: string;
    locked: string;
    unlocked: string;
    requirement: string;
    description: string;
    categories: {
      foundation: string;
      features: string;
      uiUx: string;
      performance: string;
      testing: string;
      automation: string;
      community: string;
      systematization: string;
      completion: string;
    };
  };

  // 設定
  settings: {
    title: string;
    language: string;
    theme: string;
    notifications: string;
    accessibility: string;
    privacy: string;
    account: string;
    preferences: string;
  };

  // エラーメッセージ
  errors: {
    networkError: string;
    serverError: string;
    notFound: string;
    unauthorized: string;
    forbidden: string;
    validation: string;
    generic: string;
  };

  // 成功メッセージ
  success: {
    saved: string;
    deleted: string;
    updated: string;
    created: string;
    completed: string;
  };
}

// 日本語翻訳（ベース）
const jaTranslations: TranslationDictionary = {
  common: {
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    edit: '編集',
    add: '追加',
    search: '検索',
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    warning: '警告',
    info: '情報',
    confirm: '確認',
    yes: 'はい',
    no: 'いいえ',
    ok: 'OK',
    close: '閉じる',
    back: '戻る',
    next: '次へ',
    previous: '前へ',
    home: 'ホーム',
    settings: '設定',
    profile: 'プロフィール',
    logout: 'ログアウト',
    login: 'ログイン',
  },
  navigation: {
    dashboard: 'ダッシュボード',
    calendar: 'カレンダー',
    tasks: 'タスク',
    analytics: '分析',
    reports: 'レポート',
    admin: '管理',
    integrated_dashboard: '統合ダッシュボード',
    automation: '自動化ルール',
    work_time: '勤怠管理',
  },
  tasks: {
    title: 'タスク管理',
    create: 'タスク作成',
    edit: 'タスク編集',
    delete: 'タスク削除',
    complete: '完了',
    incomplete: '未完了',
    priority: {
      high: '高',
      medium: '中',
      low: '低',
    },
    status: {
      pending: '待機中',
      inProgress: '進行中',
      completed: '完了',
    },
    dueDate: '期限',
    description: '説明',
    category: 'カテゴリ',
  },
  analytics: {
    title: 'アナリティクス',
    productivity: '生産性',
    timeSpent: '作業時間',
    tasksCompleted: '完了タスク',
    efficiency: '効率性',
    trends: 'トレンド',
    daily: '日次',
    weekly: '週次',
    monthly: '月次',
    export: 'エクスポート',
  },
  badges: {
    title: '開発バッジ',
    earned: '獲得済み',
    progress: '進捗',
    locked: 'ロック中',
    unlocked: '解除済み',
    requirement: '要件',
    description: '説明',
    categories: {
      foundation: '基盤構築',
      features: '機能実装',
      uiUx: 'UI/UX改善',
      performance: 'パフォーマンス',
      testing: 'テスト・品質',
      automation: '自動化',
      community: 'コミュニティ',
      systematization: '仕組み化',
      completion: '完成度',
    },
  },
  settings: {
    title: '設定',
    language: '言語',
    theme: 'テーマ',
    notifications: '通知',
    accessibility: 'アクセシビリティ',
    privacy: 'プライバシー',
    account: 'アカウント',
    preferences: '設定',
  },
  errors: {
    networkError: 'ネットワークエラーが発生しました',
    serverError: 'サーバーエラーが発生しました',
    notFound: 'ページが見つかりません',
    unauthorized: '認証が必要です',
    forbidden: 'アクセスが拒否されました',
    validation: '入力内容に誤りがあります',
    generic: 'エラーが発生しました',
  },
  success: {
    saved: '保存しました',
    deleted: '削除しました',
    updated: '更新しました',
    created: '作成しました',
    completed: '完了しました',
  },
};

// 英語翻訳
const enTranslations: TranslationDictionary = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    home: 'Home',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
  },
  navigation: {
    dashboard: 'Dashboard',
    calendar: 'Calendar',
    tasks: 'Tasks',
    analytics: 'Analytics',
    reports: 'Reports',
    admin: 'Admin',
    integrated_dashboard: 'Integrated Dashboard',
    automation: 'Automation Rules',
    work_time: 'Work Time',
  },
  tasks: {
    title: 'Task Management',
    create: 'Create Task',
    edit: 'Edit Task',
    delete: 'Delete Task',
    complete: 'Complete',
    incomplete: 'Incomplete',
    priority: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    status: {
      pending: 'Pending',
      inProgress: 'In Progress',
      completed: 'Completed',
    },
    dueDate: 'Due Date',
    description: 'Description',
    category: 'Category',
  },
  analytics: {
    title: 'Analytics',
    productivity: 'Productivity',
    timeSpent: 'Time Spent',
    tasksCompleted: 'Tasks Completed',
    efficiency: 'Efficiency',
    trends: 'Trends',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    export: 'Export',
  },
  badges: {
    title: 'Development Badges',
    earned: 'Earned',
    progress: 'Progress',
    locked: 'Locked',
    unlocked: 'Unlocked',
    requirement: 'Requirement',
    description: 'Description',
    categories: {
      foundation: 'Foundation',
      features: 'Features',
      uiUx: 'UI/UX',
      performance: 'Performance',
      testing: 'Testing & Quality',
      automation: 'Automation',
      community: 'Community',
      systematization: 'Systematization',
      completion: 'Completion',
    },
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    accessibility: 'Accessibility',
    privacy: 'Privacy',
    account: 'Account',
    preferences: 'Preferences',
  },
  errors: {
    networkError: 'Network error occurred',
    serverError: 'Server error occurred',
    notFound: 'Page not found',
    unauthorized: 'Authentication required',
    forbidden: 'Access denied',
    validation: 'Invalid input',
    generic: 'An error occurred',
  },
  success: {
    saved: 'Saved successfully',
    deleted: 'Deleted successfully',
    updated: 'Updated successfully',
    created: 'Created successfully',
    completed: 'Completed successfully',
  },
};

// 中国語翻訳（簡略版）
const zhTranslations: TranslationDictionary = {
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    warning: '警告',
    info: '信息',
    confirm: '确认',
    yes: '是',
    no: '否',
    ok: '确定',
    close: '关闭',
    back: '返回',
    next: '下一个',
    previous: '上一个',
    home: '首页',
    settings: '设置',
    profile: '个人资料',
    logout: '注销',
    login: '登录',
  },
  navigation: {
    dashboard: '仪表板',
    calendar: '日历',
    tasks: '任务',
    analytics: '分析',
    reports: '报告',
    admin: '管理',
    integrated_dashboard: '集成仪表板',
    automation: '自动化规则',
    work_time: '工作时间',
  },
  tasks: {
    title: '任务管理',
    create: '创建任务',
    edit: '编辑任务',
    delete: '删除任务',
    complete: '完成',
    incomplete: '未完成',
    priority: {
      high: '高',
      medium: '中',
      low: '低',
    },
    status: {
      pending: '待处理',
      inProgress: '进行中',
      completed: '已完成',
    },
    dueDate: '截止日期',
    description: '描述',
    category: '类别',
  },
  analytics: {
    title: '分析',
    productivity: '生产力',
    timeSpent: '花费时间',
    tasksCompleted: '完成任务',
    efficiency: '效率',
    trends: '趋势',
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
    export: '导出',
  },
  badges: {
    title: '开发徽章',
    earned: '已获得',
    progress: '进度',
    locked: '锁定',
    unlocked: '已解锁',
    requirement: '要求',
    description: '描述',
    categories: {
      foundation: '基础建设',
      features: '功能实现',
      uiUx: 'UI/UX',
      performance: '性能',
      testing: '测试与质量',
      automation: '自动化',
      community: '社区',
      systematization: '系统化',
      completion: '完成度',
    },
  },
  settings: {
    title: '设置',
    language: '语言',
    theme: '主题',
    notifications: '通知',
    accessibility: '辅助功能',
    privacy: '隐私',
    account: '账户',
    preferences: '首选项',
  },
  errors: {
    networkError: '网络错误',
    serverError: '服务器错误',
    notFound: '页面未找到',
    unauthorized: '需要身份验证',
    forbidden: '访问被拒绝',
    validation: '输入无效',
    generic: '发生错误',
  },
  success: {
    saved: '保存成功',
    deleted: '删除成功',
    updated: '更新成功',
    created: '创建成功',
    completed: '完成成功',
  },
};

// 韩语翻译（簡略版）
const koTranslations: TranslationDictionary = {
  common: {
    save: '저장',
    cancel: '취소',
    delete: '삭제',
    edit: '편집',
    add: '추가',
    search: '검색',
    loading: '로딩 중...',
    error: '오류',
    success: '성공',
    warning: '경고',
    info: '정보',
    confirm: '확인',
    yes: '예',
    no: '아니오',
    ok: '확인',
    close: '닫기',
    back: '뒤로',
    next: '다음',
    previous: '이전',
    home: '홈',
    settings: '설정',
    profile: '프로필',
    logout: '로그아웃',
    login: '로그인',
  },
  navigation: {
    dashboard: '대시보드',
    calendar: '캘린더',
    tasks: '작업',
    analytics: '분석',
    reports: '보고서',
    admin: '관리',
    integrated_dashboard: '통합 대시보드',
    automation: '자동화 규칙',
    work_time: '근무 시간',
  },
  tasks: {
    title: '작업 관리',
    create: '작업 생성',
    edit: '작업 편집',
    delete: '작업 삭제',
    complete: '완료',
    incomplete: '미완료',
    priority: {
      high: '높음',
      medium: '보통',
      low: '낮음',
    },
    status: {
      pending: '대기 중',
      inProgress: '진행 중',
      completed: '완료됨',
    },
    dueDate: '마감일',
    description: '설명',
    category: '카테고리',
  },
  analytics: {
    title: '분석',
    productivity: '생산성',
    timeSpent: '소요 시간',
    tasksCompleted: '완료된 작업',
    efficiency: '효율성',
    trends: '트렌드',
    daily: '일간',
    weekly: '주간',
    monthly: '월간',
    export: '내보내기',
  },
  badges: {
    title: '개발 배지',
    earned: '획득함',
    progress: '진행률',
    locked: '잠김',
    unlocked: '잠금 해제됨',
    requirement: '요구사항',
    description: '설명',
    categories: {
      foundation: '기반 구축',
      features: '기능 구현',
      uiUx: 'UI/UX',
      performance: '성능',
      testing: '테스트 및 품질',
      automation: '자동화',
      community: '커뮤니티',
      systematization: '시스템화',
      completion: '완성도',
    },
  },
  settings: {
    title: '설정',
    language: '언어',
    theme: '테마',
    notifications: '알림',
    accessibility: '접근성',
    privacy: '개인정보',
    account: '계정',
    preferences: '환경설정',
  },
  errors: {
    networkError: '네트워크 오류가 발생했습니다',
    serverError: '서버 오류가 발생했습니다',
    notFound: '페이지를 찾을 수 없습니다',
    unauthorized: '인증이 필요합니다',
    forbidden: '접근이 거부되었습니다',
    validation: '입력이 올바르지 않습니다',
    generic: '오류가 발생했습니다',
  },
  success: {
    saved: '저장되었습니다',
    deleted: '삭제되었습니다',
    updated: '업데이트되었습니다',
    created: '생성되었습니다',
    completed: '완료되었습니다',
  },
};

// 翻訳辞書マップ
const TRANSLATIONS: Record<SupportedLocale, TranslationDictionary> = {
  ja: jaTranslations,
  en: enTranslations,
  zh: zhTranslations,
  ko: koTranslations,
};

// 国際化コンテキスト
interface InternationalizationContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string) => string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  formatNumber: (number: number) => string;
  formatCurrency: (amount: number) => string;
  getLocaleConfig: () => LocaleConfig;
  isRTL: boolean;
}

export const InternationalizationContext = createContext<InternationalizationContextValue | null>(
  null
);

/**
 * 🌍 国際化プロバイダー内部ロジック
 */
const useInternationalizationLogic = () => {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    // ローカルストレージから復元
    const saved = localStorage.getItem('app-locale');
    if (saved && Object.keys(SUPPORTED_LOCALES).includes(saved)) {
      return saved as SupportedLocale;
    }

    // ブラウザの言語設定から推測
    const browserLang = navigator.language.substring(0, 2) as SupportedLocale;
    return Object.keys(SUPPORTED_LOCALES).includes(browserLang) ? browserLang : 'ja';
  });

  // ロケール変更（コンテキスト更新により自動再レンダリング）
  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem('app-locale', newLocale);

    // ドキュメントの言語属性を更新
    document.documentElement.lang = newLocale;

    // RTL対応
    const config = SUPPORTED_LOCALES[newLocale];
    document.documentElement.dir = config.direction;
  };

  // 翻訳関数
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = TRANSLATIONS[locale];

    for (const k of keys) {
      value = value?.[k];
    }

    return typeof value === 'string' ? value : key;
  };

  // 日付フォーマット
  const formatDate = (date: Date): string => {
    const config = SUPPORTED_LOCALES[locale];
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  // 時刻フォーマット
  const formatTime = (date: Date): string => {
    const config = SUPPORTED_LOCALES[locale];
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: config.timeFormat.includes('A'),
    }).format(date);
  };

  // 数値フォーマット
  const formatNumber = (number: number): string => {
    return new Intl.NumberFormat(locale).format(number);
  };

  // 通貨フォーマット
  const formatCurrency = (amount: number): string => {
    const config = SUPPORTED_LOCALES[locale];
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: config.currency,
    }).format(amount);
  };

  // ロケール設定取得
  const getLocaleConfig = (): LocaleConfig => SUPPORTED_LOCALES[locale];

  // RTL判定
  const isRTL = SUPPORTED_LOCALES[locale].direction === 'rtl';

  // 初期化時にドキュメント属性を設定
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = SUPPORTED_LOCALES[locale].direction;
  }, [locale]);

  return {
    locale,
    setLocale,
    t,
    formatDate,
    formatTime,
    formatNumber,
    formatCurrency,
    getLocaleConfig,
    isRTL,
    supportedLocales: SUPPORTED_LOCALES,
    translations: TRANSLATIONS[locale],
  };
};

/**
 * 🌍 国際化プロバイダー
 * アプリケーション全体に国際化機能を提供するコンテキストプロバイダー
 */
interface InternationalizationProviderProps {
  children: React.ReactNode;
}

export const InternationalizationProvider: React.FC<InternationalizationProviderProps> = ({
  children,
}) => {
  const internationalization = useInternationalizationLogic();

  return React.createElement(
    InternationalizationContext.Provider,
    { value: internationalization },
    children
  );
};

/**
 * 🌍 国際化フック（コンテキストから取得）
 * コンポーネントで使用する国際化機能
 */
export const useInternationalization = () => {
  const context = useContext(InternationalizationContext);
  if (!context) {
    throw new Error('useInternationalization must be used within InternationalizationProvider');
  }
  return context;
};
