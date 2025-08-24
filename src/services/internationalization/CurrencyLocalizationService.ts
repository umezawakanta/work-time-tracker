import { toast } from '@/components/ui/use-toast';

export interface Currency {
  code: string; // ISO 4217 currency code
  name: string;
  symbol: string;
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  symbolPosition: 'before' | 'after';
  spaceAfterSymbol: boolean;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
  provider: string;
}

export interface CurrencyConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRate: number;
  formattedOriginal: string;
  formattedConverted: string;
  timestamp: string;
}

export interface CurrencyPreferences {
  primaryCurrency: string;
  secondaryCurrency?: string;
  autoConvert: boolean;
  showMultipleCurrencies: boolean;
  roundingMode: 'round' | 'floor' | 'ceil';
  displayPrecision: number;
}

/**
 * 🌍 国際化マスター: 通貨ローカライゼーション
 * 多通貨対応、リアルタイム為替レート、地域別フォーマット
 */
class CurrencyLocalizationService {
  private static instance: CurrencyLocalizationService | null = null;
  private currencies: Map<string, Currency> = new Map();
  private exchangeRates: Map<string, ExchangeRate> = new Map();
  private userPreferences: CurrencyPreferences;
  private cacheTimeout = 300000; // 5分キャッシュ
  private lastRateUpdate: string = '';

  private constructor() {
    this.initializeCurrencies();
    this.initializeExchangeRates();
    this.userPreferences = this.loadUserPreferences();
    this.startRateUpdateScheduler();
  }

  public static getInstance(): CurrencyLocalizationService {
    if (!CurrencyLocalizationService.instance) {
      CurrencyLocalizationService.instance = new CurrencyLocalizationService();
    }
    return CurrencyLocalizationService.instance;
  }

  /**
   * 🌍 通貨定義初期化
   */
  private initializeCurrencies(): void {
    const currencyDefinitions: Currency[] = [
      // 🇯🇵 日本
      {
        code: 'JPY',
        name: '日本円',
        symbol: '¥',
        decimalPlaces: 0,
        thousandsSeparator: ',',
        decimalSeparator: '.',
        symbolPosition: 'before',
        spaceAfterSymbol: false,
      },
      // 🇺🇸 アメリカ
      {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        decimalPlaces: 2,
        thousandsSeparator: ',',
        decimalSeparator: '.',
        symbolPosition: 'before',
        spaceAfterSymbol: false,
      },
      // 🇪🇺 ユーロ圏
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        decimalPlaces: 2,
        thousandsSeparator: '.',
        decimalSeparator: ',',
        symbolPosition: 'after',
        spaceAfterSymbol: true,
      },
      // 🇬🇧 イギリス
      {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        decimalPlaces: 2,
        thousandsSeparator: ',',
        decimalSeparator: '.',
        symbolPosition: 'before',
        spaceAfterSymbol: false,
      },
      // 🇨🇳 中国
      {
        code: 'CNY',
        name: '人民元',
        symbol: '¥',
        decimalPlaces: 2,
        thousandsSeparator: ',',
        decimalSeparator: '.',
        symbolPosition: 'before',
        spaceAfterSymbol: false,
      },
      // 🇰🇷 韓国
      {
        code: 'KRW',
        name: '韓国ウォン',
        symbol: '₩',
        decimalPlaces: 0,
        thousandsSeparator: ',',
        decimalSeparator: '.',
        symbolPosition: 'before',
        spaceAfterSymbol: false,
      },
      // 🇦🇺 オーストラリア
      {
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: 'A$',
        decimalPlaces: 2,
        thousandsSeparator: ',',
        decimalSeparator: '.',
        symbolPosition: 'before',
        spaceAfterSymbol: false,
      },
      // 🇨🇦 カナダ
      {
        code: 'CAD',
        name: 'Canadian Dollar',
        symbol: 'C$',
        decimalPlaces: 2,
        thousandsSeparator: ',',
        decimalSeparator: '.',
        symbolPosition: 'before',
        spaceAfterSymbol: false,
      },
      // 🇨🇭 スイス
      {
        code: 'CHF',
        name: 'Swiss Franc',
        symbol: 'CHF',
        decimalPlaces: 2,
        thousandsSeparator: "'",
        decimalSeparator: '.',
        symbolPosition: 'after',
        spaceAfterSymbol: true,
      },
      // 🇮🇳 インド
      {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        decimalPlaces: 2,
        thousandsSeparator: ',',
        decimalSeparator: '.',
        symbolPosition: 'before',
        spaceAfterSymbol: false,
      },
    ];

