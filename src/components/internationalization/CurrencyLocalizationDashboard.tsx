import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Globe,
  DollarSign,
  TrendingUp,
  Settings,
  RefreshCw,
  Calculator,
  BarChart3,
  Clock,
  CheckCircle,
  ArrowRightLeft,
  Coins,
  Languages,
} from 'lucide-react';
import {
  currencyLocalizationService,
  Currency,
  CurrencyConversionResult,
  CurrencyPreferences,
  ExchangeRate,
} from '@/services/internationalization/CurrencyLocalizationService';

interface CurrencyCardProps {
  currency: Currency;
  amount: number;
  onAmountChange: (amount: number) => void;
  isSelected: boolean;
  onSelect: () => void;
}

const CurrencyCard: React.FC<CurrencyCardProps> = ({
  currency,
  amount,
  onAmountChange,
  isSelected,
  onSelect,
}) => {
  const formattedAmount = currencyLocalizationService.formatCurrency(amount, currency.code);

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currency.symbol}</span>
            <div>
              <CardTitle className="text-sm">{currency.code}</CardTitle>
              <CardDescription className="text-xs">{currency.name}</CardDescription>
            </div>
          </div>
          {isSelected && <CheckCircle className="h-5 w-5 text-blue-500" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(Number(e.target.value) || 0)}
            placeholder="金額を入力"
            className="text-lg font-mono"
          />
          <div className="text-lg font-bold text-center p-2 bg-gray-100 rounded">
            {formattedAmount}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ExchangeRateCardProps {
  rate: ExchangeRate;
  trend?: 'up' | 'down' | 'stable';
}

