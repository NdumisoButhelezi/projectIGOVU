import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../config/firebase';

export default function DeliveryInfo() {
  const { currentUser } = useAuth();
  const [transaction, setTransaction] = useState<any>(null);
  const [productsMap, setProductsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    // Retrieve transaction details from local storage
    const storedTransaction = localStorage.getItem('transaction');
    if (storedTransaction) {
      setTransaction(JSON.parse(storedTransaction));
    }
  }, []);

  // Fetch all admin products and map by id for quick lookup
  useEffect(() => {
    async function fetchProducts() {
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'products'));
      const map: Record<string, any> = {};
      snap.docs.forEach(doc => {
        map[doc.id.toString()] = { id: doc.id.toString(), ...doc.data() };
      });
      setProductsMap(map);
    }
    fetchProducts();
  }, []);

  if (!transaction) {
    return <div className="p-8 text-center">No recent orders found.</div>;
  }

  const isDelivery = transaction.deliveryMethod === 'delivery';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-2xl font-bold mb-4">{isDelivery ? 'Delivery Information' : 'Pickup Information'}</h1>
      {isDelivery ? (
        <div className="bg-gray-50 p-6 rounded-lg shadow max-w-md w-full mb-8">
          <div className="mb-2"><span className="font-semibold">Address:</span> {transaction.deliveryAddress}</div>
          <div className="mb-2"><span className="font-semibold">Amount Paid:</span> R {(transaction.amount).toFixed(2)}</div>
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg shadow max-w-md w-full mb-8">
          <div className="mb-2"><span className="font-semibold">Pickup Address:</span> 21 Bonamour Avenue</div>
          <div className="mb-2"><span className="font-semibold">Amount Paid:</span> R {(transaction.amount).toFixed(2)}</div>
        </div>
      )}

      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4 text-black">Your Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {(transaction.items || []).map((item: any, idx: number) => {
            const productId = (item.id ?? '').toString();
            const product = productsMap[productId];
            return (
              <div key={idx} className="border border-black rounded-xl bg-white shadow flex flex-col items-center p-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center mb-2">
                  {product?.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-xs text-gray-400">No Image</span>
                  )}
                </div>
                <div className="text-sm font-semibold text-black text-center mb-1">{product?.name || 'Unknown Product'}</div>
                <div className="text-xs text-gray-600 mb-1">x{item.quantity}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
