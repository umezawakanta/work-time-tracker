import { toast } from '@/components/ui/use-toast';

export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number; // 0-100%
    temperature: number; // Celsius
    processes: number;
  };
  memory: {
    used: number; // MB
    total: number; // MB
    percentage: number; // 0-100%
    available: number; // MB
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    latency: number; // ms
  };
  storage: {
    used: number; // GB
    total: number; // GB
    percentage: number; // 0-100%
    iops: number;
  };
  application: {
    responseTime: number; // ms
    throughput: number; // requests/second
    errorRate: number; // 0-100%
    activeUsers: number;
  };
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  type: 'system' | 'application' | 'security' | 'performance';
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  source: string;
  metrics: Record<string, number>;
  actions: AlertAction[];
}

export interface AlertAction {
  id: string;
  name: string;
  type: 'notification' | 'webhook' | 'script' | 'escalation';
  config: Record<string, any>;
  executed: boolean;
  result?: string;
}

export interface HealthCheck {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'HEAD';
  expectedStatus: number;
  timeout: number; // ms
  interval: number; // ms
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: string;
  responseTime: number; // ms
  consecutiveFailures: number;
  uptime: number; // percentage
}

export interface SLO {
  id: string;
  name: string;
  description: string;
  type: 'availability' | 'latency' | 'throughput' | 'error_rate';
  target: number; // target value
  threshold: number; // alert threshold
  window: '1h' | '24h' | '7d' | '30d';
  current: number; // current value
  status: 'meeting' | 'at_risk' | 'violated';
  errorBudget: {
    total: number;
    consumed: number;
    remaining: number;
    percentage: number;
  };
}

export interface MonitoringConfig {
  enableRealTimeAlerts: boolean;
  alertChannels: ('email' | 'slack' | 'webhook' | 'sms')[];
  metricsRetention: number; // days
  alertThresholds: {
    cpu: number;
    memory: number;
    disk: number;
    responseTime: number;
    errorRate: number;
  };
  healthCheckInterval: number; // ms
  sloEvaluationInterval: number; // ms
}

/**
 * 📊 システム監視マスター: リアルタイム監視サービス
 * メトリクス収集・アラート管理・ヘルスチェック・SLO追跡
 */
class SystemMonitoringService {
  private static instance: SystemMonitoringService | null = null;
  private metrics: SystemMetrics[] = [];
  private alerts: Alert[] = [];
  private healthChecks: HealthCheck[] = [];
  private slos: SLO[] = [];
  private config: MonitoringConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertingEnabled: boolean = true;

  private constructor() {
    this.config = {
      enableRealTimeAlerts: true,
      alertChannels: ['email', 'webhook'],
      metricsRetention: 30, // 30日間
      alertThresholds: {
        cpu: 80,
        memory: 85,
        disk: 90,
        responseTime: 5000, // 5秒
        errorRate: 5, // 5%
      },
      healthCheckInterval: 30000, // 30秒
      sloEvaluationInterval: 60000, // 1分
    };

    this.initializeService();
  }

  public static getInstance(): SystemMonitoringService {
    if (!SystemMonitoringService.instance) {
      SystemMonitoringService.instance = new SystemMonitoringService();
    }
    return SystemMonitoringService.instance;
  }

  /**
   * 🚀 サービス初期化
   */
  private initializeService(): void {
    this.setupDefaultHealthChecks();
    this.setupDefaultSLOs();
    this.startRealTimeMonitoring();
    console.log('📊 システム監視サービス初期化完了');
  }

