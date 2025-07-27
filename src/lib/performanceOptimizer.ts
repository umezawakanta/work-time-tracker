// 🥷 パフォーマンス忍者: 最適化ユーティリティ
import { useEffect } from 'react';

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Core Web Vitalsの測定開始
  public startMetricsCollection(): void {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    this.observeLCP();

    // First Input Delay (FID)
    this.observeFID();

    // Cumulative Layout Shift (CLS)
    this.observeCLS();

    // First Contentful Paint (FCP)
    this.observeFCP();

    console.log('🥷 Performance monitoring started');
  }

  private observeLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      this.metrics.lcp = lastEntry.startTime;
      console.log('🥷 LCP:', lastEntry.startTime, 'ms');
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(observer);
  }

  private observeFID(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.metrics.fid = entry.processingStart - entry.startTime;
        console.log('🥷 FID:', entry.processingStart - entry.startTime, 'ms');
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
    this.observers.push(observer);
  }

  private observeCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metrics.cls = clsValue;
      console.log('🥷 CLS:', clsValue);
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(observer);
  }

  private observeFCP(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
          console.log('🥷 FCP:', entry.startTime, 'ms');
        }
      });
    });

    observer.observe({ entryTypes: ['paint'] });
    this.observers.push(observer);
  }

  // メトリクスの取得
  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  // Lighthouse Score推定
  public estimateLighthouseScore(): number {
    const { fcp, lcp, fid, cls } = this.metrics;

    if (!fcp || !lcp) return 0;

    // Lighthouse v10のスコア計算式を簡略化
    let score = 100;

    // FCP (10%)
    if (fcp > 3000) score -= 10;
    else if (fcp > 1800) score -= 5;

    // LCP (25%)
    if (lcp > 4000) score -= 25;
    else if (lcp > 2500) score -= 15;

    // FID (10%)
    if (fid && fid > 300) score -= 10;
    else if (fid && fid > 100) score -= 5;

    // CLS (25%)
    if (cls && cls > 0.25) score -= 25;
    else if (cls && cls > 0.1) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  // パフォーマンス最適化の提案
  public getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const { fcp, lcp, fid, cls } = this.metrics;

    if (fcp && fcp > 1800) {
      suggestions.push('🎨 Critical CSSの最適化');
      suggestions.push('🖼️ 画像の遅延読み込み');
    }

    if (lcp && lcp > 2500) {
      suggestions.push('🚀 最大要素の最適化');
      suggestions.push('📦 バンドルサイズの削減');
    }

    if (fid && fid > 100) {
      suggestions.push('⚡ JavaScriptの実行時間短縮');
      suggestions.push('🔄 メインスレッドのブロック解除');
    }

    if (cls && cls > 0.1) {
      suggestions.push('📐 レイアウトシフトの修正');
      suggestions.push('🖼️ 画像サイズの事前指定');
    }

    return suggestions;
  }

  // リソースのプリロード
  public preloadCriticalResources(): void {
    if (typeof document === 'undefined') return;

    const criticalResources = [
      // フォント
      { href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2' },
      // Critical CSS - removed non-existent file to prevent MIME type error
      // { href: '/styles/critical.css', as: 'style' },
    ];

    criticalResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      if (resource.as === 'font') link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    console.log('🥷 Critical resources preloaded');
  }

  // 画像の遅延読み込み設定
  public setupLazyLoading(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    // 既存の遅延読み込み画像を監視
    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });

    console.log('🥷 Lazy loading setup complete');
  }

  // メモリリークの防止
  public cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    console.log('🥷 Performance observers cleaned up');
  }
}

// React Hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const optimizer = PerformanceOptimizer.getInstance();

  useEffect(() => {
    optimizer.startMetricsCollection();
    optimizer.preloadCriticalResources();
    optimizer.setupLazyLoading();

    return () => {
      optimizer.cleanup();
    };
  }, []);

  return {
    metrics: optimizer.getMetrics(),
    score: optimizer.estimateLighthouseScore(),
    suggestions: optimizer.getOptimizationSuggestions(),
  };
};

export default PerformanceOptimizer;
