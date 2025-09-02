# 🔍 Vercel Environment Variables Check

## The Problem
Emails are still going to `williamrivard@live.ca` instead of `wrivard@kua.quebec`, which means there's likely a `TO_EMAIL` environment variable set in Vercel.

## ✅ URGENT: Check Your Vercel Environment Variables

1. **Go to your Vercel Dashboard**
2. **Select your project** (construction-ste-marie)
3. **Go to Settings** → **Environment Variables**
4. **Look for these variables:**
   - `TO_EMAIL` ← **This is likely set to `williamrivard@live.ca`**
   - `FROM_EMAIL`
   - `RESEND_API_KEY`

## 🎯 What You Need to Do

### Option 1: Delete the TO_EMAIL Variable (RECOMMENDED)
- **Delete** the `TO_EMAIL` environment variable completely
- The code now uses hard-coded `wrivard@kua.quebec`
- This ensures no override can happen

### Option 2: Update the TO_EMAIL Variable
- **Change** `TO_EMAIL` from `williamrivard@live.ca` to `wrivard@kua.quebec`

## 🔧 Required Environment Variables

Only these are needed in Vercel:
```
RESEND_API_KEY = your_actual_resend_api_key
FROM_EMAIL = onboarding@resend.dev (optional, has fallback)
```

**DO NOT SET:**
- `TO_EMAIL` (now hard-coded in the code)

## 📧 After Making Changes

1. **Redeploy** your project (or wait for auto-deploy)
2. **Test the form** again
3. **Check Vercel function logs** for the detailed debugging info

## 🔍 Debug Information

The updated code now logs:
- Which email addresses are being used
- Detailed confirmation email debugging
- Environment variable values
- Success/failure status for both emails

Check the Vercel function logs to see exactly what's happening!