  /**
   * 📈 リアルタイム監視開始
   */
  private startRealTimeMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.evaluateAlerts();
      this.updateHealthChecks();
      this.evaluateSLOs();
      this.cleanupOldData();
    }, 10000); // 10秒ごと

    console.log('📈 リアルタイム監視を開始しました');
  }

  /**
   * 📊 メトリクス収集
   */
  private collectMetrics(): void {
    const currentMetrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      cpu: {
        usage: this.getCPUUsage(),
        temperature: this.getCPUTemperature(),
        processes: this.getProcessCount(),
      },
      memory: {
        used: this.getMemoryUsed(),
        total: this.getMemoryTotal(),
        percentage: 0,
        available: 0,
      },
      network: {
        bytesIn: this.getNetworkBytesIn(),
        bytesOut: this.getNetworkBytesOut(),
        packetsIn: this.getNetworkPacketsIn(),
        packetsOut: this.getNetworkPacketsOut(),
        latency: this.getNetworkLatency(),
      },
      storage: {
        used: this.getStorageUsed(),
        total: this.getStorageTotal(),
        percentage: 0,
        iops: this.getStorageIOPS(),
      },
      application: {
        responseTime: this.getApplicationResponseTime(),
        throughput: this.getApplicationThroughput(),
        errorRate: this.getApplicationErrorRate(),
        activeUsers: this.getActiveUsers(),
      },
    };

    // 計算フィールドの更新
    currentMetrics.memory.percentage =
      (currentMetrics.memory.used / currentMetrics.memory.total) * 100;
    currentMetrics.memory.available = currentMetrics.memory.total - currentMetrics.memory.used;
    currentMetrics.storage.percentage =
      (currentMetrics.storage.used / currentMetrics.storage.total) * 100;

    this.metrics.push(currentMetrics);

    // メトリクス保持期間の制限
    const retentionTime = new Date();
    retentionTime.setDate(retentionTime.getDate() - this.config.metricsRetention);
    this.metrics = this.metrics.filter((m) => new Date(m.timestamp) > retentionTime);

    console.log('📊 メトリクスを収集しました:', currentMetrics);
  }

  /**
   * 🖥️ CPU使用率取得
   */
  private getCPUUsage(): number {
    // 実際の実装では system APIs を使用
    const baseUsage = 15;
    const variation = Math.sin(Date.now() / 60000) * 20 + Math.random() * 10;
    return Math.max(0, Math.min(100, baseUsage + variation));
  }

  /**
   * 🌡️ CPU温度取得
   */
  private getCPUTemperature(): number {
    return 45 + Math.random() * 15; // 45-60°C
  }

  /**
   * 📱 プロセス数取得
   */
  private getProcessCount(): number {
    return 150 + Math.floor(Math.random() * 50);
  }

  /**
   * 💾 メモリ使用量取得
   */
  private getMemoryUsed(): number {
    if ('memory' in performance) {
      const { usedJSHeapSize } = (performance as any).memory;
      return usedJSHeapSize / (1024 * 1024); // MB
    }
    return 1024 + Math.random() * 512; // 1-1.5GB
  }

  /**
   * 💾 メモリ総量取得
   */
  private getMemoryTotal(): number {
    if ('memory' in performance) {
      const { jsHeapSizeLimit } = (performance as any).memory;
      return jsHeapSizeLimit / (1024 * 1024); // MB
    }
    return 4096; // 4GB
  }

  /**
   * 🌐 ネットワーク受信バイト数取得
   */
  private getNetworkBytesIn(): number {
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resourceEntries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
  }

  /**
   * 🌐 ネットワーク送信バイト数取得
   */
  private getNetworkBytesOut(): number {
    // 送信データの推定
    return this.getNetworkBytesIn() * 0.1; // 受信の10%と仮定
  }

  /**
   * 📦 ネットワークパケット数取得
   */
  private getNetworkPacketsIn(): number {
    return Math.floor(this.getNetworkBytesIn() / 1500); // MTUで割る
  }

  private getNetworkPacketsOut(): number {
    return Math.floor(this.getNetworkBytesOut() / 1500);
  }

  /**
   * ⚡ ネットワーク遅延取得
   */
  private getNetworkLatency(): number {
    // Navigation Timing API から推定
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      return navEntries[0].responseStart - navEntries[0].requestStart;
    }
    return 50 + Math.random() * 100; // 50-150ms
  }

  /**
   * 💽 ストレージ使用量取得
   */
  private getStorageUsed(): number {
    // 実際の実装では Storage Quota API を使用
    return 25 + Math.random() * 10; // 25-35GB
  }

  /**
   * 💽 ストレージ総量取得
   */
  private getStorageTotal(): number {
    return 100; // 100GB
  }

  /**
   * 📈 ストレージIOPS取得
   */
  private getStorageIOPS(): number {
    return 100 + Math.floor(Math.random() * 200); // 100-300 IOPS
  }

  /**
   * ⏱️ アプリケーション応答時間取得
   */
  private getApplicationResponseTime(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 1000 + Math.random() * 500;
  }

  /**
   * 🚀 アプリケーションスループット取得
   */
  private getApplicationThroughput(): number {
    return 10 + Math.random() * 20; // 10-30 requests/second
  }

  /**
   * 🚨 アプリケーションエラー率取得
   */
  private getApplicationErrorRate(): number {
    return Math.random() * 2; // 0-2%
  }

  /**
   * 👥 アクティブユーザー数取得
   */
  private getActiveUsers(): number {
    return Math.floor(1 + Math.random() * 9); // 1-10 users
  }

  /**
   * 🚨 アラート評価
   */
  private evaluateAlerts(): void {
    if (!this.alertingEnabled || this.metrics.length === 0) {
      return;
    }

    const latestMetrics = this.metrics[this.metrics.length - 1];
    const threshold = this.config.alertThresholds;

    // CPU使用率アラート
    if (latestMetrics.cpu.usage > threshold.cpu) {
      this.createAlert({
        severity: latestMetrics.cpu.usage > 95 ? 'critical' : 'warning',
        type: 'system',
        title: 'High CPU Usage',
        description: `CPU使用率が${latestMetrics.cpu.usage.toFixed(1)}%に達しています`,
        source: 'cpu-monitor',
        metrics: { cpuUsage: latestMetrics.cpu.usage },
      });
    }

    // メモリ使用率アラート
    if (latestMetrics.memory.percentage > threshold.memory) {
      this.createAlert({
        severity: latestMetrics.memory.percentage > 95 ? 'critical' : 'warning',
        type: 'system',
        title: 'High Memory Usage',
        description: `メモリ使用率が${latestMetrics.memory.percentage.toFixed(1)}%に達しています`,
        source: 'memory-monitor',
        metrics: { memoryUsage: latestMetrics.memory.percentage },
      });
    }

    // ディスク使用率アラート
    if (latestMetrics.storage.percentage > threshold.disk) {
      this.createAlert({
        severity: 'warning',
        type: 'system',
        title: 'High Disk Usage',
        description: `ディスク使用率が${latestMetrics.storage.percentage.toFixed(1)}%に達しています`,
        source: 'disk-monitor',
        metrics: { diskUsage: latestMetrics.storage.percentage },
      });
    }

    // 応答時間アラート
    if (latestMetrics.application.responseTime > threshold.responseTime) {
      this.createAlert({
        severity: 'warning',
        type: 'performance',
        title: 'High Response Time',
        description: `応答時間が${latestMetrics.application.responseTime.toFixed(0)}msと遅延しています`,
        source: 'performance-monitor',
        metrics: { responseTime: latestMetrics.application.responseTime },
      });
    }

    // エラー率アラート
    if (latestMetrics.application.errorRate > threshold.errorRate) {
      this.createAlert({
        severity: 'critical',
        type: 'application',
        title: 'High Error Rate',
        description: `エラー率が${latestMetrics.application.errorRate.toFixed(1)}%に達しています`,
        source: 'error-monitor',
        metrics: { errorRate: latestMetrics.application.errorRate },
      });
    }
  }

  /**
   * ⚠️ アラート作成
   */
  private createAlert(
    alertData: Omit<Alert, 'id' | 'timestamp' | 'acknowledged' | 'resolved' | 'actions'>
  ): void {
    // 重複アラートの確認
    const recentAlerts = this.alerts.filter(
      (alert) =>
        alert.source === alertData.source &&
        !alert.resolved &&
        Date.now() - new Date(alert.timestamp).getTime() < 300000 // 5分以内
    );

    if (recentAlerts.length > 0) {
      return; // 重複を避ける
    }

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
      actions: [],
      ...alertData,
    };

    this.alerts.push(alert);
    this.executeAlertActions(alert);

    // トースト通知
    toast({
      title: `🚨 ${alert.title}`,
      description: alert.description,
      variant: alert.severity === 'critical' ? 'destructive' : 'default',
    });

    console.log('🚨 アラートを作成しました:', alert);
  }

  /**
   * 🔔 アラートアクション実行
   */
  private executeAlertActions(alert: Alert): void {
    // デフォルトアクション（実際の実装では設定に基づく）
    const actions: AlertAction[] = [
      {
        id: `action_${Date.now()}_notification`,
        name: 'Send Notification',
        type: 'notification',
        config: { channels: this.config.alertChannels },
        executed: false,
      },
    ];

    if (alert.severity === 'critical') {
      actions.push({
        id: `action_${Date.now()}_escalation`,
        name: 'Escalate to On-Call',
        type: 'escalation',
        config: { escalationLevel: 1 },
        executed: false,
      });
    }

    alert.actions = actions;

    // アクション実行シミュレーション
    actions.forEach((action) => {
      setTimeout(() => {
        action.executed = true;
        action.result = 'success';
        console.log(`🔔 アラートアクション実行: ${action.name}`);
      }, 1000);
    });
  }

  /**
   * 🏥 デフォルトヘルスチェック設定
   */
  private setupDefaultHealthChecks(): void {
    this.healthChecks = [
      {
        id: 'api-health',
        name: 'API Health Check',
        endpoint: '/api/health',
        method: 'GET',
        expectedStatus: 200,
        timeout: 5000,
        interval: 30000,
        status: 'unknown',
        lastCheck: '',
        responseTime: 0,
        consecutiveFailures: 0,
        uptime: 99.9,
      },
      {
        id: 'database-health',
        name: 'Database Health Check',
        endpoint: '/api/db/ping',
        method: 'GET',
        expectedStatus: 200,
        timeout: 3000,
        interval: 60000,
        status: 'unknown',
        lastCheck: '',
        responseTime: 0,
        consecutiveFailures: 0,
        uptime: 99.8,
      },
      {
        id: 'frontend-health',
        name: 'Frontend Health Check',
        endpoint: '/',
        method: 'HEAD',
        expectedStatus: 200,
        timeout: 5000,
        interval: 30000,
        status: 'unknown',
        lastCheck: '',
        responseTime: 0,
        consecutiveFailures: 0,
        uptime: 99.95,
      },
    ];
  }

  /**
   * 🔍 ヘルスチェック更新
   */
  private updateHealthChecks(): void {
    this.healthChecks.forEach((healthCheck) => {
      this.performHealthCheck(healthCheck);
    });
  }

  /**
   * 🩺 個別ヘルスチェック実行
   */
  private performHealthCheck(healthCheck: HealthCheck): void {
    const startTime = Date.now();

    // 実際の実装では fetch API を使用
    const isHealthy = Math.random() > 0.05; // 95% の成功率をシミュレート
    const responseTime = 100 + Math.random() * 200; // 100-300ms

    const endTime = Date.now();

    healthCheck.lastCheck = new Date().toISOString();
    healthCheck.responseTime = endTime - startTime;

    if (isHealthy) {
      healthCheck.status = 'healthy';
      healthCheck.consecutiveFailures = 0;
    } else {
      healthCheck.status = 'unhealthy';
      healthCheck.consecutiveFailures++;

      // ヘルスチェック失敗アラート
      if (healthCheck.consecutiveFailures >= 3) {
        this.createAlert({
          severity: 'critical',
          type: 'system',
          title: 'Health Check Failed',
          description: `${healthCheck.name} が${healthCheck.consecutiveFailures}回連続で失敗しています`,
          source: `health-check-${healthCheck.id}`,
          metrics: { consecutiveFailures: healthCheck.consecutiveFailures },
        });
      }
    }

    // アップタイム計算（簡易版）
    const successRate = healthCheck.consecutiveFailures === 0 ? 1 : 0.95;
    healthCheck.uptime = healthCheck.uptime * 0.99 + successRate * 0.01;
  }

  /**
   * 🎯 デフォルトSLO設定
   */
  private setupDefaultSLOs(): void {
    this.slos = [
      {
        id: 'availability-slo',
        name: 'Service Availability',
        description: 'サービス可用性99.9%維持',
        type: 'availability',
        target: 99.9,
        threshold: 99.0,
        window: '30d',
        current: 99.95,
        status: 'meeting',
        errorBudget: {
          total: 43200, // seconds in 30 days * 0.1%
          consumed: 2160,
          remaining: 41040,
          percentage: 5.0,
        },
      },
      {
        id: 'latency-slo',
        name: 'Response Time',
        description: '95%のリクエストが2秒以内に応答',
        type: 'latency',
        target: 2000,
        threshold: 3000,
        window: '24h',
        current: 1800,
        status: 'meeting',
        errorBudget: {
          total: 8640, // 24h * 5% allowance
          consumed: 432,
          remaining: 8208,
          percentage: 5.0,
        },
      },
      {
        id: 'error-rate-slo',
        name: 'Error Rate',
        description: 'エラー率1%以下を維持',
        type: 'error_rate',
        target: 1.0,
        threshold: 2.0,
        window: '7d',
        current: 0.8,
        status: 'meeting',
        errorBudget: {
          total: 10080, // 7 days in minutes
          consumed: 504,
          remaining: 9576,
          percentage: 5.0,
        },
      },
    ];
  }

  /**
   * 📊 SLO評価
   */
  private evaluateSLOs(): void {
    if (this.metrics.length === 0) return;

    const latestMetrics = this.metrics[this.metrics.length - 1];

    this.slos.forEach((slo) => {
      let currentValue = 0;
      let status: SLO['status'] = 'meeting';

      switch (slo.type) {
        case 'availability': {
          const avgUptime =
            this.healthChecks.reduce((sum, hc) => sum + hc.uptime, 0) / this.healthChecks.length;
          currentValue = avgUptime;
          break;
        }
        case 'latency':
          currentValue = latestMetrics.application.responseTime;
          break;
        case 'error_rate':
          currentValue = latestMetrics.application.errorRate;
          break;
        case 'throughput':
          currentValue = latestMetrics.application.throughput;
          break;
      }

      slo.current = currentValue;

      // SLOステータス判定
      if (slo.type === 'latency' || slo.type === 'error_rate') {
        if (currentValue > slo.target) {
          status = currentValue > slo.threshold ? 'violated' : 'at_risk';
        }
      } else {
        if (currentValue < slo.target) {
          status = currentValue < slo.threshold ? 'violated' : 'at_risk';
        }
      }

      slo.status = status;

      // エラーバジェット更新
      if (status === 'violated') {
        slo.errorBudget.consumed += 1;
        slo.errorBudget.remaining = Math.max(0, slo.errorBudget.total - slo.errorBudget.consumed);
        slo.errorBudget.percentage = (slo.errorBudget.consumed / slo.errorBudget.total) * 100;
      }

      // SLO違反アラート
      if (status === 'violated') {
        this.createAlert({
          severity: 'critical',
          type: 'system',
          title: 'SLO Violation',
          description: `${slo.name} SLOが違反されています (現在値: ${currentValue.toFixed(2)}, 目標: ${slo.target})`,
          source: `slo-${slo.id}`,
          metrics: { currentValue, target: slo.target },
        });
      }
    });
  }

  /**
   * 🧹 古いデータのクリーンアップ
   */
  private cleanupOldData(): void {
    const now = new Date();

    // 解決済みアラートの削除（24時間後）
    this.alerts = this.alerts.filter((alert) => {
      if (alert.resolved) {
        const alertTime = new Date(alert.timestamp);
        return now.getTime() - alertTime.getTime() < 86400000; // 24時間
      }
      return true;
    });
  }

  // 外部API
  getMetrics(timeRange?: { start: string; end: string }): SystemMetrics[] {
    if (!timeRange) {
      return [...this.metrics];
    }

    const start = new Date(timeRange.start);
    const end = new Date(timeRange.end);

    return this.metrics.filter((m) => {
      const timestamp = new Date(m.timestamp);
      return timestamp >= start && timestamp <= end;
    });
  }

  getAlerts(filter?: { severity?: Alert['severity']; resolved?: boolean }): Alert[] {
    let filteredAlerts = [...this.alerts];

    if (filter?.severity) {
      filteredAlerts = filteredAlerts.filter((a) => a.severity === filter.severity);
    }

    if (filter?.resolved !== undefined) {
      filteredAlerts = filteredAlerts.filter((a) => a.resolved === filter.resolved);
    }

    return filteredAlerts.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getHealthChecks(): HealthCheck[] {
    return [...this.healthChecks];
  }

  getSLOs(): SLO[] {
    return [...this.slos];
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  /**
   * 📈 システムステータス取得
   */
  getSystemStatus(): {
    overall: 'healthy' | 'degraded' | 'critical';
    metrics: SystemMetrics | null;
    activeAlerts: number;
    healthyServices: number;
    totalServices: number;
    sloCompliance: number;
  } {
    const latestMetrics = this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
    const activeAlerts = this.alerts.filter((a) => !a.resolved).length;
    const criticalAlerts = this.alerts.filter(
      (a) => !a.resolved && a.severity === 'critical'
    ).length;
    const healthyServices = this.healthChecks.filter((hc) => hc.status === 'healthy').length;
    const totalServices = this.healthChecks.length;
    const meetingSLOs = this.slos.filter((slo) => slo.status === 'meeting').length;
    const sloCompliance = this.slos.length > 0 ? (meetingSLOs / this.slos.length) * 100 : 100;

    let overall: 'healthy' | 'degraded' | 'critical' = 'healthy';

    if (criticalAlerts > 0 || sloCompliance < 90) {
      overall = 'critical';
    } else if (activeAlerts > 0 || healthyServices < totalServices) {
      overall = 'degraded';
    }

    return {
      overall,
      metrics: latestMetrics,
      activeAlerts,
      healthyServices,
      totalServices,
      sloCompliance,
    };
  }

  /**
   * 🧹 クリーンアップ
   */
  cleanup(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }
}

export const systemMonitoringService = SystemMonitoringService.getInstance();
