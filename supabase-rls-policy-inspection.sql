-- =====================================================
-- SUPABASE RLS POLICY INSPECTION SCRIPT
-- =====================================================
-- This script focuses specifically on RLS policies that might be blocking login

-- =====================================================
-- 1. CHECK ALL RLS POLICIES ON USERS TABLE
-- =====================================================

-- Get all policies on users table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN qual IS NOT NULL THEN 'HAS_QUAL'
        ELSE 'NO_QUAL'
    END as has_qualification,
    CASE 
        WHEN with_check IS NOT NULL THEN 'HAS_WITH_CHECK'
        ELSE 'NO_WITH_CHECK'
    END as has_with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- =====================================================
-- 2. CHECK RLS STATUS ON ALL TABLES
-- =====================================================

-- Check if RLS is enabled on all relevant tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN 'ENABLED'
        ELSE 'DISABLED'
    END as rls_status
FROM pg_tables 
WHERE tablename IN ('users', 'tenants', 'invoices', 'expenses')
ORDER BY tablename;

-- =====================================================
-- 3. TEST RLS POLICIES WITH DIFFERENT USER CONTEXTS
-- =====================================================

-- Test as authenticated user
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "05bd895d-f02f-4da4-8a18-2895c722d6aa", "role": "authenticated"}';

-- Test user table access
SELECT 
    'AUTHENTICATED_USER_TEST' as test_type,
    COUNT(*) as accessible_users,
    STRING_AGG(email, ', ') as accessible_emails
FROM users;

-- Test specific user access
SELECT 
    'SPECIFIC_USER_ACCESS' as test_type,
    id,
    email,
    role,
    tenant_id
FROM users 
WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa';

-- =====================================================
-- 4. CHECK FOR PROBLEMATIC RLS POLICIES
-- =====================================================

-- Look for policies that might be too restrictive
SELECT 
    policyname,
    cmd,
    qual,
    CASE 
        WHEN qual LIKE '%auth.uid()%' THEN 'USES_AUTH_UID'
        WHEN qual LIKE '%auth.role%' THEN 'USES_AUTH_ROLE'
        WHEN qual LIKE '%auth.jwt%' THEN 'USES_AUTH_JWT'
        ELSE 'OTHER_CONDITION'
    END as policy_type,
    CASE 
        WHEN qual LIKE '%AND%' THEN 'MULTIPLE_CONDITIONS'
        WHEN qual LIKE '%OR%' THEN 'OR_CONDITIONS'
        ELSE 'SINGLE_CONDITION'
    END as complexity
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- =====================================================
-- 5. CHECK FOR CIRCULAR DEPENDENCIES IN RLS
-- =====================================================

-- Look for policies that reference the same table they're protecting
SELECT 
    policyname,
    cmd,
    qual,
    CASE 
        WHEN qual LIKE '%users%' THEN 'SELF_REFERENCING'
        ELSE 'EXTERNAL_REFERENCE'
    END as reference_type
FROM pg_policies 
WHERE tablename = 'users' 
    AND qual LIKE '%users%';

-- =====================================================
-- 6. TEST RLS WITH DIFFERENT ROLES
-- =====================================================

-- Test as service role (bypasses RLS)
SET LOCAL role TO service_role;

SELECT 
    'SERVICE_ROLE_TEST' as test_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'sme' THEN 1 END) as sme_users,
    COUNT(CASE WHEN role = 'super' THEN 1 END) as super_users
FROM users;

-- Test specific user with service role
SELECT 
    'SERVICE_ROLE_USER_ACCESS' as test_type,
    id,
    email,
    role,
    tenant_id,
    subscription_tier
FROM users 
WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa';

-- =====================================================
-- 7. CHECK FOR MISSING OR BROKEN POLICIES
-- =====================================================

-- Check if there are any missing policies for common operations
SELECT 
    'MISSING_POLICIES_CHECK' as check_type,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND cmd = 'SELECT') 
        THEN 'MISSING_SELECT_POLICY'
        ELSE 'HAS_SELECT_POLICY'
    END as select_policy_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND cmd = 'INSERT') 
        THEN 'MISSING_INSERT_POLICY'
        ELSE 'HAS_INSERT_POLICY'
    END as insert_policy_status,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND cmd = 'UPDATE') 
        THEN 'MISSING_UPDATE_POLICY'
        ELSE 'HAS_UPDATE_POLICY'
    END as update_policy_status;

-- =====================================================
-- 8. TEST AUTHENTICATION CONTEXT
-- =====================================================

-- Reset to authenticated role
SET LOCAL role TO authenticated;

-- Test auth.uid() function
SELECT 
    'AUTH_UID_TEST' as test_type,
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN 'AUTH_UID_WORKS'
        ELSE 'AUTH_UID_NULL'
    END as auth_uid_status;

-- Test auth.role() function
SELECT 
    'AUTH_ROLE_TEST' as test_type,
    auth.role() as current_role,
    CASE 
        WHEN auth.role() = 'authenticated' THEN 'AUTH_ROLE_CORRECT'
        ELSE 'AUTH_ROLE_INCORRECT'
    END as auth_role_status;

-- =====================================================
-- 9. CHECK FOR RLS POLICY CONFLICTS
-- =====================================================

-- Look for policies that might conflict with each other
WITH policy_analysis AS (
    SELECT 
        policyname,
        cmd,
        qual,
        roles,
        CASE 
            WHEN roles IS NULL OR roles = '{}' THEN 'ALL_ROLES'
            ELSE 'SPECIFIC_ROLES'
        END as role_scope
    FROM pg_policies 
    WHERE tablename = 'users'
)
SELECT 
    cmd,
    role_scope,
    COUNT(*) as policy_count,
    STRING_AGG(policyname, ', ') as policy_names
FROM policy_analysis
GROUP BY cmd, role_scope
ORDER BY cmd, role_scope;

-- =====================================================
-- 10. COMPREHENSIVE RLS DIAGNOSTIC
-- =====================================================

-- Final RLS diagnostic
SELECT 
    'RLS_DIAGNOSTIC' as section,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'users') as total_policies,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'users' AND cmd = 'SELECT') as select_policies,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'users' AND cmd = 'INSERT') as insert_policies,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'users' AND cmd = 'UPDATE') as update_policies,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'users' AND cmd = 'DELETE') as delete_policies,
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'users') as rls_enabled;
