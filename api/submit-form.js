import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
      message: 'Méthode non autorisée. Utilisez POST.' 
    });
  }

  // Debug logging
  console.log('API endpoint called');
  console.log('Request body:', req.body);
  console.log('Environment variables:', {
    hasResendKey: !!process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL,
    toEmail: process.env.TO_EMAIL
  });

  try {
    const {
      'Contact-2-First-Name': fullName,
      'Contact-2-Last-Name': city,
      'Contact-2-Email-2': email,
      'Contact-2-Phone': phone,
      'Contact-2-Select': service,
      'Contact-2-Radio': budget,
      'Contact-2-Message': message
    } = req.body;

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

    // Create email content with emojis and clean formatting
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
      from: process.env.FROM_EMAIL || 'noreply@construction-ste-marie.com',
      to: process.env.TO_EMAIL || 'wrivard@kua.quebec',
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
    
    // More specific error messages
    let errorMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
    
    if (error.message.includes('RESEND_API_KEY')) {
      errorMessage = 'Erreur de configuration: Clé API Resend manquante.';
    } else if (error.message.includes('email')) {
      errorMessage = 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
