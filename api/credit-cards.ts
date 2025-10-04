import { mongoose as mongooseDB, ensureDatabaseConnection, verifyJWT as verifyAuth, handleError } from './utils/database.js';
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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

    if (req.method === 'GET') {
      // ユーザーのクレジットカードを取得
      const { isActive } = req.query;
      
      let query: any = { userId };
      
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }

      const cards = await CreditCard.find(query)
        .sort({ isPrimary: -1, createdAt: -1 });

      res.status(200).json({
        success: true,
        message: 'クレジットカードを取得しました',
        cards: cards.map(card => ({
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
          notes: card.notes || '',
          createdAt: card.createdAt.toISOString(),
          updatedAt: card.updatedAt.toISOString(),
        }))
      });

    } else if (req.method === 'POST') {
      // 新しいクレジットカードを作成
      const {
        cardName,
        cardType,
        cardNumber,
        lastFourDigits,
        expiryMonth,
        expiryYear,
        cardHolderName,
        issuer,
        creditLimit,
        currentBalance = 0,
        availableCredit,
        minimumPayment = 0,
        paymentDueDate,
        interestRate = 0,
        annualFee = 0,
        rewardProgram = '',
        isActive = true,
        isPrimary = false,
        notes = ''
      } = req.body;

      if (!cardName || !cardType || !cardNumber || !lastFourDigits || 
          !expiryMonth || !expiryYear || !cardHolderName || !issuer || 
          !creditLimit || !availableCredit || !paymentDueDate) {
        return res.status(400).json({
          success: false,
          message: '必須フィールドが不足しています',
          error: 'Missing required fields'
        });
      }

      // 利用可能枠の自動計算
      const calculatedAvailableCredit = creditLimit - currentBalance;

      const newCard = new CreditCard({
        userId,
        cardName,
        cardType,
        cardNumber,
        lastFourDigits,
        expiryMonth: parseInt(expiryMonth),
        expiryYear: parseInt(expiryYear),
        cardHolderName,
        issuer,
        creditLimit: parseFloat(creditLimit),
        currentBalance: parseFloat(currentBalance),
        availableCredit: availableCredit || calculatedAvailableCredit,
        minimumPayment: parseFloat(minimumPayment),
        paymentDueDate: new Date(paymentDueDate),
        interestRate: parseFloat(interestRate),
        annualFee: parseFloat(annualFee),
        rewardProgram,
        isActive,
        isPrimary,
        notes
      });

      await newCard.save();

      res.status(201).json({
        success: true,
        message: 'クレジットカードを作成しました',
        card: {
          id: newCard._id.toString(),
          userId: newCard.userId,
          cardName: newCard.cardName,
          cardType: newCard.cardType,
          cardNumber: newCard.cardNumber,
          lastFourDigits: newCard.lastFourDigits,
          expiryMonth: newCard.expiryMonth,
          expiryYear: newCard.expiryYear,
          cardHolderName: newCard.cardHolderName,
          issuer: newCard.issuer,
          creditLimit: newCard.creditLimit,
          currentBalance: newCard.currentBalance,
          availableCredit: newCard.availableCredit,
          minimumPayment: newCard.minimumPayment,
          paymentDueDate: newCard.paymentDueDate.toISOString(),
          interestRate: newCard.interestRate,
          annualFee: newCard.annualFee,
          rewardProgram: newCard.rewardProgram,
          isActive: newCard.isActive,
          isPrimary: newCard.isPrimary,
          notes: newCard.notes,
          createdAt: newCard.createdAt.toISOString(),
          updatedAt: newCard.updatedAt.toISOString(),
        }
      });

    } else {
      return res.status(405).json({
        success: false,
        message: 'メソッドが許可されていません',
        error: 'Method not allowed'
      });
    }

  } catch (error) {
    console.error('❌ Credit Card API error:', error);
    return handleError(res, error, 'クレジットカード処理中にエラーが発生しました');
  }
}
