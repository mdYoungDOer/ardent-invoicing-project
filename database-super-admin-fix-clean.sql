-- Fix Super Admin User Attributes
-- Super admins should not have subscription-related attributes

-- Make subscription fields nullable for super admins
ALTER TABLE users ALTER COLUMN subscription_tier DROP NOT NULL;
ALTER TABLE users ALTER COLUMN is_unlimited_free DROP NOT NULL;
ALTER TABLE users ALTER COLUMN invoice_quota_used DROP NOT NULL;

-- Update existing super admin users to have NULL values for subscription fields
UPDATE users 
SET 
    subscription_tier = NULL,
    is_unlimited_free = NULL,
    invoice_quota_used = NULL,
    subscription_status = NULL
WHERE role = 'super';

-- Add a check constraint to ensure super admins don't have subscription attributes
ALTER TABLE users ADD CONSTRAINT check_super_admin_no_subscription 
CHECK (
    (role = 'super' AND subscription_tier IS NULL AND is_unlimited_free IS NULL) OR
    (role != 'super')
);

-- Update the default values to be NULL instead of 'free' and false
ALTER TABLE users ALTER COLUMN subscription_tier SET DEFAULT NULL;
ALTER TABLE users ALTER COLUMN is_unlimited_free SET DEFAULT NULL;
ALTER TABLE users ALTER COLUMN invoice_quota_used SET DEFAULT NULL;

-- Add a comment to clarify the schema
COMMENT ON COLUMN users.subscription_tier IS 'Subscription tier for SME users only. NULL for super admins.';
COMMENT ON COLUMN users.is_unlimited_free IS 'Unlimited free access for SME users only. NULL for super admins.';
COMMENT ON COLUMN users.invoice_quota_used IS 'Invoice quota usage for SME users only. NULL for super admins.';
