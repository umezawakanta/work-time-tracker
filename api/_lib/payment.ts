export class PaymentService {
  private static instance: PaymentService | null = null;

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async recordPayment(data: Record<string, unknown>): Promise<void> {
    console.log('[PaymentService] recordPayment', data);
  }
}


