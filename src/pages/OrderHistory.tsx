import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import { app } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const OrderHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsMap, setProductsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!currentUser) return;
    const db = getFirestore(app);
    const q = query(
      collection(db, 'transactions'),
      where('customerEmail', '==', currentUser.email), // Match by email
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Fetch all products and map by id for quick lookup
  useEffect(() => {
    async function fetchProducts() {
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, 'products'));
      const map: Record<string, any> = {};
      snap.docs.forEach(doc => {
        map[doc.id] = { id: doc.id, ...doc.data() };
      });
      setProductsMap(map);
    }
    fetchProducts();
  }, []);

  if (!currentUser) return <div className="p-8 text-center">Please log in to view your order history.</div>;
  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 pt-24 md:pt-20"> {/* Adjusted padding for mobile */}
      <h2 className="text-3xl font-bold mb-8 text-black">Order History</h2>
      {orders.length === 0 ? (
        <div className="text-gray-500">No delivered or picked up orders yet.</div>
      ) : (
        <div className="space-y-8">
          {orders.map(order => (
            <div
              key={order.id}
              className="border border-black rounded-xl bg-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between p-6"
            >
              <div className="flex-1">
                <div className="font-semibold text-lg text-black mb-1">Order #{order.id.slice(-6).toUpperCase()}</div>
                <div className="text-xs text-gray-500 mb-2">{new Date(order.timestamp?.toDate?.() || order.timestamp).toLocaleString()}</div>
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: order.status === 'delivered' || order.status === 'Delivered' || order.status === 'picked up' || order.status === 'Picked Up'
                        ? '#000'
                        : '#f3f3f3',
                      color: order.status === 'delivered' || order.status === 'Delivered' || order.status === 'picked up' || order.status === 'Picked Up'
                        ? '#fff'
                        : '#222'
                    }}>
                    {order.status}
                  </span>
                  <span className="ml-2 text-xs text-gray-700">
                    {order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}
                  </span>
                </div>
                {order.trackingNote && <div className="text-xs text-blue-700 mb-2">Note: {order.trackingNote}</div>}
                <div className="text-xs text-gray-700 mb-2">Total: <span className="font-bold text-black">R{(() => {
                  // Apply same amount formatting logic as other components
                  const amount = Number(order.amount);
                  if (amount >= 1000 && Math.floor(amount) === amount) {
                    return (amount / 100).toFixed(2);
                  }
                  return amount.toFixed(2);
                })()}</span></div> {/* Fixed formatting */}
                {order.deliveryMethod === 'pickup' && (
                  <div className="text-xs text-gray-700 mb-2">Pickup Address: <span className="font-semibold text-black">21 Bonamour Avenue</span></div>
                )}
                {order.deliveryMethod === 'delivery' && (
                  <div className="text-xs text-gray-700 mb-2">Delivery Address: <span className="font-semibold text-black">{order.deliveryAddress}</span></div>
                )}
              </div>
              <div className="flex flex-row flex-wrap gap-4 mt-4 md:mt-0 md:ml-8">
                {(order.items || []).map((item: any, idx: number) => {
                  // Try to get product info from Firestore, fallback to item itself
                  const productId = (item.productId ?? item.id ?? '').toString();
                  const product = productsMap[productId] || item;
                  const productName = product.name || productId; // Show name or fallback to ID
                  
                  return (
                    <div key={idx} className="flex flex-col items-center w-24">
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center mb-1">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={productName} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-xs text-gray-400">No Image</span>
                        )}
                      </div>
                      <div className="text-xs text-black font-semibold text-center truncate" title={productName}>
                        {productName}
                      </div>
                      <div className="text-xs text-gray-600">x{item.quantity}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
