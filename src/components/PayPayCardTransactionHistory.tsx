import React, { useState, useEffect } from 'react';
import { PayPayCard, PayPayCardTransaction, PAYPAY_CARD_TRANSACTION_TYPES, PAYPAY_CARD_CATEGORIES } from '../types/paypayCard';
import { PayPayCardManager } from '../utils/paypayCardManager';
import './PayPayCardTransactionHistory.css';

interface PayPayCardTransactionHistoryProps {
  userId: string;
  cardId: string;
  onClose: () => void;
}

const PayPayCardTransactionHistory: React.FC<PayPayCardTransactionHistoryProps> = ({
  userId,
  cardId,
  onClose
}) => {
  const [card, setCard] = useState<PayPayCard | null>(null);
  const [transactions, setTransactions] = useState<PayPayCardTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: ''
  });
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'purchase' as 'purchase' | 'payment' | 'cashback' | 'refund' | 'adjustment' | 'interest_charge',
    amount: 0,
    description: '',
    category: '',
    merchant: '',
    transactionDate: new Date().toISOString().split('T')[0],
    cashbackAmount: 0
  });

  const paypayCardManager = PayPayCardManager.getInstance();

  useEffect(() => {
    loadData();
  }, [userId, cardId]);

  const loadData = () => {
    try {
      paypayCardManager.loadFromLocalStorage();
      const paypayCard = paypayCardManager.getPayPayCard(userId, cardId);
      const paypayCardTransactions = paypayCardManager.getTransactions(userId, cardId);
      
      setCard(paypayCard);
      setTransactions(paypayCardTransactions);
      setError(null);
    } catch (err) {
      console.error('PayPayカード取引履歴の読み込みエラー:', err);
      setError('取引履歴の読み込みに失敗しました');
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

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTransactionTypeInfo = (type: string) => {
    return PAYPAY_CARD_TRANSACTION_TYPES.find(t => t.value === type) || PAYPAY_CARD_TRANSACTION_TYPES[0];
  };

  const getTransactionTypeColor = (type: string): string => {
    switch (type) {
      case 'purchase': return '#f44336';
      case 'payment': return '#4caf50';
      case 'cashback': return '#ff9800';
      case 'refund': return '#2196f3';
      case 'adjustment': return '#9c27b0';
      case 'interest_charge': return '#795548';
      default: return '#666';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter.type !== 'all' && transaction.type !== filter.type) return false;
    if (filter.category !== 'all' && transaction.category !== filter.category) return false;
    if (filter.startDate && new Date(transaction.transactionDate) < new Date(filter.startDate)) return false;
    if (filter.endDate && new Date(transaction.transactionDate) > new Date(filter.endDate)) return false;
    return true;
  });

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!card) return;

    try {
      const amount = (newTransaction.type === 'payment' || newTransaction.type === 'cashback' || newTransaction.type === 'refund')
        ? -Math.abs(newTransaction.amount) // 支払い系は負の値
        : Math.abs(newTransaction.amount); // 購入系は正の値

      const balanceAfter = card.currentBalance + amount;

      paypayCardManager.addTransaction({
        userId,
        paypayCardId: cardId,
        type: newTransaction.type,
        amount,
        description: newTransaction.description,
        category: newTransaction.category || undefined,
        merchant: newTransaction.merchant || undefined,
        transactionDate: new Date(newTransaction.transactionDate),
        balanceAfter,
        cashbackAmount: newTransaction.cashbackAmount || undefined
      });

      // フォームをリセット
      setNewTransaction({
        type: 'purchase',
        amount: 0,
        description: '',
        category: '',
        merchant: '',
        transactionDate: new Date().toISOString().split('T')[0],
        cashbackAmount: 0
      });
      setShowAddTransaction(false);
      
      // データを再読み込み
      loadData();
    } catch (err) {
      console.error('取引の追加エラー:', err);
      setError('取引の追加に失敗しました');
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!window.confirm('この取引を削除しますか？')) return;

    try {
      paypayCardManager.deleteTransaction(transactionId);
      loadData();
    } catch (err) {
      console.error('取引の削除エラー:', err);
      setError('取引の削除に失敗しました');
    }
  };

  const getTotalAmount = (type: string): number => {
    return filteredTransactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  if (isLoading) {
    return (
      <div className="paypay-card-transaction-history-overlay">
        <div className="paypay-card-transaction-history">
          <div className="loading-spinner"></div>
          <p>取引履歴を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="paypay-card-transaction-history-overlay">
        <div className="paypay-card-transaction-history">
          <div className="error-message">
            ❌ {error || 'PayPayカードが見つかりません'}
          </div>
          <button onClick={onClose} className="close-button">
            閉じる
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="paypay-card-transaction-history-overlay">
      <div className="paypay-card-transaction-history">
        <div className="history-header">
          <h3>{card.cardName} - 取引履歴</h3>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>

        {/* カード情報 */}
        <div className="card-info">
          <div className="card-summary">
            <div className="summary-item">
              <span className="label">現在の残高</span>
              <span className="value debt">{formatCurrency(card.currentBalance)}</span>
            </div>
            <div className="summary-item">
              <span className="label">利用枠</span>
              <span className="value">{formatCurrency(card.creditLimit)}</span>
            </div>
            <div className="summary-item">
              <span className="label">利用可能額</span>
              <span className="value credit">{formatCurrency(card.availableCredit)}</span>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="transaction-filters">
          <div className="filter-group">
            <label>取引種別</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
              aria-label="取引種別でフィルター"
            >
              <option value="all">すべて</option>
              {PAYPAY_CARD_TRANSACTION_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>カテゴリ</label>
            <select
              value={filter.category}
              onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
              aria-label="カテゴリでフィルター"
            >
              <option value="all">すべて</option>
              {PAYPAY_CARD_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>開始日</label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
              aria-label="開始日でフィルター"
            />
          </div>
          <div className="filter-group">
            <label>終了日</label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
              aria-label="終了日でフィルター"
            />
          </div>
        </div>

        {/* 統計情報 */}
        <div className="transaction-stats">
          <div className="stat-item">
            <span className="stat-label">購入額</span>
            <span className="stat-value purchase">
              {formatCurrency(getTotalAmount('purchase'))}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">支払額</span>
            <span className="stat-value payment">
              {formatCurrency(Math.abs(getTotalAmount('payment')))}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">キャッシュバック</span>
            <span className="stat-value cashback">
              {formatCurrency(Math.abs(getTotalAmount('cashback')))}
            </span>
          </div>
        </div>

        {/* 取引追加ボタン */}
        <div className="add-transaction-section">
          <button
            onClick={() => setShowAddTransaction(!showAddTransaction)}
            className="add-transaction-button"
          >
            {showAddTransaction ? '取引追加をキャンセル' : '取引を追加'}
          </button>
        </div>

        {/* 取引追加フォーム */}
        {showAddTransaction && (
          <div className="add-transaction-form">
            <h4>新しい取引を追加</h4>
            <form onSubmit={handleAddTransaction}>
              <div className="form-row">
                <div className="form-group">
                  <label>取引種別</label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction(prev => ({ 
                      ...prev, 
                      type: e.target.value as any 
                    }))}
                    aria-label="取引種別を選択"
                  >
                    {PAYPAY_CARD_TRANSACTION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>金額（円）</label>
                  <input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ 
                      ...prev, 
                      amount: parseFloat(e.target.value) || 0 
                    }))}
                    min="0"
                    step="1"
                    required
                    aria-label="金額を入力"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>説明</label>
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                    placeholder="取引の説明"
                    required
                    aria-label="取引の説明を入力"
                  />
                </div>
                <div className="form-group">
                  <label>カテゴリ</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction(prev => ({ 
                      ...prev, 
                      category: e.target.value 
                    }))}
                    aria-label="カテゴリを選択"
                  >
                    <option value="">選択してください</option>
                    {PAYPAY_CARD_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>加盟店名</label>
                  <input
                    type="text"
                    value={newTransaction.merchant}
                    onChange={(e) => setNewTransaction(prev => ({ 
                      ...prev, 
                      merchant: e.target.value 
                    }))}
                    placeholder="加盟店名（任意）"
                    aria-label="加盟店名を入力"
                  />
                </div>
                <div className="form-group">
                  <label>取引日</label>
                  <input
                    type="date"
                    value={newTransaction.transactionDate}
                    onChange={(e) => setNewTransaction(prev => ({ 
                      ...prev, 
                      transactionDate: e.target.value 
                    }))}
                    required
                    aria-label="取引日を選択"
                  />
                </div>
              </div>
              {(newTransaction.type === 'cashback' || newTransaction.type === 'purchase') && (
                <div className="form-group">
                  <label>キャッシュバック額（円）</label>
                  <input
                    type="number"
                    value={newTransaction.cashbackAmount}
                    onChange={(e) => setNewTransaction(prev => ({ 
                      ...prev, 
                      cashbackAmount: parseFloat(e.target.value) || 0 
                    }))}
                    min="0"
                    step="1"
                    aria-label="キャッシュバック額を入力"
                  />
                </div>
              )}
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddTransaction(false)}>
                  キャンセル
                </button>
                <button type="submit">追加</button>
              </div>
            </form>
          </div>
        )}

        {/* 取引一覧 */}
        <div className="transaction-list">
          <h4>取引履歴 ({filteredTransactions.length}件)</h4>
          {filteredTransactions.length === 0 ? (
            <div className="no-transactions">
              <p>該当する取引がありません</p>
            </div>
          ) : (
            <div className="transactions">
              {filteredTransactions.map(transaction => {
                const typeInfo = getTransactionTypeInfo(transaction.type);
                const isNegative = transaction.amount < 0;
                
                return (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-icon" style={{ color: getTransactionTypeColor(transaction.type) }}>
                      {typeInfo.icon}
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-description">
                        {transaction.description}
                        {transaction.merchant && (
                          <span className="merchant"> @ {transaction.merchant}</span>
                        )}
                      </div>
                      <div className="transaction-meta">
                        <span className="transaction-type">{typeInfo.label}</span>
                        {transaction.category && (
                          <span className="transaction-category">#{transaction.category}</span>
                        )}
                        <span className="transaction-date">{formatDate(transaction.transactionDate)}</span>
                      </div>
                      {transaction.cashbackAmount && transaction.cashbackAmount > 0 && (
                        <div className="cashback-info">
                          🎁 キャッシュバック: {formatCurrency(transaction.cashbackAmount)}
                        </div>
                      )}
                    </div>
                    <div className="transaction-amount">
                      <div className={`amount ${isNegative ? 'negative' : 'positive'}`}>
                        {isNegative ? '' : '+'}{formatCurrency(transaction.amount)}
                      </div>
                      <div className="balance-after">
                        残高: {formatCurrency(transaction.balanceAfter)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="delete-transaction-button"
                      title="取引を削除"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayPayCardTransactionHistory;
