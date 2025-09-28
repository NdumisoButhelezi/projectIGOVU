import React, { useState, useEffect } from "react";
import AdminUpload from "./AdminUpload";
import { collection, getDocs, getFirestore, updateDoc, doc, deleteDoc, addDoc } from "firebase/firestore";
import { app } from "../config/firebase";
import { useNavigate } from "react-router-dom";

// Simple Toast component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow z-50 animate-fade-in">
    {message}
    <button className="ml-4" onClick={onClose}>✕</button>
  </div>
);

import LoadingSpinner from './LoadingSpinner';

export default function AdminDashboard() {
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [trackingEditId, setTrackingEditId] = useState<string | null>(null);
  const [trackingNote, setTrackingNote] = useState<string>("");
  const [txSearch, setTxSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const db = getFirestore(app);
  const navigate = useNavigate();

  // Fetch transactions
  useEffect(() => {
    async function fetchTransactions() {
      setLoadingTransactions(true);
      try {
        const querySnapshot = await getDocs(collection(db, "transactions"));
        const transactionsList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            items: Array.isArray(data.items) ? data.items : [],
            customerName: data.customerName || '',
            customerEmail: data.customerEmail || '',
            amount: Number(data.amount) || 0,
            deliveryMethod: data.deliveryMethod || '',
            status: data.status || 'pending',
            deliveryAddress: data.deliveryAddress || '',
            trackingNote: data.trackingNote || '',
            date: data.date || data.timestamp || null
          };
        });
        setTransactions(transactionsList);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setToast("Error loading transactions. Please try again.");
      } finally {
        setLoadingTransactions(false);
      }
    }
    fetchTransactions();
  }, [db]);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      setLoadingProducts(true);
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            name: data.name || '',
            price: Number(data.price) || 0,
            sizes: data.sizes || '',
            category: data.category || '',
            stock: Number(data.stock) || 0,
            originalStock: Number(data.originalStock) || Number(data.baseStock) || Number(data.stock) || 0
          };
        });
        setProducts(productsList);
        setLastSync(new Date());
      } catch (error) {
        console.error("Error fetching products:", error);
        setToast("Error loading products. Please try again.");
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
    
    // Create a document visibility event listener to refresh products when tab regains focus
    // This ensures stock updates from AdminProducts are reflected in AdminDashboard
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProducts();
        // Also refresh transactions to stay in sync
        fetchTransactions();
      }
    };
    
    // Add function to fetch transactions for visibility change
    const fetchTransactions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "transactions"));
        const transactionsList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            items: Array.isArray(data.items) ? data.items : [],
            customerName: data.customerName || '',
            customerEmail: data.customerEmail || '',
            amount: Number(data.amount) || 0,
            deliveryMethod: data.deliveryMethod || '',
            status: data.status || 'pending',
            deliveryAddress: data.deliveryAddress || '',
            trackingNote: data.trackingNote || '',
            date: data.date || data.timestamp || null
          };
        });
        setTransactions(transactionsList);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set up periodic refresh (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchProducts();
      fetchTransactions();
    }, 30000);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [db]);

  // Mark as delivered/picked up/out for delivery
  const markAsComplete = async (id: string, status: string) => {
    await updateDoc(doc(db, "transactions", id), { status });
    setTransactions(txs => txs.map(tx => tx.id === id ? { ...tx, status } : tx));
    setToast(`Status updated: ${status.replace(/(^| )\w/g, s => s.toUpperCase())}`);
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    setProducts(ps => ps.filter(p => p.id !== id));
    setToast("Product deleted");
  };

  // Edit product
  const handleEditProduct = (product: any) => {
    setEditProduct(product);
    setShowEditProduct(true);
  };
  const handleUpdateProduct = async (updated: any) => {
    try {
      // Store images separately
      const images = updated.images || [];
      
      // Update product without images first
      const productWithoutImages = {
        ...updated,
        images: [], // Clear images array temporarily
        lastUpdated: new Date().toISOString()
      };
      
      // Update the base product data
      await updateDoc(doc(db, "products", updated.id), productWithoutImages);
      
      // If there are images, update them in chunks
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          try {
            // Update each image individually
            await updateDoc(doc(db, "products", updated.id), {
              [`images.${i}`]: images[i]
            });
          } catch (error) {
            console.error(`Error updating image ${i}:`, error);
            // Continue with other images even if one fails
          }
        }
      }
      
      setProducts(ps => ps.map(p => p.id === updated.id ? { ...productWithoutImages, images } : p));
      setShowEditProduct(false);
      setEditProduct(null);
      setToast("Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
      setToast("Error updating product. Please try again.");
    }
  };

  // Create product in Firestore with chunked image handling
  const handleCreateProduct = async (product: any) => {
    try {
      // Temporarily store images
      const images = product.images || [];
      
      // Create product without images first
      const productWithoutImages = {
        ...product,
        images: [], // Clear images array temporarily
        timestamp: new Date().toISOString()
      };
      
      // Add the product document first
      const docRef = await addDoc(collection(db, "products"), productWithoutImages);
      
      // If there are images, update them in chunks
      if (images.length > 0) {
        // Process each image
        for (let i = 0; i < images.length; i++) {
          try {
            // Update the product document with each image
            await updateDoc(doc(db, "products", docRef.id), {
              [`images.${i}`]: images[i]
            });
          } catch (error) {
            console.error(`Error uploading image ${i}:`, error);
            // Continue with other images even if one fails
          }
        }
      }
      
      // Refresh products list
      const querySnapshot = await getDocs(collection(db, "products"));
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setShowCreateProduct(false);
      setToast("Product created successfully");
    } catch (error) {
      console.error("Error creating product:", error);
      setToast("Error creating product. Please try again.");
    }
  };

  // Tracking note
  const handleEditTracking = (tx: any) => {
    setTrackingEditId(tx.id);
    setTrackingNote(tx.trackingNote || "");
  };
  const handleSaveTracking = async (id: string) => {
    await updateDoc(doc(db, "transactions", id), { trackingNote });
    setTransactions(txs => txs.map(tx => tx.id === id ? { ...tx, trackingNote } : tx));
    setTrackingEditId(null);
    setToast("Tracking note updated");
  };

  // Update stock for a product
  const handleStockChange = async (id: string, newStock: number) => {
    await updateDoc(doc(db, "products", id), { stock: newStock });
    setProducts(ps => ps.map(p => p.id === id ? { ...p, stock: newStock } : p));
    setToast("Stock updated");
  };

  // Helper function to get product name by ID
  const getProductNameById = (productId: string): string => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : productId; // Fallback to ID if product not found
  };

  return (
    <div className="p-6">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="bg-gray-100 p-4 rounded-lg mb-4 border border-gray-200">
        <h3 className="font-semibold text-gray-800 text-lg">Welcome to the Admin Dashboard</h3>
        <p className="text-gray-700 text-base">
          This dashboard allows you to manage your store's products and orders. Use the buttons below to create new products 
          or access advanced inventory management. The Transactions table shows all customer orders, while the Products table 
          displays your product catalog with stock information. Both tables have search functionality to help you find specific items.
        </p>
      </div>
      <div className="flex space-x-2 mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={() => setShowCreateProduct(true)}
        >
          Create Product
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
          onClick={() => navigate('/admin/products')}
        >
          <span>Inventory Management</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {showCreateProduct && (
        <AdminUpload
          isOpen={showCreateProduct}
          onClose={() => setShowCreateProduct(false)}
          onSubmit={handleCreateProduct}
        />
      )}
      {showEditProduct && editProduct && (
        <AdminUpload
          isOpen={showEditProduct}
          onClose={() => { setShowEditProduct(false); setEditProduct(null); }}
          onSubmit={handleUpdateProduct}
          initialProduct={editProduct}
        />
      )}

      <h2 className="text-xl font-semibold mt-8 mb-2">Transactions</h2>
      <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
        <h3 className="font-semibold text-blue-800 text-lg">About Transactions</h3>
        <p className="text-blue-700 text-base mb-3">
          This table shows all customer orders. You can update order status, add tracking notes, and manage 
          delivery information. Use this table to track order progress and ensure timely deliveries. 
          For inventory management, use the "Inventory Management" button at the top.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm text-blue-700">
          <div>
            <p className="mb-1"><strong>Date:</strong> When the order was placed</p>
            <p className="mb-1"><strong>Customer:</strong> Name of the person who ordered</p>
            <p className="mb-1"><strong>Email:</strong> Customer's contact email</p>
            <p className="mb-1"><strong>Amount:</strong> Total order amount in Rand</p>
            <p className="mb-1"><strong>Method:</strong> Pickup or delivery option</p>
          </div>
          <div>
            <p className="mb-1"><strong>Address:</strong> Where to deliver (if applicable)</p>
            <p className="mb-1"><strong>Status:</strong> Current order status (initiated, out for delivery, delivered, etc.)</p>
            <p className="mb-1"><strong>Items:</strong> Products ordered with quantities</p>
            <p className="mb-1"><strong>Tracking Note:</strong> Optional notes for tracking or delivery info</p>
            <p className="mb-1"><strong>Action:</strong> Change status or manage the order</p>
          </div>
        </div>
      </div>
      <input
        className="mb-2 px-2 py-1 border rounded"
        placeholder="Search by customer, email, status..."
        value={txSearch}
        onChange={e => setTxSearch(e.target.value)}
      />
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full border rounded-lg overflow-hidden shadow">
          <thead className="bg-blue-100">
            <tr>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Customer</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Amount</th>
              <th className="border px-2 py-1">Method</th>
              <th className="border px-2 py-1">Address</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Items</th>
              <th className="border px-2 py-1">Tracking Note</th>
              <th className="border px-2 py-1">Action</th>
            </tr>
          </thead>
          <tbody>
            {loadingTransactions ? (
              <tr>
                <td colSpan={10} className="text-center py-8">
                  <LoadingSpinner size="medium" color="#3B82F6" />
                  <p className="mt-2 text-blue-600">Loading transactions...</p>
                </td>
              </tr>
            ) : transactions.filter(tx =>
              tx.customerName?.toLowerCase().includes(txSearch.toLowerCase()) ||
              tx.customerEmail?.toLowerCase().includes(txSearch.toLowerCase()) ||
              tx.status?.toLowerCase().includes(txSearch.toLowerCase())
            ).map(tx => (
              <tr key={tx.id} className="even:bg-blue-50 odd:bg-white hover:bg-blue-200 transition-colors">
                <td className="border px-2 py-1">{tx.date ? (() => {
                  try {
                    // Handle different date formats consistently with AdminProducts
                    if (typeof tx.date === 'object' && tx.date && 'toDate' in tx.date) {
                      return tx.date.toDate().toLocaleString();
                    }
                    if (tx.date instanceof Date) {
                      return tx.date.toLocaleString();
                    }
                    if (typeof tx.date === 'string' || typeof tx.date === 'number') {
                      const parsedDate = new Date(tx.date);
                      if (!isNaN(parsedDate.getTime())) {
                        return parsedDate.toLocaleString();
                      }
                    }
                    return "-";
                  } catch (error) {
                    console.error('Error formatting date:', error);
                    return "-";
                  }
                })() : "-"}</td>
                <td className="border px-2 py-1">{tx.customerName}</td>
                <td className="border px-2 py-1">{tx.customerEmail}</td>
                <td className="border px-2 py-1 font-semibold text-blue-900">R {tx.amount ? (() => {
                  // Improved amount formatting logic
                  const amount = Number(tx.amount);
                  // Only convert from cents if the amount is clearly stored in cents
                  // This typically happens with payment processors that store amounts in cents
                  // For manual entries or direct amounts, display as-is
                  
                  // If amount is over 1000 and whole number, likely in cents
                  // If amount is under 1000, likely already in correct format
                  if (amount >= 1000 && Math.floor(amount) === amount) {
                    return (amount / 100).toFixed(2);
                  }
                  return amount.toFixed(2);
                })() : "-"}</td>
                <td className="border px-2 py-1">{tx.deliveryMethod}</td>
                <td className="border px-2 py-1">{tx.deliveryAddress}</td>
                <td className="border px-2 py-1">
                  {tx.status === "delivered" && <span className="px-2 py-1 rounded bg-green-200 text-green-800 font-bold">Delivered</span>}
                  {tx.status === "picked up" && <span className="px-2 py-1 rounded bg-yellow-200 text-yellow-800 font-bold">Picked Up</span>}
                  {tx.status === "out for delivery" && <span className="px-2 py-1 rounded bg-blue-200 text-blue-800 font-bold">Out for Delivery</span>}
                  {!["delivered", "picked up", "out for delivery"].includes(tx.status) && <span className="px-2 py-1 rounded bg-gray-200 text-gray-800">{tx.status}</span>}
                </td>
                <td className="border px-2 py-1">
                  <ul>
                    {tx.items && Array.isArray(tx.items) ? tx.items.map((item: any, idx: number) => (
                      <li key={idx}>
                        {item.quantity}x {getProductNameById(item.id)}
                      </li>
                    )) : (
                      <li className="text-red-500 text-sm">No items</li>
                    )}
                  </ul>
                </td>
                <td className="border px-2 py-1">
                  {trackingEditId === tx.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        className="border px-2 py-1 rounded"
                        value={trackingNote}
                        onChange={e => setTrackingNote(e.target.value)}
                        placeholder="Tracking note..."
                      />
                      <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={() => handleSaveTracking(tx.id)}>Save</button>
                      <button className="bg-gray-300 px-2 py-1 rounded" onClick={() => setTrackingEditId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-blue-700">{tx.trackingNote || "-"}</span>
                      <button className="text-xs underline text-blue-600" onClick={() => handleEditTracking(tx)}>Edit</button>
                    </div>
                  )}
                </td>
                <td className="border px-2 py-1 space-x-1">
                  {!["delivered", "picked up", "out for delivery"].includes(tx.status) && (
                    <>
                      <button
                        onClick={() => markAsComplete(tx.id, "out for delivery")}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-700 text-white rounded shadow"
                      >
                        Out for Delivery
                      </button>
                      <button
                        onClick={() => markAsComplete(tx.id, "delivered")}
                        className="px-2 py-1 bg-green-500 hover:bg-green-700 text-white rounded shadow"
                      >
                        Mark Delivered
                      </button>
                      <button
                        onClick={() => markAsComplete(tx.id, "picked up")}
                        className="px-2 py-1 bg-yellow-500 hover:bg-yellow-700 text-white rounded shadow"
                      >
                        Mark Picked Up
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold mb-2">Products</h2>
      <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
        <h3 className="font-semibold text-green-800 text-lg">About Products</h3>
        <p className="text-green-700 text-base mb-3">
          This table displays your product catalog with quick access to inventory levels. You can adjust stock quantities, 
          edit product details, or delete products. Stock is automatically calculated based on transactions, but you can 
          manually override numbers here. For advanced inventory management and fixing invalid transactions, use the 
          "Inventory Management" page.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm text-green-700">
          <div>
            <p className="mb-1"><strong>Name:</strong> Product name displayed to customers</p>
            <p className="mb-1"><strong>Price:</strong> Selling price in Rand (without cents)</p>
            <p className="mb-1"><strong>Sizes:</strong> Available size options for clothing</p>
          </div>
          <div>
            <p className="mb-1"><strong>Category:</strong> Product grouping for filtering</p>
            <p className="mb-1"><strong>Stock:</strong> Current available quantity (editable)</p>
            <p className="mb-1"><strong>Actions:</strong> Edit product details or remove from catalog</p>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mb-2">
        <input
          className="px-2 py-1 border rounded w-64"
          placeholder="Search by name, category..."
          value={productSearch}
          onChange={e => setProductSearch(e.target.value)}
        />
        <div className="flex items-center">
          {lastSync && (
            <span className="text-sm text-gray-500 mr-2">
              Last synced: {lastSync.toLocaleTimeString()}
            </span>
          )}
          <button 
            className="px-2 py-1 bg-blue-500 text-white rounded text-sm flex items-center"
            onClick={async () => {
              setLoadingProducts(true);
              try {
                const querySnapshot = await getDocs(collection(db, "products"));
                setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLastSync(new Date());
                setToast("Product inventory refreshed");
              } catch (error) {
                console.error("Error refreshing products:", error);
                setToast("Error refreshing products. Please try again.");
              } finally {
                setLoadingProducts(false);
              }
            }}
          >
            {loadingProducts ? (
              <>
                <LoadingSpinner size="small" color="white" />
                <span className="ml-1">Refreshing...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg overflow-hidden shadow">
          <thead className="bg-green-100">
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Price</th>
              <th className="border px-2 py-1">Sizes</th>
              <th className="border px-2 py-1">Category</th>
              <th className="border px-2 py-1">Stock</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingProducts ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <LoadingSpinner size="medium" color="#10B981" />
                  <p className="mt-2 text-green-600">Loading products...</p>
                </td>
              </tr>
            ) : products.filter(product =>
              product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
              product.category?.toLowerCase().includes(productSearch.toLowerCase())
            ).map(product => (
              <tr key={product.id} className="even:bg-green-50 odd:bg-white hover:bg-green-200 transition-colors">
                <td className="border px-2 py-1 font-semibold text-green-900">{product.name}</td>
                <td className="border px-2 py-1">R {product.price}</td>
                <td className="border px-2 py-1">{product.sizes ? product.sizes.join(", ") : "-"}</td>
                <td className="border px-2 py-1">{product.category}</td>
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    min={0}
                    value={product.stock ?? ''}
                    onChange={e => handleStockChange(product.id, Number(e.target.value))}
                    className="w-16 border rounded px-2 py-1"
                  />
                </td>
                <td className="border px-2 py-1 space-x-1">
                  <button onClick={() => handleEditProduct(product)} className="px-2 py-1 bg-yellow-500 hover:bg-yellow-700 text-white rounded shadow">Edit</button>
                  <button onClick={() => deleteProduct(product.id)} className="px-2 py-1 bg-red-500 hover:bg-red-700 text-white rounded shadow">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
