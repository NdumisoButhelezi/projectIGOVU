// Stock synchronization API endpoint with Firebase integration
const admin = require('../firebase-admin.cjs');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log('Stock sync request received:', JSON.stringify(req.body, null, 2));
    
    const { productId, quantity, action = 'reduce' } = req.body;
    
    if (!productId || !quantity) {
      return res.status(400).json({ 
        error: 'productId and quantity are required',
        received: { productId, quantity }
      });
    }

    const db = admin.firestore();
    
    // First, log the request to a queue for retry if needed
    const queueRef = db.collection('stockSyncQueue').doc();
    await queueRef.set({
      productId,
      quantity,
      action,
      processed: false,
      attempts: 0,
      timestamp: new Date().toISOString(),
      requestId: queueRef.id
    });

    // Try to update the stock directly
    try {
      const productRef = db.collection('products').doc(productId);
      const productDoc = await productRef.get();
      
      if (!productDoc.exists) {
        console.warn(`Product ${productId} not found in database`);
        return res.status(404).json({
          success: false,
          message: `Product ${productId} not found`,
          error: 'Product not found',
          queuedForRetry: true,
          requestId: queueRef.id
        });
      }
      
      const currentStock = productDoc.data().stock || 0;
      const newStock = action === 'reduce' 
        ? Math.max(0, currentStock - quantity) 
        : currentStock + quantity;
        
      await productRef.update({ 
        stock: newStock,
        lastUpdated: new Date().toISOString()
      });
      
      // Mark queue item as processed
      await queueRef.update({
        processed: true,
        processedAt: new Date().toISOString()
      });
      
      // Also log to transaction history
      await db.collection('stockTransactions').add({
        productId,
        quantity,
        action,
        previousStock: currentStock,
        newStock,
        timestamp: new Date().toISOString(),
        requestId: queueRef.id
      });

      const processedItem = {
        productId,
        quantity,
        action,
        previousStock: currentStock,
        newStock,
        processed: true,
        timestamp: new Date().toISOString()
      };

      console.log('Stock sync processed successfully:', processedItem);

      res.status(200).json({
        success: true,
        message: `Stock ${action}d successfully for product ${productId}`,
        processedItem,
        timestamp: new Date().toISOString()
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      // We've already queued the request, so we can return a partial success
      res.status(202).json({
        success: false,
        message: `Stock update queued for later processing for product ${productId}`,
        error: dbError.message,
        queuedForRetry: true,
        requestId: queueRef.id,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Stock sync error:', error);
    res.status(500).json({
      error: 'Failed to sync stock',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
