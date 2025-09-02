# Email Configuration Setup

## Required Environment Variables in Vercel

You need to set these environment variables in your Vercel project dashboard:

### 1. RESEND_API_KEY
- Go to [Resend Dashboard](https://resend.com/api-keys)
- Create a new API key
- Copy the key and add it to Vercel environment variables
- **Name:** `RESEND_API_KEY`
- **Value:** `re_xxxxxxxxx` (your actual API key)

### 2. FROM_EMAIL (Optional)
- **Name:** `FROM_EMAIL`
- **Value:** `onboarding@resend.dev` (default) or your verified domain email

## Testing Your Configuration

### Local Testing
1. Create a `.env` file in your project root:
```
RESEND_API_KEY=your_api_key_here
FROM_EMAIL=onboarding@resend.dev
```

2. Run the email test:
```bash
npm run test:email
```

### Vercel Testing
1. Deploy your project to Vercel
2. Check the function logs in Vercel dashboard
3. Look for the email sending logs

## Common Issues & Solutions

### Issue: "Invalid from address"
**Solution:** Use `onboarding@resend.dev` or verify your own domain with Resend

### Issue: "Invalid API key"
**Solution:** Double-check your API key in Vercel environment variables

### Issue: Form shows success but no email
**Solutions:**
1. Check Vercel function logs for errors
2. Verify environment variables are set correctly
3. Make sure the API endpoint is accessible at `/api/submit-form`

## Email Recipients

The form will send emails to:
- **Business email:** `wrivard@kua.quebec` (main recipient)
- **Customer email:** Confirmation email sent to the form submitter

## Form Fields Mapping

The form expects these field names:
- `Contact-2-First-Name` → Full Name
- `Contact-2-Last-Name` → City
- `Contact-2-Email-2` → Email
- `Contact-2-Phone` → Phone
- `Contact-2-Select` → Service
- `Contact-2-Radio` → Budget
- `Contact-2-Message` → Message
