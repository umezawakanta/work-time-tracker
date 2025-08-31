import { api } from './apiConfig';

export interface SubscriptionStatusResponse {
  plan: string | null;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | null;
  renewAt?: string | null;
  card?: { last4: string; brand: string } | null;
}

export interface CheckoutRequest {
  planId: string;
}

export interface CheckoutResponse {
  sessionUrl: string;
}

export interface PortalResponse {
  url: string;
}

export interface CancelRequest {
  atPeriodEnd?: boolean;
}

export interface CancelResponse {
  success: boolean;
}

export const getSubscriptionStatus = async (): Promise<SubscriptionStatusResponse> => {
  const { data } = await api.get<SubscriptionStatusResponse>('/subscription/status');
  return data;
};

export const startCheckout = async (body: CheckoutRequest): Promise<CheckoutResponse> => {
  const { data } = await api.post<CheckoutResponse>('/subscription/checkout', body);
  return data;
};

export const openPortal = async (): Promise<PortalResponse> => {
  const { data } = await api.post<PortalResponse>('/subscription/portal', {});
  return data;
};

export const cancelSubscriptionGateway = async (body: CancelRequest): Promise<CancelResponse> => {
  const { data } = await api.post<CancelResponse>('/subscription/cancel', body);
  return data;
};

const subscriptionGatewayApi = {
  getSubscriptionStatus,
  startCheckout,
  openPortal,
  cancelSubscriptionGateway,
};

export default subscriptionGatewayApi;
