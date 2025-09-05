// Stock API with Firebase integration and fallback
const admin = require('../firebase-admin.cjs');

module.exports = async (req, res) => {
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

  const { productId } = req.query;
  
  if (!productId) {
    return res.status(400).json({ 
      error: 'productId is required',
      received: req.query
    });
  }
  
  try {
    console.log(`Checking stock for product: ${productId}`);
    
    // Try to use Firebase if available
    if (admin && admin.apps && admin.apps.length > 0) {
      try {
        const db = admin.firestore();
        const productDoc = await db.collection('products').doc(productId).get();
        
        if (productDoc.exists) {
          const productData = productDoc.data();
          console.log(`Firebase stock data for ${productId}:`, productData.stock);
          
          return res.status(200).json({
            productId,
            stock: productData.stock || 0,
            name: productData.name || 'Product',
            lastUpdated: productData.lastUpdated ? productData.lastUpdated.toDate().toISOString() : new Date().toISOString(),
            inStock: (productData.stock || 0) > 0,
            source: 'firebase',
            message: 'Stock retrieved from Firebase'
          });
        } else {
          console.log(`Product ${productId} not found in Firebase, creating default entry...`);
          
          // Create default product entry
          const defaultProduct = {
            name: `Product ${productId}`,
            stock: 10,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
          };
          
          await db.collection('products').doc(productId).set(defaultProduct);
          
          return res.status(200).json({
            productId,
            stock: 10,
            name: `Product ${productId}`,
            lastUpdated: new Date().toISOString(),
            inStock: true,
            source: 'firebase-default',
            message: 'Created default product in Firebase'
          });
        }
      } catch (firebaseError) {
        console.error('Firebase error:', firebaseError);
        // Fall through to default response
      }
    }
    
    // Default response if Firebase is not available or failed
    console.log(`Using default stock for ${productId} - Firebase unavailable`);
    const responseData = {
      productId,
      stock: 10, // Default stock
      name: 'Product',
      lastUpdated: new Date().toISOString(),
      inStock: true,
      source: 'default',
      message: 'Using default stock data - Firebase not configured'
    };
    
    return res.status(200).json(responseData);
    
  } catch (error) {
    console.error('Stock check error:', error);
    
    return res.status(200).json({
      productId,
      stock: 1,
      name: 'Product',
      lastUpdated: new Date().toISOString(),
      inStock: true,
      source: 'error-fallback',
      errorOccurred: true,
      error: error.message
    });
  }
};
