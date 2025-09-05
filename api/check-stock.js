// Stock checking API endpoint
import admin from '../firebase-admin.cjs';

// Product stock cache to reduce database queries
const stockCache = new Map();
const cacheTTL = 60 * 1000; // 1 minute cache TTL

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { productId, bypassCache } = req.query;
  
  if (!productId) {
    return res.status(400).json({ 
      error: 'productId is required',
      received: req.query
    });
  }
  
  try {
    // Check if we have a recent cache entry
    const now = Date.now();
    const cacheKey = `stock_${productId}`;
    const cachedData = stockCache.get(cacheKey);
    
    if (cachedData && !bypassCache && (now - cachedData.timestamp) < cacheTTL) {
      console.log(`Serving cached stock data for product ${productId}`);
      return res.status(200).json(cachedData.data);
    }
    
    // If no valid cache or bypass requested, fetch from database
    try {
      const db = admin.firestore();
      const productRef = db.collection('products').doc(productId);
      const productDoc = await productRef.get();
      
      if (!productDoc.exists) {
        return res.status(404).json({
          error: 'Product not found',
          productId
        });
      }
      
      const productData = productDoc.data();
      
      // Prepare response data
      const responseData = {
        productId,
        stock: productData.stock || 0,
        name: productData.name || '',
        lastUpdated: productData.lastUpdated || new Date().toISOString(),
        inStock: (productData.stock || 0) > 0
      };
      
      // Update cache
      stockCache.set(cacheKey, {
        timestamp: now,
        data: responseData
      });
      
      return res.status(200).json(responseData);
    } catch (firestoreError) {
      console.error('Firestore error:', firestoreError);
      
      // If Firestore access fails, try fallback data source or return cached data if available
      if (cachedData) {
        console.log(`Using stale cache for product ${productId} due to Firestore error`);
        return res.status(200).json({
          ...cachedData.data,
          fromStaleCache: true,
          cacheAge: Math.floor((now - cachedData.timestamp) / 1000) + 's'
        });
      }
      
      // Try to access product data from a static dataset or another source
      // This is a simplified example - you might want to implement a more robust fallback
      // If all else fails, return a default response
      return res.status(200).json({
        productId,
        stock: 10, // Default stock
        name: 'Product (Fallback)',
        lastUpdated: new Date().toISOString(),
        inStock: true,
        fromFallback: true
      });
    }
  } catch (error) {
    console.error('Stock check error:', error);
    
    // Even in case of error, return a usable response instead of an error
    // This ensures the UI can still function, though with potentially stale data
    return res.status(200).json({
      productId,
      stock: 1,
      name: 'Product',
      lastUpdated: new Date().toISOString(),
      inStock: true,
      isEstimated: true,
      errorOccurred: true
    });
  }
}
