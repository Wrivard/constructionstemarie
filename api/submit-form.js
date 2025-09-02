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

    // Create email content with Construction Ste-Marie branding
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #2c2c2c; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f5f2ed;
          }
          .email-container {
            background: #ffffff;
            border-radius: 12px;
            padding: 0;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
            color: #ffffff;
            text-align: center;
            padding: 40px 30px;
            position: relative;
          }
          .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #c8a882 0%, #b8956f 100%);
          }
          .header h1 {
            color: #ffffff;
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          .header p {
            margin: 0;
            color: #c8a882;
            font-size: 16px;
            font-weight: 500;
          }
          .content-wrapper {
            padding: 30px;
          }
          .section {
            margin-bottom: 30px;
            padding: 25px;
            background: #faf8f5;
            border-radius: 10px;
            border-left: 5px solid #c8a882;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          .section h3 {
            color: #2c2c2c;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .section h3::before {
            content: '';
            width: 4px;
            height: 20px;
            background: #c8a882;
            border-radius: 2px;
          }
          .field {
            display: flex;
            margin-bottom: 15px;
            align-items: flex-start;
            padding: 12px 0;
            border-bottom: 1px solid #e8e3dc;
          }
          .field:last-child {
            border-bottom: none;
          }
          .field-label {
            font-weight: 600;
            color: #2c2c2c;
            min-width: 150px;
            margin-right: 20px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .field-value {
            color: #2c2c2c;
            flex: 1;
            font-size: 16px;
            font-weight: 500;
          }
          .highlight {
            background: linear-gradient(120deg, #c8a882 0%, #b8956f 100%);
            color: #ffffff;
            padding: 4px 10px;
            border-radius: 6px;
            font-weight: 600;
            display: inline-block;
          }
          .message-box {
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #e8e3dc;
            margin-top: 15px;
            font-size: 16px;
            line-height: 1.6;
            color: #2c2c2c;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding: 30px;
            background: #2c2c2c;
            color: #ffffff;
            border-radius: 0 0 12px 12px;
          }
          .footer p {
            margin: 10px 0;
          }
          .footer strong {
            color: #c8a882;
          }
          .cta-button {
            display: inline-block;
            background: #c8a882;
            color: #2c2c2c;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
            border: none;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .cta-button:hover {
            background: #b8956f;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }
          .brand-accent {
            color: #c8a882;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🏗️ Nouvelle Soumission</h1>
            <p>Construction Ste-Marie Inc. • Un nouveau projet vous attend !</p>
          </div>
          
          <div class="content-wrapper">
            <div class="section">
              <h3>👤 Informations du Client</h3>
              <div class="field">
                <span class="field-label">📝 Nom complet</span>
                <span class="field-value highlight">${fullName}</span>
              </div>
              <div class="field">
                <span class="field-label">🏙️ Ville</span>
                <span class="field-value highlight">${city}</span>
              </div>
              <div class="field">
                <span class="field-label">📧 Email</span>
                <span class="field-value highlight">${email}</span>
              </div>
              <div class="field">
                <span class="field-label">📱 Téléphone</span>
                <span class="field-value highlight">${phone}</span>
              </div>
            </div>
            
            <div class="section">
              <h3>🔨 Détails du Projet</h3>
              <div class="field">
                <span class="field-label">🛠️ Service demandé</span>
                <span class="field-value highlight">${service}</span>
              </div>
              <div class="field">
                <span class="field-label">💰 Budget estimé</span>
                <span class="field-value highlight">${formattedBudget}</span>
              </div>
              <div class="field">
                <span class="field-label">💬 Message du client</span>
              </div>
              <div class="message-box">
                "${message}"
              </div>
            </div>
          </div>
          
          <div class="footer">
            <a href="mailto:${email}" class="cta-button">Répondre au Client</a>
            <p style="margin-top: 20px; font-size: 12px; color: #c8a882;">
              ✨ Envoyé depuis le formulaire de Construction Ste-Marie Inc.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    // Determine the correct business email (prioritize hard-coded over env var for this specific case)
    const businessEmail = 'wrivard@kua.quebec'; // Business email - domain is verified in Resend
    
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
