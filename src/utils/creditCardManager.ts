import { CreditCard, CreditCardSummary, CreditCardAnalysis, CREDIT_CARD_TYPES, CARD_ISSUERS } from '../types/creditCard';
import { apiFetch } from './apiClient';

export class CreditCardManager {
  private static instance: CreditCardManager;
  private creditCards: CreditCard[] = [];

  private constructor() {}

  public static getInstance(): CreditCardManager {
    if (!CreditCardManager.instance) {
      CreditCardManager.instance = new CreditCardManager();
    }
    return CreditCardManager.instance;
  }

  // サーバーからクレジットカードを読み込み
  public async loadFromServer(userId: string): Promise<void> {
    try {
      const response = await apiFetch(`/api/credit-cards?userId=${userId}`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.cards) {
          this.creditCards = data.cards.map((card: any) => ({
            ...card,
            paymentDueDate: new Date(card.paymentDueDate),
            createdAt: new Date(card.createdAt),
            updatedAt: new Date(card.updatedAt)
          }));
        }
      }
    } catch (error) {
      console.error('クレジットカードの読み込みエラー:', error);
    }
  }

  // サーバーにクレジットカードを保存
  public async saveToServer(userId: string, card: Omit<CreditCard, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    try {
      const response = await apiFetch('/api/credit-cards', {
        method: 'POST',
        body: JSON.stringify({
          ...card,
          userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.card) {
          this.creditCards.push({
            ...data.card,
            paymentDueDate: new Date(data.card.paymentDueDate),
            createdAt: new Date(data.card.createdAt),
            updatedAt: new Date(data.card.updatedAt)
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('クレジットカードの保存エラー:', error);
      return false;
    }
  }

  // クレジットカードを更新
  public async updateCard(cardId: string, updates: Partial<Omit<CreditCard, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    try {
      const response = await apiFetch(`/api/credit-cards/${cardId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.card) {
          const index = this.creditCards.findIndex(c => c.id === cardId);
          if (index !== -1) {
            this.creditCards[index] = {
              ...this.creditCards[index],
              ...data.card,
              paymentDueDate: new Date(data.card.paymentDueDate),
              updatedAt: new Date(data.card.updatedAt)
            };
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('クレジットカードの更新エラー:', error);
      return false;
    }
  }

  // クレジットカードを削除
  public async deleteCard(cardId: string): Promise<boolean> {
    try {
      const response = await apiFetch(`/api/credit-cards/${cardId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        this.creditCards = this.creditCards.filter(c => c.id !== cardId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('クレジットカードの削除エラー:', error);
      return false;
    }
  }

  // クレジットカードを取得
  public getCards(userId: string): CreditCard[] {
    return this.creditCards.filter(c => c.userId === userId).sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  // クレジットカードのサマリーを取得
  public getCardSummary(userId: string): CreditCardSummary {
    const cards = this.getCards(userId);
    const activeCards = cards.filter(c => c.isActive);

    const totalCards = cards.length;
    const totalCreditLimit = activeCards.reduce((sum, c) => sum + c.creditLimit, 0);
    const totalCurrentBalance = activeCards.reduce((sum, c) => sum + c.currentBalance, 0);
    const totalAvailableCredit = totalCreditLimit - totalCurrentBalance;
    const totalAnnualFees = activeCards.reduce((sum, c) => sum + c.annualFee, 0);
    const averageUtilizationRate = totalCreditLimit > 0 ? (totalCurrentBalance / totalCreditLimit) * 100 : 0;
    const totalMinimumPayments = activeCards.reduce((sum, c) => sum + c.minimumPayment, 0);

    // 次回支払日（最も近い日）
    const nextPaymentDue = activeCards.length > 0 ? 
      activeCards.reduce((earliest, c) => 
        c.paymentDueDate < earliest.paymentDueDate ? c.paymentDueDate : earliest.paymentDueDate
      ) : undefined;

    // 限度額に近いカード（利用率80%以上）
    const cardsNearLimit = activeCards.filter(c => 
      c.creditLimit > 0 && (c.currentBalance / c.creditLimit) >= 0.8
    ).length;

    return {
      totalCards,
      totalCreditLimit,
      totalCurrentBalance,
      totalAvailableCredit,
      totalAnnualFees,
      averageUtilizationRate: Math.round(averageUtilizationRate * 100) / 100,
      totalMinimumPayments,
      nextPaymentDue,
      cardsNearLimit,
      activeCards: activeCards.length
    };
  }

  // クレジットカードの分析を取得
  public getCardAnalysis(userId: string): CreditCardAnalysis {
    const cards = this.getCards(userId);
    const activeCards = cards.filter(c => c.isActive);
    const now = new Date();

    // 利用率トレンド（過去12ヶ月）
    const utilizationTrend: Array<{
      month: string;
      totalBalance: number;
      totalLimit: number;
      utilizationRate: number;
    }> = [];

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      // 簡易的な実装：現在のデータを使用
      const totalBalance = activeCards.reduce((sum, c) => sum + c.currentBalance, 0);
      const totalLimit = activeCards.reduce((sum, c) => sum + c.creditLimit, 0);
      const utilizationRate = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;

      utilizationTrend.push({
        month: `${monthStart.getFullYear()}/${monthStart.getMonth() + 1}`,
        totalBalance,
        totalLimit,
        utilizationRate: Math.round(utilizationRate * 100) / 100
      });
    }

    // カード種別分布
    const cardTypeMap: { [key: string]: { count: number; totalLimit: number } } = {};
    activeCards.forEach(card => {
      if (!cardTypeMap[card.cardType]) {
        cardTypeMap[card.cardType] = { count: 0, totalLimit: 0 };
      }
      cardTypeMap[card.cardType].count += 1;
      cardTypeMap[card.cardType].totalLimit += card.creditLimit;
    });

    const cardTypeDistribution = Object.keys(cardTypeMap).map(type => ({
      type: CREDIT_CARD_TYPES.find(t => t.value === type)?.label || type,
      count: cardTypeMap[type].count,
      totalLimit: cardTypeMap[type].totalLimit,
      percentage: Math.round((cardTypeMap[type].count / activeCards.length) * 100)
    }));

    // 発行会社分布
    const issuerMap: { [key: string]: { count: number; totalLimit: number; totalRate: number } } = {};
    activeCards.forEach(card => {
      if (!issuerMap[card.issuer]) {
        issuerMap[card.issuer] = { count: 0, totalLimit: 0, totalRate: 0 };
      }
      issuerMap[card.issuer].count += 1;
      issuerMap[card.issuer].totalLimit += card.creditLimit;
      issuerMap[card.issuer].totalRate += card.interestRate;
    });

    const issuerDistribution = Object.keys(issuerMap).map(issuer => ({
      issuer,
      count: issuerMap[issuer].count,
      totalLimit: issuerMap[issuer].totalLimit,
      averageRate: Math.round((issuerMap[issuer].totalRate / issuerMap[issuer].count) * 100) / 100
    }));

    // 支払い行動の評価
    const totalUtilization = activeCards.reduce((sum, c) => 
      c.creditLimit > 0 ? sum + (c.currentBalance / c.creditLimit) : sum, 0
    ) / activeCards.length * 100;

    // 限度額に近いカード数（利用率80%以上）
    const cardsNearLimit = activeCards.filter(c => 
      c.creditLimit > 0 && (c.currentBalance / c.creditLimit) >= 0.8
    ).length;

    let paymentBehavior: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    if (totalUtilization > 80) {
      paymentBehavior = 'poor';
    } else if (totalUtilization > 60) {
      paymentBehavior = 'fair';
    } else if (totalUtilization > 30) {
      paymentBehavior = 'good';
    }

    // クレジットヘルススコア（1-100）
    let creditHealthScore = 100;
    creditHealthScore -= Math.min(totalUtilization * 0.5, 50); // 利用率による減点
    creditHealthScore -= cardsNearLimit * 10; // 限度額に近いカードによる減点
    creditHealthScore = Math.max(0, Math.round(creditHealthScore));

    // 推奨事項
    const recommendations: string[] = [];
    if (totalUtilization > 30) {
      recommendations.push('クレジット利用率を下げることを検討してください');
    }
    if (cardsNearLimit > 0) {
      recommendations.push('限度額に近いカードの支払いを優先してください');
    }
    if (totalAnnualFees > 50000) {
      recommendations.push('年会費の見直しを検討してください');
    }
    if (activeCards.length > 5) {
      recommendations.push('カード枚数の整理を検討してください');
    }

    return {
      utilizationTrend,
      cardTypeDistribution,
      issuerDistribution,
      paymentBehavior,
      creditHealthScore,
      recommendations
    };
  }

  // カード番号をマスクする
  public static maskCardNumber(cardNumber: string): string {
    if (cardNumber.length < 4) return cardNumber;
    const lastFour = cardNumber.slice(-4);
    const masked = '*'.repeat(cardNumber.length - 4);
    return masked + lastFour;
  }

  // 有効期限の文字列を生成
  public static formatExpiryDate(month: number, year: number): string {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  }
}
