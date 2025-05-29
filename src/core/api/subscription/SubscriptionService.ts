export class SubscriptionService {
  private static instance: SubscriptionService;
  
  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }
  
  async getSubscriptionInfo(): Promise<any> {
    return { plan: 'free', active: true };
  }
}

export default SubscriptionService;