const ExchangeRateCard: React.FC<ExchangeRateCardProps> = ({ rate, trend }) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600',
  };

  const trendIcon = trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→';

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="text-lg font-mono">
          {rate.from}/{rate.to}
        </div>
        <ArrowRightLeft className="h-4 w-4 text-gray-400" />
      </div>
      <div className="text-right">
        <div className="font-bold font-mono">{rate.rate.toFixed(6)}</div>
        <div className={`text-xs ${trendColors[trend || 'stable']}`}>
          {trendIcon} {new Date(rate.lastUpdated).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

/**
 * 🌍 国際化マスター: 通貨ローカライゼーションダッシュボード
 * 多通貨対応、リアルタイム為替レート、地域別フォーマット
 */
const CurrencyLocalizationDashboard: React.FC = () => {
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(['JPY', 'USD']);
  const [amounts, setAmounts] = useState<{ [key: string]: number }>({ JPY: 10000, USD: 100 });
  const [baseCurrency, setBaseCurrency] = useState<string>('JPY');
  const [convertResult, setConvertResult] = useState<CurrencyConversionResult | null>(null);
  const [preferences, setPreferences] = useState<CurrencyPreferences | null>(null);
  const [supportedCurrencies, setSupportedCurrencies] = useState<Currency[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);

  useEffect(() => {
    // 初期データ読み込み
    const currencies = currencyLocalizationService.getSupportedCurrencies();
    setSupportedCurrencies(currencies);

    const userPrefs = currencyLocalizationService.getUserPreferences();
    setPreferences(userPrefs);

    // 主要な為替レートを取得
    const rates: ExchangeRate[] = [];
    ['USD', 'EUR', 'GBP', 'CNY', 'KRW'].forEach((currency) => {
      const rate = currencyLocalizationService.getExchangeRate('JPY', currency);
      if (rate) {
        rates.push(rate);
      }
    });
    setExchangeRates(rates);

    // 定期更新
    const interval = setInterval(() => {
      const updatedRates: ExchangeRate[] = [];
      ['USD', 'EUR', 'GBP', 'CNY', 'KRW'].forEach((currency) => {
        const rate = currencyLocalizationService.getExchangeRate('JPY', currency);
        if (rate) {
          updatedRates.push(rate);
        }
      });
      setExchangeRates(updatedRates);
    }, 30000); // 30秒間隔

    return () => clearInterval(interval);
  }, []);

  const handleCurrencyConversion = (
    fromCurrency: string,
    toCurrency: string,
    amount: number
  ): void => {
    const result = currencyLocalizationService.convertCurrency(amount, fromCurrency, toCurrency);
    setConvertResult(result);
  };

  const handleAmountChange = (currency: string, amount: number): void => {
    setAmounts((prev) => ({ ...prev, [currency]: amount }));

    // 基準通貨からの変換結果を更新
    if (currency === baseCurrency) {
      selectedCurrencies.forEach((targetCurrency) => {
        if (targetCurrency !== currency) {
          const conversion = currencyLocalizationService.convertCurrency(
            amount,
            currency,
            targetCurrency
          );
          if (conversion) {
            setAmounts((prev) => ({ ...prev, [targetCurrency]: conversion.convertedAmount }));
          }
        }
      });
    }
  };

  const handlePreferenceChange = (key: keyof CurrencyPreferences, value: any): void => {
    if (preferences) {
      const updatedPrefs = { ...preferences, [key]: value };
      setPreferences(updatedPrefs);
      currencyLocalizationService.saveUserPreferences({ [key]: value });
    }
  };

  const addCurrency = (currencyCode: string): void => {
    if (!selectedCurrencies.includes(currencyCode)) {
      setSelectedCurrencies((prev) => [...prev, currencyCode]);

      // 基準通貨から新しい通貨への変換
      const baseAmount = amounts[baseCurrency] || 0;
      const conversion = currencyLocalizationService.convertCurrency(
        baseAmount,
        baseCurrency,
        currencyCode
      );
      if (conversion) {
        setAmounts((prev) => ({ ...prev, [currencyCode]: conversion.convertedAmount }));
      }
    }
  };

  const removeCurrency = (currencyCode: string): void => {
    if (selectedCurrencies.length > 2 && currencyCode !== baseCurrency) {
      setSelectedCurrencies((prev) => prev.filter((c) => c !== currencyCode));
      setAmounts((prev) => {
        const newAmounts = { ...prev };
        delete newAmounts[currencyCode];
        return newAmounts;
      });
    }
  };

  const getMultiCurrencyDisplay = (amount: number, currency: string) => {
    return currencyLocalizationService.getMultiCurrencyDisplay(amount, currency);
  };

  if (!preferences) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>通貨データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-500" />
            通貨ローカライゼーション
          </h1>
          <p className="text-gray-600 mt-1">
            多通貨対応・リアルタイム為替レート・地域別フォーマット
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            更新
          </Button>
        </div>
      </div>

      {/* ステータスカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">対応通貨</p>
                <p className="text-2xl font-bold">{supportedCurrencies.length}</p>
              </div>
              <Coins className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">アクティブ通貨</p>
                <p className="text-2xl font-bold">{selectedCurrencies.length}</p>
              </div>
              <Languages className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">基準通貨</p>
                <p className="text-2xl font-bold">{baseCurrency}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">最終更新</p>
                <p className="text-sm font-mono">
                  {new Date(currencyLocalizationService.getLastUpdateTime()).toLocaleTimeString()}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="converter" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="converter">通貨コンバーター</TabsTrigger>
          <TabsTrigger value="rates">為替レート</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
        </TabsList>

        {/* 通貨コンバーター */}
        <TabsContent value="converter" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  リアルタイム通貨変換
                </CardTitle>
                <CardDescription>基準通貨: {baseCurrency}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedCurrencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select onValueChange={addCurrency}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="通貨を追加" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedCurrencies
                          .filter((c) => !selectedCurrencies.includes(c.code))
                          .map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.symbol} {currency.code} - {currency.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {selectedCurrencies.map((currencyCode) => {
                      const currency = supportedCurrencies.find((c) => c.code === currencyCode);
                      if (!currency) return null;

                      return (
                        <div key={currencyCode} className="relative">
                          <CurrencyCard
                            currency={currency}
                            amount={amounts[currencyCode] || 0}
                            onAmountChange={(amount) => handleAmountChange(currencyCode, amount)}
                            isSelected={currencyCode === baseCurrency}
                            onSelect={() => setBaseCurrency(currencyCode)}
                          />
                          {selectedCurrencies.length > 2 && currencyCode !== baseCurrency && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => removeCurrency(currencyCode)}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 多通貨表示デモ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  多通貨表示デモ
                </CardTitle>
                <CardDescription>地域に応じた通貨フォーマット</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedCurrencies.map((currencyCode) => {
                    const currency = supportedCurrencies.find((c) => c.code === currencyCode);
                    const amount = amounts[currencyCode] || 0;
                    if (!currency) return null;

                    const multiDisplay = getMultiCurrencyDisplay(amount, currencyCode);

                    return (
                      <div key={currencyCode} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{currency.symbol}</span>
                          <Badge variant="outline">{currency.code}</Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="text-lg font-bold">{multiDisplay.primary}</div>
                          {multiDisplay.secondary && (
                            <div className="text-sm text-gray-600">≈ {multiDisplay.secondary}</div>
                          )}
                          {multiDisplay.additional.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {multiDisplay.additional.join(' • ')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 変換結果 */}
          {convertResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5" />
                  変換結果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-bold text-lg">{convertResult.formattedOriginal}</div>
                    <div className="text-sm text-gray-600">{convertResult.originalCurrency}</div>
                  </div>
                  <ArrowRightLeft className="h-6 w-6 text-blue-500" />
                  <div className="text-right">
                    <div className="font-bold text-lg">{convertResult.formattedConverted}</div>
                    <div className="text-sm text-gray-600">{convertResult.convertedCurrency}</div>
                  </div>
                </div>
                <div className="mt-2 text-center text-sm text-gray-500">
                  レート: {convertResult.exchangeRate.toFixed(6)} | 更新:{' '}
                  {new Date(convertResult.timestamp).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 為替レート */}
        <TabsContent value="rates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                リアルタイム為替レート
              </CardTitle>
              <CardDescription>主要通貨ペアの最新レート</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exchangeRates.map((rate, index) => (
                  <ExchangeRateCard
                    key={`${rate.from}-${rate.to}`}
                    rate={rate}
                    trend={Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 設定 */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                通貨設定
              </CardTitle>
              <CardDescription>個人設定とフォーマット設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="primary-currency">主要通貨</Label>
                    <Select
                      value={preferences.primaryCurrency}
                      onValueChange={(value) => handlePreferenceChange('primaryCurrency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedCurrencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="secondary-currency">セカンダリ通貨</Label>
                    <Select
                      value={preferences.secondaryCurrency || ''}
                      onValueChange={(value) => handlePreferenceChange('secondaryCurrency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedCurrencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="rounding-mode">丸めモード</Label>
                    <Select
                      value={preferences.roundingMode}
                      onValueChange={(value) => handlePreferenceChange('roundingMode', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round">四捨五入</SelectItem>
                        <SelectItem value="floor">切り捨て</SelectItem>
                        <SelectItem value="ceil">切り上げ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-convert">自動変換</Label>
                    <Switch
                      id="auto-convert"
                      checked={preferences.autoConvert}
                      onCheckedChange={(checked) => handlePreferenceChange('autoConvert', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-multiple">複数通貨表示</Label>
                    <Switch
                      id="show-multiple"
                      checked={preferences.showMultipleCurrencies}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange('showMultipleCurrencies', checked)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="display-precision">表示精度</Label>
                    <Select
                      value={preferences.displayPrecision.toString()}
                      onValueChange={(value) =>
                        handlePreferenceChange('displayPrecision', Number(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 (整数)</SelectItem>
                        <SelectItem value="1">1 (小数点1位)</SelectItem>
                        <SelectItem value="2">2 (小数点2位)</SelectItem>
                        <SelectItem value="3">3 (小数点3位)</SelectItem>
                        <SelectItem value="4">4 (小数点4位)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 分析 */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                通貨利用統計
              </CardTitle>
              <CardDescription>システム内での通貨使用状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportedCurrencies.slice(0, 6).map((currency, index) => {
                  const usage = Math.random() * 100;
                  return (
                    <div key={currency.code} className="flex items-center gap-4">
                      <div className="w-16 text-sm font-mono">{currency.code}</div>
                      <div className="flex-1">
                        <Progress value={usage} className="h-2" />
                      </div>
                      <div className="w-12 text-sm text-gray-600">{usage.toFixed(0)}%</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">変換統計</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>総変換回数</span>
                  <span className="font-bold">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span>今日の変換</span>
                  <span className="font-bold text-green-600">89</span>
                </div>
                <div className="flex justify-between">
                  <span>最頻通貨ペア</span>
                  <span className="font-mono">JPY/USD</span>
                </div>
                <div className="flex justify-between">
                  <span>平均変換額</span>
                  <span className="font-mono">¥15,678</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">システム状態</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>レート更新</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span>キャッシュ</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex justify-between items-center">
                  <span>API接続</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex justify-between">
                  <span>稼働時間</span>
                  <span className="font-mono">99.9%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CurrencyLocalizationDashboard;
