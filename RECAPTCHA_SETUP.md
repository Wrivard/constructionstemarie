# 🔐 reCAPTCHA v3 Setup Instructions

## 🎯 Current Status
- ❌ Using test keys (shows "testing only")
- ✅ Code is ready for production keys

## 📋 Steps to Fix:

### 1. Get Real reCAPTCHA Keys
1. Go to: https://www.google.com/recaptcha/admin
2. **Create New Site** or select existing
3. **Choose reCAPTCHA v3**
4. **Add your domain**: `your-site.vercel.app`
5. **Copy the keys**:
   - Site Key (public): `6Lc...` 
   - Secret Key (private): `6Lc...`

### 2. Update Site Key in Code
Replace `YOUR_SITE_KEY_HERE` with your actual Site Key in:
- Line 1355: `<script src="https://www.google.com/recaptcha/api.js?render=YOUR_ACTUAL_SITE_KEY">`
- Line 1421: `grecaptcha.execute('YOUR_ACTUAL_SITE_KEY', {action: 'submit'})`
- Line 1567: `grecaptcha.execute('YOUR_ACTUAL_SITE_KEY', {action: 'submit'})`

### 3. Add Secret Key to Vercel
1. **Vercel Dashboard** → **Settings** → **Environment Variables**
2. **Add:**
   - Name: `RECAPTCHA_SECRET_KEY`
   - Value: `Your_Actual_Secret_Key`

### 4. Deploy Changes
```bash
git add .
git commit -m "Add production reCAPTCHA keys"
git push origin master
```

## ✅ Expected Result:
- No more "testing only" message
- Invisible reCAPTCHA protection
- Form works normally with security

## 🔧 Current Placeholders to Replace:
- `YOUR_SITE_KEY_HERE` → Your actual Site Key (3 locations)
- `RECAPTCHA_SECRET_KEY` → Add to Vercel environment variables
