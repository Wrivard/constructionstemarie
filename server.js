const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp'); // Temporary directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.')); // Serve static files from current directory

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 'your_resend_api_key_here');

// Email endpoint
app.post('/api/submit-form', upload.array('Contact-2-Image', 5), async (req, res) => {
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

    // Handle uploaded files
    const uploadedFiles = req.files || [];
    console.log('Uploaded files:', uploadedFiles);

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
            ${uploadedFiles && uploadedFiles.length > 0 ? `
            <div class="field" style="margin-top: 15px;">
              <span class="field-label">📷 Images jointes (${uploadedFiles.length}) :</span>
            </div>
            <div class="message-box" style="background: #f0f8ff; border: 2px solid #c8a882;">
              Le client a joint ${uploadedFiles.length} image${uploadedFiles.length > 1 ? 's' : ''} à sa soumission. Voir les pièces jointes de cet email.
            </div>
            ` : ''}
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

    // Prepare attachments if files were uploaded
    const attachments = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      const fs = require('fs');
      for (const file of uploadedFiles) {
        try {
          const fileBuffer = fs.readFileSync(file.path);
          attachments.push({
            filename: file.originalname || `image_${Date.now()}.jpg`,
            content: fileBuffer,
            contentType: file.mimetype || 'image/jpeg'
          });
        } catch (fileError) {
          console.error('Error reading file:', fileError);
        }
      }
    }

    const emailData = {
      from: process.env.FROM_EMAIL || 'noreply@constructionstemarie.ca',
      to: 'charles.constructionsm@gmail.com', // Hard-coded business email
      subject: `🏗️ Nouveau Projet - ${fullName} (${city}) - Construction Ste-Marie`,
      html: emailContent,
      replyTo: email
    };

    // Add attachments if any
    if (attachments.length > 0) {
      emailData.attachments = attachments;
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send(emailData);

    // Clean up temporary files
    if (uploadedFiles && uploadedFiles.length > 0) {
      const fs = require('fs');
      for (const file of uploadedFiles) {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
    }

    if (error) {
      console.error('Erreur Resend:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.'
      });
    }

    console.log('Email sent successfully:', data);

    res.json({
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
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email endpoint: http://localhost:${PORT}/api/submit-form`);
  console.log(`🌐 Static files served from: http://localhost:${PORT}`);
});

module.exports = app;
