// Simple sync stock API without Firebase dependency

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
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
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity) {
      return res.status(400).json({ 
        error: 'productId and quantity are required',
        received: req.body
      });
    }
    
    console.log(`Syncing stock for product ${productId}, quantity: ${quantity}`);
    
    // For now, just return success
    // This is a temporary solution until Firebase is properly configured
    return res.status(200).json({
      success: true,
      productId,
      quantity,
      message: 'Stock sync completed (simulated - Firebase not configured)',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Stock sync error:', error);
    
    return res.status(500).json({
      error: 'Stock sync failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
