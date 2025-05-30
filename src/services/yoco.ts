const API_URL = 'http://localhost:4000/api';

interface CreateCheckoutParams {
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
  metadata?: Record<string, any>;
}

export const createCheckout = async (params: CreateCheckoutParams) => {
  const res = await fetch(`${API_URL}/yoco-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    let errorText = '';
    let errorBody: any = null;
    try {
      errorBody = await res.json();
      errorText = errorBody.error?.message || JSON.stringify(errorBody) || 'Failed to create checkout';
    } catch {
      // If not JSON, try to get plain text
      errorText = await res.text();
    }
    throw new Error(errorText || 'Failed to create checkout');
  }
  return await res.json();
};

export const verifyPayment = async (checkoutId: string) => {
  const res = await fetch(`${API_URL}/yoco-checkout/${checkoutId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Failed to verify payment');
  }
  return await res.json();
};