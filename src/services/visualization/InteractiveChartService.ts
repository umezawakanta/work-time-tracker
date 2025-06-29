import { toast } from '@/components/ui/use-toast';
import { dataGenerator } from '../../utils/idGenerator';

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  data: ChartData;
  options: ChartOptions;
  interactive: boolean;
  realTime: boolean;
  exportable: boolean;
  customizable: boolean;
}

export interface ChartData {
  datasets: Dataset[];
  labels?: string[];
  categories?: string[];
  timeRange?: {
    start: string;
    end: string;
  };
  metadata?: {
    source: string;
    lastUpdated: string;
    totalPoints: number;
  };
}

export interface Dataset {
  id: string;
  label: string;
  data: DataPoint[];
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  type?: ChartType;
  visible: boolean;
  interactive: boolean;
  animations: AnimationConfig;
}

export interface DataPoint {
  x: number | string | Date;
  y: number;
  z?: number; // 3D charts
  label?: string;
  category?: string;
  metadata?: Record<string, any>;
  tooltip?: string;
  clickable?: boolean;
  highlight?: boolean;
}

export interface ChartOptions {
  width?: number;
  height?: number;
  responsive: boolean;
  maintainAspectRatio: boolean;
  animation: AnimationConfig;
  interaction: InteractionConfig;
  legend: LegendConfig;
  tooltip: TooltipConfig;
  zoom: ZoomConfig;
  brush: BrushConfig;
  theme: ChartTheme;
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
  delay: number;
  loop: boolean;
  direction: 'normal' | 'reverse' | 'alternate';
}

export interface InteractionConfig {
  hover: boolean;
  click: boolean;
  drag: boolean;
  select: boolean;
  multiSelect: boolean;
  crossfilter: boolean;
  linking: boolean; // Chart linking
}

export interface LegendConfig {
  display: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  interactive: boolean;
  customizable: boolean;
}

export interface TooltipConfig {
  enabled: boolean;
  mode: 'single' | 'multiple' | 'index';
  position: 'nearest' | 'average' | 'cursor';
  customContent: boolean;
  richContent: boolean; // HTML/React components
}

export interface ZoomConfig {
  enabled: boolean;
  mode: 'x' | 'y' | 'xy';
  limits: {
    x?: { min: number; max: number };
    y?: { min: number; max: number };
  };
  speed: number;
}

export interface BrushConfig {
  enabled: boolean;
  mode: 'selection' | 'zoom' | 'filter';
  axis: 'x' | 'y' | 'xy';
  linked: boolean;
}

export interface ChartTheme {
  name: string;
  colors: {
    primary: string[];
    secondary: string[];
    background: string;
    text: string;
    grid: string;
    axis: string;
  };
  fonts: {
    family: string;
    size: {
      title: number;
      label: number;
      tick: number;
      legend: number;
    };
  };
  spacing: {
    padding: number;
    margin: number;
    gap: number;
  };
}

export type ChartType =
  | 'line'
  | 'area'
  | 'bar'
  | 'column'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'bubble'
  | 'heatmap'
  | 'treemap'
  | 'sunburst'
  | 'sankey'
  | 'chord'
  | 'network'
  | 'timeline'
  | 'gantt'
  | 'waterfall'
  | 'funnel'
  | 'radar'
  | 'polar'
  | 'candlestick'
  | 'boxplot'
  | 'violin'
  | 'histogram'
  | 'density'
  | 'contour'
  | '3d-surface'
  | '3d-scatter'
  | '3d-bar'
  | 'parallel-coordinates'
  | 'force-directed';

export interface ChartExportOptions {
  format: 'png' | 'svg' | 'pdf' | 'json' | 'csv' | 'excel';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  dimensions: {
    width: number;
    height: number;
  };
  includeData: boolean;
  includeConfig: boolean;
}

export interface ChartPerformanceMetrics {
  renderTime: number;
  dataPoints: number;
  memoryUsage: number;
  fps: number;
  interactions: number;
  exports: number;
}

/**
 * 📊 データビジュアライゼーションマスター: インタラクティブチャートサービス
 * D3.js、Chart.js統合による高度データ可視化システム
 */
class InteractiveChartService {
  private static instance: InteractiveChartService | null = null;
  private charts: Map<string, ChartConfig> = new Map();
  private chartInstances: Map<string, any> = new Map();
  private performanceMetrics: Map<string, ChartPerformanceMetrics> = new Map();
  private themes: Map<string, ChartTheme> = new Map();
  private realTimeInterval: NodeJS.Timeout | null = null;
  private linkedCharts: Set<string> = new Set();

