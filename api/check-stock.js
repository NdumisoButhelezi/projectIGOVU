// Stock checking API endpoint
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

  try {
    const { productId } = req.query;
    
    if (!productId) {
      return res.status(400).json({ 
        error: 'productId is required',
        received: req.query
      });
    }

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
    
    res.status(200).json({
      productId,
      stock: productData.stock || 0,
      name: productData.name || '',
      lastUpdated: productData.lastUpdated || new Date().toISOString(),
      inStock: (productData.stock || 0) > 0
    });
    
  } catch (error) {
    console.error('Stock check error:', error);
    res.status(500).json({
      error: 'Failed to check stock',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
