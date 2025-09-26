# 🇬🇭 Ardent Invoicing

> Professional invoicing and expense tracking for Ghanaian SMEs

Ardent Invoicing is a comprehensive, mobile-first SaaS platform designed specifically for Ghanaian small and medium enterprises. Built with Next.js 14, Supabase, and Paystack integration, it provides seamless invoicing, expense tracking, and payment processing in Ghana Cedis (GHS).

## ✨ Features

### 🧾 Invoicing
- **Multi-currency support** with automatic GHS conversion
- **PDF generation** with professional templates
- **Recurring invoices** with automated scheduling
- **Client portal** for easy payment access
- **Invoice templates** for consistent branding
- **Quota management** based on subscription tiers

### 💰 Expense Tracking
- **Receipt OCR** using Tesseract.js for automatic data extraction
- **Geolocation tracking** for mileage calculation
- **Category management** with automatic classification
- **Receipt storage** via Supabase Storage
- **Multi-currency support** with real-time exchange rates

### 📊 Dashboards
- **SME Dashboard**: Income/expense analytics, recent activity, quota status
- **Super Admin Dashboard**: SME management, analytics, unlimited access controls
- **Client Portal**: Invoice viewing and payment processing

### 💳 Payments & Subscriptions
- **Paystack integration** for GHS payments
- **Recurring subscriptions** with multiple billing intervals
- **Free tier** with 2 invoices/month
- **Tiered pricing**: Starter (₵129), Pro (₵489), Enterprise (₵999)
- **Super admin overrides** for unlimited access

### 📧 Email System
- **SendGrid integration** for transactional emails
- **Professional templates** for invoices, receipts, reminders
- **Automated reminders** for overdue payments
- **Subscription confirmations** and notifications

### 🔐 Security & Multi-tenancy
- **Row Level Security (RLS)** for complete tenant isolation
- **Role-based access control** (SME, Super Admin, Client)
- **Secure authentication** via Supabase Auth
- **Data encryption** and secure storage

## 🚀 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Material-UI v5** for consistent design
- **Framer Motion** for smooth animations
- **React Hook Form + Zod** for form validation
- **Recharts** for data visualization

### Backend & Database
- **Supabase** for authentication, database, and storage
- **PostgreSQL** with Row Level Security
- **Edge Functions** for serverless operations

### Payments & Integrations
- **Paystack** for payment processing
- **SendGrid** for email delivery
- **Exchange Rate API** for currency conversion
- **Tesseract.js** for OCR functionality

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Paystack account
- SendGrid account
- Exchange Rate API key

### 1. Clone and Install
```bash
git clone https://github.com/mdYoungDOer/ardent-invoicing-project.git
cd ardent-invoicing-project/ardent-invoicing
npm install
```

### 2. Environment Setup
```bash
cp env.example .env.local
```

Configure your `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...

# SendGrid
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Exchange Rate API
NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=your_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup
1. Create a new Supabase project
2. Run the SQL from `database-final.sql` in your Supabase SQL editor
3. Enable Row Level Security on all tables
4. Configure storage buckets for receipts

### 4. Development
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Super admin pages
│   ├── client/            # Client portal pages
│   ├── dashboard/         # SME dashboard pages
│   └── api/               # API routes
├── components/            # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── supabase.ts        # Database client
│   ├── paystack.ts        # Payment processing
│   ├── email.ts           # Email service
│   └── store.ts           # Zustand state management
└── types/                 # TypeScript type definitions
```

## 🚀 Deployment

### DigitalOcean App Platform

1. **Connect Repository**
   - Connect your GitHub repository to DigitalOcean App Platform
   - Select the `ardent-invoicing` directory as the source

2. **Environment Variables**
   - Add all environment variables from your `.env.local`
   - Ensure production URLs are set correctly

3. **Build Settings**
   ```yaml
   # .do/app.yaml
   name: ardent-invoicing
   services:
   - name: web
     source_dir: /
     github:
       repo: your-username/ardent-invoicing-project
       branch: main
     run_command: npm start
     build_command: npm run build
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NODE_ENV
       value: production
   ```

4. **Deploy**
   - DigitalOcean will automatically build and deploy
   - Monitor logs for any issues

### Alternative Deployments

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm run build
# Upload dist folder to Netlify
```

## 📱 PWA Features

- **Offline support** for viewing cached invoices
- **App-like experience** on mobile devices
- **Push notifications** for payment reminders
- **Home screen installation** on iOS/Android

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Subscriptions
- `POST /api/subscribe/create` - Create subscription
- `POST /api/webhook/paystack` - Paystack webhook

### Invoicing
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice

### Payments
- `POST /api/pay/invoice` - Process invoice payment

### Email
- `POST /api/email/send` - Send transactional email

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 📊 Monitoring

### Analytics
- Google Analytics integration
- Custom event tracking
- User behavior analytics

### Error Tracking
- Sentry integration for error monitoring
- Performance monitoring
- Uptime tracking

## 🔒 Security

- **HTTPS enforcement** in production
- **Content Security Policy** headers
- **Rate limiting** on API endpoints
- **Input validation** with Zod schemas
- **SQL injection protection** via Supabase
- **XSS protection** with React sanitization

## 🌍 Localization

- **Ghana timezone** support
- **GHS currency** formatting
- **Local payment methods** (mobile money, bank transfers)
- **English language** interface
- **Cultural considerations** in UI/UX

## 📈 Performance

- **Server-side rendering** for SEO
- **Image optimization** with Next.js
- **Code splitting** for faster loading
- **Caching strategies** for API calls
- **Database indexing** for optimal queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.ardentinvoicing.com](https://docs.ardentinvoicing.com)
- **Email**: support@ardentinvoicing.com
- **GitHub Issues**: [Report bugs](https://github.com/mdYoungDOer/ardent-invoicing-project/issues)

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core invoicing functionality
- ✅ Expense tracking with OCR
- ✅ Paystack integration
- ✅ Email notifications
- ✅ Multi-tenancy

### Phase 2 (Q2 2024)
- 🔄 Advanced analytics dashboard
- 🔄 Mobile app (React Native)
- 🔄 API for third-party integrations
- 🔄 Advanced reporting features

### Phase 3 (Q3 2024)
- 🔄 White-label solutions
- 🔄 Advanced automation
- 🔄 Multi-language support
- 🔄 Advanced team collaboration

---

**Built with ❤️ for Ghanaian SMEs** 🇬🇭

*Empowering businesses with professional invoicing and expense tracking solutions tailored for the Ghanaian market.*
