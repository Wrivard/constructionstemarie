import { Resend } from 'resend';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const hardCodedEmail = 'charles.constructionsm@gmail.com';

    console.log('🧪 DEBUG EMAIL TEST');
    console.log('📧 From:', fromEmail);
    console.log('📧 To (hard-coded):', hardCodedEmail);
    console.log('📧 API Key present:', !!process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: hardCodedEmail,
      subject: '🧪 DEBUG: Email Routing Test',
      html: `
        <h2>🧪 Email Routing Debug Test</h2>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>From:</strong> ${fromEmail}</p>
        <p><strong>To (hard-coded):</strong> ${hardCodedEmail}</p>
        <p><strong>Expected recipient:</strong> charles.constructionsm@gmail.com</p>
        <p>If you receive this email at the wrong address, there's a routing issue somewhere!</p>
      `
    });

    if (error) {
      console.error('❌ Debug email error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error,
        config: {
          from: fromEmail,
          to: hardCodedEmail
        }
      });
    }

    console.log('✅ Debug email sent:', data);
    return res.status(200).json({ 
      success: true, 
      message: 'Debug email sent successfully',
      data: data,
      config: {
        from: fromEmail,
        to: hardCodedEmail,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Debug email exception:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
}
