-- =====================================================
-- SUPABASE RLS POLICY FIX SCRIPT
-- =====================================================
-- This script identifies and fixes conflicting RLS policies

-- =====================================================
-- 1. LIST ALL RLS POLICIES ON USERS TABLE
-- =====================================================

-- Get all policies on users table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- =====================================================
-- 2. CHECK FOR DUPLICATE POLICIES
-- =====================================================

-- Check for policies with same command and roles
SELECT 
    cmd,
    roles,
    COUNT(*) as policy_count,
    STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies 
WHERE tablename = 'users'
GROUP BY cmd, roles
HAVING COUNT(*) > 1
ORDER BY cmd, roles;

-- =====================================================
-- 3. IDENTIFY PROBLEMATIC POLICIES
-- =====================================================

-- Check for policies that might be causing conflicts
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
-- 4. CHECK FOR SELF-REFERENCING POLICIES
-- =====================================================

-- Look for policies that reference the users table itself
SELECT 
    policyname,
    cmd,
    qual,
    'SELF_REFERENCING' as issue_type
FROM pg_policies 
WHERE tablename = 'users' 
    AND qual LIKE '%users%';

-- =====================================================
-- 5. TEST CURRENT RLS STATUS
-- =====================================================

-- Check if RLS is enabled
SELECT 
    'RLS_STATUS' as check_type,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users';

-- =====================================================
-- 6. SAFE POLICY REMOVAL (IF NEEDED)
-- =====================================================

-- WARNING: Only run this if you identify problematic policies
-- Uncomment the lines below if you need to remove specific policies

-- Example: Remove a specific policy (replace 'policy_name' with actual name)
-- DROP POLICY IF EXISTS "policy_name" ON users;

-- =====================================================
-- 7. CREATE CLEAN RLS POLICIES (IF NEEDED)
-- =====================================================

-- WARNING: Only run this if you need to recreate policies
-- Uncomment and modify as needed

-- Example: Create a simple SELECT policy
-- CREATE POLICY "users_select_policy" ON users
--     FOR SELECT
--     USING (auth.uid() = id);

-- Example: Create a simple INSERT policy
-- CREATE POLICY "users_insert_policy" ON users
--     FOR INSERT
--     WITH CHECK (auth.uid() = id);

-- Example: Create a simple UPDATE policy
-- CREATE POLICY "users_update_policy" ON users
--     FOR UPDATE
--     USING (auth.uid() = id)
--     WITH CHECK (auth.uid() = id);

-- =====================================================
-- 8. TEST RLS AFTER FIXES
-- =====================================================

-- Test if RLS is working properly
SET row_security = on;

-- Test user access
SELECT 
    'RLS_TEST' as test_type,
    COUNT(*) as accessible_users
FROM users;

-- Test specific user access
SELECT 
    'USER_ACCESS_TEST' as test_type,
    id,
    email,
    role
FROM users 
WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa';
