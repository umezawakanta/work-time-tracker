/**
 * 🆔 ID生成とデータ生成ユーティリティ
 * Math.random()の代替として、より適切で予測可能なID・データ生成を提供
 */

/**
 * 安全で一意なIDを生成（crypto API使用）
 */
export function generateId(prefix?: string, length: number = 8): string {
  const charset = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let id = '';

  // ブラウザ環境での安全なランダム生成
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      id += charset.charAt(array[i] % charset.length);
    }
  } else {
    // フォールバック：決定論的生成（テスト環境など）
    const generator = new DataGenerator(Date.now() + length);
    for (let i = 0; i < length; i++) {
      id += charset.charAt(generator.randomInt(0, charset.length - 1));
    }
  }

  return prefix ? `${prefix}_${id}` : id;
}

/**
 * タイムスタンプベースの決定論的ID生成
 */
export function generateTimeBasedId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const random = generateId(undefined, 4); // 衝突回避のための短いランダム部分
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * シーケンシャルIDジェネレーター
 */
class SequentialIdGenerator {
  private counters = new Map<string, number>();

  generate(prefix: string): string {
    const current = this.counters.get(prefix) || 0;
    const next = current + 1;
    this.counters.set(prefix, next);
    return `${prefix}_${next.toString().padStart(6, '0')}`;
  }

  reset(prefix?: string): void {
    if (prefix) {
      this.counters.delete(prefix);
    } else {
      this.counters.clear();
    }
  }
}

export const sequentialIdGenerator = new SequentialIdGenerator();

/**
 * 設定可能なデータジェネレーター
 */
export class DataGenerator {
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed || Date.now();
  }

  /**
   * シード値を使った決定論的な「ランダム」値生成
   */
  private seededRandom(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  /**
   * 指定範囲の整数を生成
   */
  randomInt(min: number, max: number): number {
    return Math.floor(this.seededRandom() * (max - min + 1)) + min;
  }

  /**
   * 指定範囲の浮動小数点数を生成
   */
  randomFloat(min: number, max: number): number {
    return this.seededRandom() * (max - min) + min;
  }

  /**
   * 配列からランダムに要素を選択
   */
  randomChoice<T>(array: T[]): T {
    const index = this.randomInt(0, array.length - 1);
    return array[index];
  }

  /**
   * パフォーマンスメトリクスの生成
   */
  generatePerformanceMetrics(): {
    cpu: number;
    memory: number;
    loadTime: number;
    fps: number;
  } {
    return {
      cpu: this.randomFloat(20, 80), // 20-80% CPU使用率
      memory: this.randomFloat(30, 90), // 30-90% メモリ使用率
      loadTime: this.randomFloat(500, 3000), // 0.5-3秒
      fps: this.randomInt(55, 65), // 55-65 FPS
    };
  }

  /**
   * ユーザーエンゲージメントメトリクスの生成
   */
  generateEngagementMetrics(): {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    engagement: number;
  } {
    const views = this.randomInt(100, 10000);
    const engagementRate = this.randomFloat(0.02, 0.08); // 2-8% エンゲージメント率

    return {
      views,
      likes: Math.floor(views * engagementRate * 0.6),
      shares: Math.floor(views * engagementRate * 0.1),
      comments: Math.floor(views * engagementRate * 0.3),
      engagement: engagementRate * 100,
    };
  }

  /**
   * システムヘルスメトリクスの生成
   */
  generateSystemHealth(): {
    uptime: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
  } {
    return {
      uptime: this.randomFloat(99.5, 99.99), // 99.5-99.99% uptime
      responseTime: this.randomFloat(50, 200), // 50-200ms response time
      errorRate: this.randomFloat(0, 0.5), // 0-0.5% error rate
      throughput: this.randomFloat(500, 2000), // 500-2000 requests/minute
    };
  }

  /**
   * 財務メトリクスの生成（資産・負債）
   */
  generateFinancialData(baseAmount: number): {
    assets: number;
    debts: number;
    growth: number;
    volatility: number;
  } {
    const growthRate = this.randomFloat(-0.05, 0.08); // -5% to +8% growth
    const volatility = this.randomFloat(0.01, 0.03); // 1-3% volatility

    return {
      assets: baseAmount * (1 + growthRate),
      debts: baseAmount * 0.3 * (1 + growthRate * 0.5),
      growth: growthRate * 100,
      volatility: volatility * 100,
    };
  }

  /**
   * 作業生産性データの生成
   */
  generateProductivityData(): {
    tasksCompleted: number;
    hoursWorked: number;
    focusScore: number;
    efficiency: number;
  } {
    const hoursWorked = this.randomFloat(6, 10);
    const efficiency = this.randomFloat(0.6, 0.9);

    return {
      tasksCompleted: Math.floor(hoursWorked * efficiency * 1.5),
      hoursWorked: Math.round(hoursWorked * 10) / 10,
      focusScore: this.randomFloat(70, 95),
      efficiency: Math.round(efficiency * 100),
    };
  }
}

// デフォルトのデータジェネレーター（決定論的）
export const dataGenerator = new DataGenerator(12345);

// 真にランダムなデータが必要な場合のジェネレーター
export const randomDataGenerator = new DataGenerator();

/**
 * 共有レポート用のセキュアなID生成
 */
export function generateShareId(): string {
  // より安全な英数字のみの8文字ID（crypto APIまたは決定論的生成）
  const charset = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';

  // ブラウザ環境での安全なランダム生成
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(8);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < 8; i++) {
      result += charset.charAt(array[i] % charset.length);
    }
  } else {
    // フォールバック：時間ベースの決定論的生成
    const generator = new DataGenerator(Date.now() + 8000);
    for (let i = 0; i < 8; i++) {
      result += charset.charAt(generator.randomInt(0, charset.length - 1));
    }
  }

  return result;
}

/**
 * UUID v4の生成（標準準拠、crypto API使用）
 */
export function generateUUID(): string {
  // ブラウザ環境での安全なUUID生成
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);

    // UUID v4のフォーマットに変換
    array[6] = (array[6] & 0x0f) | 0x40; // Version 4
    array[8] = (array[8] & 0x3f) | 0x80; // Variant bits

    const hex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  } else {
    // フォールバック：決定論的UUID生成
    const generator = new DataGenerator(Date.now() + 16000);
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = generator.randomInt(0, 15);
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

/**
 * より複雑な操作IDの生成（操作追跡用）
 */
export function generateOperationId(operationType: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = generateId(undefined, 6);
  return `${operationType}_${timestamp}_${randomPart}`;
}
