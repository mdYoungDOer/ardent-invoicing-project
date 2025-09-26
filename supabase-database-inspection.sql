-- =====================================================
-- COMPREHENSIVE SUPABASE DATABASE INSPECTION SCRIPT
-- =====================================================
-- This script will help identify any database issues affecting login
-- Run each section individually in Supabase SQL Editor

-- =====================================================
-- 1. USER DATA INTEGRITY CHECK
-- =====================================================

-- Check all users in the users table
SELECT 
    id,
    email,
    role,
    tenant_id,
    subscription_tier,
    subscription_status,
    created_at,
    updated_at
FROM users 
ORDER BY created_at DESC;

-- Check specific user (replace with your user ID)
SELECT 
    id,
    email,
    role,
    tenant_id,
    subscription_tier,
    subscription_status,
    invoice_quota_used,
    is_unlimited_free,
    created_at,
    updated_at
FROM users 
WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa';

-- Check for any users with missing or invalid roles
SELECT 
    id,
    email,
    role,
    CASE 
        WHEN role IS NULL THEN 'NULL_ROLE'
        WHEN role NOT IN ('sme', 'super') THEN 'INVALID_ROLE'
        ELSE 'VALID_ROLE'
    END as role_status
FROM users 
WHERE role IS NULL OR role NOT IN ('sme', 'super');

-- =====================================================
-- 2. TENANT DATA CHECK
-- =====================================================

-- Check all tenants
SELECT 
    id,
    business_name,
    created_at,
    updated_at
FROM tenants 
ORDER BY created_at DESC;

-- Check if user has valid tenant
SELECT 
    u.id,
    u.email,
    u.role,
    u.tenant_id,
    t.business_name,
    t.created_at as tenant_created
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.id = '05bd895d-f02f-4da4-8a18-2895c722d6aa';

-- =====================================================
-- 3. RLS POLICIES INSPECTION
-- =====================================================

-- Check all RLS policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Check if RLS is enabled on users table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- =====================================================
-- 4. AUTH USERS VS DATABASE USERS
-- =====================================================

-- Check auth.users table (if accessible)
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'mdyoungdoer@gmail.com'
ORDER BY created_at DESC;

-- Compare auth.users with public.users
SELECT 
    au.id as auth_id,
    au.email as auth_email,
    au.email_confirmed_at,
    au.last_sign_in_at,
    pu.id as public_id,
    pu.email as public_email,
    pu.role,
    pu.tenant_id
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'mdyoungdoer@gmail.com';

-- =====================================================
-- 5. SESSION AND AUTHENTICATION CHECK
-- =====================================================

-- Check auth sessions (if accessible)
SELECT 
    id,
    user_id,
    created_at,
    updated_at,
    factor_id,
    aal,
    not_after
FROM auth.sessions 
WHERE user_id = '05bd895d-f02f-4da4-8a18-2895c722d6aa'
ORDER BY created_at DESC;

-- Check auth identities
SELECT 
    id,
    user_id,
    identity_data,
    provider,
    created_at,
    updated_at
FROM auth.identities 
WHERE user_id = '05bd895d-f02f-4da4-8a18-2895c722d6aa'
ORDER BY created_at DESC;

-- =====================================================
-- 6. PERMISSIONS AND ACCESS CHECK
-- =====================================================

-- Check table permissions
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name IN ('users', 'tenants')
ORDER BY table_name, grantee;

-- Check if current user can access users table
SELECT 
    has_table_privilege('users', 'SELECT') as can_select_users,
    has_table_privilege('users', 'INSERT') as can_insert_users,
    has_table_privilege('users', 'UPDATE') as can_update_users,
    has_table_privilege('tenants', 'SELECT') as can_select_tenants;

-- =====================================================
-- 7. DATABASE CONSTRAINTS AND FOREIGN KEYS
-- =====================================================

-- Check foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('users', 'tenants');

-- Check check constraints
SELECT 
    conname,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE contype = 'c' 
    AND conrelid = 'users'::regclass;

-- =====================================================
-- 8. RECENT ACTIVITY AND LOGS
-- =====================================================

-- Check recent user updates
SELECT 
    id,
    email,
    role,
    updated_at,
    CASE 
        WHEN updated_at > created_at THEN 'UPDATED'
        ELSE 'ORIGINAL'
    END as status
FROM users 
WHERE updated_at > NOW() - INTERVAL '24 hours'
ORDER BY updated_at DESC;

-- Check for any data inconsistencies
SELECT 
    'users_with_null_tenant' as issue_type,
    COUNT(*) as count
FROM users 
WHERE tenant_id IS NULL AND role = 'sme'

UNION ALL

SELECT 
    'users_with_invalid_roles' as issue_type,
    COUNT(*) as count
FROM users 
WHERE role NOT IN ('sme', 'super')

UNION ALL

SELECT 
    'users_with_missing_emails' as issue_type,
    COUNT(*) as count
FROM users 
WHERE email IS NULL OR email = '';

-- =====================================================
-- 9. TEST QUERIES (SIMULATE LOGIN FLOW)
-- =====================================================

-- Test the exact query used in login flow
-- This simulates what happens when a user logs in
SELECT 
    id,
    email,
    role,
    tenant_id,
    subscription_tier,
    subscription_status
FROM users 
WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa';

-- Test tenant lookup (if user has tenant_id)
SELECT 
    t.id,
    t.business_name,
    t.created_at
FROM tenants t
WHERE t.id = (
    SELECT tenant_id 
    FROM users 
    WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa'
);

-- =====================================================
-- 10. RLS POLICY TESTING
-- =====================================================

-- Test if RLS policies are blocking access
-- This will show if RLS is preventing data access
SET row_security = on;

-- Test user table access with RLS enabled
SELECT 
    'RLS_ENABLED' as test_type,
    COUNT(*) as user_count
FROM users;

-- Test specific user access
SELECT 
    'USER_ACCESS_TEST' as test_type,
    id,
    email,
    role
FROM users 
WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa';

-- =====================================================
-- 11. ENVIRONMENT AND CONFIGURATION CHECK
-- =====================================================

-- Check current database user
SELECT current_user, session_user;

-- Check current database
SELECT current_database();

-- Check if we're in the right schema
SELECT current_schema();

-- Check timezone settings
SELECT current_setting('timezone');

-- =====================================================
-- 12. COMPREHENSIVE DIAGNOSTIC SUMMARY
-- =====================================================

-- Final diagnostic query - run this last
SELECT 
    'DIAGNOSTIC_SUMMARY' as section,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE role = 'sme') as sme_users,
    (SELECT COUNT(*) FROM users WHERE role = 'super') as super_users,
    (SELECT COUNT(*) FROM tenants) as total_tenants,
    (SELECT COUNT(*) FROM users WHERE tenant_id IS NULL AND role = 'sme') as sme_users_without_tenant,
    (SELECT COUNT(*) FROM users WHERE role IS NULL) as users_without_role;
