// Stock synchronization API endpoint
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

    // Here you would normally update your database/inventory system
    // For now, we'll just simulate a successful sync
    const processedItem = {
      productId: productId,
      quantity: quantity,
      action: action,
      processed: true,
      timestamp: new Date().toISOString()
    };

    console.log('Stock sync processed:', processedItem);

    res.status(200).json({
      success: true,
      message: `Stock ${action}d successfully for product ${productId}`,
      processedItem: processedItem,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Stock sync error:', error);
    res.status(500).json({
      error: 'Failed to sync stock',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
