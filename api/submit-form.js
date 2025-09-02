import { Resend } from 'resend';

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
    resendKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
    fromEmail: process.env.FROM_EMAIL,
    nodeEnv: process.env.NODE_ENV,
    hardCodedBusinessEmail: 'wrivard@kua.quebec'
  });

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

    // Verify reCAPTCHA (optional for now)
    if (recaptchaToken && recaptchaToken !== 'no-recaptcha' && recaptchaToken !== 'recaptcha-error') {
      try {
        const recaptchaVerify = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
        });

        const recaptchaResult = await recaptchaVerify.json();
        
        console.log('reCAPTCHA verification result:', recaptchaResult);
        
        if (!recaptchaResult.success) {
          console.warn('reCAPTCHA verification failed:', recaptchaResult);
        }
        
        // For reCAPTCHA v3, check the score (0.0 = bot, 1.0 = human)
        if (recaptchaResult.score && recaptchaResult.score < 0.3) {
          return res.status(400).json({
            success: false,
            message: 'Score de sécurité trop bas. Veuillez réessayer.'
          });
        }
      } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        // Continue without blocking the form
      }
    } else {
      console.log('Form submitted without reCAPTCHA verification');
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

    // Initialize Resend with error handling
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is missing');
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);

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
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    // Determine the correct business email (prioritize hard-coded over env var for this specific case)
    const businessEmail = 'williamrivard@live.ca'; // Temporary: use verified email until wrivard@kua.quebec is verified in Resend
    
    // Log if there's an environment variable that might be interfering
    if (process.env.TO_EMAIL && process.env.TO_EMAIL !== businessEmail) {
      console.log('⚠️  Warning: TO_EMAIL env var differs from hard-coded email:', {
        envToEmail: process.env.TO_EMAIL,
        hardCodedEmail: businessEmail,
        usingEmail: businessEmail
      });
    }
    
    console.log('📧 Attempting to send email with config:', {
      from: fromEmail,
      to: businessEmail,
      subject: `🏗️ Nouveau Projet - ${fullName} (${city}) - Construction Ste-Marie`,
      replyTo: email,
      contentLength: emailContent.length,
      envToEmail: process.env.TO_EMAIL, // Log if there's an env override
      deploymentCheck: 'FORCE_REDEPLOY_v2'
    });

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: businessEmail, // Your business email - hard-coded to ensure correct recipient
      subject: `🏗️ Nouveau Projet - ${fullName} (${city}) - Construction Ste-Marie`,
      html: emailContent,
      replyTo: email // Customer's email so you can reply directly
    });

    if (error) {
      console.error('❌ Erreur Resend détaillée:', {
        error,
        errorMessage: error.message,
        errorName: error.name,
        fromEmail,
        hasApiKey: !!process.env.RESEND_API_KEY
      });
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.',
        debug: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }

    console.log('✅ Email business envoyé avec succès:', data);

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
              <p>🌐 <strong>Site web :</strong> construction-ste-marie.com</p>
              <p style="margin-top: 20px; font-size: 12px;">
                ✨ Merci de faire confiance à Construction Ste-Marie Inc. pour votre projet !
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send confirmation email with extensive logging
    try {
      console.log('📧 ===== CONFIRMATION EMAIL DEBUG =====');
      console.log('📧 Customer email from form:', email);
      console.log('📧 Email validation:', {
        isValidEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        emailLength: email ? email.length : 0,
        emailTrimmed: email ? email.trim() : 'N/A'
      });
      console.log('📧 From email:', fromEmail);
      console.log('📧 Confirmation content length:', confirmationEmailContent.length);
      
      const confirmationResult = await resend.emails.send({
        from: fromEmail,
        to: email.trim(), // Send to the user's email (trimmed)
        subject: `✅ Confirmation de soumission - Construction Ste-Marie`,
        html: confirmationEmailContent,
        replyTo: 'wrivard@kua.quebec'
      });

      console.log('📧 Resend confirmation response:', JSON.stringify(confirmationResult, null, 2));

      if (confirmationResult.error) {
        console.error('❌ CONFIRMATION EMAIL FAILED:', {
          error: confirmationResult.error,
          errorMessage: confirmationResult.error.message,
          errorName: confirmationResult.error.name,
          customerEmail: email,
          fromEmail: fromEmail
        });
      } else {
        console.log('✅ CONFIRMATION EMAIL SUCCESS:', {
          emailId: confirmationResult.data?.id,
          customerEmail: email,
          data: confirmationResult.data
        });
      }
    } catch (confirmationError) {
      console.error('❌ CONFIRMATION EMAIL EXCEPTION:', {
        error: confirmationError,
        message: confirmationError.message,
        stack: confirmationError.stack,
        customerEmail: email
      });
    }

    res.status(200).json({
      success: true,
      message: 'Votre soumission a été envoyée avec succès ! Vous recevrez une confirmation par email.',
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
