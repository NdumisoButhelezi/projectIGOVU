import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

interface CreateCheckoutParams {
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
  metadata?: Record<string, any>;
}

export const createCheckout = async (params: CreateCheckoutParams, baseUrl?: string) => {
  const apiUrl = baseUrl ? `${baseUrl}/yoco-checkout` : '/api/yoco-checkout';
  const res = await axios.post(apiUrl, params, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.data;
};

export const verifyPayment = async (checkoutId: string) => {
  const res = await fetch(`${API_URL}/yoco-checkout/${checkoutId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Failed to verify payment');
  }
  return await res.json();
};