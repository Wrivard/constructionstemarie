export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || 'AlzaSyCpMa49c3sFHy1Xegzzr6ctgs6Fsiwb-tg';
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Google Maps API key not configured',
      status: 'missing_key'
    });
  }

  // Test if the API key works by making a simple request
  try {
    const testUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    
    // We can't actually test the API key without making a real request,
    // but we can return the key info for debugging
    res.status(200).json({ 
      apiKey: apiKey,
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 10),
      status: 'key_available',
      message: 'API key is available. Make sure Maps JavaScript API is enabled in Google Cloud Console.'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error testing API key',
      details: error.message,
      status: 'test_error'
    });
  }
}

