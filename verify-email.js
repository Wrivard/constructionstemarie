const { Resend } = require('resend');

// Test script to verify Resend configuration
async function testResend() {
  console.log('🧪 Testing Resend Email Configuration');
  console.log('=====================================');
  
  // Check environment variables
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  
  console.log('🔑 API Key present:', !!apiKey);
  console.log('📧 From Email:', fromEmail);
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY environment variable is missing!');
    console.log('💡 Please set your Resend API key in Vercel environment variables');
    return;
  }
  
  // Initialize Resend
  const resend = new Resend(apiKey);
  
  try {
    console.log('📧 Sending test email...');
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: 'wrivard@kua.quebec',
      subject: '🧪 Test Email - Construction Ste-Marie',
      html: `
        <h2>🧪 Test Email</h2>
        <p>This is a test email to verify your Resend configuration is working properly.</p>
        <p><strong>From:</strong> ${fromEmail}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p>If you receive this email, your configuration is working! 🎉</p>
      `
    });
    
    if (error) {
      console.error('❌ Error sending email:', error);
      
      // Provide specific guidance based on error
      if (error.message?.includes('Invalid from address')) {
        console.log('💡 Solution: You need to verify your domain with Resend or use onboarding@resend.dev');
        console.log('📖 Read more: https://resend.com/docs/send-with-domains');
      } else if (error.message?.includes('Invalid API key')) {
        console.log('💡 Solution: Check that your RESEND_API_KEY is correct in Vercel');
      }
      
      return;
    }
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Email ID:', data.id);
    console.log('🎉 Your Resend configuration is working properly!');
    
  } catch (error) {
    console.error('❌ Exception occurred:', error.message);
  }
}

// Run the test
testResend();
