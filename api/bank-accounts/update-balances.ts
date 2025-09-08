const { VercelRequest, VercelResponse } = require('@vercel/node');
const { FinancialDataService } = require('../../src/database/services/FinancialDataService');

// データベースサービス
const financialService = FinancialDataService.getInstance();

async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const { userId, accountId, balance } = req.body;

    if (!userId || !accountId || balance === undefined) {
      return res.status(400).json({
        success: false,
        message: 'userId, accountId, and balance are required',
      });
    }

    // Update bank account balance
    const updatedAccount = await financialService.updateBankAccountBalance(accountId, balance);

    if (!updatedAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bank account balance updated successfully',
      data: updatedAccount,
    });
  } catch (error) {
    console.error('Update bank account balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

module.exports = handler;
