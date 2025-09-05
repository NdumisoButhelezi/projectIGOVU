// CourierGuy quote API with enhanced error handling and fallback

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

  const COURIERGUY_API_KEY = process.env.COURIERGUY_API_KEY;

  console.log('CourierGuy API request received:', {
    hasApiKey: !!COURIERGUY_API_KEY,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  if (!COURIERGUY_API_KEY) {
    console.error('CourierGuy API key missing');
    return res.status(500).json({ 
      error: 'Courier Guy API key is not configured.',
      code: 'MISSING_API_KEY'
    });
  }

  try {
    const quotePayload = req.body;
    
    // Validate the payload
    if (!quotePayload || typeof quotePayload !== 'object') {
      return res.status(400).json({
        error: 'Invalid request payload',
        code: 'INVALID_PAYLOAD'
      });
    }

    // Try multiple CourierGuy API endpoints/methods
    const apiUrls = [
      'https://api.thecourierguy.co.za/api/quote',
      'https://api.thecourierguy.co.za/v2/quote',
      'https://thecourierguy.co.za/api/quote'
    ];

    let lastError = null;

    for (let i = 0; i < apiUrls.length; i++) {
      const apiUrl = apiUrls[i];
      console.log(`Attempting CourierGuy API call ${i + 1}/${apiUrls.length}:`, apiUrl);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${COURIERGUY_API_KEY}`,
            'User-Agent': 'IGOVU-Store/1.0',
          },
          body: JSON.stringify(quotePayload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log(`CourierGuy API ${i + 1} response status:`, response.status);
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error(`CourierGuy API ${i + 1} error response:`, data);
          lastError = {
            status: response.status,
            data: data,
            url: apiUrl
          };
          continue; // Try next URL
        }
        
        console.log(`CourierGuy API ${i + 1} success:`, data);
        return res.status(200).json(data);
        
      } catch (fetchError) {
        console.error(`CourierGuy API ${i + 1} fetch error:`, {
          message: fetchError.message,
          name: fetchError.name,
          url: apiUrl
        });
        
        lastError = {
          error: fetchError.message,
          name: fetchError.name,
          url: apiUrl
        };
        
        // Don't try other URLs if it's an abort error (timeout)
        if (fetchError.name === 'AbortError') {
          break;
        }
      }
    }

    // If all API calls failed, return a fallback response
    console.error('All CourierGuy API attempts failed, using fallback');
    
    // Return a mock delivery quote as fallback
    return res.status(200).json({
      success: true,
      rates: [
        {
          service: 'Standard Delivery',
          price: 65.00,
          currency: 'ZAR',
          days: '2-3 business days',
          provider: 'Fallback Service'
        },
        {
          service: 'Express Delivery',
          price: 95.00,
          currency: 'ZAR', 
          days: '1-2 business days',
          provider: 'Fallback Service'
        }
      ],
      message: 'Using fallback delivery rates - CourierGuy API unavailable',
      fallback: true,
      lastError: lastError
    });
    
  } catch (err) {
    console.error('Unexpected CourierGuy API error:', {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    
    // Return fallback even on unexpected errors
    return res.status(200).json({
      success: true,
      rates: [
        {
          service: 'Standard Delivery',
          price: 65.00,
          currency: 'ZAR',
          days: '2-3 business days',
          provider: 'Fallback Service'
        }
      ],
      message: 'Using fallback delivery rates due to service error',
      fallback: true,
      error: err.message
    });
  }
}
