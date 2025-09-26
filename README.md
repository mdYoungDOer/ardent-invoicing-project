# Ardent Invoicing

A mobile-first, enterprise-grade invoicing and expense management SaaS platform designed specifically for Ghanaian SMEs. Built with Next.js 14, Supabase, and Material-UI.

## Features

- **Professional Invoicing**: Create beautiful invoices with GHS currency support
- **Expense Tracking**: Comprehensive expense management with receipt capture
- **Multi-Tenancy**: Secure tenant isolation with role-based access control
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **VAT Compliance**: Automatic VAT calculations for Ghanaian tax requirements
- **Real-time Analytics**: Business insights and reporting dashboard
- **Secure Authentication**: Supabase Auth with custom user roles

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI Framework**: Material-UI (MUI) v5 with custom theme
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Custom CSS with MUI theming
- **State Management**: Zustand
- **Forms**: React Hook Form with validation
- **Icons**: Material-UI Icons, Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ardent-invoicing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses a multi-tenant architecture with the following key tables:

- **users**: User accounts with roles (super, sme, client)
- **tenants**: Business entities owned by SMEs
- **invoices**: Invoice records with tenant isolation
- **expenses**: Expense tracking with tenant isolation

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- Tenant isolation (SMEs can only access their own data)
- Super admin access (full platform access)
- User profile management

## User Roles

### Super Admin
- Full platform access
- User and tenant management
- System administration

### SME (Small/Medium Enterprise)
- Business account owner
- Invoice and expense management
- Team member management
- Subscription management

### Client
- Limited access for invoice viewing
- Payment tracking

## Subscription Tiers

### Free
- 2 invoices per month
- Basic expense tracking
- GHS currency support

### Starter (₵129/month)
- 20 invoices per month
- Advanced expense tracking
- Multi-currency support
- VAT calculations

### Pro (₵489/month)
- 400 invoices per month
- Advanced analytics
- Custom branding
- API access
- Team collaboration (up to 5 users)

### Enterprise (₵999/month)
- Unlimited invoices
- Full API access
- White-label options
- Dedicated support
- Unlimited team members

## Deployment

### DigitalOcean App Platform

1. **Connect your repository** to DigitalOcean App Platform
2. **Set environment variables** in the App Platform dashboard
3. **Configure build settings**:
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Output Directory: `.next`

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # SME dashboard
│   └── page.tsx          # Home page
├── components/            # Reusable components
│   ├── theme/            # Theme providers
│   └── ui/               # UI components
├── lib/                  # Utilities and configurations
│   ├── supabase.ts       # Supabase client
│   ├── auth.ts          # Authentication utilities
│   └── utils.ts         # General utilities
└── theme.ts             # MUI theme configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@ardentinvoicing.com or join our Slack channel.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced reporting and analytics
- [ ] Integration with Ghanaian banks
- [ ] Multi-language support (Twi, Ewe)
- [ ] Advanced automation features
- [ ] API marketplace