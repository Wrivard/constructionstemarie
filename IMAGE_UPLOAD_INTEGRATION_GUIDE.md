# Image Upload Integration Guide

A comprehensive guide for adding image upload functionality to contact forms with email attachments.

## Overview

This guide explains how to integrate image upload features into contact forms that send images as email attachments without requiring permanent storage. The solution works with both Vercel API routes and Express servers.

## Table of Contents

1. [Frontend Implementation](#frontend-implementation)
2. [Backend Implementation](#backend-implementation)
3. [Email Integration](#email-integration)
4. [Dependencies](#dependencies)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Complete Example](#complete-example)

## Frontend Implementation

### 1. HTML Form Setup

```html
<!-- Add enctype="multipart/form-data" to your form -->
<form id="contact-form" enctype="multipart/form-data">
  <!-- Your existing form fields -->
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  
  <!-- Image upload field -->
  <div class="form-field">
    <label for="images">Photos du projet (optionnel)</label>
    <input type="file" 
           id="images" 
           name="images" 
           accept="image/*" 
           multiple 
           class="form-input">
    <small>Vous pouvez sélectionner plusieurs images (JPG, PNG, GIF - max 5MB chacune)</small>
  </div>
  
  <button type="submit">Envoyer</button>
</form>
```

### 2. JavaScript Form Submission

**❌ WRONG - This loses file data:**
```javascript
const formData = new FormData(form);
const data = {};
formData.forEach((value, key) => {
  data[key] = value; // File objects become empty {}
});

fetch('/api/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data) // Files are lost!
});
```

**✅ CORRECT - This preserves file data:**
```javascript
const formData = new FormData(form);

fetch('/api/submit', {
  method: 'POST',
  // Don't set Content-Type header - let browser set multipart boundary
  body: formData // Send FormData directly
});
```

### 3. Complete Frontend Example

```javascript
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  
  // Add any additional data
  formData.append('timestamp', new Date().toISOString());
  
  try {
    const response = await fetch('/api/submit-form', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Form submitted successfully!');
      form.reset();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error. Please try again.');
  }
});
```

## Backend Implementation

### 1. Vercel API Route (api/submit-form.js)

```javascript
import { Resend } from 'resend';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Important for file uploads
  },
};

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
    // Parse form data with formidable
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB per file
      maxFiles: 5, // Maximum 5 files
      keepExtensions: true,
      uploadDir: '/tmp' // Temporary directory
    });

    const [fields, files] = await form.parse(req);
    
    // Extract form fields - handle both single values and arrays
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const message = Array.isArray(fields.message) ? fields.message[0] : fields.message;
    
    // Extract uploaded files
    const uploadedFiles = files.images || [];
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled.'
      });
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Prepare attachments
    const attachments = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        if (file && file.filepath) {
          try {
            const fileBuffer = fs.readFileSync(file.filepath);
            attachments.push({
              filename: file.originalFilename || `image_${Date.now()}.jpg`,
              content: fileBuffer,
              contentType: file.mimetype || 'image/jpeg'
            });
          } catch (fileError) {
            console.error('Error reading file:', fileError);
          }
        }
      }
    }

    // Create email content
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
      ${uploadedFiles && uploadedFiles.length > 0 ? 
        `<p><strong>Images attached:</strong> ${uploadedFiles.length} file(s)</p>` : 
        ''
      }
    `;

    // Send email
    const emailData = {
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      to: process.env.TO_EMAIL || 'your-email@domain.com',
      subject: `New Contact Form - ${name}`,
      html: emailContent,
      replyTo: email
    };

    // Add attachments if any
    if (attachments.length > 0) {
      emailData.attachments = attachments;
    }

    const { data, error } = await resend.emails.send(emailData);

    // Clean up temporary files
    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        if (file && file.filepath) {
          try {
            fs.unlinkSync(file.filepath);
          } catch (cleanupError) {
            console.error('Error cleaning up file:', cleanupError);
          }
        }
      }
    }

    if (error) {
      console.error('Email error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error sending email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Form submitted successfully!',
      data: data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
}
```

### 2. Express Server (server.js)

```javascript
const express = require('express');
const multer = require('multer');
const { Resend } = require('resend');
const fs = require('fs');

const app = express();

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Contact form endpoint
app.post('/api/submit-form', upload.array('images', 5), async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const uploadedFiles = req.files || [];

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled.'
      });
    }

    // Prepare attachments
    const attachments = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
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

    // Create email content
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
      ${uploadedFiles && uploadedFiles.length > 0 ? 
        `<p><strong>Images attached:</strong> ${uploadedFiles.length} file(s)</p>` : 
        ''
      }
    `;

    // Send email
    const emailData = {
      from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
      to: process.env.TO_EMAIL || 'your-email@domain.com',
      subject: `New Contact Form - ${name}`,
      html: emailContent,
      replyTo: email
    };

    // Add attachments if any
    if (attachments.length > 0) {
      emailData.attachments = attachments;
    }

    const { data, error } = await resend.emails.send(emailData);

    // Clean up temporary files
    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
    }

    if (error) {
      console.error('Email error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error sending email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'Form submitted successfully!',
      data: data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Email Integration

### 1. Resend API Setup

```javascript
// Environment variables
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
TO_EMAIL=your-email@domain.com
```

### 2. Email Template with Image Notifications

```javascript
const emailContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <h2>New Contact Form Submission</h2>
    
    <div class="client-info">
      <h3>Client Information</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
    </div>
    
    <div class="project-details">
      <h3>Project Details</h3>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Budget:</strong> ${budget}</p>
      <p><strong>Message:</strong> ${message}</p>
      
      ${uploadedFiles && uploadedFiles.length > 0 ? `
      <div class="images-section">
        <h4>📷 Images Attached (${uploadedFiles.length})</h4>
        <p>The client has attached ${uploadedFiles.length} image${uploadedFiles.length > 1 ? 's' : ''} to their submission. See the email attachments.</p>
      </div>
      ` : ''}
    </div>
  </body>
  </html>
`;
```

## Dependencies

### package.json

```json
{
  "dependencies": {
    "resend": "^2.0.0",
    "formidable": "^3.5.1",
    "multer": "^1.4.5-lts.1",
    "express": "^4.18.2"
  }
}
```

### Installation

```bash
npm install resend formidable multer express
```

## Testing

### 1. Test Form Submission

```javascript
// Test with images
const formData = new FormData();
formData.append('name', 'Test User');
formData.append('email', 'test@example.com');
formData.append('message', 'Test message');

// Add test image
const fileInput = document.getElementById('images');
if (fileInput.files.length > 0) {
  for (let i = 0; i < fileInput.files.length; i++) {
    formData.append('images', fileInput.files[i]);
  }
}

fetch('/api/submit-form', {
  method: 'POST',
  body: formData
});
```

### 2. Debug Logging

```javascript
// Add to your API handler
console.log('Uploaded files:', uploadedFiles);
console.log('Attachments prepared:', attachments.length);
console.log('Email data:', emailData);
```

## Troubleshooting

### Common Issues

1. **Files not being received:**
   - Check that `enctype="multipart/form-data"` is set on the form
   - Ensure you're sending `FormData` directly, not converting to JSON
   - Don't set `Content-Type` header manually

2. **Files not appearing in email:**
   - Check file size limits (5MB default)
   - Verify file types (images only)
   - Check server logs for errors
   - Ensure Resend API key is valid

3. **Form data truncated:**
   - Use proper field extraction for formidable/multer
   - Handle both single values and arrays

### Debug Checklist

- [ ] Form has `enctype="multipart/form-data"`
- [ ] JavaScript sends `FormData` directly
- [ ] No `Content-Type` header set manually
- [ ] Backend uses formidable (Vercel) or multer (Express)
- [ ] File validation is working
- [ ] Email service supports attachments
- [ ] Temporary files are cleaned up

## Complete Example

See the working implementation in this project:
- Frontend: `soumission-en-ligne.html`
- Vercel API: `api/submit-form.js`
- Express Server: `server.js`

## Key Takeaways

1. **Always use `FormData`** for file uploads
2. **Never convert to JSON** - it loses file data
3. **Let the browser set Content-Type** for multipart data
4. **Clean up temporary files** after processing
5. **Validate file types and sizes** on both frontend and backend
6. **Use proper error handling** for file operations

This approach provides a robust, scalable solution for image uploads in contact forms without requiring permanent file storage.
