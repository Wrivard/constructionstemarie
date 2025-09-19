import { Resend } from 'resend';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🧪 Simple test started');
    console.log('📧 API Key exists:', !!process.env.RESEND_API_KEY);
    console.log('📧 FROM_EMAIL:', process.env.FROM_EMAIL);

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ 
        error: 'RESEND_API_KEY missing',
        hasKey: false
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log('📧 Resend instance created');

    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'wrivard@kua.quebec',
      subject: '🧪 Simple Test',
      html: '<p>Simple test email</p>'
    });

    console.log('📧 Send result:', result);

    if (result.error) {
      console.error('❌ Send error:', result.error);
      return res.status(500).json({ 
        error: result.error,
        success: false
      });
    }

    return res.status(200).json({ 
      success: true,
      data: result.data,
      message: 'Simple test email sent'
    });

  } catch (error) {
    console.error('❌ Exception:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack,
      success: false
    });
  }
}
