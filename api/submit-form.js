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

    // Create simplified email content for better compatibility
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #2c2c2c; margin: 0; padding: 20px; background-color: #f5f2ed;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: #2c2c2c; color: #ffffff; text-align: center; padding: 40px 30px; position: relative;">
                    <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">🏗️ Nouvelle Soumission</h1>
                    <p style="margin: 0; color: #c8a882; font-size: 16px; font-weight: 500;">Construction Ste-Marie Inc. • Un nouveau projet vous attend !</p>
                    <div style="height: 4px; background: #c8a882; margin-top: 20px;"></div>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <!-- Client Info Section -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; padding: 25px; background: #faf8f5; border-radius: 10px; border-left: 5px solid #c8a882;">
                      <tr>
                        <td>
                          <h3 style="color: #2c2c2c; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">👤 Informations du Client</h3>
                          
                          <table width="100%" cellpadding="8" cellspacing="0">
                            <tr>
                              <td style="font-weight: 600; color: #2c2c2c; width: 150px; font-size: 14px;">📝 NOM COMPLET</td>
                              <td style="background: #c8a882; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-weight: 600;">${fullName}</td>
                            </tr>
                            <tr>
                              <td style="font-weight: 600; color: #2c2c2c; width: 150px; font-size: 14px;">🏙️ VILLE</td>
                              <td style="background: #c8a882; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-weight: 600;">${city}</td>
                            </tr>
                            <tr>
                              <td style="font-weight: 600; color: #2c2c2c; width: 150px; font-size: 14px;">📧 EMAIL</td>
                              <td style="background: #c8a882; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-weight: 600;">${email}</td>
                            </tr>
                            <tr>
                              <td style="font-weight: 600; color: #2c2c2c; width: 150px; font-size: 14px;">📱 TÉLÉPHONE</td>
                              <td style="background: #c8a882; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-weight: 600;">${phone}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Project Details Section -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; padding: 25px; background: #faf8f5; border-radius: 10px; border-left: 5px solid #c8a882;">
                      <tr>
                        <td>
                          <h3 style="color: #2c2c2c; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">🔨 Détails du Projet</h3>
                          
                          <table width="100%" cellpadding="8" cellspacing="0">
                            <tr>
                              <td style="font-weight: 600; color: #2c2c2c; width: 150px; font-size: 14px;">🛠️ SERVICE DEMANDÉ</td>
                              <td style="background: #c8a882; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-weight: 600;">${service}</td>
                            </tr>
                            <tr>
                              <td style="font-weight: 600; color: #2c2c2c; width: 150px; font-size: 14px;">💰 BUDGET ESTIMÉ</td>
                              <td style="background: #c8a882; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-weight: 600;">${formattedBudget}</td>
                            </tr>
                            <tr>
                              <td colspan="2" style="padding-top: 15px;">
                                <strong style="font-weight: 600; color: #2c2c2c; font-size: 14px;">💬 MESSAGE DU CLIENT</strong>
                                <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 2px solid #e8e3dc; margin-top: 10px; font-size: 16px; line-height: 1.6; color: #2c2c2c;">
                                  "${message}"
            </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="text-align: center; padding: 30px; background: #2c2c2c; color: #ffffff;">
                    <a href="mailto:${email}" style="display: inline-block; background: #c8a882; color: #2c2c2c; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; font-size: 16px;">Répondre au Client</a>
                    <p style="margin: 20px 0 0 0; font-size: 12px; color: #c8a882;">
                      ✨ Envoyé depuis le formulaire de Construction Ste-Marie Inc.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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

    // Send confirmation email to the user - simplified for better compatibility
    const confirmationEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #2c2c2c; margin: 0; padding: 20px; background-color: #f5f2ed;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: #2c2c2c; color: #ffffff; text-align: center; padding: 40px 30px;">
                    <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">✅ Confirmation de Soumission</h1>
                    <p style="margin: 0; color: #c8a882; font-size: 18px; font-weight: 500;">Construction Ste-Marie Inc.</p>
                    <div style="height: 4px; background: #c8a882; margin-top: 20px;"></div>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 18px;">Bonjour <strong style="color: #c8a882;">${fullName}</strong>,</p>
                    
                    <p style="margin: 0 0 20px 0; font-size: 18px; color: #2c2c2c;"><strong>🎉 Merci pour votre demande de soumission !</strong></p>
                    
                    <p style="margin: 0 0 20px 0; font-size: 16px;">Nous avons bien reçu votre demande concernant :</p>
                    
                    <!-- Summary Box -->
                    <table width="100%" cellpadding="20" cellspacing="0" style="background: #faf8f5; border-radius: 10px; border-left: 5px solid #c8a882; margin: 20px 0;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #2c2c2c;">📋 Résumé de votre demande :</p>
                          <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>🛠️ Service :</strong> <span style="color: #c8a882; font-weight: 600;">${service}</span></p>
                          <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>💰 Budget :</strong> <span style="color: #c8a882; font-weight: 600;">${formattedBudget}</span></p>
                          <p style="margin: 0; font-size: 16px;"><strong>🏙️ Localisation :</strong> <span style="color: #c8a882; font-weight: 600;">${city}</span></p>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 20px 0 10px 0; font-size: 16px; font-weight: 600;">⏰ Prochaines étapes :</p>
                    <table width="100%" cellpadding="5" cellspacing="0">
                      <tr><td style="font-size: 16px;">📞 Nous vous contacterons dans les <strong>24-48 heures</strong></td></tr>
                      <tr><td style="font-size: 16px;">📋 Nous discuterons de vos besoins en détail</td></tr>
                      <tr><td style="font-size: 16px;">📄 Nous vous fournirons une soumission détaillée</td></tr>
                    </table>
                    
                    <p style="margin: 20px 0 10px 0; font-size: 16px; font-weight: 600;">💡 En attendant, n'hésitez pas à :</p>
                    <table width="100%" cellpadding="5" cellspacing="0">
                      <tr><td style="font-size: 16px;">📸 Préparer des photos de votre projet</td></tr>
                      <tr><td style="font-size: 16px;">📝 Noter toutes vos questions</td></tr>
                      <tr><td style="font-size: 16px;">📏 Prendre des mesures si possible</td></tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="text-align: center; padding: 30px; background: #2c2c2c; color: #ffffff;">
                    <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #c8a882;">📧 Besoin de nous joindre ?</p>
                    <p style="margin: 0 0 10px 0; font-size: 14px;">Répondez simplement à cet email ou contactez-nous</p>
                    <p style="margin: 0 0 20px 0; font-size: 14px;">🌐 <strong>Site web :</strong> constructionstemarie.com</p>
                    <p style="margin: 0; font-size: 12px; color: #c8a882;">
                ✨ Merci de faire confiance à Construction Ste-Marie Inc. pour votre projet !
              </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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
