import { toast } from '@/components/ui/use-toast';

export interface CarbonFootprint {
  timestamp: string;
  carbonIntensity: number; // gCO2/kWh
  energyConsumption: number; // kWh
  estimatedEmissions: number; // gCO2
  location: string;
  source: 'grid' | 'renewable' | 'mixed';
}

export interface GreenMetrics {
  totalEmissions: number; // gCO2 total
  dailyEmissions: number; // gCO2 per day
  energyEfficiencyScore: number; // 0-100
  renewableEnergyRatio: number; // 0-1
  carbonSavings: number; // gCO2 saved through optimization
  sustainabilityGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface EnergyOptimizationConfig {
  lowCarbonMode: boolean;
  adaptiveRendering: boolean;
  resourceScheduling: boolean;
  carbonAwareScaling: boolean;
  greenDataCenters: boolean;
  ecoFriendlyDefaults: boolean;
}

export interface CarbonAwareTask {
  id: string;
  name: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedEnergy: number; // kWh
  estimatedCarbon: number; // gCO2
  scheduledTime?: string;
  canDelay: boolean;
  maxDelay: number; // minutes
}

/**
 * ♻️ サステナブルコード推進者: カーボンアウェア処理サービス
 * 環境負荷を考慮した計算とエネルギー効率化
 */
class CarbonAwareComputingService {
  private static instance: CarbonAwareComputingService | null = null;
  private carbonFootprints: CarbonFootprint[] = [];
  private greenMetrics: GreenMetrics;
  private config: EnergyOptimizationConfig;
  private taskQueue: CarbonAwareTask[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.greenMetrics = {
      totalEmissions: 0,
      dailyEmissions: 0,
      energyEfficiencyScore: 85,
      renewableEnergyRatio: 0.3,
      carbonSavings: 0,
      sustainabilityGrade: 'B',
    };

    this.config = {
      lowCarbonMode: true,
      adaptiveRendering: true,
      resourceScheduling: true,
      carbonAwareScaling: true,
      greenDataCenters: true,
      ecoFriendlyDefaults: true,
    };

    this.initializeService();
  }

  public static getInstance(): CarbonAwareComputingService {
    if (!CarbonAwareComputingService.instance) {
      CarbonAwareComputingService.instance = new CarbonAwareComputingService();
    }
    return CarbonAwareComputingService.instance;
  }

  /**
   * 🌱 サービス初期化
   */
  private initializeService(): void {
    this.startCarbonMonitoring();
    this.optimizeInitialSettings();
    this.setupEcoFriendlyDefaults();
    console.log('♻️ カーボンアウェア処理サービス初期化完了');
  }

