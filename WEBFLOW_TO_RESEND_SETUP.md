# 🚀 Complete Webflow to Resend Email Integration Guide

## 📋 Overview
This guide walks you through setting up email functionality for a Webflow-exported site using Resend API, including form handling, email templates, and deployment on Vercel.

## 🎯 Prerequisites
- Webflow site exported as HTML/CSS/JS
- Vercel account for hosting
- Resend account for email service
- Git repository for version control

---

## 📦 1. Initial Setup

### 1.1 Project Structure
After Webflow export, your project should have:
```
project-root/
├── index.html
├── css/
├── js/
├── images/
├── api/
│   └── submit-form.js (create this)
├── package.json (create this)
└── vercel.json (create this)
```

### 1.2 Create package.json
```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "description": "Webflow site with Resend email integration",
  "main": "server.js",
  "scripts": {
    "dev": "vercel dev",
    "start": "vercel dev"
  },
  "dependencies": {
    "resend": "^2.0.0"
  },
  "keywords": ["webflow", "resend", "email"],
  "license": "MIT"
}
```

### 1.3 Create vercel.json
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

---

## 🔧 2. Resend Configuration

### 2.1 Get Resend API Keys
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create a new API key
3. Copy the API key (starts with `re_`)

### 2.2 Domain Verification (IMPORTANT)
1. Go to [Resend Domains](https://resend.com/domains)
2. Add your domain (e.g., `yourdomain.com`)
3. Follow DNS verification steps
4. Wait for verification ✅

### 2.3 Set Environment Variables in Vercel
1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Add these variables:
   ```
   RESEND_API_KEY = your_actual_resend_api_key
   FROM_EMAIL = noreply@yourdomain.com (or onboarding@resend.dev)
   ```

---

## 📧 3. Create API Endpoint

### 3.1 Create api/submit-form.js
```javascript
import { Resend } from 'resend';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Extract form data (adjust field names to match your Webflow form)
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
    if (!fullName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing'
      });
    }

    // Initialize Resend
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable missing');
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const businessEmail = 'your-business@email.com'; // Change this

    // Create email content (table-based for compatibility)
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="background: #333; color: #fff; text-align: center; padding: 30px;">
                    <h1 style="margin: 0; font-size: 24px;">New Form Submission</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <h3>Contact Information</h3>
                    <p><strong>Name:</strong> ${fullName}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                    ${city ? `<p><strong>City:</strong> ${city}</p>` : ''}
                    ${service ? `<p><strong>Service:</strong> ${service}</p>` : ''}
                    ${budget ? `<p><strong>Budget:</strong> ${budget}</p>` : ''}
                    
                    <h3>Message</h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                      ${message}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send business email
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: businessEmail,
      subject: `New Contact Form Submission - ${fullName}`,
      html: emailContent,
      replyTo: email
    });

    if (error) {
      console.error('Email send error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send email'
      });
    }

    // Send confirmation email to user
    const confirmationContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background: #28a745; color: #fff; text-align: center; padding: 30px;">
                    <h1 style="margin: 0; font-size: 24px;">Thank You!</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px;">
                    <p>Hello ${fullName},</p>
                    <p>Thank you for contacting us. We have received your message and will get back to you within 24-48 hours.</p>
                    <p>Best regards,<br>Your Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Thank you for contacting us',
        html: confirmationContent,
        replyTo: businessEmail
      });
    } catch (confirmationError) {
      console.warn('Confirmation email failed:', confirmationError);
      // Don't fail the main request
    }

    res.status(200).json({
      success: true,
      message: 'Message sent successfully!',
      data: data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
```

---

## 🎨 4. Modify Webflow Form

### 4.1 Update Form HTML
In your form page HTML, find the form and update the action:

```html
<!-- Find your Webflow form and modify it -->
<form id="wf-form-Contact-2-Form" name="wf-form-Contact-2-Form" data-name="Contact 2 Form" method="get" class="form" data-wf-page-id="your-page-id" data-wf-element-id="your-element-id">
  <!-- Your existing form fields -->
  <input type="submit" value="Submit" data-wait="Please wait..." class="button w-button">
</form>
```

### 4.2 Add Form JavaScript
Add this script before the closing `</body>` tag:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('wf-form-Contact-2-Form');
  const successMessage = document.querySelector('.w-form-done');
  const errorMessage = document.querySelector('.w-form-fail');

  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      try {
        // Submit to your API
        const response = await fetch('/api/submit-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
          // Show success message
          form.style.display = 'none';
          if (successMessage) {
            successMessage.style.display = 'block';
          }
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Form submission error:', error);
        if (errorMessage) {
          errorMessage.style.display = 'block';
        }
      }
    });
  }
});
</script>
```

---

## 🔐 5. reCAPTCHA Integration (Optional)

### 5.1 Get reCAPTCHA Keys
1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Create new site (choose reCAPTCHA v3)
3. Add your domain
4. Get Site Key and Secret Key

### 5.2 Add to Vercel Environment Variables
```
RECAPTCHA_SECRET_KEY = your_secret_key_here
```

### 5.3 Add reCAPTCHA to Form Page
```html
<!-- Add before closing </head> -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>

