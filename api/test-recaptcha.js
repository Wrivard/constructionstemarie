export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { token } = req.body;
    
    console.log('🔍 Testing reCAPTCHA token:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'No reCAPTCHA token provided'
      });
    }

    // Verify with Google
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      return res.status(500).json({
        success: false,
        error: 'RECAPTCHA_SECRET_KEY not configured'
      });
    }

    console.log('🔑 Using secret key:', secretKey.substring(0, 10) + '...');

    const verifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`
    });

    const verifyResult = await verifyResponse.json();
    
    console.log('🔍 Google verification result:', verifyResult);

    if (verifyResult.success) {
      return res.status(200).json({
        success: true,
        score: verifyResult.score,
        action: verifyResult.action,
        hostname: verifyResult.hostname
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'reCAPTCHA verification failed',
        details: verifyResult['error-codes']
      });
    }

  } catch (error) {
    console.error('❌ reCAPTCHA test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
