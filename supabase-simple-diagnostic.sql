-- =====================================================
-- SIMPLE SUPABASE DIAGNOSTIC SCRIPT
-- =====================================================
-- This script identifies the exact RLS policy conflicts

-- =====================================================
-- 1. LIST ALL POLICIES (SIMPLE)
-- =====================================================

SELECT 
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- =====================================================
-- 2. COUNT POLICIES BY COMMAND
-- =====================================================

SELECT 
    cmd,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'users'
GROUP BY cmd
ORDER BY cmd;

-- =====================================================
-- 3. CHECK FOR DUPLICATE POLICY NAMES
-- =====================================================

SELECT 
    policyname,
    COUNT(*) as duplicate_count
FROM pg_policies 
WHERE tablename = 'users'
GROUP BY policyname
HAVING COUNT(*) > 1
ORDER BY policyname;

-- =====================================================
-- 4. TEST BASIC USER ACCESS
-- =====================================================

-- Test without RLS
SET row_security = off;

SELECT 
    'NO_RLS_TEST' as test_type,
    COUNT(*) as total_users,
    STRING_AGG(email, ', ') as user_emails
FROM users;

-- Test with RLS
SET row_security = on;

SELECT 
    'WITH_RLS_TEST' as test_type,
    COUNT(*) as accessible_users,
    STRING_AGG(email, ', ') as accessible_emails
FROM users;

-- =====================================================
-- 5. CHECK RLS STATUS
-- =====================================================

SELECT 
    'RLS_STATUS' as check_type,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users';
