// Stock recovery utility script
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { app } from "../config/firebase";

interface ProductStock {
  id: string;
  name: string;
  currentStock: number;
  initialStock: number;
  calculatedStock: number;
}

interface StockDiscrepancy {
  productId: string;
  name: string;
  currentStock: number;
  calculatedStock: number;
  difference: number;
}

interface TransactionItem {
  id: string;
  quantity: number;
}

/**
 * This utility helps recover and sync stock levels based on transaction history
 * Can be run manually to fix discrepancies
 */
async function syncStockLevels() {
  const db = getFirestore(app);
  console.log("Starting stock recovery process...");

  // 1. Get all products
  const productsRef = collection(db, "products");
  const productsSnapshot = await getDocs(productsRef);
  const products: Record<string, ProductStock> = {};
  
  productsSnapshot.forEach((productDoc) => {
    const data = productDoc.data();
    products[productDoc.id] = {
      id: productDoc.id,
      name: data.name || 'Unknown Product',
      currentStock: data.stock || 0,
      initialStock: data.initialStock || data.stock || 0,
      calculatedStock: 0, // We'll calculate this from transactions
    };
  });
  
  console.log(`Found ${Object.keys(products).length} products in database`);
  
  // 2. Get all successful transactions
  const transactionsRef = collection(db, "transactions");
  const successQuery = query(transactionsRef, where("status", "in", ["success", "completed"]));
  const successTransactions = await getDocs(successQuery);
  
  console.log(`Found ${successTransactions.size} successful transactions`);
  
  // 3. Calculate total items sold per product
  const soldItems: Record<string, number> = {};
  
  successTransactions.forEach((transactionDoc) => {
    const transaction = transactionDoc.data();
    const items = transaction.items as TransactionItem[] || [];
    
    items.forEach((item: TransactionItem) => {
      const productId = item.id;
      const quantity = item.quantity || 0;
      
      if (!soldItems[productId]) {
        soldItems[productId] = 0;
      }
      
      soldItems[productId] += quantity;
    });
  });
  
  console.log("Items sold per product:", soldItems);
  
  // 4. Calculate what the stock should be for each product
  for (const productId in products) {
    const product = products[productId];
    const sold = soldItems[productId] || 0;
    product.calculatedStock = Math.max(0, product.initialStock - sold);
  }
  
  // 5. Find discrepancies
  const discrepancies: StockDiscrepancy[] = [];
  
  for (const productId in products) {
    const product = products[productId];
    if (product.currentStock !== product.calculatedStock) {
      discrepancies.push({
        productId,
        name: product.name,
        currentStock: product.currentStock,
        calculatedStock: product.calculatedStock,
        difference: product.calculatedStock - product.currentStock
      });
    }
  }
  
  console.log(`Found ${discrepancies.length} products with stock discrepancies`);
  console.table(discrepancies);
  
  // 6. Fix discrepancies if requested
  const fixDiscrepancies = confirm("Do you want to fix these discrepancies?");
  
  if (fixDiscrepancies) {
    for (const discrepancy of discrepancies) {
      try {
        await updateDoc(doc(db, "products", discrepancy.productId), {
          stock: discrepancy.calculatedStock,
          lastSynced: new Date().toISOString()
        });
        console.log(`Updated stock for ${discrepancy.name} (${discrepancy.productId}): ${discrepancy.currentStock} → ${discrepancy.calculatedStock}`);
      } catch (error) {
        console.error(`Failed to update stock for ${discrepancy.productId}:`, error);
      }
    }
    console.log("Stock synchronization completed!");
  } else {
    console.log("No changes were made to the stock levels.");
  }
}

// Usage instructions
console.log(`
======================================
STOCK RECOVERY UTILITY
======================================

This utility helps recover and synchronize stock levels based on transaction history.
It will:
1. Read all products in the database
2. Calculate expected stock based on initial stock and completed transactions
3. Identify and optionally fix any discrepancies

To run:
- Call syncStockLevels() in your browser console when logged in as an admin
- Review the discrepancies and confirm if you want to update them

NOTE: Make sure you're logged in as an admin before running this utility.
`);

// Export the utility function
export default syncStockLevels;
