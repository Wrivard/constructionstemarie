const express = require('express');
const path = require('path');
const { Resend } = require('resend');

const app = express();
const PORT = 3000;

// Environment variables for local development
// IMPORTANT: Set RESEND_API_KEY in your environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'onboarding@resend.dev'; // Resend verified sender
const TO_EMAIL = 'charles.constructionsm@gmail.com'; // Business email
const RECAPTCHA_SECRET_KEY = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';

console.log('🔑 Resend API Key:', RESEND_API_KEY ? 'Present' : 'Missing');
console.log('📧 From Email:', FROM_EMAIL);
console.log('📧 To Email:', TO_EMAIL);

// Initialize Resend
const resend = new Resend(RESEND_API_KEY);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add CORS headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Clean URLs middleware - handle routes without .html
app.get('/soumission-en-ligne', (req, res) => {
  res.sendFile(path.join(__dirname, 'soumission-en-ligne.html'));
});

app.get('/a-propos', (req, res) => {
  res.sendFile(path.join(__dirname, 'a-propos.html'));
});

app.get('/renovation-laval', (req, res) => {
  res.sendFile(path.join(__dirname, 'renovation-laval.html'));
});

app.get('/renovation-joliette', (req, res) => {
  res.sendFile(path.join(__dirname, 'renovation-joliette.html'));
});

app.get('/renovation-repentigny', (req, res) => {
  res.sendFile(path.join(__dirname, 'renovation-repentigny.html'));
});

app.get('/renovation-terrebonne', (req, res) => {
  res.sendFile(path.join(__dirname, 'renovation-terrebonne.html'));
});

app.get('/services/renovation', (req, res) => {
  res.sendFile(path.join(__dirname, 'services/renovation.html'));
});

app.get('/services/agrandissement-de-maison', (req, res) => {
  res.sendFile(path.join(__dirname, 'services/agrandissement-de-maison.html'));
});

// Static files (serve after clean URL routes)
app.use(express.static('.'));

