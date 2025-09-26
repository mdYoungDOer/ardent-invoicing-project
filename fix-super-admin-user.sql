-- Fix the existing Super Admin user
-- Remove subscription attributes that shouldn't exist for super admins

UPDATE users 
SET 
    subscription_tier = NULL,
    is_unlimited_free = NULL,
    invoice_quota_used = NULL,
    subscription_status = NULL,
    updated_at = NOW()
WHERE id = '891f3647-3249-431a-a972-d0f1bc31802e' 
AND role = 'super';

-- Verify the update
SELECT 
    id,
    email,
    role,
    tenant_id,
    subscription_tier,
    invoice_quota_used,
    is_unlimited_free,
    subscription_status,
    created_at,
    updated_at
FROM users 
WHERE id = '891f3647-3249-431a-a972-d0f1bc31802e';
