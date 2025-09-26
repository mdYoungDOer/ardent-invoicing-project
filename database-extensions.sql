-- Extended Ardent Invoicing Database Schema
-- Additional tables for invoices, expenses, and client access

-- Create invoice line items table
CREATE TABLE invoice_line_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client invites table
CREATE TABLE client_invites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    client_email TEXT NOT NULL,
    invite_token TEXT UNIQUE NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update invoices table with additional fields
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

-- Update expenses table with additional fields
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS ocr_text TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS mileage_distance DECIMAL(8,2);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_business BOOLEAN NOT NULL DEFAULT true;

-- Create invoice templates table
CREATE TABLE invoice_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    template_data JSONB NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoice_line_items
CREATE POLICY "Tenant isolation for invoice line items" ON invoice_line_items
    FOR ALL USING (
        invoice_id IN (
            SELECT i.id FROM invoices i
            JOIN users u ON u.tenant_id = i.tenant_id
            WHERE u.id = auth.uid()
        )
    );

-- RLS Policies for client_invites
CREATE POLICY "Tenant isolation for client invites" ON client_invites
    FOR ALL USING (
        tenant_id IN (
            SELECT u.tenant_id FROM users u
            WHERE u.id = auth.uid() AND u.tenant_id IS NOT NULL
        )
    );

-- RLS Policies for invoice_templates
CREATE POLICY "Tenant isolation for invoice templates" ON invoice_templates
    FOR ALL USING (
        tenant_id IN (
            SELECT u.tenant_id FROM users u
            WHERE u.id = auth.uid() AND u.tenant_id IS NOT NULL
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_client_invites_tenant_id ON client_invites(tenant_id);
CREATE INDEX idx_client_invites_token ON client_invites(invite_token);
CREATE INDEX idx_invoice_templates_tenant_id ON invoice_templates(tenant_id);
CREATE INDEX idx_invoices_recurring ON invoices(recurring_config);
CREATE INDEX idx_expenses_receipt_url ON expenses(receipt_url);

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
        -- Create new invoice
        INSERT INTO invoices (
            tenant_id, 
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

-- Create trigger for updated_at on invoice_templates
CREATE TRIGGER update_invoice_templates_updated_at BEFORE UPDATE ON invoice_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
