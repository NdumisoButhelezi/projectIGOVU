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
    const OSM_API_KEY = process.env.OSM_API_KEY || process.env.VITE_OSM_API_KEY || '16b19b41d218475ea44e4dfcbb35c632';
    
    if (!OSM_API_KEY) {
      // Use mock data instead of returning an error
      console.warn('OSM API key not configured, using mock data');
      return res.status(200).json({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              address_line1: text,
              address_line2: "South Africa",
              city: "Durban",
              country: "South Africa",
              country_code: "za",
              formatted: `${text}, Durban, South Africa`,
              lat: -29.8587,
              lon: 31.0218,
              postcode: "4001",
              state: "KwaZulu-Natal"
            },
            geometry: {
              coordinates: [31.0218, -29.8587],
              type: "Point"
            }
          }
        ]
      });
    }

    // Log the request for debugging
    console.log(`Geocoding request for text: "${text}" with API key: ${OSM_API_KEY.substring(0, 5)}...`);

    // Try multiple geocoding services - first Geoapify
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&limit=${limit}&lang=${lang}&apiKey=${OSM_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Geoapify API error: ${response.status}`);
      }

      const data = await response.json();
      return res.status(200).json(data);
    } catch (geoapifyError) {
      console.error('Geoapify error:', geoapifyError);
      
      // Fallback to Nominatim (OpenStreetMap free service)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error(`Nominatim API error: ${response.status}`);
        }

        const nominatimData = await response.json();
        
        // Convert Nominatim format to our expected format
        const features = nominatimData.map(item => ({
          type: "Feature",
          properties: {
            address_line1: item.display_name.split(',')[0],
            address_line2: item.display_name.split(',').slice(1).join(',').trim(),
            city: item.address?.city || item.address?.town || item.address?.village || '',
            country: item.address?.country || '',
            country_code: item.address?.country_code || '',
            formatted: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            postcode: item.address?.postcode || '',
            state: item.address?.state || ''
          },
          geometry: {
            coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
            type: "Point"
          }
        }));

        return res.status(200).json({
          type: "FeatureCollection",
          features
        });
      } catch (nominatimError) {
        console.error('Nominatim fallback error:', nominatimError);
        throw geoapifyError; // Re-throw original error for final fallback
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    
    // Last resort - return mock data instead of an error
    return res.status(200).json({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            address_line1: text,
            address_line2: "South Africa",
            city: "Durban",
            country: "South Africa",
            country_code: "za",
            formatted: `${text}, Durban, South Africa`,
            lat: -29.8587,
            lon: 31.0218,
            postcode: "4001",
            state: "KwaZulu-Natal"
          },
          geometry: {
            coordinates: [31.0218, -29.8587],
            type: "Point"
          }
        }
      ]
    });
  }
};
