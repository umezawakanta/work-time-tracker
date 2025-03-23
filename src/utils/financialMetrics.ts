/**
 * 財務指標計算のためのユーティリティ関数
 */

import { AssetEntry, DebtEntry, FinancialMetrics } from "@/types";
    
  /**
   * 資産と負債のデータから各種財務指標を計算する
   * @param assetEntries 資産エントリの配列
   * @param debtEntries 負債エントリの配列
   * @returns 計算された財務指標
   */
  export const calculateFinancialMetrics = (
    assetEntries: AssetEntry[],
    debtEntries: DebtEntry[]
  ): FinancialMetrics => {
    // 総資産の計算
    const totalAssets = assetEntries.reduce((sum, entry) => sum + entry.value, 0);
  
    // 総負債の計算
    const totalDebts = debtEntries.reduce((sum, entry) => sum + entry.value, 0);
  
    // 純資産の計算
    const netWorth = totalAssets - totalDebts;
  
    // 負債資産比率の計算 (%)
    const debtToAssetRatio = totalAssets > 0 
      ? (totalDebts / totalAssets) * 100 
      : 0;
  
    // 資産成長率の計算 (デモでは適当な値)
    // 実際のアプリでは前回の総資産と比較して計算する
    const assetGrowthRate = totalAssets > 0 
      ? Math.min(Math.max((Math.random() * 10) - 2, -5), 15) 
      : 0;
  
    // 月間純資産変化の計算 (デモでは適当な値)
    // 実際のアプリでは過去の履歴データを使用して計算する
    const monthlyNetWorthChange = netWorth > 0 
      ? netWorth * (Math.random() * 0.03 + 0.005) 
      : 0;
  
    // 緊急資金率 (月数) の計算
    // 現金・預金の合計 ÷ 月間支出(デモでは仮定)
    const liquidAssets = assetEntries
      .filter(asset => asset.isLiquid || 
        asset.account.toLowerCase().includes('現金') || 
        asset.account.toLowerCase().includes('預金') ||
        asset.account.toLowerCase().includes('銀行'))
      .reduce((sum, asset) => sum + asset.value, 0);
    
    // 月間支出は仮に30万円とする
    const monthlyExpenses = 300000;
    const emergencyFundRatio = monthlyExpenses > 0 
      ? liquidAssets / monthlyExpenses 
      : 0;
  
    // 投資配分比率の計算
    const investmentAssets = assetEntries
      .filter(asset => asset.isInvestment || 
        asset.account.toLowerCase().includes('投資') || 
        asset.account.toLowerCase().includes('株') ||
        asset.account.toLowerCase().includes('fund'))
      .reduce((sum, asset) => sum + asset.value, 0);
  
    const investmentAllocation = totalAssets > 0 
      ? (investmentAssets / totalAssets) * 100 
      : 0;
  
    // 1年後の予測純資産
    const annualGrowthRate = assetGrowthRate > 0 ? assetGrowthRate : 3; // デフォルト3%
    const projectedNetWorth = netWorth * (1 + annualGrowthRate / 100);
  
    // 流動比率の計算 (流動資産 / 流動負債)
    // 実際のアプリでは流動負債の情報も必要
    // ここでは仮に負債の30%を流動負債とする
    const shortTermDebt = totalDebts * 0.3;
    const liquidityRatio = shortTermDebt > 0 
      ? liquidAssets / shortTermDebt 
      : liquidAssets > 0 ? 999 : 0; // 流動負債がなければ比率は高い(または0)
  
    return {
      totalAssets,
      totalDebts,
      netWorth,
      debtToAssetRatio,
      assetGrowthRate,
      monthlyNetWorthChange,
      emergencyFundRatio,
      projectedNetWorth,
      investmentAllocation,
      liquidityRatio
    };
  };
  
  /**
   * 資産・負債データの一貫性チェック
   * @param assetEntries 資産エントリの配列
   * @param debtEntries 負債エントリの配列
   * @returns 問題があれば警告メッセージの配列、なければ空配列
   */
  export const validateFinancialData = (
    assetEntries: AssetEntry[],
    debtEntries: DebtEntry[]
  ): string[] => {
    const warnings: string[] = [];
    
    // データの整合性チェック
    if (assetEntries.length === 0) {
      warnings.push('資産データが登録されていません。');
    }
    
    // 更新日のチェック
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    
    const outdatedAssets = assetEntries.filter(asset => {
      if (!asset.lastUpdated) return true;
      const updateDate = new Date(asset.lastUpdated);
      return updateDate < threeMonthsAgo;
    });
    
    if (outdatedAssets.length > 0) {
      warnings.push(`${outdatedAssets.length}件の資産データが3ヶ月以上更新されていません。`);
    }
    
    // 負債の利率チェック
    const highInterestDebts = debtEntries.filter(debt => 
      debt.interestRate !== undefined && debt.interestRate > 15
    );
    
    if (highInterestDebts.length > 0) {
      warnings.push(`${highInterestDebts.length}件の負債が高金利（15%超）です。`);
    }
    
    // 資産/負債比率のチェック
    const { debtToAssetRatio } = calculateFinancialMetrics(assetEntries, debtEntries);
    
    if (debtToAssetRatio > 80) {
      warnings.push('負債資産比率が80%を超えています。財務バランスの見直しをおすすめします。');
    }
    
    return warnings;
  };
  
  /**
   * 財務改善のための提案を生成
   * @param metrics 財務指標
   * @returns 改善提案の配列
   */
  export const generateFinancialSuggestions = (metrics: FinancialMetrics): string[] => {
    const suggestions: string[] = [];
    
    // 緊急資金に関する提案
    if (metrics.emergencyFundRatio < 3) {
      suggestions.push('緊急資金が3ヶ月分に満たないため、現金または流動性の高い資産の積み増しを検討してください。');
    }
    
    // 負債に関する提案
    if (metrics.debtToAssetRatio > 50) {
      suggestions.push('負債資産比率が50%を超えています。高金利の負債から優先的に返済することを検討してください。');
    }
    
    // 投資配分に関する提案
    if (metrics.investmentAllocation < 20) {
      suggestions.push('長期的な資産形成のため、投資配分の増加を検討してください。');
    } else if (metrics.investmentAllocation > 80) {
      suggestions.push('投資配分が非常に高くなっています。リスク分散のため、一部を安全資産にシフトすることも検討してください。');
    }
    
    // 流動性に関する提案
    if (metrics.liquidityRatio < 1) {
      suggestions.push('短期的な支払い能力を示す流動比率が1を下回っています。流動資産の増加を検討してください。');
    }
    
    return suggestions;
  };