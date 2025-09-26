# Ardent Invoicing

A mobile-first, enterprise-grade invoicing and expense management SaaS platform designed specifically for Ghanaian SMEs.

## 🌟 Features

### Core Functionality
- **Multi-tenant Architecture**: Complete tenant isolation with Row Level Security (RLS)
- **Authentication**: Supabase Auth with role-based access (Super Admin, SME, Client)
- **Invoicing**: Create, manage, and track invoices with multi-currency support
- **Expense Tracking**: Track business expenses with receipt upload and OCR scanning
- **Dashboard Analytics**: Comprehensive dashboards with charts and insights
- **PDF Generation**: Professional invoice PDFs with custom branding

### Advanced Features
- **Mobile-First Design**: Responsive UI optimized for mobile devices
- **Real-time Updates**: Live data synchronization across devices
- **OCR Receipt Scanning**: Automatic text extraction from receipt images
- **Geolocation Integration**: Automatic location detection for expenses
- **Exchange Rate API**: Real-time currency conversion
- **Recurring Invoices**: Automated invoice generation
- **Quota Management**: Subscription-based invoice limits
- **Client Portal**: Invitation-based client access

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Material-UI v5
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Styling**: MUI Theme with custom Ghana-inspired color palette (#a67c00, #746354)
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **PDF Generation**: @react-pdf/renderer
- **OCR**: Tesseract.js for receipt scanning
- **Currency**: Multi-currency support with exchange rate integration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mdYoungDOer/ardent-invoicing-project.git
   cd ardent-invoicing-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   - Run the extended schema from `database-extensions.sql`
   - Get your project URL and API keys from Settings > API

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Exchange Rate API (Optional - for currency conversion)
   # Get your free API key from https://exchangerate-api.com/
   NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=your_api_key_here
   
   # OpenCage Geocoding API (Optional - for location services)
   # Get your free API key from https://opencagedata.com/
   NEXT_PUBLIC_OPENCAGE_API_KEY=your_api_key_here
   ```

5. **Set up Supabase Storage**
   - Go to Storage in your Supabase dashboard
   - Create two buckets: `invoices` and `receipts`
   - Set appropriate RLS policies for tenant isolation

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

The application uses the following main tables:

### Core Tables
- **tenants**: Business entities with subscription information
- **users**: User accounts with role-based access
- **invoices**: Invoice records with line items
- **expenses**: Expense tracking with receipt management

### Extended Tables
- **invoice_line_items**: Individual line items for invoices
- **client_invites**: Invitation system for client access
- **invoice_templates**: Customizable invoice templates

### Key Features
- Row Level Security (RLS) for complete tenant isolation
- Automatic timestamp management with triggers
- Quota checking functions for subscription management
- Recurring invoice automation

## 🔐 Authentication Flow

1. **SME Registration**: Creates both user and tenant records automatically
2. **Super Admin**: Platform administration access with full system oversight
3. **Client Access**: Invitation-based access to view and pay invoices

## 💰 Subscription Tiers

- **Free**: 2 invoices/month, basic features
- **Starter**: 20 invoices/month - ₵129/month
- **Pro**: 400 invoices/month - ₵489/month  
- **Enterprise**: Unlimited invoices - ₵999/month

## 🎨 Design System

### Color Palette
- **Primary**: #a67c00 (Gold) - Ghana-inspired branding
- **Secondary**: #746354 (Brown) - Earth tones
- **Background**: White (light mode default)
- **Text**: #2c2c2c (Dark gray)

### Typography
- **Font Family**: Inter (primary), Roboto (fallback)
- **Mobile-First**: Responsive breakpoints optimized for mobile

## 📱 Mobile Features

- **Touch-Optimized**: Large buttons and touch targets
- **Swipeable Lists**: Mobile-friendly expense and invoice lists
- **Camera Integration**: Direct receipt capture
- **Geolocation**: Automatic expense location detection
- **Offline Support**: Basic offline functionality

## 🌍 Multi-Currency Support

- **Default Currency**: Ghana Cedis (GHS) 🇬🇭
- **Supported Currencies**: USD, GBP, EUR, CAD, AUD
- **Exchange Rate Integration**: Real-time conversion rates
- **Payment Notes**: Automatic GHS conversion instructions

## 📄 PDF Features

- **Professional Design**: Custom-branded invoice templates
- **Multi-Currency**: Currency symbols and conversion notes
- **Ghana Flag**: 🇬🇭 branding for GHS invoices
- **Paystack Integration**: Payment instructions for GHS conversion

## 🚀 Deployment

The application is designed for deployment on DigitalOcean App Platform:

1. **Connect Repository**: Link your GitHub repository
2. **Environment Variables**: Set all required environment variables
3. **Build Settings**: Configure Next.js build process
4. **Deploy**: Automatic builds on push to main branch

### Production Checklist
- [ ] Set up production Supabase project
- [ ] Configure domain and SSL
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Set up CDN for static assets

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Build for production
npm run build
```

## 📈 Analytics & Monitoring

- **User Analytics**: Track user engagement and feature usage
- **Revenue Analytics**: Monitor subscription metrics
- **Performance Monitoring**: Track app performance and errors
- **Business Intelligence**: Dashboard insights for SMEs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the established design system

## 📞 Support

For support and questions:
- **Email**: support@ardentinvoicing.com
- **Documentation**: [docs.ardentinvoicing.com](https://docs.ardentinvoicing.com)
- **GitHub Issues**: [Report bugs and request features](https://github.com/mdYoungDOer/ardent-invoicing-project/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the amazing backend-as-a-service platform
- **Material-UI** for the comprehensive component library
- **Next.js** team for the powerful React framework
- **Ghana** 🇬🇭 for inspiring the color palette and design

---

**Built with ❤️ for Ghanaian SMEs** 🇬🇭