    currencyDefinitions.forEach((currency) => {
      this.currencies.set(currency.code, currency);
    });

    console.log('🌍 通貨定義を初期化しました', this.currencies.size, '通貨');
  }

  /**
   * 💱 為替レート初期化
   */
  private initializeExchangeRates(): void {
    // シミュレートされた為替レート（実際のAPIと接続する）
    const mockRates: ExchangeRate[] = [
      {
        from: 'USD',
        to: 'JPY',
        rate: 150.25,
        lastUpdated: new Date().toISOString(),
        provider: 'XE',
      },
      {
        from: 'EUR',
        to: 'JPY',
        rate: 163.45,
        lastUpdated: new Date().toISOString(),
        provider: 'XE',
      },
      {
        from: 'GBP',
        to: 'JPY',
        rate: 188.9,
        lastUpdated: new Date().toISOString(),
        provider: 'XE',
      },
      {
        from: 'CNY',
        to: 'JPY',
        rate: 20.75,
        lastUpdated: new Date().toISOString(),
        provider: 'XE',
      },
      {
        from: 'KRW',
        to: 'JPY',
        rate: 0.113,
        lastUpdated: new Date().toISOString(),
        provider: 'XE',
      },
      { from: 'AUD', to: 'JPY', rate: 98.5, lastUpdated: new Date().toISOString(), provider: 'XE' },
      {
        from: 'CAD',
        to: 'JPY',
        rate: 110.25,
        lastUpdated: new Date().toISOString(),
        provider: 'XE',
      },
      {
        from: 'CHF',
        to: 'JPY',
        rate: 168.75,
        lastUpdated: new Date().toISOString(),
        provider: 'XE',
      },
      { from: 'INR', to: 'JPY', rate: 1.8, lastUpdated: new Date().toISOString(), provider: 'XE' },

      // 逆方向の為替レート
      {
        from: 'JPY',
        to: 'USD',
        rate: 0.00665,
        lastUpdated: new Date().toISOString(),
        provider: 'XE',
      },
      {
        from: 'JPY',
        to: 'EUR',
        rate: 0.00612,
        lastUpdated: new Date().toISOString(),
        provider: 'XE',
      },
      {
        from: 'JPY',
        to: 'GBP',
        rate: 0.00529,
        lastUpdated: new Date().toISOString(),
        provider: 'XE',
      },

      // USD基準のクロスレート
      {
        from: 'EUR',
        to: 'USD',
        rate: 1.0875,
        lastUpdated: new Date().toISOString(),
        provider: 'XE',
      },
      {
        from: 'USD',
        to: 'EUR',
        rate: 0.9195,
        lastUpdated: new Date().toISOString(),
        provider: 'XE',
      },
      {
        from: 'GBP',
        to: 'USD',
        rate: 1.257,
        lastUpdated: new Date().toISOString(),
        provider: 'XE',
      },
      {
        from: 'USD',
        to: 'GBP',
        rate: 0.7955,
        lastUpdated: new Date().toISOString(),
        provider: 'XE',
      },
    ];

    mockRates.forEach((rate) => {
      const key = `${rate.from}-${rate.to}`;
      this.exchangeRates.set(key, rate);
    });

    this.lastRateUpdate = new Date().toISOString();
    console.log('💱 為替レートを初期化しました', this.exchangeRates.size, 'レート');
  }

  /**
   * ⚙️ ユーザー設定読み込み
   */
  private loadUserPreferences(): CurrencyPreferences {
    const saved = localStorage.getItem('currencyPreferences');
    const defaultPreferences: CurrencyPreferences = {
      primaryCurrency: 'JPY',
      secondaryCurrency: 'USD',
      autoConvert: true,
      showMultipleCurrencies: true,
      roundingMode: 'round',
      displayPrecision: 2,
    };

    return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
  }

  /**
   * 💾 ユーザー設定保存
   */
  saveUserPreferences(preferences: Partial<CurrencyPreferences>): void {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    localStorage.setItem('currencyPreferences', JSON.stringify(this.userPreferences));

    toast({
      title: '通貨設定を保存',
      description: '設定が正常に保存されました',
      variant: 'default',
    });
  }

  /**
   * 🔄 為替レート更新スケジューラー
   */
  private startRateUpdateScheduler(): void {
    setInterval(() => {
      this.updateExchangeRates();
    }, this.cacheTimeout);
  }

  /**
   * 📡 為替レート更新（実際のAPIから取得をシミュレート）
   */
  private async updateExchangeRates(): Promise<void> {
    try {
      // 実際の実装では外部APIを呼び出す
      console.log('💱 為替レートを更新中...');

      // 小さな変動をシミュレート
      this.exchangeRates.forEach((rate, key) => {
        const variation = (Math.random() - 0.5) * 0.02; // ±1%の変動
        const newRate = rate.rate * (1 + variation);

        this.exchangeRates.set(key, {
          ...rate,
          rate: Number(newRate.toFixed(6)),
          lastUpdated: new Date().toISOString(),
        });
      });

      this.lastRateUpdate = new Date().toISOString();
      console.log('✅ 為替レート更新完了');
    } catch (error) {
      console.error('❌ 為替レート更新エラー:', error);
    }
  }

  /**
   * 💰 通貨フォーマット
   */
  formatCurrency(
    amount: number,
    currencyCode: string,
    options?: {
      showCurrencyCode?: boolean;
      precision?: number;
    }
  ): string {
    const currency = this.currencies.get(currencyCode);
    if (!currency) {
      return `${amount} ${currencyCode}`;
    }

    const precision = options?.precision ?? currency.decimalPlaces;
    const roundedAmount = this.roundAmount(amount, precision);

    // 整数部分と小数部分を分離
    const parts = roundedAmount.toFixed(precision).split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // 千の位区切り文字を追加
    const formattedInteger = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      currency.thousandsSeparator
    );

    // 小数部分を追加
    let formattedNumber = formattedInteger;
    if (precision > 0 && decimalPart) {
      formattedNumber += currency.decimalSeparator + decimalPart;
    }

    // 通貨記号の配置
    let formatted: string;
    if (currency.symbolPosition === 'before') {
      formatted = currency.symbol + (currency.spaceAfterSymbol ? ' ' : '') + formattedNumber;
    } else {
      formatted = formattedNumber + (currency.spaceAfterSymbol ? ' ' : '') + currency.symbol;
    }

    // 通貨コード表示
    if (options?.showCurrencyCode) {
      formatted += ` ${currencyCode}`;
    }

    return formatted;
  }

  /**
   * 🔄 通貨変換
   */
  convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): CurrencyConversionResult | null {
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: amount,
        convertedCurrency: toCurrency,
        exchangeRate: 1,
        formattedOriginal: this.formatCurrency(amount, fromCurrency),
        formattedConverted: this.formatCurrency(amount, toCurrency),
        timestamp: new Date().toISOString(),
      };
    }

    const directRate = this.exchangeRates.get(`${fromCurrency}-${toCurrency}`);
    if (directRate) {
      const convertedAmount = amount * directRate.rate;
      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: this.roundAmount(convertedAmount, this.userPreferences.displayPrecision),
        convertedCurrency: toCurrency,
        exchangeRate: directRate.rate,
        formattedOriginal: this.formatCurrency(amount, fromCurrency),
        formattedConverted: this.formatCurrency(convertedAmount, toCurrency),
        timestamp: new Date().toISOString(),
      };
    }

    // USD経由の変換を試行
    const toUsdRate = this.exchangeRates.get(`${fromCurrency}-USD`);
    const fromUsdRate = this.exchangeRates.get(`USD-${toCurrency}`);

    if (toUsdRate && fromUsdRate) {
      const usdAmount = amount * toUsdRate.rate;
      const convertedAmount = usdAmount * fromUsdRate.rate;
      const crossRate = toUsdRate.rate * fromUsdRate.rate;

      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: this.roundAmount(convertedAmount, this.userPreferences.displayPrecision),
        convertedCurrency: toCurrency,
        exchangeRate: crossRate,
        formattedOriginal: this.formatCurrency(amount, fromCurrency),
        formattedConverted: this.formatCurrency(convertedAmount, toCurrency),
        timestamp: new Date().toISOString(),
      };
    }

    return null;
  }

  /**
   * 🔢 金額丸め処理
   */
  private roundAmount(amount: number, precision: number): number {
    const multiplier = Math.pow(10, precision);

    switch (this.userPreferences.roundingMode) {
      case 'floor':
        return Math.floor(amount * multiplier) / multiplier;
      case 'ceil':
        return Math.ceil(amount * multiplier) / multiplier;
      case 'round':
      default:
        return Math.round(amount * multiplier) / multiplier;
    }
  }

  /**
   * 📊 複数通貨表示
   */
  getMultiCurrencyDisplay(
    amount: number,
    baseCurrency: string
  ): {
    primary: string;
    secondary?: string;
    additional: string[];
  } {
    const result = {
      primary: this.formatCurrency(amount, baseCurrency),
      secondary: undefined as string | undefined,
      additional: [] as string[],
    };

    if (!this.userPreferences.showMultipleCurrencies) {
      return result;
    }

    // セカンダリ通貨表示
    if (
      this.userPreferences.secondaryCurrency &&
      this.userPreferences.secondaryCurrency !== baseCurrency
    ) {
      const conversion = this.convertCurrency(
        amount,
        baseCurrency,
        this.userPreferences.secondaryCurrency
      );
      if (conversion) {
        result.secondary = conversion.formattedConverted;
      }
    }

    // 主要通貨での追加表示
    const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];
    majorCurrencies.forEach((currencyCode) => {
      if (
        currencyCode !== baseCurrency &&
        currencyCode !== this.userPreferences.secondaryCurrency
      ) {
        const conversion = this.convertCurrency(amount, baseCurrency, currencyCode);
        if (conversion && result.additional.length < 3) {
          result.additional.push(conversion.formattedConverted);
        }
      }
    });

    return result;
  }

  /**
   * 📈 為替レート履歴
   */
  getRateHistory(fromCurrency: string, toCurrency: string, days: number = 7): ExchangeRate[] {
    // 実際の実装では履歴データを返す
    // ここではシミュレートデータを生成
    const history: ExchangeRate[] = [];
    const currentRate = this.exchangeRates.get(`${fromCurrency}-${toCurrency}`);

    if (currentRate) {
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const variation = (Math.random() - 0.5) * 0.05; // ±2.5%の変動
        const rate = currentRate.rate * (1 + variation);

        history.push({
          ...currentRate,
          rate: Number(rate.toFixed(6)),
          lastUpdated: date.toISOString(),
        });
      }
    }

    return history;
  }

  // ゲッター
  getSupportedCurrencies(): Currency[] {
    return Array.from(this.currencies.values());
  }

  getCurrency(code: string): Currency | undefined {
    return this.currencies.get(code);
  }

  getExchangeRate(fromCurrency: string, toCurrency: string): ExchangeRate | undefined {
    return this.exchangeRates.get(`${fromCurrency}-${toCurrency}`);
  }

  getUserPreferences(): CurrencyPreferences {
    return { ...this.userPreferences };
  }

  getLastUpdateTime(): string {
    return this.lastRateUpdate;
  }

  /**
   * 🏦 通貨検出（文字列から通貨と金額を抽出）
   */
  detectCurrencyFromText(text: string): {
    amount?: number;
    currency?: string;
    formatted?: string;
  } {
    // 通貨記号パターン
    const currencyPatterns = [
      { regex: /¥\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/g, currency: 'JPY' },
      { regex: /\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/g, currency: 'USD' },
      { regex: /€\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/g, currency: 'EUR' },
      { regex: /£\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/g, currency: 'GBP' },
      { regex: /₩\s?(\d{1,3}(?:,\d{3})*)/g, currency: 'KRW' },
    ];

    for (const pattern of currencyPatterns) {
      const match = pattern.regex.exec(text);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        return {
          amount,
          currency: pattern.currency,
          formatted: this.formatCurrency(amount, pattern.currency),
        };
      }
    }

    return {};
  }
}

export const currencyLocalizationService = CurrencyLocalizationService.getInstance();
