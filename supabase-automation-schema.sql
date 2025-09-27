-- Supabase Automation Schema Updates
-- Run this script in your Supabase SQL Editor after the main schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- NEW TABLES FOR AUTOMATION
-- ==============================================

-- Recurring invoice schedules
CREATE TABLE IF NOT EXISTS recurring_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'yearly')),
    next_run TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(invoice_id)
);

-- System health metrics
CREATE TABLE IF NOT EXISTS system_health (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
    details JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backup logs
CREATE TABLE IF NOT EXISTS backup_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    backup_type TEXT NOT NULL CHECK (backup_type IN ('database', 'files', 'config', 'storage')),
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'in_progress')),
    size_bytes BIGINT,
    duration_seconds INTEGER,
    error_message TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics cache
CREATE TABLE IF NOT EXISTS analytics_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
    data JSONB NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    UNIQUE(tenant_id, metric_type, period, DATE(calculated_at))
);

-- Email logs for tracking sent emails
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- UPDATES TO EXISTING TABLES
-- ==============================================

-- Add columns to invoices table for automation
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS parent_invoice_id UUID REFERENCES invoices(id);

-- Add columns to users table for subscription management
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS next_billing_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_billing_date DATE;

-- Add columns to subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL CHECK (plan_id IN ('free', 'starter', 'pro', 'enterprise')),
    interval TEXT NOT NULL CHECK (interval IN ('monthly', 'quarterly', 'yearly')),
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'GHS',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'past_due', 'cancelled')),
    paystack_reference TEXT,
    paystack_customer_id TEXT,
    paystack_subscription_id TEXT,
    paystack_plan_id TEXT,
    started_at TIMESTAMPTZ,
    next_billing_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Recurring invoices indexes
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_tenant_id ON recurring_invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next_run ON recurring_invoices(next_run);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_is_active ON recurring_invoices(is_active);

-- System health indexes
CREATE INDEX IF NOT EXISTS idx_system_health_metric_name ON system_health(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_health_status ON system_health(status);
CREATE INDEX IF NOT EXISTS idx_system_health_recorded_at ON system_health(recorded_at);

-- Backup logs indexes
CREATE INDEX IF NOT EXISTS idx_backup_logs_type ON backup_logs(backup_type);
CREATE INDEX IF NOT EXISTS idx_backup_logs_status ON backup_logs(status);
CREATE INDEX IF NOT EXISTS idx_backup_logs_created_at ON backup_logs(created_at);

-- Analytics cache indexes
CREATE INDEX IF NOT EXISTS idx_analytics_cache_tenant_id ON analytics_cache(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_metric_type ON analytics_cache(metric_type);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_period ON analytics_cache(period);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires_at ON analytics_cache(expires_at);

-- Email logs indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(type);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);

-- Updated indexes for existing tables
CREATE INDEX IF NOT EXISTS idx_invoices_reminder_count ON invoices(reminder_count);
CREATE INDEX IF NOT EXISTS idx_invoices_last_reminder_sent ON invoices(last_reminder_sent);
CREATE INDEX IF NOT EXISTS idx_invoices_is_recurring ON invoices(is_recurring);
CREATE INDEX IF NOT EXISTS idx_invoices_parent_invoice_id ON invoices(parent_invoice_id);

CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_next_billing_date ON users(next_billing_date);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_date ON subscriptions(next_billing_date);

-- ==============================================
-- ROW LEVEL SECURITY POLICIES
-- ==============================================

-- Enable RLS on new tables
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Recurring invoices policies
CREATE POLICY "Super admins can view all recurring invoices" ON recurring_invoices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super'
        )
    );

CREATE POLICY "Tenant isolation for recurring invoices" ON recurring_invoices
    FOR ALL USING (
        tenant_id IN (
            SELECT u.tenant_id FROM users u 
            WHERE u.id = auth.uid() 
            AND u.tenant_id IS NOT NULL
        )
    );

-- System health policies (super admin only)
CREATE POLICY "Super admins can view system health" ON system_health
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super'
        )
    );

-- Backup logs policies (super admin only)
CREATE POLICY "Super admins can view backup logs" ON backup_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super'
        )
    );

-- Analytics cache policies
CREATE POLICY "Super admins can view all analytics cache" ON analytics_cache
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super'
        )
    );

CREATE POLICY "Tenant isolation for analytics cache" ON analytics_cache
    FOR ALL USING (
        tenant_id IN (
            SELECT u.tenant_id FROM users u 
            WHERE u.id = auth.uid() 
            AND u.tenant_id IS NOT NULL
        )
    );

