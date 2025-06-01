import React, { useState } from 'react';
import { X, Truck, MapPin } from 'lucide-react';
import { CartItem, CheckoutFormData } from '../types';
import { createCheckout as createCheckoutBase } from '../services/yoco';
import { useAuth } from '../contexts/AuthContext';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
}

export default function Checkout({ isOpen, onClose, items }: CheckoutProps) {
  const { currentUser } = useAuth();
  const [step, setStep] = useState<'delivery' | 'processing'>('delivery');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    name: '',
    address: '',
    city: '',
    country: '',
    zipCode: '',
    deliveryMethod: 'delivery'
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = formData.deliveryMethod === 'delivery' && items.length === 1 ? 60 : 0;
  const finalTotal = total + deliveryFee;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Determine API base URL
  const API_BASE_URL =
    window.location.hostname.endsWith('.vercel.app') || window.location.hostname === 'project-igovu.vercel.app'
      ? 'https://project-igovu.vercel.app/api'
      : 'http://localhost:4000/api';

  // Call createCheckoutBase with the correct base URL
  const createCheckout = (data: any) => createCheckoutBase(data);

  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setError(null);

    try {
      const checkoutData = {
        amount: Math.round(finalTotal * 100),
        currency: 'ZAR',
        successUrl: `${window.location.origin.replace('http://', 'https://')}/payment-success`,
        cancelUrl: `${window.location.origin.replace('http://', 'https://')}/payment-cancelled`,
        failureUrl: `${window.location.origin.replace('http://', 'https://')}/payment-failed`,
        metadata: {
          customerName: formData.name,
          customerEmail: currentUser?.email || '',
          deliveryMethod: formData.deliveryMethod,
          deliveryAddress: formData.deliveryMethod === 'delivery' 
            ? `${formData.address}, ${formData.city}, ${formData.country}` 
            : 'Pickup',
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        }
      };

      const checkout = await createCheckout(checkoutData);
      
      if (checkout.redirectUrl) {
        window.location.href = checkout.redirectUrl;
      } else {
        throw new Error('No redirect URL received from Yoco');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to create checkout. Please try again.');
      setStep('delivery');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg max-w-md w-full p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {step === 'delivery' && (
            <form onSubmit={handleSubmitDelivery}>
              <h2 className="text-2xl font-bold mb-6">Delivery Method 🚚</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'delivery' }))}
                    className={`flex-1 p-4 rounded-lg border-2 ${
                      formData.deliveryMethod === 'delivery' 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-200 hover:border-black'
                    }`}
                  >
                    <Truck className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Delivery</div>
                    <div className="text-sm mt-1">
                      {items.length > 1 ? 'Free Delivery! 🎉' : formatCurrency(60) + ' to nearest Pep Store'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'pickup' }))}
                    className={`flex-1 p-4 rounded-lg border-2 ${
                      formData.deliveryMethod === 'pickup' 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-200 hover:border-black'
                    }`}
                  >
                    <MapPin className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">Pickup</div>
                    <div className="text-sm mt-1">Durban & Joburg areas 📍</div>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name 👤</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    autoCapitalize="words"
                    autoComplete="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm py-2 px-3"
                  />
                </div>

                {formData.deliveryMethod === 'delivery' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address 🏠</label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City 🌆</label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">ZIP Code 📮</label>
                        <input
                          type="text"
                          name="zipCode"
                          required
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country 🌍</label>
                      <select
                        name="country"
                        required
                        value={formData.country}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      >
                        <option value="">Select country</option>
                        <option value="ZA">South Africa</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="border-t pt-6">
                  <div className="flex justify-between text-lg font-medium mb-4">
                    <span>Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <span>Delivery Fee</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary"
                >
                  Proceed to Payment 💳
                </button>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-lg">Processing your payment... 🔄</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}