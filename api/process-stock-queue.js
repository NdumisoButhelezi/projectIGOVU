// Stock synchronization queue processor
const admin = require('../firebase-admin.js');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET for manual trigger or POST for automated systems
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log('Starting stock queue processing');
    
    const db = admin.firestore();
    
    // Get unprocessed queue items with less than 5 attempts
    const queueQuery = await db.collection('stockSyncQueue')
      .where('processed', '==', false)
      .where('attempts', '<', 5)
      .orderBy('attempts')
      .orderBy('timestamp')
      .limit(20) // Process a batch at a time
      .get();
    
    if (queueQuery.empty) {
      return res.status(200).json({
        success: true,
        message: 'No pending items in the queue',
        processed: 0
      });
    }
    
    const results = {
      success: [],
      failed: []
    };
    
    // Process each queue item
    for (const queueDoc of queueQuery.docs) {
      const queueItem = queueDoc.data();
      const queueId = queueDoc.id;
      
      console.log(`Processing queue item ${queueId} for product ${queueItem.productId}`);
      
      try {
        // Increment attempt counter
        await queueDoc.ref.update({
          attempts: (queueItem.attempts || 0) + 1,
          lastAttempt: new Date().toISOString()
        });
        
        // Get the product
        const productRef = db.collection('products').doc(queueItem.productId);
        const productDoc = await productRef.get();
        
        if (!productDoc.exists) {
          console.warn(`Product ${queueItem.productId} not found in database`);
          results.failed.push({
            queueId,
            productId: queueItem.productId,
            reason: 'Product not found',
            attempts: queueItem.attempts + 1
          });
          continue;
        }
        
        // Update the stock
        const currentStock = productDoc.data().stock || 0;
        const newStock = queueItem.action === 'reduce' 
          ? Math.max(0, currentStock - queueItem.quantity) 
          : currentStock + queueItem.quantity;
          
        await productRef.update({ 
          stock: newStock,
          lastUpdated: new Date().toISOString()
        });
        
        // Mark as processed
        await queueDoc.ref.update({
          processed: true,
          processedAt: new Date().toISOString()
        });
        
        // Log to transaction history
        await db.collection('stockTransactions').add({
          productId: queueItem.productId,
          quantity: queueItem.quantity,
          action: queueItem.action,
          previousStock: currentStock,
          newStock,
          timestamp: new Date().toISOString(),
          requestId: queueId,
          fromQueue: true
        });
        
        results.success.push({
          queueId,
          productId: queueItem.productId,
          quantity: queueItem.quantity,
          action: queueItem.action,
          previousStock: currentStock,
          newStock
        });
        
      } catch (error) {
        console.error(`Error processing queue item ${queueId}:`, error);
        results.failed.push({
          queueId,
          productId: queueItem.productId,
          reason: error.message,
          attempts: queueItem.attempts + 1
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Processed ${results.success.length + results.failed.length} queue items`,
      successful: results.success.length,
      failed: results.failed.length,
      details: results
    });
    
  } catch (error) {
    console.error('Stock queue processing error:', error);
    res.status(500).json({
      error: 'Failed to process stock queue',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
