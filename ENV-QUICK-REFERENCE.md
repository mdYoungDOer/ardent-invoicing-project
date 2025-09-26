# ⚡ Environment Variables Quick Reference

## 🚨 **CRITICAL - Required for Production**

### Supabase (Database & Auth)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Paystack (Payments) - USE LIVE KEYS!
```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
```

### SendGrid (Emails)
```
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### App Configuration
```
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
NEXTAUTH_SECRET=your_very_long_random_secret_key_here
NEXTAUTH_URL=https://your-app-domain.com
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

### Exchange Rates
```
NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=your_exchangerate_api_key
```

## 🔧 **Optional but Recommended**

### Analytics
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### File Upload
```
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
```

### Ghana Settings
```
NEXT_PUBLIC_DEFAULT_CURRENCY=GHS
NEXT_PUBLIC_DEFAULT_TIMEZONE=Africa/Accra
NEXT_PUBLIC_COUNTRY_CODE=GH
```

## ⚠️ **IMPORTANT NOTES**

1. **Use LIVE Paystack keys** for production (not test keys)
2. **Generate NEXTAUTH_SECRET** with: `openssl rand -base64 32`
3. **Keep service role keys secret** - never expose them
4. **Use HTTPS URLs** for all webhooks and redirects
5. **Test thoroughly** before going live

## 🚀 **Deployment Steps**

1. Set up all accounts (Supabase, Paystack, SendGrid)
2. Get API keys from each service
3. Create DigitalOcean App Platform app
4. Add all environment variables
5. Deploy and test!
