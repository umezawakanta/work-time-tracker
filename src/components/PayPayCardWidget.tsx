import React, { useState, useEffect } from 'react';
import { PayPayCard, PayPayCardSummary, PayPayCardAlert } from '../types/paypayCard';
import { PayPayCardManager } from '../utils/paypayCardManager';
import './PayPayCardWidget.css';

interface PayPayCardWidgetProps {
  userId: string;
  onUpdateBalance: (cardId: string) => void;
  onShowTransactions: (cardId: string) => void;
  onShowSettings: () => void;
}

const PayPayCardWidget: React.FC<PayPayCardWidgetProps> = ({
  userId,
  onUpdateBalance,
  onShowTransactions,
  onShowSettings
}) => {
  const [summary, setSummary] = useState<PayPayCardSummary | null>(null);
  const [alerts, setAlerts] = useState<PayPayCardAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paypayCardManager = PayPayCardManager.getInstance();

  useEffect(() => {
    loadPayPayCardData();
  }, [userId]);

  const loadPayPayCardData = () => {
    try {
      paypayCardManager.loadFromLocalStorage();
      const paypayCardSummary = paypayCardManager.getPayPayCardSummary(userId);
      const paypayCardAlerts = paypayCardManager.getAlerts(userId);
      
      setSummary(paypayCardSummary);
      setAlerts(paypayCardAlerts);
      setError(null);
    } catch (err) {
      console.error('PayPayカードデータの読み込みエラー:', err);
      setError('PayPayカードデータの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getCardTypeIcon = (cardType: string): string => {
    switch (cardType) {
      case 'paypay_card': return '💳';
      case 'paypay_bank_card': return '🏦';
      case 'paypay_credit_card': return '💎';
      default: return '💳';
    }
  };

  const getCardTypeColor = (cardType: string): string => {
    switch (cardType) {
      case 'paypay_card': return '#ff6b35';
      case 'paypay_bank_card': return '#4a90e2';
      case 'paypay_credit_card': return '#7b68ee';
      default: return '#ff6b35';
    }
  };

  const getAlertSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      case 'critical': return '#9c27b0';
      default: return '#4caf50';
    }
  };

  const getAlertSeverityIcon = (severity: string): string => {
    switch (severity) {
      case 'low': return 'ℹ️';
      case 'medium': return '⚠️';
      case 'high': return '🚨';
      case 'critical': return '🔥';
      default: return 'ℹ️';
    }
  };

  const markAlertAsRead = (alertId: string) => {
    paypayCardManager.markAlertAsRead(alertId);
    loadPayPayCardData();
  };

  if (isLoading) {
    return (
      <div className="paypay-card-widget">
        <div className="paypay-card-header">
          <h3>PayPayカード負債管理</h3>
        </div>
        <div className="paypay-card-loading">
          <div className="loading-spinner"></div>
          <p>PayPayカードデータを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="paypay-card-widget">
        <div className="paypay-card-header">
          <h3>PayPayカード負債管理</h3>
        </div>
        <div className="paypay-card-error">
          <p>❌ {error}</p>
          <button onClick={loadPayPayCardData} className="retry-button">
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (!summary || summary.cardCount === 0) {
    return (
      <div className="paypay-card-widget">
        <div className="paypay-card-header">
          <h3>PayPayカード負債管理</h3>
          <button onClick={onShowSettings} className="settings-button">
            ⚙️
          </button>
        </div>
        <div className="paypay-card-empty">
          <div className="empty-icon">💳</div>
          <h4>PayPayカードが登録されていません</h4>
          <p>PayPayカードの負債を管理するために、まずカードを登録してください。</p>
          <button 
            onClick={() => onUpdateBalance('new')} 
            className="add-card-button"
          >
            PayPayカードを追加
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="paypay-card-widget">
      <div className="paypay-card-header">
        <h3>PayPayカード負債管理</h3>
        <div className="paypay-card-actions">
          <button onClick={onShowSettings} className="settings-button">
            ⚙️
          </button>
          {alerts.length > 0 && (
            <div className="alert-badge">
              {alerts.filter(a => !a.isRead).length}
            </div>
          )}
        </div>
      </div>

      {/* アラート表示 */}
      {alerts.length > 0 && (
        <div className="paypay-card-alerts">
          <h4>アラート</h4>
          {alerts.slice(0, 3).map(alert => (
            <div 
              key={alert.id} 
              className={`alert-item ${alert.isRead ? 'read' : 'unread'}`}
              onClick={() => markAlertAsRead(alert.id)}
            >
              <div className="alert-icon">
                {getAlertSeverityIcon(alert.severity)}
              </div>
              <div className="alert-content">
                <div className="alert-title">{alert.title}</div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-time">
                  {new Date(alert.createdAt).toLocaleString('ja-JP')}
                </div>
              </div>
              <div 
                className="alert-severity"
                style={{ backgroundColor: getAlertSeverityColor(alert.severity) }}
              >
                {alert.severity}
              </div>
            </div>
          ))}
          {alerts.length > 3 && (
            <div className="more-alerts">
              他 {alerts.length - 3} 件のアラート
            </div>
          )}
        </div>
      )}

      {/* サマリー情報 */}
      <div className="paypay-card-summary">
        <div className="summary-item">
          <div className="summary-label">総負債額</div>
          <div className="summary-value debt">
            {formatCurrency(summary.totalDebt)}
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-label">利用可能枠</div>
          <div className="summary-value credit">
            {formatCurrency(summary.totalAvailableCredit)}
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-label">カード数</div>
          <div className="summary-value">
            {summary.cardCount}枚
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-label">平均金利</div>
          <div className="summary-value">
            {summary.averageInterestRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* カード一覧 */}
      <div className="paypay-card-list">
        <h4>登録済みカード</h4>
        {summary.cards.map(card => (
          <div key={card.cardId} className="paypay-card-item">
            <div className="card-header">
              <div className="card-info">
                <div className="card-icon" style={{ color: getCardTypeColor(card.cardType) }}>
                  {getCardTypeIcon(card.cardType)}
                </div>
                <div className="card-details">
                  <div className="card-name">{card.cardName}</div>
                  <div className="card-type">{card.cardType}</div>
                </div>
              </div>
              <div className="card-actions">
                <button 
                  onClick={() => onUpdateBalance(card.cardId)}
                  className="action-button update"
                  title="残高を更新"
                >
                  📝
                </button>
                <button 
                  onClick={() => onShowTransactions(card.cardId)}
                  className="action-button transactions"
                  title="取引履歴"
                >
                  📊
                </button>
              </div>
            </div>
            
            <div className="card-balance">
              <div className="balance-item">
                <span className="balance-label">現在の残高</span>
                <span className="balance-value debt">
                  {formatCurrency(card.balance)}
                </span>
              </div>
              <div className="balance-item">
                <span className="balance-label">利用枠</span>
                <span className="balance-value">
                  {formatCurrency(card.creditLimit)}
                </span>
              </div>
              <div className="balance-item">
                <span className="balance-label">利用可能額</span>
                <span className="balance-value credit">
                  {formatCurrency(card.availableCredit)}
                </span>
              </div>
            </div>

            <div className="card-details">
              <div className="detail-item">
                <span className="detail-label">金利</span>
                <span className="detail-value">{card.interestRate}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">支払期日</span>
                <span className="detail-value">{formatDate(card.paymentDueDate)}</span>
              </div>
            </div>

            {/* 利用枠の使用率バー */}
            <div className="credit-usage-bar">
              <div className="usage-label">
                利用枠使用率: {Math.round((card.balance / card.creditLimit) * 100)}%
              </div>
              <div className="usage-bar">
                <div 
                  className="usage-fill"
                  style={{ 
                    width: `${Math.min((card.balance / card.creditLimit) * 100, 100)}%`,
                    backgroundColor: (card.balance / card.creditLimit) > 0.9 ? '#f44336' : 
                                   (card.balance / card.creditLimit) > 0.7 ? '#ff9800' : '#4caf50'
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 統計情報 */}
      <div className="paypay-card-stats">
        <h4>今月の統計</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">購入額</div>
            <div className="stat-value purchase">
              {formatCurrency(summary.totalPurchases)}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">支払額</div>
            <div className="stat-value payment">
              {formatCurrency(summary.totalPayments)}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">キャッシュバック</div>
            <div className="stat-value cashback">
              {formatCurrency(summary.totalCashback)}
            </div>
          </div>
        </div>
      </div>

      {/* 次回支払期日 */}
      {summary.nextPaymentDate && (
        <div className="next-payment">
          <h4>次回支払期日</h4>
          <div className="payment-info">
            <div className="payment-date">
              {formatDate(summary.nextPaymentDate)}
            </div>
            <div className="payment-days">
              {Math.ceil((summary.nextPaymentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}日後
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayPayCardWidget;
