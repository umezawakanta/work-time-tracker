import { mongoose as mongooseDB, ensureDatabaseConnection, verifyJWT as verifyAuth, handleError } from '../utils/database.js';
import dotenv from 'dotenv';
import { VercelRequest, VercelResponse } from '@vercel/node';

dotenv.config();

// Credit Card Schema
const CreditCardSchema = new mongooseDB.Schema({
  userId: { type: String, required: true, index: true },
  cardName: { type: String, required: true },
  cardType: { 
    type: String, 
    enum: ['visa', 'mastercard', 'jcb', 'amex', 'diners', 'discover', 'other'], 
    required: true 
  },
  cardNumber: { type: String, required: true },
  lastFourDigits: { type: String, required: true },
  expiryMonth: { type: Number, required: true, min: 1, max: 12 },
  expiryYear: { type: Number, required: true },
  cardHolderName: { type: String, required: true },
  issuer: { type: String, required: true },
  creditLimit: { type: Number, required: true, min: 0 },
  currentBalance: { type: Number, default: 0, min: 0 },
  availableCredit: { type: Number, required: true, min: 0 },
  minimumPayment: { type: Number, default: 0, min: 0 },
  paymentDueDate: { type: Date, required: true },
  interestRate: { type: Number, default: 0, min: 0 },
  annualFee: { type: Number, default: 0, min: 0 },
  rewardProgram: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isPrimary: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 更新時にupdatedAtを自動更新
CreditCardSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const CreditCard = (mongooseDB.models['CreditCard'] as any) || mongooseDB.model('CreditCard', CreditCardSchema);

// CORS設定
const setCorsHeaders = (res: VercelResponse, origin: string | undefined) => {
  const allowedOrigins = ['http://localhost:9000', 'https://work-time-tracker-five.vercel.app'];
  const isPreview = origin && /^https:\/\/work-time-tracker-five-[a-z0-9-]+\.vercel\.app$/.test(origin);
  const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isPreview);

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { origin } = req.headers;
  setCorsHeaders(res, origin);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await ensureDatabaseConnection();

    const userInfo = await verifyAuth(req);
    if (!userInfo) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です',
        error: 'Authentication required'
      });
    }

    const userId = userInfo.id || userInfo.userId;
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'カードのIDが必要です',
        error: 'Card ID required'
      });
    }

    if (req.method === 'GET') {
      // 特定のクレジットカードを取得
      const card = await CreditCard.findOne({ _id: id, userId });
      
      if (!card) {
        return res.status(404).json({
          success: false,
          message: 'クレジットカードが見つかりません',
          error: 'Card not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'クレジットカードを取得しました',
        card: {
          id: card._id.toString(),
          userId: card.userId,
          cardName: card.cardName,
          cardType: card.cardType,
          cardNumber: card.cardNumber,
          lastFourDigits: card.lastFourDigits,
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          cardHolderName: card.cardHolderName,
          issuer: card.issuer,
          creditLimit: card.creditLimit,
          currentBalance: card.currentBalance,
          availableCredit: card.availableCredit,
          minimumPayment: card.minimumPayment,
          paymentDueDate: card.paymentDueDate.toISOString(),
          interestRate: card.interestRate,
          annualFee: card.annualFee,
          rewardProgram: card.rewardProgram,
          isActive: card.isActive,
          isPrimary: card.isPrimary,
          notes: card.notes,
          createdAt: card.createdAt.toISOString(),
          updatedAt: card.updatedAt.toISOString(),
        }
      });

    } else if (req.method === 'PUT') {
      // クレジットカードを更新
      const updateData = req.body || {};
      
      // 日付フィールドを変換
      if (updateData.paymentDueDate) {
        updateData.paymentDueDate = new Date(updateData.paymentDueDate);
      }
      
      // 数値フィールドを変換
      if (updateData.creditLimit) {
        updateData.creditLimit = parseFloat(updateData.creditLimit);
      }
      if (updateData.currentBalance) {
        updateData.currentBalance = parseFloat(updateData.currentBalance);
      }
      if (updateData.availableCredit) {
        updateData.availableCredit = parseFloat(updateData.availableCredit);
      }
      if (updateData.minimumPayment) {
        updateData.minimumPayment = parseFloat(updateData.minimumPayment);
      }
      if (updateData.interestRate) {
        updateData.interestRate = parseFloat(updateData.interestRate);
      }
      if (updateData.annualFee) {
        updateData.annualFee = parseFloat(updateData.annualFee);
      }

      // 利用可能枠の自動計算
      if (updateData.creditLimit !== undefined && updateData.currentBalance !== undefined) {
        updateData.availableCredit = updateData.creditLimit - updateData.currentBalance;
      }

      const card = await CreditCard.findOneAndUpdate(
        { _id: id, userId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!card) {
        return res.status(404).json({
          success: false,
          message: 'クレジットカードが見つかりません',
          error: 'Card not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'クレジットカードを更新しました',
        card: {
          id: card._id.toString(),
          userId: card.userId,
          cardName: card.cardName,
          cardType: card.cardType,
          cardNumber: card.cardNumber,
          lastFourDigits: card.lastFourDigits,
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          cardHolderName: card.cardHolderName,
          issuer: card.issuer,
          creditLimit: card.creditLimit,
          currentBalance: card.currentBalance,
          availableCredit: card.availableCredit,
          minimumPayment: card.minimumPayment,
          paymentDueDate: card.paymentDueDate.toISOString(),
          interestRate: card.interestRate,
          annualFee: card.annualFee,
          rewardProgram: card.rewardProgram,
          isActive: card.isActive,
          isPrimary: card.isPrimary,
          notes: card.notes,
          createdAt: card.createdAt.toISOString(),
          updatedAt: card.updatedAt.toISOString(),
        }
      });

    } else if (req.method === 'DELETE') {
      // クレジットカードを削除
      const card = await CreditCard.findOneAndDelete({ _id: id, userId });
      
      if (!card) {
        return res.status(404).json({
          success: false,
          message: 'クレジットカードが見つかりません',
          error: 'Card not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'クレジットカードを削除しました'
      });

    } else {
      return res.status(405).json({
        success: false,
        message: 'メソッドが許可されていません',
        error: 'Method not allowed'
      });
    }

  } catch (error) {
    console.error('❌ Credit Card Detail API error:', error);
    return handleError(res, error, 'クレジットカード処理中にエラーが発生しました');
  }
}
