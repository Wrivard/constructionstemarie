export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the API key from environment variables or use the provided key
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || 'AlzaSyCpMa49c3sFHy1Xegzzr6ctgs6Fsiwb-tg';
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Google Maps API key not configured' });
  }

  // Return the API key securely
  res.status(200).json({ 
    apiKey: apiKey,
    libraries: 'places' // Include the places library for enhanced functionality
  });
}
