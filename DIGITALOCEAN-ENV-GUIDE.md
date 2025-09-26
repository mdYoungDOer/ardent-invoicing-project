# 🚀 DigitalOcean App Platform Environment Variables Guide

This guide provides all the environment variables you need to set in DigitalOcean App Platform for your Ardent Invoicing deployment.

## 📋 Required Environment Variables

### 🔐 **Supabase Configuration** (Required)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get these:**
1. Go to your Supabase project dashboard
2. Settings → API
3. Copy the Project URL and anon public key
4. Copy the service_role key (keep this secret!)

### 💳 **Paystack Configuration** (Required for Payments)
```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
```

**How to get these:**
1. Sign up at [paystack.com](https://paystack.com)
2. Go to Settings → API Keys & Webhooks
3. Copy your Live Public Key and Live Secret Key
4. **Important:** Use Live keys for production, Test keys for development

### 📧 **SendGrid Configuration** (Required for Emails)
```
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

**How to get these:**
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Go to Settings → API Keys
3. Create a new API key with Full Access
4. Set up a verified sender email address

### 🌍 **Exchange Rate API** (Required for Multi-Currency)
```
NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=your_exchangerate_api_key
```

**How to get this:**
1. Sign up at [exchangerate-api.com](https://exchangerate-api.com)
2. Get your free API key
3. Upgrade to paid plan for production use

### 🌐 **App Configuration** (Required)
```
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
NEXTAUTH_SECRET=your_very_long_random_secret_key_here
NEXTAUTH_URL=https://your-app-domain.com
```

**How to generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 🗄️ **Database Configuration** (Optional - Supabase handles this)
```
DATABASE_URL=postgresql://username:password@host:port/database
```
*Note: This is optional since we're using Supabase's managed database*

## 🔧 **Production Environment Variables**

### 📊 **Analytics & Monitoring** (Optional but Recommended)
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 📁 **File Upload Configuration** (Optional)
```
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
```

### 🏷️ **Environment Flags** (Required)
```
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

## 🎯 **DigitalOcean App Platform Setup Steps**

### 1. **Create New App**
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repository
4. Select the `ardent-invoicing` repository

### 2. **Configure App Settings**
- **Name:** `ardent-invoicing`
- **Region:** Choose closest to Ghana (Frankfurt or Amsterdam)
- **Source:** GitHub repository
- **Branch:** `main`
- **Build Command:** `npm run build`
- **Run Command:** `npm start`
- **HTTP Port:** `3000`

### 3. **Add Environment Variables**
In the App Platform dashboard:
1. Go to Settings → App-Level Environment Variables
2. Add each environment variable from the list above
3. Make sure to use **Live** Paystack keys for production
4. Use your actual domain for `NEXT_PUBLIC_APP_URL`

### 4. **Configure Domain**
1. Go to Settings → Domains
2. Add your custom domain (e.g., `ardentinvoicing.com`)
3. Configure DNS records as instructed
4. SSL will be automatically provisioned

## 🔒 **Security Checklist**

### ✅ **Before Going Live:**
- [ ] Use **Live** Paystack keys (not test keys)
- [ ] Set up proper domain and SSL
- [ ] Configure SendGrid sender verification
- [ ] Test payment flows end-to-end
- [ ] Verify email delivery
- [ ] Set up monitoring and error tracking
- [ ] Configure database backups
- [ ] Test mobile responsiveness

### 🚨 **Critical Security Notes:**
- **Never commit** environment variables to Git
- **Use Live Paystack keys** only in production
- **Keep service role keys secret**
- **Enable RLS** on all Supabase tables
- **Use HTTPS** for all communications

## 📱 **Ghana-Specific Configuration**

### 🇬🇭 **Local Settings:**
```
NEXT_PUBLIC_DEFAULT_CURRENCY=GHS
NEXT_PUBLIC_DEFAULT_TIMEZONE=Africa/Accra
NEXT_PUBLIC_COUNTRY_CODE=GH
```

### 💰 **Paystack Ghana Setup:**
1. **Verify your business** with Paystack
2. **Enable Mobile Money** (MTN, Vodafone, AirtelTigo)
3. **Configure Bank Transfers** for local banks
4. **Set up webhooks** for payment notifications

## 🔍 **Testing Your Deployment**

### 1. **Health Checks:**
- Visit your domain - should load the landing page
- Test user registration and login
- Verify email delivery
- Test payment processing

### 2. **Mobile Testing:**
- Test on actual mobile devices
- Verify touch interactions
- Check responsive design
- Test offline capabilities

### 3. **Performance Testing:**
- Check page load times
- Test with slow connections
- Verify image optimization
- Monitor API response times

## 🚀 **Go Live Checklist**

- [ ] All environment variables configured
- [ ] Domain and SSL working
- [ ] Payment processing tested
- [ ] Email delivery verified
- [ ] Mobile responsiveness confirmed
- [ ] Error monitoring active
- [ ] Database backups configured
- [ ] Performance optimized

## 📞 **Support Resources**

- **DigitalOcean Docs:** [docs.digitalocean.com](https://docs.digitalocean.com)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Paystack Docs:** [paystack.com/docs](https://paystack.com/docs)
- **SendGrid Docs:** [docs.sendgrid.com](https://docs.sendgrid.com)

---

**🎉 Your Ardent Invoicing platform is ready to serve Ghanaian SMEs! 🇬🇭**

*Remember to test thoroughly before announcing your launch!*
