const express = require('express');
const path = require('path');
const { Resend } = require('resend');

const app = express();
const PORT = 3000;

// Environment variables for local development
const RESEND_API_KEY = 're_Hn66szAL_H1Y6c6jGPC8n8ems6Kwqx9ji';
const FROM_EMAIL = 'noreply@construction-ste-marie.com';
const RECAPTCHA_SECRET_KEY = '6Len-rQrAAAAAJNv4Gl8FWXgaRUuNlAHc6xwb0Bf';

// Initialize Resend
const resend = new Resend(RESEND_API_KEY);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get('/renovation-terrebonne', (req, res) => {
  res.sendFile(path.join(__dirname, 'renovation-terrebonne.html'));
});

app.get('/renovation-repentigny', (req, res) => {
  res.sendFile(path.join(__dirname, 'renovation-repentigny.html'));
});

app.get('/renovation-joliette', (req, res) => {
  res.sendFile(path.join(__dirname, 'renovation-joliette.html'));
});

app.get('/politique-de-cookie', (req, res) => {
  res.sendFile(path.join(__dirname, 'politique-de-cookie.html'));
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
        
        if (recaptchaResult.score && recaptchaResult.score < 0.3) {
          return res.status(400).json({
            success: false,
            message: 'Score de sécurité trop bas. Veuillez réessayer.'
          });
        }
      } catch (error) {
        console.error('reCAPTCHA verification error:', error);
      }
    }

    // Validate required fields
    if (!fullName || !email || !phone || !service || !budget || !message) {
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

    // Create email content
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f8f9fa;
          }
          .email-container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-left: 5px solid #007bff;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
          }
          .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .section {
            margin-bottom: 25px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #28a745;
          }
          .section h3 {
            color: #28a745;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: 600;
          }
          .field {
            display: flex;
            margin-bottom: 12px;
            align-items: center;
          }
          .field-label {
            font-weight: 600;
            color: #495057;
            min-width: 140px;
            margin-right: 15px;
          }
          .field-value {
            color: #212529;
            flex: 1;
          }
          .message-box {
            background: white;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #dee2e6;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
          }
          .highlight {
            background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🏗️ Nouvelle Soumission - Construction Ste-Marie</h1>
            <p style="margin: 0; color: #6c757d; font-size: 16px;">Un nouveau client souhaite un devis !</p>
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
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: 'wrivard@kua.quebec',
      subject: `🏗️ Nouveau Projet - ${fullName} (${city}) - Construction Ste-Marie`,
      html: emailContent,
      replyTo: email
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.'
      });
    }

    console.log('Email envoyé avec succès:', data);

    res.status(200).json({
      success: true,
      message: 'Votre soumission a été envoyée avec succès !',
      data: data
    });

  } catch (error) {
    console.error('Erreur du serveur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur. Veuillez réessayer plus tard.'
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
