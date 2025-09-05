// Simple stock API without Firebase dependency

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
    
    // For now, return a default response indicating product is in stock
    // This is a temporary solution until Firebase is properly configured
    const responseData = {
      productId,
      stock: 10, // Default stock
      name: 'Product',
      lastUpdated: new Date().toISOString(),
      inStock: true,
      isDefault: true,
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
      isEstimated: true,
      errorOccurred: true,
      error: error.message
    });
  }
};
