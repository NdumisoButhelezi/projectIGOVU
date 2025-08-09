const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const COURIERGUY_API_URL = 'https://api.thecourierguy.co.za/api/quote';
  const COURIERGUY_API_KEY = process.env.COURIERGUY_API_KEY;

  if (!COURIERGUY_API_KEY) {
    return res.status(500).json({ error: 'Courier Guy API key is not set in environment variables.' });
  }

  try {
    const quotePayload = req.body;
    const courierRes = await axios.post(
      COURIERGUY_API_URL,
      quotePayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${COURIERGUY_API_KEY}`,
        },
      }
    );
    res.status(courierRes.status).json(courierRes.data);
  } catch (err) {
    if (err.code === 'ENOTFOUND') {
      console.error('DNS resolution error:', err.message);
      return res.status(500).json({ error: 'Unable to resolve Courier Guy API URL. Please check your internet connection or API URL.' });
    }
    res.status(err.response?.status || 500).json({
      error: err.response?.data || err.message,
    });
  }
};
