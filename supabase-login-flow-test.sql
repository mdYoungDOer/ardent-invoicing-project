-- =====================================================
-- SUPABASE LOGIN FLOW TEST SCRIPT
-- =====================================================
-- This script tests the exact queries used in the login process

-- =====================================================
-- 1. SIMULATE LOGIN AUTHENTICATION FLOW
-- =====================================================

-- Step 1: Check if user exists in auth.users (if accessible)
-- Note: This might not be accessible depending on RLS policies
SELECT 
    'AUTH_USERS_CHECK' as step,
    id,
    email,
    email_confirmed_at,
    last_sign_in_at,
    created_at
FROM auth.users 
WHERE email = 'mdyoungdoer@gmail.com'
ORDER BY created_at DESC;

-- Step 2: Check user in public.users table
SELECT 
    'PUBLIC_USERS_CHECK' as step,
    id,
    email,
    role,
    tenant_id,
    subscription_tier,
    subscription_status,
    created_at,
    updated_at
FROM users 
WHERE email = 'mdyoungdoer@gmail.com'
ORDER BY created_at DESC;

-- Step 3: Test the exact query used in login process
SELECT 
    'LOGIN_QUERY_TEST' as step,
    id,
    email,
    role,
    tenant_id,
    subscription_tier,
    subscription_status
FROM users 
WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa';

-- =====================================================
-- 2. TEST ROLE VERIFICATION
-- =====================================================

-- Test role verification (this is what happens in login)
SELECT 
    'ROLE_VERIFICATION' as step,
    id,
    email,
    role,
    CASE 
        WHEN role = 'sme' THEN 'SME_ROLE_CONFIRMED'
        WHEN role = 'super' THEN 'SUPER_ROLE_CONFIRMED'
        WHEN role IS NULL THEN 'NULL_ROLE_ERROR'
        ELSE 'INVALID_ROLE_ERROR'
    END as role_status
FROM users 
WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa';

-- =====================================================
-- 3. TEST TENANT LOOKUP (if user has tenant_id)
-- =====================================================

-- Test tenant lookup (this happens after role verification)
SELECT 
    'TENANT_LOOKUP' as step,
    u.id as user_id,
    u.email,
    u.role,
    u.tenant_id,
    t.id as tenant_exists,
    t.business_name,
    t.created_at as tenant_created
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.id = '05bd895d-f02f-4da4-8a18-2895c722d6aa';

-- =====================================================
-- 4. TEST SESSION PERSISTENCE
-- =====================================================

-- Check if there are any active sessions
SELECT 
    'ACTIVE_SESSIONS' as step,
    id,
    user_id,
    created_at,
    updated_at,
    aal,
    not_after
FROM auth.sessions 
WHERE user_id = '05bd895d-f02f-4da4-8a18-2895c722d6aa'
    AND (not_after IS NULL OR not_after > NOW())
ORDER BY created_at DESC;

-- =====================================================
-- 5. TEST MIDDLEWARE QUERIES
-- =====================================================

-- Test the exact query used in middleware
SELECT 
    'MIDDLEWARE_QUERY' as step,
    id,
    role
FROM users 
WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa';

-- =====================================================
-- 6. TEST DASHBOARD ACCESS QUERIES
-- =====================================================

-- Test the query used in dashboard authentication guard
SELECT 
    'DASHBOARD_AUTH_CHECK' as step,
    id,
    email,
    role,
    tenant_id,
    subscription_tier,
    subscription_status
FROM users 
WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa';

-- =====================================================
-- 7. TEST WITH DIFFERENT AUTHENTICATION CONTEXTS
-- =====================================================

-- Test as authenticated user
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "05bd895d-f02f-4da4-8a18-2895c722d6aa", "role": "authenticated"}';

SELECT 
    'AUTHENTICATED_CONTEXT' as step,
    auth.uid() as current_user_id,
    auth.role() as current_role,
    COUNT(*) as accessible_users
FROM users;

-- Test specific user access in authenticated context
SELECT 
    'AUTHENTICATED_USER_ACCESS' as step,
    id,
    email,
    role,
    tenant_id
FROM users 
WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa';

-- =====================================================
-- 8. TEST RLS POLICY IMPACT
-- =====================================================

-- Test with RLS enabled
SET row_security = on;

SELECT 
    'RLS_ENABLED_TEST' as step,
    COUNT(*) as accessible_users,
    STRING_AGG(email, ', ') as accessible_emails
FROM users;

-- Test specific user with RLS enabled
SELECT 
    'RLS_USER_ACCESS' as step,
    id,
    email,
    role,
    tenant_id
FROM users 
WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa';

-- =====================================================
-- 9. CHECK FOR DATA INCONSISTENCIES
-- =====================================================

-- Check for any data that might cause login issues
SELECT 
    'DATA_INCONSISTENCY_CHECK' as step,
    CASE 
        WHEN email IS NULL THEN 'NULL_EMAIL'
        WHEN email = '' THEN 'EMPTY_EMAIL'
        WHEN role IS NULL THEN 'NULL_ROLE'
        WHEN role NOT IN ('sme', 'super') THEN 'INVALID_ROLE'
        WHEN tenant_id IS NULL AND role = 'sme' THEN 'SME_WITHOUT_TENANT'
        ELSE 'DATA_OK'
    END as data_status,
    COUNT(*) as count
FROM users 
WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa'
GROUP BY 
    CASE 
        WHEN email IS NULL THEN 'NULL_EMAIL'
        WHEN email = '' THEN 'EMPTY_EMAIL'
        WHEN role IS NULL THEN 'NULL_ROLE'
        WHEN role NOT IN ('sme', 'super') THEN 'INVALID_ROLE'
        WHEN tenant_id IS NULL AND role = 'sme' THEN 'SME_WITHOUT_TENANT'
        ELSE 'DATA_OK'
    END;

-- =====================================================
-- 10. COMPREHENSIVE LOGIN FLOW DIAGNOSTIC
-- =====================================================

-- Final diagnostic for login flow
SELECT 
    'LOGIN_FLOW_DIAGNOSTIC' as section,
    (SELECT COUNT(*) FROM users WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa') as user_exists,
    (SELECT role FROM users WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa') as user_role,
    (SELECT tenant_id FROM users WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa') as user_tenant,
    (SELECT COUNT(*) FROM tenants WHERE id = (SELECT tenant_id FROM users WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa')) as tenant_exists,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'users') as rls_policies_count,
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'users') as rls_enabled;
