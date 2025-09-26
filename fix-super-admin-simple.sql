-- Step 1: Make subscription fields nullable
ALTER TABLE users ALTER COLUMN subscription_tier DROP NOT NULL;
ALTER TABLE users ALTER COLUMN is_unlimited_free DROP NOT NULL;
ALTER TABLE users ALTER COLUMN invoice_quota_used DROP NOT NULL;

-- Step 2: Update existing super admin users
UPDATE users 
SET 
    subscription_tier = NULL,
    is_unlimited_free = NULL,
    invoice_quota_used = NULL,
    subscription_status = NULL
WHERE role = 'super';

-- Step 3: Verify the changes
SELECT 
    id,
    email,
    role,
    subscription_tier,
    is_unlimited_free,
    invoice_quota_used,
    subscription_status
FROM users 
WHERE role = 'super';
