export class EmailService {
  private static instance: EmailService | null = null;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendPaymentFailureNotification(payload: Record<string, unknown>): Promise<void> {
    console.log('[EmailService] sendPaymentFailureNotification', payload);
  }
}


