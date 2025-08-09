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

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { text, limit = 5, lang = 'en' } = req.query;
  
  if (!text) {
    res.status(400).json({ error: 'Text parameter is required' });
    return;
  }

  try {
    const OSM_API_KEY = process.env.OSM_API_KEY;
    
    if (!OSM_API_KEY) {
      res.status(500).json({ error: 'OSM API key not configured' });
      return;
    }

    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&limit=${limit}&lang=${lang}&apiKey=${OSM_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Failed to fetch geocoding data' });
  }
}
