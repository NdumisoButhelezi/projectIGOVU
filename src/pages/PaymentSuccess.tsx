import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logTransaction } from '../services/logTransaction';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { app } from '../config/firebase';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  // Try to get delivery from state, fallback to query param
  let deliveryChosen = location.state?.delivery;
  if (deliveryChosen === undefined) {
    const params = new URLSearchParams(window.location.search);
    deliveryChosen = params.get('delivery') === '1';
  }

  useEffect(() => {
    // Only log transaction after payment success
    async function logIfNeeded() {
      // Prevent duplicate logging
      if (window.sessionStorage.getItem('tx-logged')) return;

      // Get cart/items and user info from localStorage (or however you store it)
      const items = JSON.parse(localStorage.getItem('cart') || '[]');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const amount = Number(localStorage.getItem('lastAmount') || 0);
      const deliveryMethod = localStorage.getItem('lastDeliveryMethod') || (deliveryChosen ? 'delivery' : 'pickup');
      const deliveryAddress = localStorage.getItem('lastDeliveryAddress') || (deliveryMethod === 'delivery'
        ? localStorage.getItem('lastDeliveryAddress') || ''
        : 'Pickup');
      const deliveryFee = localStorage.getItem('lastDeliveryFee') || '0';

      // Only log if we have items and user info
      if (items.length && user?.email) {
        await logTransaction({
          customerName: user.name || '',
          customerEmail: user.email,
          userId: user.uid || '',
          amount,
          deliveryMethod,
          deliveryAddress,
          deliveryFee,
          status: 'initiated',
          items,
        });

        // Update stock for each product in Firestore
        const db = getFirestore(app);
        for (const item of items) {
          if (!item.id || typeof item.quantity !== 'number') continue;
          const productRef = doc(db, 'products', String(item.id));
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            const currentStock = productSnap.data().stock ?? 0;
            const newStock = Math.max(0, currentStock - item.quantity);
            await updateDoc(productRef, { stock: newStock });
          }
        }

        window.sessionStorage.setItem('tx-logged', '1');
        // Optionally clear cart
        localStorage.removeItem('cart');
      }
    }
    logIfNeeded();

    // Redirect to order history after short delay
    const timer = setTimeout(() => {
      navigate('/order-history');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Payment Successful!</h1>
      <p className="mb-6 text-lg text-green-800">Thank you for your purchase. Your payment was confirmed.</p>
      <p className="text-green-700">Redirecting to your order history...</p>
      <button
        className="mt-4 px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800"
        onClick={() => navigate('/order-history')}
      >
        View Order History
      </button>
    </div>
  );
}
  