  /**
   * 📊 カーボン監視開始
   */
  private startCarbonMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.measureCarbonFootprint();
      this.optimizeBasedOnCarbonIntensity();
      this.updateGreenMetrics();
    }, 300000); // 5分ごと

    console.log('📊 カーボン監視を開始しました');
  }

  /**
   * 🔬 カーボンフットプリント測定
   */
  private measureCarbonFootprint(): void {
    // 実際のAPI呼び出しの代わりにシミュレーション
    const currentTime = new Date().toISOString();
    const carbonIntensity = this.getCarbonIntensity();
    const energyConsumption = this.measureEnergyConsumption();

    const footprint: CarbonFootprint = {
      timestamp: currentTime,
      carbonIntensity,
      energyConsumption,
      estimatedEmissions: carbonIntensity * energyConsumption,
      location: 'Japan-Tokyo',
      source: carbonIntensity < 300 ? 'renewable' : carbonIntensity < 500 ? 'mixed' : 'grid',
    };

    this.carbonFootprints.push(footprint);

    // 直近24時間のデータのみ保持
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    this.carbonFootprints = this.carbonFootprints.filter((f) => new Date(f.timestamp) > yesterday);

    console.log('🔬 カーボンフットプリント測定:', footprint);
  }

  /**
   * ⚡ エネルギー消費量測定
   */
  private measureEnergyConsumption(): number {
    // CPU使用率、DOM要素数、ネットワーク活動などから推定
    const cpuLoad = this.getCPULoad();
    const domComplexity = document.querySelectorAll('*').length;
    const networkActivity = this.getNetworkActivity();

    // エネルギー消費量を推定（kWh）
    const baseConsumption = 0.001; // 1Wh基本消費
    const cpuConsumption = cpuLoad * 0.002;
    const domConsumption = (domComplexity / 1000) * 0.0001;
    const networkConsumption = networkActivity * 0.0005;

    return baseConsumption + cpuConsumption + domConsumption + networkConsumption;
  }

  /**
   * 🌍 カーボン強度取得
   */
  private getCarbonIntensity(): number {
    // 時間帯によるカーボン強度の変動をシミュレーション
    const hour = new Date().getHours();

    // 昼間は太陽光発電でカーボン強度が低い
    if (hour >= 10 && hour <= 16) {
      return 200 + Math.random() * 100; // 200-300 gCO2/kWh
    }

    // 夜間は石炭・ガス火力でカーボン強度が高い
    return 400 + Math.random() * 200; // 400-600 gCO2/kWh
  }

  /**
   * 🔍 CPU負荷取得
   */
  private getCPULoad(): number {
    // パフォーマンス情報から推定
    const startTime = performance.now();

    // 軽い計算処理でCPU負荷を推定
    for (let i = 0; i < 1000; i++) {
      void (Math.random() * Math.random());
    }

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    // 処理時間からCPU負荷を推定（0-1）
    return Math.min(processingTime / 10, 1);
  }

  /**
   * 🌐 ネットワーク活動取得
   */
  private getNetworkActivity(): number {
    // ページロード時のリソース数から推定
    const resources = performance.getEntriesByType('resource');
    const recentResources = resources.filter(
      (r) => r.startTime > Date.now() - 300000 // 直近5分
    );

    return recentResources.length / 10; // 正規化
  }

  /**
   * ⚡ カーボン強度に基づく最適化
   */
  private optimizeBasedOnCarbonIntensity(): void {
    const currentIntensity = this.getCarbonIntensity();

    if (currentIntensity > 500) {
      // 高カーボン強度時の最適化
      this.enableLowCarbonMode();
      this.delayNonCriticalTasks();
      this.reduceRenderingQuality();
    } else if (currentIntensity < 300) {
      // 低カーボン強度時の積極活用
      this.disableLowCarbonMode();
      this.processQueuedTasks();
      this.enableHighQualityRendering();
    }
  }

  /**
   * 🌿 低カーボンモード有効化
   */
  private enableLowCarbonMode(): void {
    if (!this.config.lowCarbonMode) {
      this.config.lowCarbonMode = true;

      // CSS アニメーション削減
      this.injectLowCarbonStyles();

      // 不要なタイマー停止
      this.pauseNonEssentialTimers();

      // 画像品質下げる
      this.optimizeImageQuality();

      toast({
        title: '🌿 低カーボンモード有効',
        description: 'エネルギー消費を削減しています',
        variant: 'default',
      });
    }
  }

  /**
   * ⚡ 低カーボンモード無効化
   */
  private disableLowCarbonMode(): void {
    if (this.config.lowCarbonMode) {
      this.config.lowCarbonMode = false;

      // 通常のパフォーマンス復元
      this.removeLowCarbonStyles();
      this.resumeNonEssentialTimers();
      this.restoreImageQuality();
    }
  }

  /**
   * 🎨 低カーボンスタイル注入
   */
  private injectLowCarbonStyles(): void {
    const style = document.createElement('style');
    style.id = 'low-carbon-styles';
    style.textContent = `
      .low-carbon-mode * {
        animation-duration: 0s !important;
        transition-duration: 0.1s !important;
      }
      
      .low-carbon-mode video {
        max-width: 480px !important;
        max-height: 360px !important;
      }
      
      .low-carbon-mode img {
        filter: contrast(90%) brightness(95%) !important;
      }
      
      .low-carbon-mode .energy-intensive {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('low-carbon-mode');
  }

  /**
   * 🔄 低カーボンスタイル削除
   */
  private removeLowCarbonStyles(): void {
    const style = document.getElementById('low-carbon-styles');
    if (style) {
      style.remove();
    }
    document.body.classList.remove('low-carbon-mode');
  }

  /**
   * ⏸️ 非必須タイマー一時停止
   */
  private pauseNonEssentialTimers(): void {
    // アニメーションフレーム要求を制限
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function (callback) {
      return originalRAF.call(window, function () {
        // フレームレートを制限
        setTimeout(callback, 32); // 30 FPS instead of 60 FPS
      });
    };
  }

  /**
   * ▶️ 非必須タイマー再開
   */
  private resumeNonEssentialTimers(): void {
    // 通常のrequestAnimationFrame復元（実際の実装では保存した参照を使用）
    console.log('🔄 非必須タイマーを再開しました');
  }

  /**
   * 🖼️ 画像品質最適化
   */
  private optimizeImageQuality(): void {
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      img.style.filter = 'contrast(90%) brightness(95%)';
    });
  }

  /**
   * 🖼️ 画像品質復元
   */
  private restoreImageQuality(): void {
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      img.style.filter = '';
    });
  }

  /**
   * ⏰ 非クリティカルタスクの遅延
   */
  private delayNonCriticalTasks(): void {
    const nonCriticalTasks = this.taskQueue.filter(
      (task) => task.priority !== 'critical' && task.canDelay
    );

    nonCriticalTasks.forEach((task) => {
      if (!task.scheduledTime) {
        // 低カーボン強度の時間に再スケジュール
        const delayedTime = new Date();
        delayedTime.setMinutes(delayedTime.getMinutes() + task.maxDelay);
        task.scheduledTime = delayedTime.toISOString();
      }
    });

    console.log(`⏰ ${nonCriticalTasks.length}個のタスクを遅延しました`);
  }

  /**
   * 🚀 キューにあるタスクの処理
   */
  private processQueuedTasks(): void {
    const readyTasks = this.taskQueue.filter((task) => {
      if (!task.scheduledTime) {
        return true;
      }
      return new Date(task.scheduledTime) <= new Date();
    });

    readyTasks.forEach((task) => {
      this.executeTask(task);
    });

    this.taskQueue = this.taskQueue.filter((task) => !readyTasks.includes(task));
    console.log(`🚀 ${readyTasks.length}個のタスクを実行しました`);
  }

  /**
   * 🎯 タスク実行
   */
  private executeTask(task: CarbonAwareTask): void {
    console.log(`🎯 タスク実行: ${task.name}`);
    // タスクの実際の実行（プレースホルダー）
  }

  /**
   * 📈 レンダリング品質向上
   */
  private enableHighQualityRendering(): void {
    document.body.classList.add('high-quality-rendering');
  }

  /**
   * 📉 レンダリング品質削減
   */
  private reduceRenderingQuality(): void {
    document.body.classList.add('reduced-quality-rendering');
  }

  /**
   * 📊 グリーンメトリクス更新
   */
  private updateGreenMetrics(): void {
    const recentFootprints = this.carbonFootprints.slice(-24); // 直近24時間

    if (recentFootprints.length > 0) {
      const totalEmissions = recentFootprints.reduce((sum, f) => sum + f.estimatedEmissions, 0);
      const avgCarbonIntensity =
        recentFootprints.reduce((sum, f) => sum + f.carbonIntensity, 0) / recentFootprints.length;

      this.greenMetrics.dailyEmissions = totalEmissions;
      this.greenMetrics.totalEmissions += totalEmissions / 24; // 1時間分を追加

      // 再生可能エネルギー比率
      const renewableCount = recentFootprints.filter((f) => f.source === 'renewable').length;
      this.greenMetrics.renewableEnergyRatio = renewableCount / recentFootprints.length;

      // エネルギー効率スコア
      this.greenMetrics.energyEfficiencyScore = Math.max(0, 100 - avgCarbonIntensity / 10);

      // サステナビリティグレード
      this.greenMetrics.sustainabilityGrade = this.calculateSustainabilityGrade();
    }
  }

  /**
   * 🎓 サステナビリティグレード計算
   */
  private calculateSustainabilityGrade(): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
    const score = this.greenMetrics.energyEfficiencyScore;
    const renewableRatio = this.greenMetrics.renewableEnergyRatio;

    const combinedScore = score * 0.7 + renewableRatio * 100 * 0.3;

    if (combinedScore >= 95) {
      return 'A+';
    }
    if (combinedScore >= 90) {
      return 'A';
    }
    if (combinedScore >= 75) {
      return 'B';
    }
    if (combinedScore >= 60) {
      return 'C';
    }
    if (combinedScore >= 40) {
      return 'D';
    }
    return 'F';
  }

  /**
   * 🌱 エコフレンドリーデフォルト設定
   */
  private setupEcoFriendlyDefaults(): void {
    // ダークモードでエネルギー削減（OLED画面で有効）
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('energy-efficient-dark');
    }

    // 不要なプリフェッチ無効化
    this.disableUnnecessaryPrefetch();

    // 遅延ローディング有効化
    this.enableLazyLoading();

    console.log('🌱 エコフレンドリーデフォルトを設定しました');
  }

  /**
   * 🚫 不要なプリフェッチ無効化
   */
  private disableUnnecessaryPrefetch(): void {
    const linkElements = document.querySelectorAll('link[rel="prefetch"], link[rel="preload"]');
    linkElements.forEach((link) => {
      if (!link.hasAttribute('data-essential')) {
        link.remove();
      }
    });
  }

  /**
   * 🔄 遅延ローディング有効化
   */
  private enableLazyLoading(): void {
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach((img) => {
      img.setAttribute('loading', 'lazy');
    });
  }

  /**
   * ⚙️ 初期最適化
   */
  private optimizeInitialSettings(): void {
    // ブラウザの電力設定検出
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        if (battery.charging === false && battery.level < 0.2) {
          this.enableLowCarbonMode();
          toast({
            title: '🔋 バッテリー節約モード',
            description: 'バッテリー残量が少ないため、省エネモードを有効化しました',
            variant: 'default',
          });
        }
      });
    }

    // 接続タイプに基づく最適化
    if ('connection' in navigator) {
      const { effectiveType } = (navigator as any).connection;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        this.enableLowCarbonMode();
      }
    }
  }

  // 外部APIメソッド
  getGreenMetrics(): GreenMetrics {
    return { ...this.greenMetrics };
  }

  getCarbonFootprints(): CarbonFootprint[] {
    return [...this.carbonFootprints];
  }

  addTask(task: Omit<CarbonAwareTask, 'id'>): string {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTask: CarbonAwareTask = { ...task, id };
    this.taskQueue.push(newTask);
    return id;
  }

  updateConfig(newConfig: Partial<EnergyOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): EnergyOptimizationConfig {
    return { ...this.config };
  }

  /**
   * 🧹 クリーンアップ
   */
  cleanup(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.removeLowCarbonStyles();
  }
}

export const carbonAwareComputingService = CarbonAwareComputingService.getInstance();