// API endpoint - same as Vercel function
app.post('/api/submit-form', async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('API endpoint called');
  console.log('Request body:', req.body);

  try {
    const {
      'Contact-2-First-Name': fullName,
      'Contact-2-Last-Name': city,
      'Contact-2-Email-2': email,
      'Contact-2-Phone': phone,
      'Contact-2-Select': service,
      'Contact-2-Radio': budget,
      'Contact-2-Message': message,
      'g-recaptcha-response': recaptchaToken
    } = req.body;

    // Verify reCAPTCHA (optional for local dev)
    if (recaptchaToken && recaptchaToken !== 'no-recaptcha' && recaptchaToken !== 'recaptcha-error') {
      try {
        const recaptchaVerify = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
        });

        const recaptchaResult = await recaptchaVerify.json();
        console.log('reCAPTCHA verification result:', recaptchaResult);
      } catch (error) {
        console.error('reCAPTCHA verification error:', error);
      }
    }

    // Validate required fields
    if (!fullName || !city || !email || !phone || !service || !budget || !message) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis.'
      });
    }

    // Format budget for better readability
    const budgetMap = {
      'Contact 2 Radio 1': '25 000$ et moins',
      'Contact 2 Radio 2': '25 000$-50 000$',
      'Contact 2 Radio 3': '50 000-100 000$',
      'Contact 2 Radio 4': '100 000$ et plus'
    };

    const formattedBudget = budgetMap[budget] || budget;

    // Create email content with emojis and clean formatting
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .email-container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c5530; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .section { background: #f8f9fa; padding: 20px; margin-bottom: 20px; border-radius: 8px; }
          .field { margin-bottom: 10px; display: flex; }
          .field-label { font-weight: bold; min-width: 150px; }
          .highlight { font-weight: bold; color: #2c5530; }
          .message-box { background: #fff; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6; margin-top: 10px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🏗️ Nouvelle Soumission - Construction Ste-Marie</h1>
            <p style="margin: 0; color: #f8f9fa; font-size: 16px;">Un nouveau client souhaite un devis !</p>
          </div>
          
          <div class="section">
            <h3>👤 Informations du Client</h3>
            <div class="field">
              <span class="field-label">📝 Nom complet :</span>
              <span class="field-value highlight">${fullName}</span>
            </div>
            <div class="field">
              <span class="field-label">🏙️ Ville :</span>
              <span class="field-value highlight">${city}</span>
            </div>
            <div class="field">
              <span class="field-label">📧 Email :</span>
              <span class="field-value highlight">${email}</span>
            </div>
            <div class="field">
              <span class="field-label">📱 Téléphone :</span>
              <span class="field-value highlight">${phone}</span>
            </div>
          </div>
          
          <div class="section">
            <h3>🔨 Détails du Projet</h3>
            <div class="field">
              <span class="field-label">🛠️ Service demandé :</span>
              <span class="field-value highlight">${service}</span>
            </div>
            <div class="field">
              <span class="field-label">💰 Budget estimé :</span>
              <span class="field-value highlight">${formattedBudget}</span>
            </div>
            <div class="field">
              <span class="field-label">💬 Message :</span>
            </div>
            <div class="message-box">
              ${message}
            </div>
          </div>
          
          <div class="footer">
            <p>🚀 <strong>Prêt à transformer ce projet en réalité ?</strong></p>
            <p>📧 Répondez directement à cet email pour contacter le client</p>
            <p style="margin-top: 15px; font-size: 12px; color: #adb5bd;">
              ✨ Envoyé depuis le formulaire de soumission en ligne de Construction Ste-Marie
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend
    console.log('📧 Attempting to send email...');
    console.log('📧 From:', FROM_EMAIL);
    console.log('📧 To:', TO_EMAIL);
    console.log('📧 Reply-To:', email);
    
    // SIMPLIFIED APPROACH: Use direct try/catch with more logging
    try {
      console.log('📧 Starting email send process...');
      console.log('📧 Resend API Key:', RESEND_API_KEY ? `${RESEND_API_KEY.substring(0, 5)}...` : 'Missing');
      
      const data = await resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL, // Use verified email
        subject: `🏗️ Nouveau Projet - ${fullName} (${city}) - Construction Ste-Marie`,
        html: emailContent,
        reply_to: email // Use reply_to instead of replyTo
      });
      
      console.log('📧 Resend API Response:', JSON.stringify(data, null, 2));
      
      if (data && data.id) {
        console.log('✅ Email business envoyé avec succès! ID:', data.id);
      } else {
        console.log('⚠️ Email sent but no ID returned:', data);
      }
      
      // Send confirmation email to the user
      const confirmationEmailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .email-container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c5530; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px 20px; border-radius: 0 0 8px 8px; }
            .highlight { background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>✅ Confirmation de Soumission</h1>
              <p style="margin: 0; font-size: 18px;">Construction Ste-Marie Inc.</p>
            </div>
            
            <div class="content">
              <p>Bonjour <strong>${fullName}</strong>,</p>
              
              <p>🎉 <strong>Merci pour votre demande de soumission !</strong></p>
              
              <p>Nous avons bien reçu votre demande concernant :</p>
              
              <div class="highlight">
                <p><strong>📋 Résumé de votre demande :</strong></p>
                <p>🛠️ <strong>Service :</strong> ${service}</p>
                <p>💰 <strong>Budget :</strong> ${formattedBudget}</p>
                <p>🏙️ <strong>Localisation :</strong> ${city}</p>
              </div>
              
              <p><strong>⏰ Prochaines étapes :</strong></p>
              <ul>
                <li>📞 Nous vous contacterons dans les <strong>24-48 heures</strong></li>
                <li>📋 Nous discuterons de vos besoins en détail</li>
                <li>📄 Nous vous fournirons une soumission détaillée</li>
              </ul>
              
              <p>💡 <strong>En attendant</strong>, n'hésitez pas à :</p>
              <ul>
                <li>📸 Préparer des photos de votre projet</li>
                <li>📝 Noter toutes vos questions</li>
                <li>📏 Prendre des mesures si possible</li>
              </ul>
              
              <div class="footer">
                <p><strong>📧 Besoin de nous joindre ?</strong></p>
                <p>Répondez simplement à cet email ou contactez-nous :</p>
                <p>🌐 <strong>Site web :</strong> constructionstemarie.com</p>
                <p style="margin-top: 20px; font-size: 12px;">
                  ✨ Merci de faire confiance à Construction Ste-Marie Inc. pour votre projet !
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        // Only try to send confirmation if business email succeeded
        const confirmationResult = await resend.emails.send({
          from: FROM_EMAIL,
          to: email, // User's email
          subject: `✅ Confirmation de soumission - Construction Ste-Marie`,
          html: confirmationEmailContent,
          reply_to: 'charles.constructionsm@gmail.com' // Business email for replies
        });
        
        console.log('✅ Email de confirmation envoyé:', confirmationResult);
      } catch (confirmError) {
        console.error('❌ Erreur envoi confirmation:', confirmError);
        // Don't fail the whole request if confirmation fails
      }

      // Return success even if confirmation email fails
      res.status(200).json({
        success: true,
        message: 'Votre soumission a été envoyée avec succès ! Vous recevrez une confirmation par email.',
        data: data
      });
      
    } catch (emailError) {
      console.error('❌ EMAIL ERROR:', emailError);
      console.error('❌ Error message:', emailError.message);
      console.error('❌ Error name:', emailError.name);
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.',
        debug: emailError.message
      });
    }

  } catch (error) {
    console.error('❌ SERVER ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur. Veuillez réessayer plus tard.',
      debug: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Local dev server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Local development server running on http://localhost:${PORT}`);
  console.log(`📧 Form page: http://localhost:${PORT}/soumission-en-ligne`);
  console.log(`🔧 API endpoint: http://localhost:${PORT}/api/submit-form`);
  console.log(`✨ Clean URLs enabled - no .html extensions needed!`);
});