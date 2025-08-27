# Construction Ste-Marie - Website with Email Integration

This website includes a contact form that integrates with Resend to send emails to `wrivard@kua.quebec`.

## 🚀 Features

- **Contact Form**: Online submission form for construction quotes
- **Email Integration**: Powered by Resend for reliable email delivery
- **Real-time Validation**: Form validation and error handling
- **Responsive Design**: Mobile-friendly Webflow design
- **SEO Optimized**: Includes sitemap, robots.txt, and LLM.txt

## 📧 Email Integration Setup

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com) and create an account
2. Navigate to API Keys section
3. Create a new API key
4. Copy the API key

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Resend API Configuration
RESEND_API_KEY=your_actual_resend_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration
FROM_EMAIL=noreply@construction-ste-marie.com
TO_EMAIL=wrivard@kua.quebec
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 🔧 Form Fields

The contact form includes:

- **Nom complet** (Full Name) - Required
- **Ville** (City) - Required  
- **Email** - Required
- **Numéro de téléphone** (Phone) - Required
- **Service** - Required (dropdown selection)
- **Budget** - Required (radio buttons)
- **Message** - Required (textarea)
- **Conditions acceptance** - Required (checkbox)

## 📨 Email Format

When a form is submitted, an email is sent to `wrivard@kua.quebec` with:

- Client information (name, city, email, phone)
- Project details (service, budget, message)
- Professional HTML formatting
- Reply-to set to client's email

## 🌐 API Endpoints

- `POST /api/submit-form` - Form submission endpoint
- `GET /api/health` - Health check endpoint

## 📁 File Structure

```
├── server.js              # Express server with Resend integration
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (create this)
├── soumission-en-ligne.html  # Contact form page
├── sitemap.xml           # SEO sitemap
├── robots.txt            # SEO robots file
├── llm.txt              # AI training data declaration
└── README.md            # This file
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
1. Set `NODE_ENV=production` in your `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "construction-ste-marie"
   ```

### Environment Variables for Production
- `RESEND_API_KEY`: Your Resend API key
- `PORT`: Server port (default: 3000)
- `FROM_EMAIL`: Sender email address
- `TO_EMAIL`: Recipient email (wrivard@kua.quebec)

## 🔒 Security Notes

- API key is stored in environment variables
- Form validation on both client and server side
- CORS enabled for cross-origin requests
- Input sanitization and validation

## 📞 Support

For technical support or questions about the email integration:
- Email: info@construction-ste-marie.com
- Check the server logs for debugging information

## 📝 License

MIT License - see package.json for details
