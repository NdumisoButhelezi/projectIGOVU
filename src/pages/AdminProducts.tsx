import React, { useEffect, useState } from 'react';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  writeBatch, 
  deleteDoc,
  query,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  Query
} from 'firebase/firestore';
import { app } from '../config/firebase';

interface FirebaseTimestamp {
  toDate(): Date;
}

interface TransactionItem {
  id: string;
  quantity: number;
}

interface Transaction {
  id: string;
  items?: TransactionItem[];
  customerName: string;
  customerEmail: string;
  amount: number;
  deliveryMethod: string;
  status: string;
  timestamp?: FirebaseTimestamp | Date;
  date?: Date;
}

interface Product {
  id: string;
  name: string;
  price: number;
  sizes?: string;
  category?: string;
  stock: number;
  originalStock?: number;
  baseStock?: number;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [soldItems, setSoldItems] = useState<Record<string, number>>({});
  const [transactionToFix, setTransactionToFix] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [transactionsWithoutItems, setTransactionsWithoutItems] = useState<number>(0);
  const [invalidProductIds, setInvalidProductIds] = useState<Set<string>>(new Set());
  const [selectedReplaceId, setSelectedReplaceId] = useState<string | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Function to calculate sold quantities from transactions
  const calculateSoldQuantities = (transactions: Transaction[]) => {
    const soldQuantities: Record<string, number> = {};
    let missingItemsCount = 0;
    
    transactions.forEach(transaction => {
      if (transaction.items && Array.isArray(transaction.items)) {
        transaction.items.forEach((item: TransactionItem) => {
          if (item.id && item.quantity) {
            if (!soldQuantities[item.id]) {
              soldQuantities[item.id] = 0;
            }
            soldQuantities[item.id] += Number(item.quantity);
          }
        });
      } else {
        missingItemsCount++;
      }
    });
    
    setTransactionsWithoutItems(missingItemsCount);
    return soldQuantities;
  };

  // Function to update stock in database
  const updateStockInDatabase = async (products: Product[], soldQuantities: Record<string, number>) => {
    const db = getFirestore(app);
    const batch = writeBatch(db);
    let updatedCount = 0;
    
    // Update products with calculated stock
    const updatedProducts = products.map(product => {
      const originalStock = product.originalStock !== undefined ? 
        product.originalStock : 
        (product.baseStock !== undefined ? product.baseStock : product.stock || 0);
      
      const sold = soldQuantities[product.id] || 0;
      const newStock = Math.max(0, originalStock - sold);
      
      // Only update if stock has changed
      if (newStock !== product.stock) {
        const productRef = doc(db, 'products', product.id);
        batch.update(productRef, { 
          stock: newStock,
          // Store original stock for future calculations
          originalStock: originalStock
        });
        updatedCount++;
      }
      
      return {
        ...product,
        stock: newStock,
        originalStock: originalStock,
        sold: sold
      };
    });
    
    // Commit all updates in a single batch
    if (updatedCount > 0) {
      await batch.commit();
      setUpdateStatus(`Updated stock for ${updatedCount} products based on transaction history`);
      setTimeout(() => setUpdateStatus(null), 3000);
    }
    
    return updatedProducts;
  };

