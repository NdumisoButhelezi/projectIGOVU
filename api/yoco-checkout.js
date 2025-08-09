import axios from 'axios';

// Remove the proxy URL since we're handling the logic directly in this serverless function
// const PROXY_API_URL = 'http://localhost:4000/api/yoco-checkout';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log('Received payload at /api/yoco-checkout:', JSON.stringify(req.body, null, 2)); // Debug log
    const { cartItems, ...payload } = req.body; // Extract cartItems from the request body
    const proxyRes = await axios.post(PROXY_API_URL, { cartItems, ...payload }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Response from Yoco Proxy API:', JSON.stringify(proxyRes.data, null, 2)); // Debug log
    res.status(proxyRes.status).json(proxyRes.data);
  } catch (err) {
    if (err.response) {
      console.error('Proxy API Error:', err.response.data);
      res.status(err.response.status).json({
        error: err.response.data,
      });
    } else {
      console.error('Proxy API Error:', err.message);
      res.status(500).json({
        error: err.message,
      });
    }
  }
}
