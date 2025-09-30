import React, { useState, useEffect } from 'react';
import { PayPayCard, PAYPAY_CARD_TYPES } from '../types/paypayCard';
import { PayPayCardManager } from '../utils/paypayCardManager';
import './PayPayCardUpdateForm.css';

interface PayPayCardUpdateFormProps {
  userId: string;
  cardId: string | null; // nullの場合は新規作成
  onSave: (card: PayPayCard) => void;
  onCancel: () => void;
}

const PayPayCardUpdateForm: React.FC<PayPayCardUpdateFormProps> = ({
  userId,
  cardId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    cardName: '',
    cardType: 'paypay_card' as const,
    cardNumber: '',
    cardHolderName: '',
    currentBalance: 0,
    creditLimit: 0,
    minimumPayment: 0,
    interestRate: 18.0,
    paymentDueDate: '',
    lastPaymentDate: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const paypayCardManager = PayPayCardManager.getInstance();

  useEffect(() => {
    if (cardId && cardId !== 'new') {
      loadCardData();
    }
  }, [cardId]);

  const loadCardData = () => {
    if (!cardId || cardId === 'new') return;

    const card = paypayCardManager.getPayPayCard(userId, cardId);
    if (card) {
      setFormData({
        cardName: card.cardName,
        cardType: card.cardType,
        cardNumber: card.cardNumber,
        cardHolderName: card.cardHolderName,
        currentBalance: card.currentBalance,
        creditLimit: card.creditLimit,
        minimumPayment: card.minimumPayment,
        interestRate: card.interestRate,
        paymentDueDate: card.paymentDueDate ? 
          card.paymentDueDate.toISOString().split('T')[0] : '',
        lastPaymentDate: card.lastPaymentDate ? 
          card.lastPaymentDate.toISOString().split('T')[0] : '',
        notes: card.notes || ''
      });
      setIsEditing(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.cardName.trim()) {
      setError('カード名を入力してください');
      return false;
    }
    if (!formData.cardHolderName.trim()) {
      setError('カード名義人を入力してください');
      return false;
    }
    if (formData.creditLimit <= 0) {
      setError('利用枠は0より大きい値を入力してください');
      return false;
    }
    if (formData.currentBalance < 0) {
      setError('現在の残高は0以上で入力してください');
      return false;
    }
    if (formData.currentBalance > formData.creditLimit) {
      setError('現在の残高は利用枠以下で入力してください');
      return false;
    }
    if (formData.interestRate < 0 || formData.interestRate > 100) {
      setError('金利は0-100%の範囲で入力してください');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      let card: PayPayCard;

      if (isEditing && cardId && cardId !== 'new') {
        // 更新
        const updatedCard = paypayCardManager.updatePayPayCard(cardId, {
          cardName: formData.cardName.trim(),
          cardType: formData.cardType,
          cardNumber: formData.cardNumber.trim(),
          cardHolderName: formData.cardHolderName.trim(),
          currentBalance: formData.currentBalance,
          creditLimit: formData.creditLimit,
          minimumPayment: formData.minimumPayment,
          interestRate: formData.interestRate,
          paymentDueDate: formData.paymentDueDate ? new Date(formData.paymentDueDate) : undefined,
          lastPaymentDate: formData.lastPaymentDate ? new Date(formData.lastPaymentDate) : undefined,
          notes: formData.notes.trim()
        });

        if (!updatedCard) {
          throw new Error('PayPayカードの更新に失敗しました');
        }

        card = updatedCard;
      } else {
        // 新規作成
        card = paypayCardManager.createPayPayCard(userId, {
          cardName: formData.cardName.trim(),
          cardType: formData.cardType,
          cardNumber: formData.cardNumber.trim(),
          cardHolderName: formData.cardHolderName.trim(),
          currentBalance: formData.currentBalance,
          creditLimit: formData.creditLimit,
          minimumPayment: formData.minimumPayment,
          interestRate: formData.interestRate,
          paymentDueDate: formData.paymentDueDate ? new Date(formData.paymentDueDate) : undefined,
          lastPaymentDate: formData.lastPaymentDate ? new Date(formData.lastPaymentDate) : undefined,
          notes: formData.notes.trim()
        });
      }

      onSave(card);
    } catch (err) {
      console.error('PayPayカードの保存エラー:', err);
      setError(err instanceof Error ? err.message : 'PayPayカードの保存に失敗しました');
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

  const getCardTypeInfo = (cardType: string) => {
    return PAYPAY_CARD_TYPES.find(type => type.value === cardType) || PAYPAY_CARD_TYPES[0];
  };

  return (
    <div className="paypay-card-update-form-overlay">
      <div className="paypay-card-update-form">
        <div className="form-header">
          <h3>
            {isEditing ? 'PayPayカードを編集' : 'PayPayカードを追加'}
          </h3>
          <button onClick={onCancel} className="close-button">
            ✕
          </button>
        </div>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="paypay-card-form">
          {/* カード種別 */}
          <div className="form-group">
            <label htmlFor="cardType">カード種別</label>
            <select
              id="cardType"
              name="cardType"
              value={formData.cardType}
              onChange={handleInputChange}
              className="form-select"
            >
              {PAYPAY_CARD_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* カード名 */}
          <div className="form-group">
            <label htmlFor="cardName">カード名 *</label>
            <input
              type="text"
              id="cardName"
              name="cardName"
              value={formData.cardName}
              onChange={handleInputChange}
              placeholder="例: PayPayカード メイン"
              className="form-input"
              required
            />
          </div>

          {/* カード番号 */}
          <div className="form-group">
            <label htmlFor="cardNumber">カード番号（下4桁）</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              placeholder="例: ****1234"
              className="form-input"
              maxLength={8}
            />
          </div>

          {/* カード名義人 */}
          <div className="form-group">
            <label htmlFor="cardHolderName">カード名義人 *</label>
            <input
              type="text"
              id="cardHolderName"
              name="cardHolderName"
              value={formData.cardHolderName}
              onChange={handleInputChange}
              placeholder="例: TARO YAMADA"
              className="form-input"
              required
            />
          </div>

          {/* 現在の残高 */}
          <div className="form-group">
            <label htmlFor="currentBalance">現在の残高（円）</label>
            <input
              type="number"
              id="currentBalance"
              name="currentBalance"
              value={formData.currentBalance}
              onChange={handleInputChange}
              min="0"
              step="1"
              className="form-input"
            />
            <div className="input-hint">
              現在の負債残高: {formatCurrency(formData.currentBalance)}
            </div>
          </div>

          {/* 利用枠 */}
          <div className="form-group">
            <label htmlFor="creditLimit">利用枠（円） *</label>
            <input
              type="number"
              id="creditLimit"
              name="creditLimit"
              value={formData.creditLimit}
              onChange={handleInputChange}
              min="1"
              step="1"
              className="form-input"
              required
            />
            <div className="input-hint">
              利用可能枠: {formatCurrency(formData.creditLimit)}
            </div>
          </div>

          {/* 最低支払額 */}
          <div className="form-group">
            <label htmlFor="minimumPayment">最低支払額（円）</label>
            <input
              type="number"
              id="minimumPayment"
              name="minimumPayment"
              value={formData.minimumPayment}
              onChange={handleInputChange}
              min="0"
              step="1"
              className="form-input"
            />
            <div className="input-hint">
              最低支払額: {formatCurrency(formData.minimumPayment)}
            </div>
          </div>

          {/* 金利 */}
          <div className="form-group">
            <label htmlFor="interestRate">金利（年利%）</label>
            <input
              type="number"
              id="interestRate"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.1"
              className="form-input"
            />
            <div className="input-hint">
              年利: {formData.interestRate}%
            </div>
          </div>

          {/* 支払期日 */}
          <div className="form-group">
            <label htmlFor="paymentDueDate">支払期日</label>
            <input
              type="date"
              id="paymentDueDate"
              name="paymentDueDate"
              value={formData.paymentDueDate}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          {/* 最終支払日 */}
          <div className="form-group">
            <label htmlFor="lastPaymentDate">最終支払日</label>
            <input
              type="date"
              id="lastPaymentDate"
              name="lastPaymentDate"
              value={formData.lastPaymentDate}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          {/* メモ */}
          <div className="form-group">
            <label htmlFor="notes">メモ</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="カードに関するメモを入力してください"
              className="form-textarea"
              rows={3}
            />
          </div>

          {/* プレビュー */}
          <div className="form-preview">
            <h4>プレビュー</h4>
            <div className="preview-card">
              <div className="preview-header">
                <div className="preview-icon" style={{ color: getCardTypeInfo(formData.cardType).color }}>
                  {getCardTypeInfo(formData.cardType).icon}
                </div>
                <div className="preview-info">
                  <div className="preview-name">{formData.cardName || 'カード名'}</div>
                  <div className="preview-type">{getCardTypeInfo(formData.cardType).label}</div>
                </div>
              </div>
              <div className="preview-balance">
                <div className="preview-balance-item">
                  <span>残高</span>
                  <span className="debt">{formatCurrency(formData.currentBalance)}</span>
                </div>
                <div className="preview-balance-item">
                  <span>利用枠</span>
                  <span>{formatCurrency(formData.creditLimit)}</span>
                </div>
                <div className="preview-balance-item">
                  <span>利用可能額</span>
                  <span className="credit">{formatCurrency(formData.creditLimit - formData.currentBalance)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={isLoading}
            >
              {isLoading ? '保存中...' : (isEditing ? '更新' : '追加')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayPayCardUpdateForm;
