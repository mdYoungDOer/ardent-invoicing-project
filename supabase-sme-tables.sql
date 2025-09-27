-- SME Dashboard Required Tables
-- Run this script in your Supabase SQL Editor

-- Customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    company TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'GHS',
    category TEXT,
    sku TEXT,
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business settings table
CREATE TABLE IF NOT EXISTS public.business_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    business_name TEXT,
    business_email TEXT,
    business_phone TEXT,
    business_address TEXT,
    business_registration_number TEXT,
    tax_id TEXT,
    website TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id)
);

-- Invoice settings table
CREATE TABLE IF NOT EXISTS public.invoice_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    default_currency TEXT NOT NULL DEFAULT 'GHS',
    default_tax_rate DECIMAL(5,2) DEFAULT 12.5,
    default_payment_terms INTEGER DEFAULT 30,
    invoice_prefix TEXT DEFAULT 'INV',
    footer_message TEXT,
    include_bank_details BOOLEAN DEFAULT false,
    auto_send_invoices BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id)
);

-- Notification settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    invoice_reminders BOOLEAN DEFAULT true,
    payment_notifications BOOLEAN DEFAULT true,
    low_stock_alerts BOOLEAN DEFAULT false,
    weekly_reports BOOLEAN DEFAULT false,
    monthly_reports BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Users can view own tenant customers" ON public.customers
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own tenant customers" ON public.customers
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update own tenant customers" ON public.customers
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own tenant customers" ON public.customers
    FOR DELETE USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

-- RLS Policies for products
CREATE POLICY "Users can view own tenant products" ON public.products
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own tenant products" ON public.products
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update own tenant products" ON public.products
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own tenant products" ON public.products
    FOR DELETE USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

-- RLS Policies for business_settings
CREATE POLICY "Users can view own tenant business settings" ON public.business_settings
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own tenant business settings" ON public.business_settings
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update own tenant business settings" ON public.business_settings
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

-- RLS Policies for invoice_settings
CREATE POLICY "Users can view own tenant invoice settings" ON public.invoice_settings
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own tenant invoice settings" ON public.invoice_settings
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update own tenant invoice settings" ON public.invoice_settings
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

-- RLS Policies for notification_settings
CREATE POLICY "Users can view own tenant notification settings" ON public.notification_settings
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own tenant notification settings" ON public.notification_settings
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update own tenant notification settings" ON public.notification_settings
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM public.users 
            WHERE id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_tenant_id ON public.customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON public.products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_business_settings_tenant_id ON public.business_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoice_settings_tenant_id ON public.invoice_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_tenant_id ON public.notification_settings(tenant_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER set_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_business_settings_updated_at
    BEFORE UPDATE ON public.business_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_invoice_settings_updated_at
    BEFORE UPDATE ON public.invoice_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_notification_settings_updated_at
    BEFORE UPDATE ON public.notification_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
