export default async function handler(req, res) {
  // Simple endpoint to check what's actually deployed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const config = {
    timestamp: new Date().toISOString(),
    hardCodedBusinessEmail: 'charles.constructionsm@gmail.com',
    environmentVars: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.FROM_EMAIL,
      toEmail: process.env.TO_EMAIL || 'NOT_SET',
      nodeEnv: process.env.NODE_ENV
    },
    deploymentInfo: {
      vercelRegion: process.env.VERCEL_REGION,
      vercelUrl: process.env.VERCEL_URL
    }
  };

  res.status(200).json({
    message: 'Configuration Check',
    config: config
  });
}