  // Enhanced function to get product name for display
  const getProductName = (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) {
      // Return styled text for invalid products, but also include the ID for reference
      return <span className="text-red-500 font-bold">{id} (Invalid Product)</span>;
    }
    return product.name;
  };

  // Add item to transaction
  const addItemToTransaction = async (transactionId: string, replaceItemId?: string) => {
    if (!selectedProduct || !transactionId) return;
    
    try {
      setLoading(true);
      const db = getFirestore(app);
      const transactionRef = doc(db, 'transactions', transactionId);
      const transactionDoc = transactions.find(t => t.id === transactionId);
      
      if (!transactionDoc) return;
      
      // Create or update items array
      let newItems = transactionDoc.items && Array.isArray(transactionDoc.items) 
        ? [...transactionDoc.items] 
        : [];
      
      // If replacing an existing item with invalid ID
      if (replaceItemId) {
        newItems = newItems.map(item => 
          item.id === replaceItemId 
            ? { ...item, id: selectedProduct }
            : item
        );
      } else {
        // Add new item
        newItems.push({
          id: selectedProduct,
          quantity: quantity
        });
      }
      
      // Update transaction in database
      await updateDoc(transactionRef, { items: newItems });
      
      // Update local state
      const updatedTransactions = transactions.map(t => 
        t.id === transactionId ? { ...t, items: newItems } : t
      );
      
      setTransactions(updatedTransactions);
      
      // Recalculate sold quantities
      const newSoldQuantities = calculateSoldQuantities(updatedTransactions);
      setSoldItems(newSoldQuantities);
      
      // Update product stock
      const updatedProducts = await updateStockInDatabase(products, newSoldQuantities);
      setProducts(updatedProducts);
      
      setUpdateStatus(`${replaceItemId ? 'Fixed' : 'Added'} item in transaction and updated stock`);
      setTimeout(() => setUpdateStatus(null), 3000);
      
      // Reset form
      setTransactionToFix(null);
      setSelectedProduct('');
      setQuantity(1);
      setSelectedReplaceId(undefined);
      
      // Remove from invalid IDs if it was there
      if (replaceItemId) {
        setInvalidProductIds(prev => {
          const updated = new Set([...prev]);
          updated.delete(replaceItemId);
          return updated;
        });
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      setUpdateStatus("Error updating transaction. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Recalculate all stock
  const recalculateAllStock = async () => {
    try {
      setLoading(true);
      
      // Recalculate sold quantities
      const newSoldQuantities = calculateSoldQuantities(transactions);
      setSoldItems(newSoldQuantities);
      
      // Update product stock
      const updatedProducts = await updateStockInDatabase(products, newSoldQuantities);
      setProducts(updatedProducts);
      
      setUpdateStatus(`Recalculated stock for all products based on transaction history`);
      setTimeout(() => setUpdateStatus(null), 3000);
    } catch (error) {
      console.error("Error recalculating stock:", error);
      setUpdateStatus("Error recalculating stock. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a transaction
  const deleteTransaction = async (transactionId: string) => {
    try {
      setLoading(true);
      
      const db = getFirestore(app);
      const transactionRef = doc(db, 'transactions', transactionId);
      await deleteDoc(transactionRef);
      
      // Update local state by removing the deleted transaction
      const updatedTransactions = transactions.filter(t => t.id !== transactionId);
      setTransactions(updatedTransactions);
      
      // Recalculate sold quantities with updated transactions list
      const newSoldQuantities = calculateSoldQuantities(updatedTransactions);
      setSoldItems(newSoldQuantities);
      
      // Update product stock with new sold quantities
      const updatedProducts = await updateStockInDatabase(products, newSoldQuantities);
      setProducts(updatedProducts);
      
      setUpdateStatus("Transaction deleted successfully. Stock updated.");
      setTimeout(() => setUpdateStatus(null), 3000);
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setUpdateStatus("Error deleting transaction. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };
  
  // Bulk delete all transactions with invalid items or no items
  const bulkDeleteInvalidTransactions = async () => {
    try {
      setLoading(true);
      const db = getFirestore(app);
      const batch = writeBatch(db);
      
      // Identify transactions to delete (those with invalid items or no items)
      const transactionsToDelete = transactions.filter(transaction => {
        // No items
        if (!transaction.items || !transaction.items.length) return true;
        
        // Invalid items
        return transaction.items.some(item => invalidProductIds.has(item.id));
      });
      
      // Add each transaction to delete batch
      transactionsToDelete.forEach(transaction => {
        const transactionRef = doc(db, 'transactions', transaction.id);
        batch.delete(transactionRef);
      });
      
      // Commit the batch
      await batch.commit();
      
      // Update local state
      const updatedTransactions = transactions.filter(t => 
        !transactionsToDelete.some(td => td.id === t.id)
      );
      setTransactions(updatedTransactions);
      
      // Recalculate sold quantities with updated transactions list
      const newSoldQuantities = calculateSoldQuantities(updatedTransactions);
      setSoldItems(newSoldQuantities);
      
      // Update product stock with new sold quantities
      const updatedProducts = await updateStockInDatabase(products, newSoldQuantities);
      setProducts(updatedProducts);
      
      setUpdateStatus(`Deleted ${transactionsToDelete.length} invalid transactions. Stock updated.`);
      setTimeout(() => setUpdateStatus(null), 3000);
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      console.error("Error bulk deleting transactions:", error);
      setUpdateStatus("Error deleting transactions. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const formatTransactionDate = (transaction: Transaction): string => {
    if (!transaction.timestamp && !transaction.date) return '-';
    
    try {
      // Handle Firestore Timestamp objects
      if (transaction.timestamp && typeof transaction.timestamp === 'object' && 'toDate' in transaction.timestamp) {
        return transaction.timestamp.toDate().toLocaleString();
      }
      
      // Handle Date objects
      if (transaction.timestamp instanceof Date) {
        return transaction.timestamp.toLocaleString();
      }
      if (transaction.date instanceof Date) {
        return transaction.date.toLocaleString();
      }
      
      // Handle ISO strings and other formats
      const dateValue = transaction.timestamp || transaction.date;
      if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        const parsedDate = new Date(dateValue);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleString();
        }
      }
      
      return '-';
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };
  
  // Helper function to format currency amounts correctly
  const formatAmount = (amount: number): string => {
    // Improved amount formatting logic to match AdminDashboard
    // Only convert from cents if the amount is clearly stored in cents
    // This typically happens with payment processors that store amounts in cents
    // For manual entries or direct amounts, display as-is
    
    // If amount is over 1000 and whole number, likely in cents
    // If amount is under 1000, likely already in correct format
    if (amount >= 1000 && Math.floor(amount) === amount) {
      return (amount / 100).toFixed(2);
    }
    return amount.toFixed(2);
  };

  useEffect(() => {
    async function fetchAndProcessData() {
      setLoading(true);
      try {
        const db = getFirestore(app);
        
        // Fetch products with pagination to avoid size limits
        const BATCH_SIZE = 100;
        let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
        let allProducts: Product[] = [];
        
        do {
          // Create a query with proper typing
          const constraints = [] as any[];
          if (lastDoc) {
            constraints.push(startAfter(lastDoc));
          }
          constraints.push(limit(BATCH_SIZE));
          
          const q = query(collection(db, 'products'), ...constraints);
          const productsSnap = await getDocs(q);
          
          if (productsSnap.empty) break;
          
          // Process this batch
          const batchProducts = productsSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || '',
              price: Number(data.price) || 0,
              sizes: data.sizes || '',
              category: data.category || '',
              stock: Number(data.stock) || 0,
              originalStock: Number(data.originalStock) || Number(data.baseStock) || Number(data.stock) || 0,
              baseStock: Number(data.baseStock) || Number(data.stock) || 0
            } as Product;
          });
          
          allProducts = [...allProducts, ...batchProducts];
          
          // Get the last document for the next iteration
          lastDoc = productsSnap.docs[productsSnap.docs.length - 1] || null;
          
          // Continue if we got a full batch (there might be more)
          if (productsSnap.docs.length < BATCH_SIZE) break;
          
        } while (lastDoc);
        
        const productsList = allProducts;
        
        // Fetch transactions with pagination
        let lastTransactionDoc: QueryDocumentSnapshot<DocumentData> | null = null;
        let allTransactions: Transaction[] = [];
        
        do {
          const transConstraints = [] as any[];
          if (lastTransactionDoc) {
            transConstraints.push(startAfter(lastTransactionDoc));
          }
          transConstraints.push(limit(BATCH_SIZE));
          
          const transQuery = query(collection(db, 'transactions'), ...transConstraints);
          const transactionsSnap = await getDocs(transQuery);
          
          if (transactionsSnap.empty) break;
          
          const batchTransactions = transactionsSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            return {
              id: doc.id,
              items: Array.isArray(data.items) ? data.items : [],
              customerName: data.customerName || '',
              customerEmail: data.customerEmail || '',
              amount: Number(data.amount) || 0,
              deliveryMethod: data.deliveryMethod || '',
              status: data.status || 'pending',
              timestamp: data.timestamp || data.date || null,
              date: data.date || data.timestamp || null,
              deliveryAddress: data.deliveryAddress || '',
              trackingNote: data.trackingNote || ''
            } as Transaction;
          });
          
          allTransactions = [...allTransactions, ...batchTransactions];
          
          lastTransactionDoc = transactionsSnap.docs[transactionsSnap.docs.length - 1] || null;
          
          if (transactionsSnap.docs.length < BATCH_SIZE) break;
          
        } while (lastTransactionDoc);
        
        const transactionsList = allTransactions;
        
        // Track invalid product IDs - do this once during data load
        const invalidIds = new Set<string>();
        transactionsList.forEach(transaction => {
          if (transaction.items && Array.isArray(transaction.items)) {
            transaction.items.forEach(item => {
              if (item.id && !productsList.some(p => p.id === item.id)) {
                invalidIds.add(item.id);
              }
            });
          }
        });
        setInvalidProductIds(invalidIds);
        
        // Calculate sold quantities
        const soldQuantities = calculateSoldQuantities(transactionsList);
        setSoldItems(soldQuantities);
        
        // Update product stock based on sold quantities
        const updatedProducts = await updateStockInDatabase(productsList, soldQuantities);
        
        setProducts(updatedProducts);
        setTransactions(transactionsList);
      } catch (error) {
        console.error("Error processing data:", error);
        setUpdateStatus("Error updating stock. Please check console for details.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchAndProcessData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2 text-lg">About Inventory Management</h3>
        <p className="text-gray-700 mb-3 text-base">
          This page provides advanced inventory control for your store. The system automatically calculates stock based on transaction history,
          and highlights problematic transactions that need attention. You can fix invalid product references or delete incorrect transactions.
        </p>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700 mt-4">
          <div>
            <p className="mb-2"><span className="inline-block w-3 h-3 bg-red-50 mr-1"></span> <strong>Red rows:</strong> Transactions with invalid product references</p>
            <p className="mb-2"><span className="inline-block w-3 h-3 bg-yellow-50 mr-1"></span> <strong>Yellow rows:</strong> Transactions missing items</p>
            <p className="mb-2"><strong>Clean Up Invalid Transactions:</strong> Bulk delete problematic transactions</p>
          </div>
          <div>
            <p className="mb-2"><strong>Recalculate All Stock:</strong> Update inventory based on all transactions</p>
            <p className="mb-2"><strong>Fix/Add Items:</strong> Correct product references in transactions</p>
            <p className="mb-2"><strong>Delete:</strong> Remove individual transactions from history</p>
          </div>
        </div>
      </div>
      
      {updateStatus && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
          {updateStatus}
        </div>
      )}

      {transactionsWithoutItems > 0 && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
          Warning: {transactionsWithoutItems} transactions found with no items. Fix them below to ensure accurate inventory.
        </div>
      )}
      
      {invalidProductIds.size > 0 && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
          Warning: {invalidProductIds.size} invalid product references found in transactions. Look for highlighted items below and fix them.
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={recalculateAllStock}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            Recalculate All Stock
          </button>
          
          {(invalidProductIds.size > 0 || transactionsWithoutItems > 0) && (
            <button 
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              disabled={loading}
            >
              Clean Up Invalid Transactions ({invalidProductIds.size + transactionsWithoutItems})
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="w-full text-md font-bold mb-2">Stock Synchronization Utilities</h3>
          <button
            onClick={async () => {
              try {
                setLoading(true);
                const response = await fetch('/api/process-stock-queue', { method: 'GET' });
                if (!response.ok) {
                  throw new Error(`Failed to process stock queue: ${response.status}`);
                }
                const data = await response.json();
                setUpdateStatus(`Stock queue processed: ${data.successful} succeeded, ${data.failed} failed`);
                setTimeout(() => setUpdateStatus(null), 5000);
              } catch (error) {
                console.error('Error processing stock queue:', error);
                setUpdateStatus(`Error processing stock queue: ${error instanceof Error ? error.message : String(error)}`);
              } finally {
                setLoading(false);
              }
            }}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
            disabled={loading}
          >
            Process Stock Queue
          </button>

          <button
            onClick={async () => {
              if (!window.confirm('Are you sure you want to run stock recovery? This will analyze all transactions and may update product stock levels.')) {
                return;
              }
              
              try {
                setLoading(true);
                
                // Import and run the stock recovery utility
                const syncStockLevels = (await import('../utils/stock-recovery')).default;
                await syncStockLevels();
                
                // Refresh the page data
                window.location.reload();
              } catch (error) {
                console.error('Stock recovery failed:', error);
                setUpdateStatus(`Stock recovery failed: ${error instanceof Error ? error.message : String(error)}`);
                setTimeout(() => setUpdateStatus(null), 5000);
              } finally {
                setLoading(false);
              }
            }}
            className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm"
            disabled={loading}
          >
            Advanced Stock Recovery
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <span className="ml-3">Processing inventory...</span>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2 text-lg">Products Inventory</h3>
            <p className="text-blue-700 text-base mb-3">
              This table displays your complete product catalog with calculated stock levels based on transaction history.
              Stock is automatically adjusted when transactions are added, modified, or removed.
            </p>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-700">
              <div>
                <p className="mb-2"><strong>Name:</strong> Product identifier shown to customers</p>
                <p className="mb-2"><strong>Price:</strong> Retail price in Rand</p>
                <p className="mb-2"><strong>Sizes:</strong> Available sizes for clothing items</p>
              </div>
              <div>
                <p className="mb-2"><strong>Category:</strong> Product grouping for organization</p>
                <p className="mb-2"><strong>Sold:</strong> Total quantity sold based on transactions</p>
                <p className="mb-2"><strong>Stock:</strong> Current available inventory (red if low stock)</p>
              </div>
            </div>
          </div>
          
          <table className="w-full border-collapse border border-gray-300 mb-8">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Price</th>
                <th className="border border-gray-300 px-4 py-2">Sizes</th>
                <th className="border border-gray-300 px-4 py-2">Category</th>
                <th className="border border-gray-300 px-4 py-2">Sold</th>
                <th className="border border-gray-300 px-4 py-2">Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td className="border border-gray-300 px-4 py-2 font-medium">{product.name}</td>
                  <td className="border border-gray-300 px-4 py-2">R {product.price}</td>
                  <td className="border border-gray-300 px-4 py-2">{product.sizes || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">{product.category || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold">
                      {soldItems[product.id] || 0}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                      Number(product.stock) < 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="text-xl font-semibold mb-4">Transactions</h2>
          <div className="bg-purple-50 p-4 rounded-lg mb-4 border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2 text-lg">Transaction Management</h3>
            <p className="text-purple-700 text-base mb-3">
              This table shows all customer orders and their impact on inventory. Problematic transactions are highlighted in color.
              Use the tools in the Actions column to fix issues or clean up the database.
            </p>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-purple-700">
              <div>
                <p className="mb-2"><strong>Date:</strong> When order was placed</p>
                <p className="mb-2"><strong>Customer/Email:</strong> Order contact information</p>
                <p className="mb-2"><strong>Amount:</strong> Total payment in Rand</p>
                <p className="mb-2"><strong>Method:</strong> Pickup or delivery choice</p>
              </div>
              <div>
                <p className="mb-2"><strong>Status:</strong> Current order fulfillment status</p>
                <p className="mb-2"><strong>Items:</strong> Products ordered and quantities</p>
                <p className="mb-2"><strong>Actions:</strong> Options to fix or delete transactions</p>
                <p className="mb-2"><strong>Red/Yellow highlighting:</strong> Indicates issues needing attention</p>
              </div>
            </div>
          </div>
          
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Date</th>
                <th className="border border-gray-300 px-4 py-2">Customer</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2">Amount</th>
                <th className="border border-gray-300 px-4 py-2">Method</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Items</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => {
                // Check if transaction has any invalid product IDs
                const hasInvalidItems = transaction.items && Array.isArray(transaction.items) && 
                  transaction.items.some(item => invalidProductIds.has(item.id));
                
                return (
                  <tr 
                    key={transaction.id} 
                    className={
                      hasInvalidItems ? "bg-red-50" :
                      (!transaction.items || !transaction.items.length) ? "bg-yellow-50" :
                      ""
                    }
                  >
                    <td className="border border-gray-300 px-4 py-2">
                      {formatTransactionDate(transaction)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{transaction.customerName}</td>
                    <td className="border border-gray-300 px-4 py-2">{transaction.customerEmail}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      R {typeof transaction.amount === 'number' 
                        ? formatAmount(transaction.amount) 
                        : 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{transaction.deliveryMethod}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                        transaction.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'picked up' ? 'bg-yellow-100 text-yellow-800' :
                        transaction.status === 'out for delivery' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {transaction.items && Array.isArray(transaction.items) && transaction.items.length > 0 ? (
                        <ul className="list-disc pl-4">
                          {transaction.items.map((item: any, idx: number) => (
                            <li key={idx} className="text-sm">
                              <span className="font-medium">{item.quantity}x</span> {getProductName(item.id)}
                              {invalidProductIds.has(item.id) && (
                                <button 
                                  onClick={() => {
                                    // Store the item ID in state instead of using DOM
                                    setTransactionToFix(transaction.id);
                                    // Use a ref or state to track the item to replace
                                    setSelectedReplaceId(item.id);
                                  }}
                                  className="ml-2 px-1 py-0.5 bg-red-500 text-white text-xs rounded"
                                >
                                  Fix
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-red-500 font-medium">No items</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex space-x-2">
                        {(!transaction.items || !transaction.items.length || hasInvalidItems) && (
                          <button
                            className={`px-2 py-1 text-white rounded ${
                              hasInvalidItems ? "bg-red-500 hover:bg-red-600" : "bg-yellow-500 hover:bg-yellow-600"
                            }`}
                            onClick={() => setTransactionToFix(transaction.id)}
                          >
                            {hasInvalidItems ? "Fix Invalid Items" : "Add Items"}
                          </button>
                        )}
                        <button
                          className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                          onClick={() => setConfirmDeleteId(transaction.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Modal to fix transaction items */}
          {transactionToFix && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-96">
                <h3 className="text-lg font-bold mb-4">
                  {selectedReplaceId 
                    ? 'Replace Invalid Item' 
                    : 'Add Item to Transaction'}
                </h3>
                <div className="mb-4">
                  <label className="block mb-2">Select Product</label>
                  <select 
                    className="w-full p-2 border rounded"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">-- Select Product --</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - R {product.price}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Quantity</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded mr-2"
                    onClick={() => {
                      setTransactionToFix(null);
                      setSelectedReplaceId(undefined);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={() => {
                      addItemToTransaction(transactionToFix, selectedReplaceId);
                      setSelectedReplaceId(undefined);
                    }}
                    disabled={!selectedProduct}
                  >
                    {selectedReplaceId ? 'Replace Item' : 'Add Item'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Confirm Delete Modal */}
          {confirmDeleteId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-96">
                <h3 className="text-lg font-bold mb-4 text-red-600">Confirm Delete Transaction</h3>
                <p className="mb-4">
                  Are you sure you want to delete this transaction? This action cannot be undone.
                </p>
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded mr-2"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded"
                    onClick={() => deleteTransaction(confirmDeleteId)}
                  >
                    Delete Transaction
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Bulk Delete Confirmation Modal */}
          {showBulkDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-96">
                <h3 className="text-lg font-bold mb-4 text-red-600">Clean Up Invalid Transactions</h3>
                <p className="mb-4">
                  This will delete all transactions that have invalid product references ({invalidProductIds.size}) 
                  or no items ({transactionsWithoutItems}).
                </p>
                <p className="mb-4 font-bold">
                  This action cannot be undone. Are you sure?
                </p>
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded mr-2"
                    onClick={() => setShowBulkDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded"
                    onClick={bulkDeleteInvalidTransactions}
                  >
                    Delete All Invalid Transactions
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

