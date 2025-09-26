-- Final Ardent Invoicing Database Schema
-- Complete schema with subscriptions, email logs, and enhanced features

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    plan_id TEXT NOT NULL,
    interval TEXT NOT NULL, -- monthly, quarterly, biannual, annual
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'GHS',
    status TEXT NOT NULL DEFAULT 'pending', -- pending, active, cancelled, past_due
    paystack_reference TEXT UNIQUE,
    paystack_customer_id TEXT,
    paystack_subscription_id TEXT,
    paystack_plan_id TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    next_billing_date TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    last_payment_failed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email logs table
CREATE TABLE email_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL, -- invoice, payment_receipt, subscription_confirmation, invoice_reminder
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'sent', -- sent, failed, pending
    error_message TEXT,
    metadata JSONB
);

-- Create client invites table (if not exists)
CREATE TABLE IF NOT EXISTS client_invites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    client_email TEXT NOT NULL,
    invite_token TEXT UNIQUE NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_unlimited_free BOOLEAN DEFAULT false;

-- Add columns to invoices table if they don't exist
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_phone TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_address TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) NOT NULL DEFAULT 12.5;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,4);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurring_config JSONB;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reminder_count INTEGER NOT NULL DEFAULT 0;

-- Add columns to expenses table if they don't exist
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS ocr_text TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS mileage_distance DECIMAL(8,2);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_business BOOLEAN NOT NULL DEFAULT true;

-- Add columns to tenants table if they don't exist
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS business_address TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS business_phone TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS business_email TEXT;

-- Create invoice line items table (if not exists)
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoice templates table (if not exists)
CREATE TABLE IF NOT EXISTS invoice_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    template_data JSONB NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for email logs (admin only)
DROP POLICY IF EXISTS "Super admins can view all email logs" ON email_logs;
CREATE POLICY "Super admins can view all email logs" ON email_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super'
        )
    );

-- RLS Policies for client_invites
DROP POLICY IF EXISTS "Tenant isolation for client invites" ON client_invites;
CREATE POLICY "Tenant isolation for client invites" ON client_invites
    FOR ALL USING (
        tenant_id IN (
            SELECT u.tenant_id FROM users u
            WHERE u.id = auth.uid() AND u.tenant_id IS NOT NULL
        )
    );

-- RLS Policies for invoice_line_items
DROP POLICY IF EXISTS "Tenant isolation for invoice line items" ON invoice_line_items;
CREATE POLICY "Tenant isolation for invoice line items" ON invoice_line_items
    FOR ALL USING (
        invoice_id IN (
            SELECT i.id FROM invoices i
            JOIN users u ON u.tenant_id = i.tenant_id
            WHERE u.id = auth.uid()
        )
    );