  private constructor() {
    this.initializeThemes();
    this.initializeDefaultCharts();
    this.startPerformanceMonitoring();
  }

  public static getInstance(): InteractiveChartService {
    if (!InteractiveChartService.instance) {
      InteractiveChartService.instance = new InteractiveChartService();
    }
    return InteractiveChartService.instance;
  }

  /**
   * 🎨 テーマ初期化
   */
  private initializeThemes(): void {
    const themes: ChartTheme[] = [
      {
        name: 'modern',
        colors: {
          primary: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
            '#06B6D4',
            '#84CC16',
            '#F97316',
          ],
          secondary: [
            '#93C5FD',
            '#6EE7B7',
            '#FCD34D',
            '#FCA5A5',
            '#C4B5FD',
            '#67E8F9',
            '#BEF264',
            '#FDBA74',
          ],
          background: '#FFFFFF',
          text: '#1F2937',
          grid: '#E5E7EB',
          axis: '#6B7280',
        },
        fonts: {
          family: 'Inter, sans-serif',
          size: {
            title: 18,
            label: 14,
            tick: 12,
            legend: 13,
          },
        },
        spacing: {
          padding: 20,
          margin: 10,
          gap: 8,
        },
      },
      {
        name: 'dark',
        colors: {
          primary: [
            '#60A5FA',
            '#34D399',
            '#FBBF24',
            '#F87171',
            '#A78BFA',
            '#22D3EE',
            '#A3E635',
            '#FB923C',
          ],
          secondary: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
            '#06B6D4',
            '#84CC16',
            '#F97316',
          ],
          background: '#111827',
          text: '#F9FAFB',
          grid: '#374151',
          axis: '#9CA3AF',
        },
        fonts: {
          family: 'Inter, sans-serif',
          size: {
            title: 18,
            label: 14,
            tick: 12,
            legend: 13,
          },
        },
        spacing: {
          padding: 20,
          margin: 10,
          gap: 8,
        },
      },
      {
        name: 'colorful',
        colors: {
          primary: [
            '#FF6B6B',
            '#4ECDC4',
            '#45B7D1',
            '#96CEB4',
            '#FECA57',
            '#FF9FF3',
            '#54A0FF',
            '#5F27CD',
          ],
          secondary: [
            '#FF8E8E',
            '#6BCFD6',
            '#67C7E8',
            '#A8D8C4',
            '#FED665',
            '#FFB3F5',
            '#6BB3FF',
            '#7B4EE8',
          ],
          background: '#FDFDFD',
          text: '#2C3E50',
          grid: '#ECF0F1',
          axis: '#7F8C8D',
        },
        fonts: {
          family: 'Poppins, sans-serif',
          size: {
            title: 20,
            label: 15,
            tick: 12,
            legend: 14,
          },
        },
        spacing: {
          padding: 24,
          margin: 12,
          gap: 10,
        },
      },
    ];

    themes.forEach((theme) => {
      this.themes.set(theme.name, theme);
    });

    console.log('📊 チャートテーマを初期化しました', this.themes.size, 'テーマ');
  }

  /**
   * 📈 デフォルトチャート初期化
   */
  private initializeDefaultCharts(): void {
    const defaultCharts: ChartConfig[] = [
      {
        id: 'productivity-trend',
        type: 'line',
        title: '生産性トレンド',
        description: '日別生産性の推移',
        data: {
          datasets: [
            {
              id: 'productivity',
              label: '生産性スコア',
              data: this.generateRandomChartData(),
              color: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderColor: '#3B82F6',
              visible: true,
              interactive: true,
              animations: {
                enabled: true,
                duration: 1000,
                easing: 'ease-out',
                delay: 0,
                loop: false,
                direction: 'normal',
              },
            },
          ],
          labels: this.generateDateLabels(30),
          metadata: {
            source: 'WorkTime Tracker',
            lastUpdated: new Date().toISOString(),
            totalPoints: 30,
          },
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            enabled: true,
            duration: 1000,
            easing: 'ease-out',
            delay: 0,
            loop: false,
            direction: 'normal',
          },
          interaction: {
            hover: true,
            click: true,
            drag: false,
            select: true,
            multiSelect: false,
            crossfilter: false,
            linking: true,
          },
          legend: {
            display: true,
            position: 'top',
            interactive: true,
            customizable: true,
          },
          tooltip: {
            enabled: true,
            mode: 'single',
            position: 'nearest',
            customContent: true,
            richContent: true,
          },
          zoom: {
            enabled: true,
            mode: 'x',
            limits: {},
            speed: 1.1,
          },
          brush: {
            enabled: true,
            mode: 'selection',
            axis: 'x',
            linked: true,
          },
          theme: this.themes.get('modern')!,
        },
        interactive: true,
        realTime: true,
        exportable: true,
        customizable: true,
      },
      {
        id: 'task-distribution',
        type: 'pie',
        title: 'タスク分布',
        description: 'カテゴリ別タスク配分',
        data: {
          datasets: [
            {
              id: 'tasks',
              label: 'タスク数',
              data: this.generateRandomChartData(),
              color: '#10B981',
              visible: true,
              interactive: true,
              animations: {
                enabled: true,
                duration: 1500,
                easing: 'bounce',
                delay: 100,
                loop: false,
                direction: 'normal',
              },
            },
          ],
          categories: ['開発', 'テスト', 'デザイン', 'ドキュメント', '会議', 'その他'],
          metadata: {
            source: 'Task Manager',
            lastUpdated: new Date().toISOString(),
            totalPoints: 6,
          },
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            enabled: true,
            duration: 1500,
            easing: 'bounce',
            delay: 100,
            loop: false,
            direction: 'normal',
          },
          interaction: {
            hover: true,
            click: true,
            drag: false,
            select: true,
            multiSelect: true,
            crossfilter: true,
            linking: false,
          },
          legend: {
            display: true,
            position: 'right',
            interactive: true,
            customizable: true,
          },
          tooltip: {
            enabled: true,
            mode: 'single',
            position: 'cursor',
            customContent: true,
            richContent: true,
          },
          zoom: {
            enabled: false,
            mode: 'xy',
            limits: {},
            speed: 1.1,
          },
          brush: {
            enabled: false,
            mode: 'selection',
            axis: 'xy',
            linked: false,
          },
          theme: this.themes.get('colorful')!,
        },
        interactive: true,
        realTime: false,
        exportable: true,
        customizable: true,
      },
      {
        id: 'performance-heatmap',
        type: 'heatmap',
        title: 'パフォーマンスヒートマップ',
        description: '時間帯別パフォーマンス',
        data: {
          datasets: [
            {
              id: 'performance',
              label: 'パフォーマンス',
              data: this.generateRandomChartData(),
              color: '#F59E0B',
              visible: true,
              interactive: true,
              animations: {
                enabled: true,
                duration: 2000,
                easing: 'ease-in-out',
                delay: 0,
                loop: false,
                direction: 'normal',
              },
            },
          ],
          metadata: {
            source: 'Performance Monitor',
            lastUpdated: new Date().toISOString(),
            totalPoints: 168,
          },
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            enabled: true,
            duration: 2000,
            easing: 'ease-in-out',
            delay: 0,
            loop: false,
            direction: 'normal',
          },
          interaction: {
            hover: true,
            click: true,
            drag: false,
            select: true,
            multiSelect: false,
            crossfilter: true,
            linking: true,
          },
          legend: {
            display: true,
            position: 'bottom',
            interactive: false,
            customizable: true,
          },
          tooltip: {
            enabled: true,
            mode: 'single',
            position: 'cursor',
            customContent: true,
            richContent: true,
          },
          zoom: {
            enabled: true,
            mode: 'xy',
            limits: {},
            speed: 1.2,
          },
          brush: {
            enabled: true,
            mode: 'zoom',
            axis: 'xy',
            linked: false,
          },
          theme: this.themes.get('dark')!,
        },
        interactive: true,
        realTime: true,
        exportable: true,
        customizable: true,
      },
    ];

    defaultCharts.forEach((chart) => {
      this.charts.set(chart.id, chart);
      this.initializePerformanceMetrics(chart.id);
    });

    console.log('📊 デフォルトチャートを初期化しました', this.charts.size, 'チャート');
  }

  /**
   * 📊 サンプルデータ生成
   */
  private generateRandomChartData(): any[] {
    const data: any[] = [];

    for (let i = 0; i < 12; i++) {
      data.push({
        x: i,
        y: Math.floor(dataGenerator.randomFloat(20, 120)),
        label: `Month ${i + 1}`,
        tooltip: `生産性: ${Math.floor(dataGenerator.randomFloat(20, 120))}%`,
      });
    }

    const categories = ['開発', 'デザイン', 'ミーティング', 'テスト', 'ドキュメント'];

    for (let i = 0; i < categories.length; i++) {
      data.push({
        x: i,
        y: Math.floor(dataGenerator.randomFloat(10, 60)),
        category: categories[i],
        tooltip: `${categories[i] || `Category ${i + 1}`}: ${Math.floor(dataGenerator.randomFloat(10, 60))}時間`,
      });
    }

    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        data.push({
          x: hour,
          y: day,
          z: Math.floor(dataGenerator.randomFloat(0, 100)),
          day,
          tooltip: `${['日', '月', '火', '水', '木', '金', '土'][day]} ${hour}:00 - パフォーマンス: ${Math.floor(dataGenerator.randomFloat(0, 100))}%`,
        });
      }
    }

    for (let i = 0; i < 50; i++) {
      data.push({
        x: i,
        y: Math.floor(dataGenerator.randomFloat(20, 120)),
        timestamp: Date.now() + i * 1000,
        tooltip: `リアルタイム値: ${Math.floor(dataGenerator.randomFloat(20, 120))}`,
      });
    }

    return data;
  }

  /**
   * 📅 日付ラベル生成
   */
  private generateDateLabels(days: number): string[] {
    const labels: string[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }));
    }

    return labels;
  }

  /**
   * 📈 パフォーマンスメトリクス初期化
   */
  private initializePerformanceMetrics(chartId: string): void {
    this.performanceMetrics.set(chartId, {
      renderTime: 0,
      dataPoints: 0,
      memoryUsage: 0,
      fps: 60,
      interactions: 0,
      exports: 0,
    });
  }

  /**
   * 🔄 パフォーマンス監視開始
   */
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 1000);

    console.log('📊 チャートパフォーマンス監視を開始しました');
  }

  /**
   * 📊 パフォーマンスメトリクス更新
   */
  private updatePerformanceMetrics(): void {
    this.performanceMetrics.forEach((metrics, chartId) => {
      // メモリ使用量の推定
      const chart = this.charts.get(chartId);
      if (chart) {
        const dataPoints = chart.data.datasets.reduce(
          (sum, dataset) => sum + dataset.data.length,
          0
        );
        metrics.dataPoints = dataPoints;
        metrics.memoryUsage = dataPoints * 50; // 推定値（バイト）
      }

      // FPS計算（リアルタイムチャートのみ）
      if (chart?.realTime) {
        metrics.fps = dataGenerator.randomInt(55, 65); // 55-65 FPS
      }
    });
  }

  /**
   * 📊 チャート作成
   */
  createChart(config: Partial<ChartConfig>): string {
    const chartId = config.id || `chart_${Date.now()}`;

    const fullConfig: ChartConfig = {
      id: chartId,
      type: config.type || 'line',
      title: config.title || 'Untitled Chart',
      description: config.description,
      data: config.data || { datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          enabled: true,
          duration: 1000,
          easing: 'ease-out',
          delay: 0,
          loop: false,
          direction: 'normal',
        },
        interaction: {
          hover: true,
          click: true,
          drag: false,
          select: true,
          multiSelect: false,
          crossfilter: false,
          linking: false,
        },
        legend: {
          display: true,
          position: 'top',
          interactive: true,
          customizable: true,
        },
        tooltip: {
          enabled: true,
          mode: 'single',
          position: 'nearest',
          customContent: false,
          richContent: false,
        },
        zoom: {
          enabled: false,
          mode: 'x',
          limits: {},
          speed: 1.1,
        },
        brush: {
          enabled: false,
          mode: 'selection',
          axis: 'x',
          linked: false,
        },
        theme: config.options?.theme || this.themes.get('modern')!,
        ...config.options,
      },
      interactive: config.interactive ?? true,
      realTime: config.realTime ?? false,
      exportable: config.exportable ?? true,
      customizable: config.customizable ?? true,
    };

    this.charts.set(chartId, fullConfig);
    this.initializePerformanceMetrics(chartId);

    console.log('📊 新しいチャートを作成しました:', chartId);

    toast({
      title: 'チャート作成完了',
      description: `${fullConfig.title}を作成しました`,
      variant: 'default',
    });

    return chartId;
  }

  /**
   * 🔄 チャートデータ更新
   */
  updateChartData(chartId: string, newData: Partial<ChartData>): void {
    const chart = this.charts.get(chartId);
    if (!chart) {
      throw new Error(`Chart not found: ${chartId}`);
    }

    const startTime = performance.now();

    chart.data = {
      ...chart.data,
      ...newData,
      metadata: {
        source: chart.data.metadata?.source || 'Unknown',
        totalPoints: chart.data.metadata?.totalPoints || 0,
        ...newData.metadata,
        lastUpdated: new Date().toISOString(),
      },
    };

    const endTime = performance.now();
    const metrics = this.performanceMetrics.get(chartId);
    if (metrics) {
      metrics.renderTime = endTime - startTime;
    }

    console.log(
      `📊 チャートデータを更新しました: ${chartId} (${(endTime - startTime).toFixed(2)}ms)`
    );
  }

  /**
   * 🎨 チャートテーマ変更
   */
  changeChartTheme(chartId: string, themeName: string): void {
    const chart = this.charts.get(chartId);
    const theme = this.themes.get(themeName);

    if (!chart || !theme) {
      throw new Error('Chart or theme not found');
    }

    chart.options.theme = theme;

    toast({
      title: 'テーマ変更完了',
      description: `${chart.title}のテーマを${themeName}に変更しました`,
      variant: 'default',
    });
  }

  /**
   * 🔗 チャートリンク設定
   */
  linkCharts(chartIds: string[]): void {
    chartIds.forEach((id) => {
      this.linkedCharts.add(id);
      const chart = this.charts.get(id);
      if (chart) {
        chart.options.interaction.linking = true;
        chart.options.brush.linked = true;
      }
    });

    console.log('🔗 チャートをリンクしました:', chartIds);
  }

  /**
   * 📤 チャートエクスポート
   */
  async exportChart(chartId: string, options: ChartExportOptions): Promise<Blob | string> {
    const chart = this.charts.get(chartId);
    if (!chart) {
      throw new Error(`Chart not found: ${chartId}`);
    }

    const metrics = this.performanceMetrics.get(chartId);
    if (metrics) {
      metrics.exports++;
    }

    // 実際の実装では、chart.jsやD3.jsのエクスポート機能を使用
    const exportData = {
      config: chart,
      data: chart.data,
      options: options,
      timestamp: new Date().toISOString(),
    };

    switch (options.format) {
      case 'json':
        return JSON.stringify(exportData, null, 2);
      case 'csv':
        return this.exportToCSV(chart.data);
      default:
        // PNG/SVG/PDFの場合はBlobを返す
        return new Blob([JSON.stringify(exportData)], { type: 'application/json' });
    }
  }

  /**
   * 📄 CSV形式エクスポート
   */
  private exportToCSV(data: ChartData): string {
    const headers = ['Label', 'Value', 'Category'];
    const rows = [headers.join(',')];

    data.datasets.forEach((dataset) => {
      dataset.data.forEach((point) => {
        const row = [point.label || point.x, point.y, point.category || ''];
        rows.push(row.join(','));
      });
    });

    return rows.join('\n');
  }

  /**
   * 🔄 リアルタイムデータ更新開始
   */
  startRealTimeUpdates(chartId: string, interval: number = 5000): void {
    const chart = this.charts.get(chartId);
    if (!chart || !chart.realTime) {
      return;
    }

    this.realTimeInterval = setInterval(() => {
      // リアルタイムデータ生成（実際の実装ではAPIから取得）
      const newDataPoint: DataPoint = {
        x: Date.now(),
        y: Math.floor(dataGenerator.randomFloat(20, 120)),
        label: new Date().toLocaleTimeString(),
        tooltip: `リアルタイム値: ${Math.floor(dataGenerator.randomFloat(20, 120))}`,
        clickable: true,
      };

      // データポイントを追加（最新100ポイントまで保持）
      chart.data.datasets.forEach((dataset) => {
        dataset.data.push(newDataPoint);
        if (dataset.data.length > 100) {
          dataset.data.shift();
        }
      });

      console.log(`📊 リアルタイムデータを更新: ${chartId}`);
    }, interval);
  }

  /**
   * ⏹️ リアルタイムデータ更新停止
   */
  stopRealTimeUpdates(): void {
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
      this.realTimeInterval = null;
      console.log('📊 リアルタイムデータ更新を停止しました');
    }
  }

  // ゲッター
  getChart(chartId: string): ChartConfig | undefined {
    return this.charts.get(chartId);
  }

  getAllCharts(): ChartConfig[] {
    return Array.from(this.charts.values());
  }

  getChartsByType(type: ChartType): ChartConfig[] {
    return Array.from(this.charts.values()).filter((chart) => chart.type === type);
  }

  getPerformanceMetrics(chartId: string): ChartPerformanceMetrics | undefined {
    return this.performanceMetrics.get(chartId);
  }

  getAllThemes(): ChartTheme[] {
    return Array.from(this.themes.values());
  }

  getLinkedCharts(): string[] {
    return Array.from(this.linkedCharts);
  }

  // サービス停止
  shutdown(): void {
    this.stopRealTimeUpdates();
    this.charts.clear();
    this.chartInstances.clear();
    this.performanceMetrics.clear();
    this.linkedCharts.clear();
    console.log('🛑 インタラクティブチャートサービス停止');
  }
}

export const interactiveChartService = InteractiveChartService.getInstance();
