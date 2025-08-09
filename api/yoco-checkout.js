// Direct Yoco API integration for serverless deployment

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
    console.log('Received payload at /api/yoco-checkout:', JSON.stringify(req.body, null, 2));
    
    const { cartItems, ...payload } = req.body;
    
    // Get Yoco secret key from environment
    const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;
    
    if (!YOCO_SECRET_KEY) {
      return res.status(500).json({ error: 'Yoco secret key not configured' });
    }

    // Create Yoco checkout session
    const yocoResponse = await fetch('https://online.yoco.com/v1/charges/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: payload.amount,
        currency: 'ZAR',
        token: payload.token,
        metadata: {
          cartItems: JSON.stringify(cartItems),
          customerEmail: payload.customerEmail,
          deliveryMethod: payload.deliveryMethod,
          deliveryAddress: payload.deliveryAddress,
        }
      })
    });

    const yocoData = await yocoResponse.json();
    
    if (!yocoResponse.ok) {
      console.error('Yoco API Error:', yocoData);
      return res.status(yocoResponse.status).json({
        error: yocoData
      });
    }

    console.log('Yoco API Response:', JSON.stringify(yocoData, null, 2));
    res.status(200).json(yocoData);
    
  } catch (err) {
    console.error('Checkout API Error:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
};
