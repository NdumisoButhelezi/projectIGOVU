import React, { useState, useEffect } from 'react';
import { X, Truck, MapPin } from 'lucide-react';
import { CartItem, CheckoutFormData } from '../types';
import { createCheckout as createCheckoutBase } from '../services/yoco';
import { useAuth } from '../contexts/AuthContext';
import OSMAddressInput from './OSMAddressInput';
import { logTransaction } from '../services/logTransaction';
import { buildApiUrl, API_ENDPOINTS, debugApiConfig } from '../utils/api-config';

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
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [isFetchingDeliveryFee, setIsFetchingDeliveryFee] = useState(false);
  const [deliveryFeeError, setDeliveryFeeError] = useState<string | null>(null);
  const [availableRates, setAvailableRates] = useState<any[]>([]);
  const [geoAddress, setGeoAddress] = useState<any>(null);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = total + (deliveryFee || 0);

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

  useEffect(() => {
    // Debug API configuration on component mount
    debugApiConfig();
  }, []);

  // Call createCheckoutBase with the correct proxy URL
  const createCheckout = async (data: any) => {
    try {
      const apiUrl = buildApiUrl(API_ENDPOINTS.YOCO_CHECKOUT);
      console.log('Creating Yoco checkout with URL:', apiUrl);
      console.log('Checkout payload:', JSON.stringify(data, null, 2));
      
      const response = await createCheckoutBase(data, apiUrl);
      console.log('Yoco Checkout API Response:', response);
      return response;
    } catch (error: any) {
      console.error('Yoco Checkout API Error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Extract meaningful error message
      let errorMessage = 'Checkout failed';
      if (error.response?.data?.details) {
        errorMessage = `Yoco API Error: ${JSON.stringify(error.response.data.details)}`;
      } else if (error.response?.data?.error) {
        errorMessage = `${error.response.data.error}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  // Fetch delivery fee from Courier Guy API when delivery details change
  useEffect(() => {
    async function fetchDeliveryFee() {
      if (
        formData.deliveryMethod === 'delivery' &&
        formData.address &&
        formData.city &&
        formData.country &&
        formData.zipCode &&
        formData.name // Ensure customerName is not empty
      ) {
        setIsFetchingDeliveryFee(true);
        setDeliveryFeeError(null);
        try {
          const apiUrl = buildApiUrl(API_ENDPOINTS.COURIERGUY_QUOTE);

          const collection_address = {
            type: 'business',
            company: 'iGovu Clothing',
            street_address: 'Block Y Unit 33',
            local_area: 'Glebelands',
            city: 'uMlazi',
            zone: 'KwaZulu-Natal',
            country: 'ZA',
            code: '4031',
            lat: -29.9707,
            lng: 30.9188,
          };

          const delivery_address = {
            type: 'residential',
            company: formData.name, // Ensure customerName is included
            street_address: formData.address,
            local_area: '',
            city: formData.city,
            zone: formData.city || 'Durban',
            country: formData.country,
            code: formData.zipCode,
            lat: geoAddress?.properties?.lat || null,
            lng: geoAddress?.properties?.lon || null,
          };

          const parcels = items.map(item => ({
            submitted_length_cm: item.length_cm ?? 20,
            submitted_width_cm: item.width_cm ?? 20,
            submitted_height_cm: item.height_cm ?? 10,
            submitted_weight_kg: item.weight_kg ?? 1,
          }));

          const declared_value = total;

          const payload = {
            metadata: {
              deliveryMethod: formData.deliveryMethod,
              customerName: formData.name,
              deliveryAddress: `${formData.address}, ${formData.city}, ${formData.country}`,
            },
            collection_address,
            delivery_address,
            parcels,
            declared_value,
          };

          console.log('Payload being sent to /api/courierguy-quote:', JSON.stringify(payload, null, 2)); // Debug log

          const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setDeliveryFeeError(data.error ? JSON.stringify(data.error) : 'Failed to fetch delivery quote');
            setDeliveryFee(null);
            setAvailableRates([]);
            return;
          }

          const data = await res.json();
          let fee = 0;
          let availableRates = [];
          if (data.rates && Array.isArray(data.rates) && data.rates.length > 0) {
            availableRates = data.rates;
            fee = data.rates[0].rate;
          }
          setDeliveryFee(fee);
          setAvailableRates(availableRates);
          console.log('CourierGuy Quote API response:', data);
        } catch (err) {
          setDeliveryFeeError('Could not fetch delivery fee. Please check your address or try again later.');
          setDeliveryFee(null);
          console.error('CourierGuy Quote Error:', err);
        } finally {
          setIsFetchingDeliveryFee(false);
        }
      } else {
        setDeliveryFee(null);
      }
    }
    fetchDeliveryFee();
  }, [formData.deliveryMethod, formData.address, formData.city, formData.country, formData.zipCode, formData.name, items]);

  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setError(null);

    try {
      const transactionData = {
        customerName: formData.name,
        customerEmail: currentUser?.email || '',
        amount: finalTotal,
        deliveryMethod: formData.deliveryMethod,
        deliveryAddress: formData.deliveryMethod === 'delivery'
          ? `${formData.address}, ${formData.city}, ${formData.country}`
          : 'Pickup',
        deliveryFee: String(deliveryFee ?? 0), // Convert deliveryFee to string
        items: items.map(item => ({ id: item.id, quantity: item.quantity })),
        status: 'initiated',
        timestamp: new Date().toISOString(),
      };

      // First log the transaction
      const transactionRef = await logTransaction(transactionData);

      // Deplete stock with better error handling and retry logic
      const stockUpdatePromises = items.map(async (item) => {
        try {
          const stockSyncUrl = buildApiUrl(API_ENDPOINTS.SYNC_STOCK);
          console.log(`Syncing stock for product ${item.id} at URL: ${stockSyncUrl}`);
          
          const response = await fetch(stockSyncUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              productId: item.id, 
              quantity: item.quantity,
              action: 'reduce',
              transactionId: transactionRef?.id || 'unknown',
            }),
          });

          if (!response.ok) {
            // Even if the API fails, we continue with checkout since the queue will handle retries
            const errorData = await response.json().catch(() => ({}));
            console.warn(
              `Stock sync warning for product ID ${item.id}: HTTP ${response.status}`,
              errorData
            );
            return { success: false, productId: item.id, error: errorData };
          }
          
          const responseData = await response.json();
          console.log(`Stock sync success for product ID ${item.id}`, responseData);
          return { success: true, productId: item.id, data: responseData };
        } catch (error) {
          // Log the error but don't block the checkout
          console.error(`Stock sync error for product ID ${item.id}:`, error);
          return { 
            success: false, 
            productId: item.id, 
            error: error instanceof Error ? error.message : String(error) 
          };
        }
      });
      
      // Wait for all stock updates to complete (success or failure)
      const stockResults = await Promise.allSettled(stockUpdatePromises);
      console.log('Stock sync results:', stockResults);
      
      // Record any failed stock updates to retry later
      const failedUpdates = stockResults
        .filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
        .map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason });
      
      if (failedUpdates.length > 0) {
        console.warn(`${failedUpdates.length} stock updates failed, will retry later:`, failedUpdates);
      }

      const checkoutData = {
        amount: Math.round(finalTotal * 100),
        currency: 'ZAR',
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancelled`,
        failureUrl: `${window.location.origin}/payment-failed`,
        metadata: {
          customerName: String(formData.name),
          customerEmail: String(currentUser?.email || ''),
          deliveryMethod: String(formData.deliveryMethod),
          deliveryAddress: String(
            formData.deliveryMethod === 'delivery'
              ? `${formData.address}, ${formData.city}, ${formData.country}`
              : 'Pickup'
          ),
          deliveryFee: String(deliveryFee ?? 0),
          items: items.map(item => ({ id: item.id, quantity: item.quantity })), // Store items as an array
        }
      };

      const checkout = await createCheckout(checkoutData);
      console.log('Checkout response:', checkout);
      
      if (checkout.redirectUrl) {
        console.log('Redirecting to Yoco checkout:', checkout.redirectUrl);
        window.location.href = checkout.redirectUrl;
      } else if (checkout.url) {
        console.log('Redirecting to Yoco checkout (url field):', checkout.url);
        window.location.href = checkout.url;
      } else {
        console.error('No redirect URL received from Yoco:', checkout);
        throw new Error('No redirect URL received from Yoco');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      console.error('Full error object:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      // Extract meaningful error message for user
      let userErrorMessage = 'Failed to create checkout. Please try again.';
      if (error.message.includes('Yoco API Error')) {
        userErrorMessage = error.message;
      } else if (error.response?.data?.details) {
        userErrorMessage = `Payment failed: ${JSON.stringify(error.response.data.details)}`;
      } else if (error.message) {
        userErrorMessage = error.message;
      }
      
      setError(userErrorMessage);
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
                      {isFetchingDeliveryFee
                        ? 'Fetching delivery fee...'
                        : deliveryFeeError
                        ? 'Error fetching delivery fee'
                        : deliveryFee !== null
                        ? formatCurrency(deliveryFee)
                        : 'Enter address for quote'}
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
                    <OSMAddressInput
                      value={formData.address}
                      onSelect={result => {
                        setGeoAddress(result);
                        setFormData(prev => ({
                          ...prev,
                          address: result?.properties?.address_line1 || result?.properties?.formatted || '',
                          city: result?.properties?.city || '',
                          zipCode: result?.properties?.postcode || '',
                          country: result?.properties?.country_code?.toUpperCase() || '',
                        }));
                      }}
                    />
                  </div>
                )}

                <div className="border-t pt-6">
                  <div className="flex justify-between text-lg font-medium mb-4">
                    <span>Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  {formData.deliveryMethod === 'delivery' && (
                    <>
                      {isFetchingDeliveryFee && (
                        <div className="flex justify-between text-sm text-gray-600 mb-4">
                          <span>Delivery Fee</span>
                          <span>Fetching...</span>
                        </div>
                      )}
                      {deliveryFeeError && (
                        <div className="flex justify-between text-sm text-red-600 mb-4">
                          <span>Delivery Fee</span>
                          <span>{deliveryFeeError}</span>
                        </div>
                      )}
                      {deliveryFee !== null && !isFetchingDeliveryFee && !deliveryFeeError && (
                        <div className="flex justify-between text-sm text-gray-600 mb-4">
                          <span>Delivery Fee</span>
                          <span>{formatCurrency(deliveryFee)}</span>
                        </div>
                      )}

                      {availableRates.length > 1 && (
                        <div className="mb-4">
                          <div className="font-semibold mb-2">Choose a delivery option:</div>
                          {availableRates.map((rate, idx) => (
                            <div key={idx} className="flex justify-between items-center mb-2 p-2 border rounded">
                              <div>
                                <div className="font-medium">{rate.service_level?.name || 'Option ' + (idx + 1)}</div>
                                <div className="text-xs text-gray-500">{rate.service_level?.description}</div>
                              </div>
                              <button
                                type="button"
                                className={`px-3 py-1 rounded ${deliveryFee === rate.rate ? 'bg-black text-white' : 'bg-gray-100'}`}
                                onClick={() => setDeliveryFee(rate.rate)}
                              >
                                {formatCurrency(rate.rate)}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={formData.deliveryMethod === 'delivery' && (isFetchingDeliveryFee || !!deliveryFeeError || deliveryFee === null)}
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