<!-- Update form script -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('wf-form-Contact-2-Form');
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get reCAPTCHA token
    let recaptchaToken = 'no-recaptcha';
    if (typeof grecaptcha !== 'undefined') {
      try {
        recaptchaToken = await grecaptcha.execute('YOUR_SITE_KEY', {action: 'submit'});
      } catch (error) {
        console.warn('reCAPTCHA failed:', error);
      }
    }
    
    // Get form data
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    data['g-recaptcha-response'] = recaptchaToken;

    // Rest of form submission code...
  });
});
</script>
```

---

## 🧹 6. Console Cleanup (Optional)

### 6.1 Add Permissions Policy
Add to `<head>` section:
```html
<meta http-equiv="Permissions-Policy" content="interest-cohort=(), browsing-topics=(), attribution-reporting=(), run-ad-auction=(), join-ad-interest-group=(), private-state-token-issuance=(), private-aggregation=()">
```

### 6.2 Add Console Error Suppression
Add before closing `</body>`:
```html
<script>
// Suppress common console warnings that don't affect functionality
const originalWarn = console.warn;
const originalError = console.error;

console.warn = function(...args) {
  const message = args.join(' ');
  if (message.includes('Permissions-Policy') || 
      message.includes('deprecated') ||
      message.includes('NoApiKeys') ||
      message.includes('sensor=fal')) {
    return; // Don't log these warnings
  }
  originalWarn.apply(console, args);
};

console.error = function(...args) {
  const message = args.join(' ');
  if (message.includes('InvalidValueError') && message.includes('NaN')) {
    return; // Don't log coordinate errors
  }
  originalError.apply(console, args);
};
</script>
```

---

## 🚀 7. Deployment

### 7.1 Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set up environment variables in Vercel dashboard
# Deploy production
vercel --prod
```

### 7.2 Test Deployment
1. Submit test form
2. Check email delivery
3. Verify confirmation emails
4. Check Vercel function logs if issues

---

## 🔧 8. Troubleshooting

### Common Issues:

**❌ "Testing only" reCAPTCHA:**
- Replace test keys with production keys from Google reCAPTCHA admin

**❌ Emails not sending:**
- Check RESEND_API_KEY is set correctly
- Verify domain is verified in Resend
- Use `onboarding@resend.dev` for FROM_EMAIL if domain not verified

**❌ Form not submitting:**
- Check form field names match API expectations
- Verify API endpoint is accessible at `/api/submit-form`
- Check browser console for JavaScript errors

**❌ 500 Server Error:**
- Check Vercel function logs
- Verify all environment variables are set
- Check API code syntax

### Debug Tools:

**Test API directly:**
```bash
curl -X POST https://your-site.vercel.app/api/submit-form \
  -H "Content-Type: application/json" \
  -d '{"Contact-2-First-Name":"Test","Contact-2-Email-2":"test@test.com","Contact-2-Message":"Test message"}'
```

**Check Vercel logs:**
- Vercel Dashboard → Functions → submit-form → Logs

---

## ✅ 9. Final Checklist

- [ ] Resend account created and domain verified
- [ ] Environment variables set in Vercel
- [ ] API endpoint created and tested
- [ ] Form HTML updated with JavaScript
- [ ] reCAPTCHA integrated (if needed)
- [ ] Console cleanup applied
- [ ] Test form submission works
- [ ] Business emails received
- [ ] Confirmation emails sent
- [ ] Production deployment successful

---

## 📚 Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha)

---

**🎉 Congratulations! Your Webflow site now has fully functional email integration with Resend!**
