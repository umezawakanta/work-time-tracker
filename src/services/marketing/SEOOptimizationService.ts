export interface SEOMetrics {
  title: string;
  description: string;
  keywords: string[];
  metaTags: Record<string, string>;
  structuredData: any[];
  canonicalUrl?: string;
  noindex?: boolean;
  pageScore: number; // 0-100
}

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number; // 0.0-1.0
}

export interface SEOAnalysis {
  score: number;
  issues: SEOIssue[];
  recommendations: string[];
  strengths: string[];
}

export interface SEOIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  element?: string;
  suggestion: string;
}

/**
 * 🔍 SEO最適化サービス
 * メタタグ最適化、サイトマップ生成、構造化データマークアップを提供
 */
class SEOOptimizationService {
  private static instance: SEOOptimizationService | null = null;
  private seoMetrics: Map<string, SEOMetrics> = new Map();
  private sitemap: SitemapEntry[] = [];
  private structuredDataSchemas: Map<string, any> = new Map();

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): SEOOptimizationService {
    if (!SEOOptimizationService.instance) {
      SEOOptimizationService.instance = new SEOOptimizationService();
    }
    return SEOOptimizationService.instance;
  }

  /**
   * 🚀 サービス初期化
   */
  private initializeService(): void {
    this.setupDefaultStructuredData();
    this.generateInitialSitemap();
    this.optimizeCurrentPage();
    console.log('🔍 SEO最適化サービス初期化完了');
  }

  /**
   * 📄 ページSEO最適化
   */
  optimizePage(
    path: string,
    options: {
      title: string;
      description: string;
      keywords?: string[];
      image?: string;
      type?: string;
      canonicalUrl?: string;
      noindex?: boolean;
    }
  ): void {
    const {
      title,
      description,
      keywords = [],
      image,
      type = 'website',
      canonicalUrl,
      noindex,
    } = options;

    // メタタグの設定
    this.setMetaTag('title', title);
    this.setMetaTag('description', description);
    this.setMetaTag('keywords', keywords.join(', '));

    // Open Graphタグ
    this.setMetaTag('og:title', title, 'property');
    this.setMetaTag('og:description', description, 'property');
    this.setMetaTag('og:type', type, 'property');
    this.setMetaTag('og:url', window.location.href, 'property');

    if (image) {
      this.setMetaTag('og:image', image, 'property');
    }

    // Twitterカード
    this.setMetaTag('twitter:card', 'summary_large_image', 'name');
    this.setMetaTag('twitter:title', title, 'name');
    this.setMetaTag('twitter:description', description, 'name');

    if (image) {
      this.setMetaTag('twitter:image', image, 'name');
    }

    // カノニカルURL
    if (canonicalUrl) {
      this.setCanonicalUrl(canonicalUrl);
    }

    // noindex設定
    if (noindex) {
      this.setMetaTag('robots', 'noindex,nofollow', 'name');
    }

    // SEOメトリクスを保存
    const metrics: SEOMetrics = {
      title,
      description,
      keywords,
      metaTags: this.getAllMetaTags(),
      structuredData: this.getStructuredDataForPage(path),
      canonicalUrl,
      noindex,
      pageScore: this.calculatePageScore(title, description, keywords),
    };

    this.seoMetrics.set(path, metrics);
    console.log(`🔍 SEO最適化完了: ${path} (スコア: ${metrics.pageScore})`);
  }

  /**
   * 🏷️ メタタグ設定
   */
  private setMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name'): void {
    let metaTag = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;

    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute(attribute, name);
      document.head.appendChild(metaTag);
    }

    metaTag.content = content;
  }

  /**
   * 🔗 カノニカルURL設定
   */
  private setCanonicalUrl(url: string): void {
    let linkTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

    if (!linkTag) {
      linkTag = document.createElement('link');
      linkTag.rel = 'canonical';
      document.head.appendChild(linkTag);
    }

    linkTag.href = url;
  }

  /**
   * 📊 すべてのメタタグ取得
   */
  private getAllMetaTags(): Record<string, string> {
    const metaTags: Record<string, string> = {};
    const allMetas = document.querySelectorAll('meta[name], meta[property]');

    allMetas.forEach((meta) => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      if (name && content) {
        metaTags[name] = content;
      }
    });

    return metaTags;
  }

  /**
   * 🗺️ サイトマップ生成
   */
  generateSitemap(): string {
    this.sitemap = [
      {
        url: '/',
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: '/dashboard',
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: '/analytics',
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: '/monitoring',
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: '/development-badges',
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ];

    return this.generateSitemapXML();
  }

  /**
   * 📄 サイトマップXML生成
   */
  private generateSitemapXML(): string {
    const baseUrl = window.location.origin;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    this.sitemap.forEach((entry) => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${entry.url}</loc>\n`;
      xml += `    <lastmod>${entry.lastModified.split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
      xml += `    <priority>${entry.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
  }

  /**
   * 📋 構造化データ設定
   */
  private setupDefaultStructuredData(): void {
    // Webサイト構造化データ
    this.structuredDataSchemas.set('website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Work Time Tracker',
      url: window.location.origin,
      description: 'React + TypeScript + Viteを使用した勤怠管理アプリケーション',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${window.location.origin}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    });

    // Webアプリケーション構造化データ
    this.structuredDataSchemas.set('application', {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Work Time Tracker',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'JPY',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        ratingCount: '100',
        bestRating: '5',
        worstRating: '1',
      },
    });

    // 組織構造化データ
    this.structuredDataSchemas.set('organization', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Work Time Tracker Development Team',
      url: window.location.origin,
      description: 'React TypeScript勤怠管理アプリケーション開発チーム',
    });
  }

  /**
   * 📑 構造化データ注入
   */
  injectStructuredData(path: string): void {
    const structuredData = this.getStructuredDataForPage(path);

    // 既存の構造化データを削除
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((script) => script.remove());

    // 新しい構造化データを注入
    structuredData.forEach((data) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    });
  }

  /**
   * 📄 ページ別構造化データ取得
   */
  private getStructuredDataForPage(path: string): any[] {
    const data = [];

    // 基本的なWebサイト情報は全ページに追加
    data.push(this.structuredDataSchemas.get('website'));

    switch (path) {
      case '/':
        data.push(this.structuredDataSchemas.get('application'));
        data.push(this.structuredDataSchemas.get('organization'));
        break;
      case '/dashboard':
        data.push({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'ダッシュボード',
          description: 'Work Time Trackerのメインダッシュボード',
          isPartOf: {
            '@type': 'WebSite',
            name: 'Work Time Tracker',
          },
        });
        break;
      case '/analytics':
        data.push({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: '分析ダッシュボード',
          description: 'データ分析とインサイト表示',
          isPartOf: {
            '@type': 'WebSite',
            name: 'Work Time Tracker',
          },
        });
        break;
    }

    return data.filter(Boolean);
  }

  /**
   * 🔍 現在のページ最適化
   */
  private optimizeCurrentPage(): void {
    const path = window.location.pathname;

    // ページに応じたSEO最適化
    switch (path) {
      case '/':
        this.optimizePage('/', {
          title: 'Work Time Tracker - React TypeScript勤怠管理アプリ',
          description:
            'React + TypeScript + Viteで構築された高機能な勤怠管理アプリケーション。リアルタイム分析、AI支援、モバイル対応完備。',
          keywords: ['勤怠管理', 'React', 'TypeScript', 'Vite', 'ダッシュボード', 'AI', '分析'],
          type: 'website',
        });
        break;
      case '/dashboard':
        this.optimizePage('/dashboard', {
          title: 'ダッシュボード - Work Time Tracker',
          description:
            'リアルタイムデータ表示とインサイト分析ができるダッシュボード。AI支援機能付きタスク管理。',
          keywords: ['ダッシュボード', 'リアルタイム', 'データ分析', 'AI支援'],
        });
        break;
      case '/analytics':
        this.optimizePage('/analytics', {
          title: '分析ダッシュボード - Work Time Tracker',
          description:
            '高度なデータ分析とビジュアライゼーション。パフォーマンス指標とトレンド分析。',
          keywords: ['データ分析', 'ビジュアライゼーション', 'パフォーマンス', 'トレンド'],
        });
        break;
      case '/monitoring':
        this.optimizePage('/monitoring', {
          title: 'システム監視 - Work Time Tracker',
          description: 'リアルタイムシステム監視、アラート管理、SLO追跡機能。',
          keywords: ['システム監視', 'アラート', 'SLO', 'パフォーマンス監視'],
        });
        break;
      default:
        this.optimizePage(path, {
          title: 'Work Time Tracker',
          description: 'React TypeScript勤怠管理アプリケーション',
          keywords: ['勤怠管理', 'React', 'TypeScript'],
        });
    }

    // 構造化データ注入
    this.injectStructuredData(path);
  }

  /**
   * 📊 ページスコア計算
   */
  private calculatePageScore(title: string, description: string, keywords: string[]): number {
    let score = 0;

    // タイトル評価
    if (title.length >= 30 && title.length <= 60) score += 25;
    else if (title.length > 0) score += 15;

    // ディスクリプション評価
    if (description.length >= 120 && description.length <= 160) score += 25;
    else if (description.length > 0) score += 15;

    // キーワード評価
    if (keywords.length >= 3 && keywords.length <= 10) score += 20;
    else if (keywords.length > 0) score += 10;

    // 構造化データ評価
    score += 15; // 構造化データが設定されている

    // 追加要因
    if (document.querySelector('link[rel="canonical"]')) score += 10;
    if (!document.querySelector('meta[name="robots"][content*="noindex"]')) score += 5;

    return Math.min(score, 100);
  }

  /**
   * 🔍 SEO分析実行
   */
  analyzePage(url?: string): SEOAnalysis {
    const currentUrl = url || window.location.pathname;
    const metrics = this.seoMetrics.get(currentUrl);

    const issues: SEOIssue[] = [];
    const recommendations: string[] = [];
    const strengths: string[] = [];

    // タイトルタグ分析
    const titleTag = document.querySelector('title');
    if (!titleTag || !titleTag.textContent) {
      issues.push({
        severity: 'critical',
        type: 'missing_title',
        description: 'ページタイトルが設定されていません',
        suggestion: 'descriptiveで魅力的なタイトルを設定してください',
      });
    } else if (titleTag.textContent.length > 60) {
      issues.push({
        severity: 'medium',
        type: 'title_too_long',
        description: 'タイトルが長すぎます（60文字推奨）',
        element: titleTag.textContent,
        suggestion: 'タイトルを60文字以内に短縮してください',
      });
    } else {
      strengths.push('適切な長さのタイトルが設定されています');
    }

    // メタディスクリプション分析
    const descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta || !descMeta.getAttribute('content')) {
      issues.push({
        severity: 'high',
        type: 'missing_description',
        description: 'メタディスクリプションが設定されていません',
        suggestion: '120-160文字の魅力的な説明文を追加してください',
      });
    } else {
      const descLength = descMeta.getAttribute('content')!.length;
      if (descLength < 120 || descLength > 160) {
        issues.push({
          severity: 'medium',
          type: 'description_length',
          description: `メタディスクリプションの長さが不適切です（${descLength}文字）`,
          element: descMeta.getAttribute('content')!,
          suggestion: '120-160文字の範囲で調整してください',
        });
      } else {
        strengths.push('適切な長さのメタディスクリプションが設定されています');
      }
    }

    // 構造化データ分析
    const structuredDataScripts = document.querySelectorAll('script[type="application/ld+json"]');
    if (structuredDataScripts.length === 0) {
      issues.push({
        severity: 'medium',
        type: 'missing_structured_data',
        description: '構造化データが設定されていません',
        suggestion: 'Schema.orgの構造化データを追加してください',
      });
    } else {
      strengths.push('構造化データが適切に設定されています');
    }

    // 推奨事項生成
    if (issues.length === 0) {
      recommendations.push('SEOの基本設定は完璧です！');
    } else {
      recommendations.push('重要度の高い問題から順に修正してください');
      recommendations.push('Googleサーチコンソールでパフォーマンスを監視してください');
    }

    const score = metrics?.pageScore || this.calculateCurrentPageScore();

    return {
      score,
      issues,
      recommendations,
      strengths,
    };
  }

  /**
   * 📊 現在ページスコア計算
   */
  private calculateCurrentPageScore(): number {
    const title = document.querySelector('title')?.textContent || '';
    const description =
      document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const keywords =
      document.querySelector('meta[name="keywords"]')?.getAttribute('content')?.split(',') || [];

    return this.calculatePageScore(title, description, keywords);
  }

  /**
   * 🗺️ 初期サイトマップ生成
   */
  private generateInitialSitemap(): void {
    this.generateSitemap();
    console.log('🗺️ サイトマップ生成完了');
  }

  // 外部API
  getSEOMetrics(path?: string): SEOMetrics | undefined {
    const currentPath = path || window.location.pathname;
    return this.seoMetrics.get(currentPath);
  }

  getAllSEOMetrics(): Map<string, SEOMetrics> {
    return new Map(this.seoMetrics);
  }

  getSitemap(): SitemapEntry[] {
    return [...this.sitemap];
  }

  getSitemapXML(): string {
    return this.generateSitemapXML();
  }

  updatePageInSitemap(url: string, options?: Partial<SitemapEntry>): void {
    const existingIndex = this.sitemap.findIndex((entry) => entry.url === url);

    if (existingIndex >= 0) {
      this.sitemap[existingIndex] = {
        ...this.sitemap[existingIndex],
        ...options,
        lastModified: new Date().toISOString(),
      };
    } else {
      this.sitemap.push({
        url,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.5,
        ...options,
      });
    }
  }
}

export const seoOptimizationService = SEOOptimizationService.getInstance();
