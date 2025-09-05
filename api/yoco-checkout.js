// Direct Yoco API integration for serverless deployment

export default async function handler(req, res) {
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
    const payload = req.body;
    const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;
    
    if (!YOCO_SECRET_KEY) {
      console.error('Missing YOCO_SECRET_KEY environment variable');
      return res.status(500).json({ error: 'Yoco secret key not configured' });
    }

    // If no token provided, create a checkout session instead
    if (!payload.token) {
      console.log('No token provided, creating checkout session...');
      
      // Validate required fields for checkout session
      if (!payload.amount || !payload.successUrl || !payload.cancelUrl || !payload.failureUrl) {
        console.error('Missing required fields for checkout session:', {
          amount: !!payload.amount,
          successUrl: !!payload.successUrl,
          cancelUrl: !!payload.cancelUrl,
          failureUrl: !!payload.failureUrl
        });
        return res.status(400).json({ 
          error: 'Missing required fields: amount, successUrl, cancelUrl, failureUrl' 
        });
      }

      const checkoutPayload = {
        amount: payload.amount,
        currency: payload.currency || 'ZAR',
        successUrl: payload.successUrl,
        cancelUrl: payload.cancelUrl,
        failureUrl: payload.failureUrl,
        metadata: payload.metadata || {}
      };

      console.log('Sending to Yoco Checkout API:', JSON.stringify(checkoutPayload, null, 2));
      
      const checkoutResponse = await fetch('https://payments.yoco.com/api/checkouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutPayload)
      });

      const checkoutData = await checkoutResponse.json();
      console.log('Yoco API Response Status:', checkoutResponse.status);
      console.log('Yoco API Response:', JSON.stringify(checkoutData, null, 2));

      if (!checkoutResponse.ok) {
        console.error('Yoco Checkout API Error:', {
          status: checkoutResponse.status,
          statusText: checkoutResponse.statusText,
          data: checkoutData
        });
        return res.status(checkoutResponse.status).json({ 
          error: 'Yoco API Error',
          details: checkoutData 
        });
      }

      console.log('Yoco Checkout created successfully');
      return res.status(200).json(checkoutData);
    }

    // Original token-based payment code for direct charges
    console.log('Token provided, processing direct charge...');
    
    // Defensive: check for token (must exist and not be empty)
    if (typeof payload.token !== 'string' || payload.token.trim() === '') {
      console.error('Invalid Yoco token in payload:', typeof payload.token);
      return res.status(400).json({ error: 'Invalid Yoco token in payload' });
    }

    // Defensive: use items from metadata
    const items = payload.metadata?.items || [];

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
          items: JSON.stringify(items),
          customerEmail: payload.metadata?.customerEmail,
          deliveryMethod: payload.metadata?.deliveryMethod,
          deliveryAddress: payload.metadata?.deliveryAddress,
          deliveryFee: payload.metadata?.deliveryFee,
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
    console.error('Full error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}
