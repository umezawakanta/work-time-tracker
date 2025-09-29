// 仮想通貨表示コンポーネント

import React, { useState, useEffect } from 'react';
import { currencyManager } from '../utils/currencyManager';
import { CURRENCIES } from '../types/currency';
import './CurrencyDisplay.css';

interface CurrencyDisplayProps {
  userId: string;
  showDetails?: boolean;
  className?: string;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  userId,
  showDetails = false,
  className = ''
}) => {
  const [currencies, setCurrencies] = useState<{ [key: string]: number }>({});
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadCurrencies();
  }, [userId]);

  const loadCurrencies = () => {
    const userCurrencies: { [key: string]: number } = {};
    
    Object.keys(CURRENCIES).forEach(currencyId => {
      userCurrencies[currencyId] = currencyManager.getUserCurrency(userId, currencyId as any);
    });
    
    setCurrencies(userCurrencies);
  };

  const getTotalValue = () => {
    return Object.values(currencies).reduce((total, amount) => total + amount, 0);
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  if (!showDetails) {
    return (
      <div className={`currency-display-simple ${className}`}>
        <div className="currency-icon">🪙</div>
        <div className="currency-amount">{formatAmount(getTotalValue())}</div>
      </div>
    );
  }

  return (
    <div className={`currency-display ${className}`}>
      <div 
        className="currency-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="currency-icon">🪙</div>
        <div className="currency-total">
          <span className="currency-label">総資産</span>
          <span className="currency-amount">{formatAmount(getTotalValue())}</span>
        </div>
        <div className={`currency-toggle ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </div>
      </div>

      {isExpanded && (
        <div className="currency-details">
          {Object.entries(currencies).map(([currencyId, amount]) => {
            const currency = CURRENCIES[currencyId as keyof typeof CURRENCIES];
            return (
              <div key={currencyId} className="currency-item">
                <div className="currency-item-icon">{currency.icon}</div>
                <div className="currency-item-info">
                  <div className="currency-item-name">{currency.name}</div>
                  <div className="currency-item-amount">{formatAmount(amount)}</div>
                </div>
              </div>
            );
          })}
          
          <div className="currency-actions">
            <button 
              className="currency-refresh-btn"
              onClick={loadCurrencies}
              title="更新"
            >
              🔄
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyDisplay;