-- Email logs policies (super admin only)
CREATE POLICY "Super admins can view email logs" ON email_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super'
        )
    );

-- Subscriptions policies
CREATE POLICY "Super admins can view all subscriptions" ON subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super'
        )
    );

CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (user_id = auth.uid());

-- ==============================================
-- HELPER FUNCTIONS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_recurring_invoices_updated_at 
    BEFORE UPDATE ON recurring_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired analytics cache
CREATE OR REPLACE FUNCTION cleanup_expired_analytics_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM analytics_cache 
    WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- Function to get subscription quota for user
CREATE OR REPLACE FUNCTION get_user_invoice_quota(user_uuid UUID)
RETURNS TABLE(quota_limit INTEGER, quota_used INTEGER, quota_remaining INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN u.subscription_tier = 'free' THEN 2
            WHEN u.subscription_tier = 'starter' THEN 20
            WHEN u.subscription_tier = 'pro' THEN 400
            WHEN u.subscription_tier = 'enterprise' THEN 999999
            ELSE 0
        END as quota_limit,
        u.invoice_quota_used as quota_used,
        CASE 
            WHEN u.subscription_tier = 'enterprise' THEN 999999
            ELSE GREATEST(0, 
                CASE 
                    WHEN u.subscription_tier = 'free' THEN 2
                    WHEN u.subscription_tier = 'starter' THEN 20
                    WHEN u.subscription_tier = 'pro' THEN 400
                    ELSE 0
                END - u.invoice_quota_used
            )
        END as quota_remaining
    FROM users u
    WHERE u.id = user_uuid;
END;
$$ language 'plpgsql';

-- Function to check if user can create invoice
CREATE OR REPLACE FUNCTION can_user_create_invoice(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    quota_result RECORD;
BEGIN
    SELECT * INTO quota_result FROM get_user_invoice_quota(user_uuid);
    
    RETURN quota_result.quota_remaining > 0 OR quota_result.quota_limit = 999999;
END;
$$ language 'plpgsql';

-- ==============================================
-- AUTOMATION TRIGGERS
-- ==============================================

-- Trigger to automatically update invoice quota when invoice is created
CREATE OR REPLACE FUNCTION update_invoice_quota_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment invoice quota used for the tenant owner
    UPDATE users 
    SET invoice_quota_used = invoice_quota_used + 1
    WHERE id = (
        SELECT sme_user_id 
        FROM tenants 
        WHERE id = NEW.tenant_id
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_invoice_quota
    AFTER INSERT ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_invoice_quota_on_insert();

-- Trigger to log email sending
CREATE OR REPLACE FUNCTION log_email_sending()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO email_logs (type, recipient_email, subject, status, sent_at)
    VALUES (NEW.type, NEW.recipient_email, NEW.subject, NEW.status, NOW());
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================
-- SAMPLE DATA (Optional - for testing)
-- ==============================================

-- Insert sample recurring invoice schedule (uncomment for testing)
/*
INSERT INTO recurring_invoices (invoice_id, tenant_id, frequency, next_run, is_active)
SELECT 
    i.id,
    i.tenant_id,
    'monthly',
    (i.due_date + INTERVAL '1 month')::TIMESTAMPTZ,
    true
FROM invoices i
WHERE i.is_recurring = true
LIMIT 1;
*/

-- ==============================================
-- GRANTS AND PERMISSIONS
-- ==============================================

-- Grant necessary permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant permissions to authenticated users for their own data
GRANT SELECT, INSERT, UPDATE ON recurring_invoices TO authenticated;
GRANT SELECT ON analytics_cache TO authenticated;
GRANT SELECT ON subscriptions TO authenticated;

COMMENT ON TABLE recurring_invoices IS 'Manages recurring invoice schedules and automation';
COMMENT ON TABLE system_health IS 'Stores system health metrics for monitoring';
COMMENT ON TABLE backup_logs IS 'Logs backup operations and their status';
COMMENT ON TABLE analytics_cache IS 'Caches calculated analytics for performance';
COMMENT ON TABLE email_logs IS 'Logs all email communications for audit trail';
COMMENT ON TABLE subscriptions IS 'Manages user subscription plans and billing';

COMMENT ON FUNCTION cleanup_expired_analytics_cache() IS 'Cleans up expired analytics cache entries';
COMMENT ON FUNCTION get_user_invoice_quota(UUID) IS 'Returns invoice quota information for a user';
COMMENT ON FUNCTION can_user_create_invoice(UUID) IS 'Checks if user can create a new invoice based on quota';