-- RLS Policies for invoice_templates
DROP POLICY IF EXISTS "Tenant isolation for invoice templates" ON invoice_templates;
CREATE POLICY "Tenant isolation for invoice templates" ON invoice_templates
    FOR ALL USING (
        tenant_id IN (
            SELECT u.tenant_id FROM users u
            WHERE u.id = auth.uid() AND u.tenant_id IS NOT NULL
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paystack_ref ON subscriptions(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(type);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_client_invites_tenant_id ON client_invites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_invites_token ON client_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_invoice_templates_tenant_id ON invoice_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_ref ON invoices(payment_reference);
CREATE INDEX IF NOT EXISTS idx_invoices_recurring ON invoices(recurring_config);
CREATE INDEX IF NOT EXISTS idx_expenses_receipt_url ON expenses(receipt_url);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_templates_updated_at ON invoice_templates;
CREATE TRIGGER update_invoice_templates_updated_at BEFORE UPDATE ON invoice_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create recurring invoice
CREATE OR REPLACE FUNCTION create_recurring_invoice()
RETURNS void AS $$
DECLARE
    recurring_invoice RECORD;
    new_invoice_id UUID;
    new_invoice_number TEXT;
BEGIN
    -- Get invoices that need to be recreated
    FOR recurring_invoice IN 
        SELECT * FROM invoices 
        WHERE recurring_config IS NOT NULL
        AND recurring_config->>'frequency' IS NOT NULL
        AND recurring_config->>'next_run' IS NOT NULL
        AND (recurring_config->>'next_run')::timestamp <= NOW()
    LOOP
        -- Generate new invoice number
        SELECT 'INV-' || EXTRACT(YEAR FROM NOW()) || 
               LPAD(EXTRACT(MONTH FROM NOW())::text, 2, '0') ||
               LPAD(EXTRACT(DAY FROM NOW())::text, 2, '0') ||
               '-' || LPAD(FLOOR(RANDOM() * 1000)::text, 3, '0')
        INTO new_invoice_number;
        
        -- Create new invoice
        INSERT INTO invoices (
            tenant_id, 
            invoice_number,
            client_name, 
            client_email, 
            client_phone,
            client_address,
            amount, 
            currency, 
            status, 
            due_date,
            tax_rate,
            discount_amount,
            exchange_rate,
            notes,
            recurring_config
        ) VALUES (
            recurring_invoice.tenant_id,
            new_invoice_number,
            recurring_invoice.client_name,
            recurring_invoice.client_email,
            recurring_invoice.client_phone,
            recurring_invoice.client_address,
            recurring_invoice.amount,
            recurring_invoice.currency,
            'draft',
            recurring_invoice.due_date + INTERVAL '1 month', -- Adjust based on frequency
            recurring_invoice.tax_rate,
            recurring_invoice.discount_amount,
            recurring_invoice.exchange_rate,
            recurring_invoice.notes,
            recurring_invoice.recurring_config
        ) RETURNING id INTO new_invoice_id;
        
        -- Copy line items
        INSERT INTO invoice_line_items (
            invoice_id,
            description,
            quantity,
            unit_price,
            total_amount
        )
        SELECT 
            new_invoice_id,
            description,
            quantity,
            unit_price,
            total_amount
        FROM invoice_line_items 
        WHERE invoice_id = recurring_invoice.id;
        
        -- Update next run date
        UPDATE invoices 
        SET recurring_config = jsonb_set(
            recurring_config, 
            '{next_run}', 
            to_jsonb((recurring_config->>'next_run')::timestamp + INTERVAL '1 month')
        )
        WHERE id = recurring_invoice.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to increment invoice quota
CREATE OR REPLACE FUNCTION increment_invoice_quota(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_record users%ROWTYPE;
    quota_limit INTEGER;
BEGIN
    -- Get user record
    SELECT * INTO user_record FROM users WHERE id = user_id;
    
    -- If unlimited free, allow
    IF user_record.is_unlimited_free THEN
        RETURN TRUE;
    END IF;
    
    -- Set quota based on subscription tier
    CASE user_record.subscription_tier
        WHEN 'free' THEN quota_limit := 2;
        WHEN 'starter' THEN quota_limit := 20;
        WHEN 'pro' THEN quota_limit := 400;
        WHEN 'enterprise' THEN quota_limit := 999999;
        ELSE quota_limit := 2;
    END CASE;
    
    -- Check if within quota
    IF user_record.invoice_quota_used < quota_limit THEN
        -- Increment quota
        UPDATE users 
        SET invoice_quota_used = invoice_quota_used + 1 
        WHERE id = user_id;
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send invoice reminder
CREATE OR REPLACE FUNCTION send_invoice_reminder()
RETURNS void AS $$
DECLARE
    overdue_invoice RECORD;
BEGIN
    -- Get overdue invoices
    FOR overdue_invoice IN 
        SELECT 
            i.*,
            t.business_name,
            t.business_email
        FROM invoices i
        JOIN tenants t ON t.id = i.tenant_id
        WHERE i.status IN ('sent', 'draft')
        AND i.due_date < NOW()
        AND i.reminder_count < 3
    LOOP
        -- Log reminder email (actual sending would be handled by application)
        INSERT INTO email_logs (type, recipient, subject, status, metadata)
        VALUES (
            'invoice_reminder',
            overdue_invoice.client_email,
            'Payment Reminder - Invoice ' || overdue_invoice.invoice_number,
            'pending',
            jsonb_build_object(
                'invoice_id', overdue_invoice.id,
                'business_name', overdue_invoice.business_name,
                'days_overdue', EXTRACT(DAY FROM NOW() - overdue_invoice.due_date)
            )
        );
        
        -- Increment reminder count
        UPDATE invoices 
        SET reminder_count = reminder_count + 1
        WHERE id = overdue_invoice.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a view for subscription analytics
CREATE VIEW subscription_analytics AS
SELECT 
    s.plan_id,
    s.interval,
    COUNT(*) as total_subscriptions,
    COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_subscriptions,
    COUNT(CASE WHEN s.status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
    AVG(s.amount) as average_amount,
    SUM(s.amount) as total_revenue,
    MIN(s.created_at) as first_subscription,
    MAX(s.created_at) as latest_subscription
FROM subscriptions s
GROUP BY s.plan_id, s.interval;

-- Create a view for invoice analytics
CREATE VIEW invoice_analytics AS
SELECT 
    t.business_name,
    t.subscription_tier,
    COUNT(i.id) as total_invoices,
    COUNT(CASE WHEN i.status = 'paid' THEN 1 END) as paid_invoices,
    COUNT(CASE WHEN i.status = 'overdue' THEN 1 END) as overdue_invoices,
    SUM(i.amount) as total_amount,
    SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END) as paid_amount,
    AVG(i.amount) as average_invoice_amount,
    MIN(i.created_at) as first_invoice,
    MAX(i.created_at) as latest_invoice
FROM invoices i
JOIN tenants t ON t.id = i.tenant_id
GROUP BY t.business_name, t.subscription_tier;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
