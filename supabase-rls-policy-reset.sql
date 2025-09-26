-- =====================================================
-- SUPABASE RLS POLICY RESET SCRIPT
-- =====================================================
-- WARNING: This script will remove ALL RLS policies on the users table
-- Only run this if you're sure you want to reset all policies

-- =====================================================
-- 1. BACKUP CURRENT POLICIES (FOR REFERENCE)
-- =====================================================

-- Get all current policies before removing them
SELECT 
    'CURRENT_POLICIES_BACKUP' as section,
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
-- 2. REMOVE ALL EXISTING POLICIES
-- =====================================================

-- Remove all policies on users table
-- WARNING: This will remove ALL policies
-- Uncomment the lines below if you want to proceed

-- DROP POLICY IF EXISTS "users_select_policy" ON users;
-- DROP POLICY IF EXISTS "users_insert_policy" ON users;
-- DROP POLICY IF EXISTS "users_update_policy" ON users;
-- DROP POLICY IF EXISTS "users_delete_policy" ON users;
-- DROP POLICY IF EXISTS "Enable read access for all users" ON users;
-- DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
-- DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;
-- DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON users;
-- DROP POLICY IF EXISTS "Users can view own data" ON users;
-- DROP POLICY IF EXISTS "Users can insert own data" ON users;
-- DROP POLICY IF EXISTS "Users can update own data" ON users;
-- DROP POLICY IF EXISTS "Users can delete own data" ON users;

-- =====================================================
-- 3. CREATE CLEAN, SIMPLE POLICIES
-- =====================================================

-- Create simple, non-conflicting policies
-- Uncomment and modify as needed

-- Allow users to read their own data
-- CREATE POLICY "users_select_own" ON users
--     FOR SELECT
--     USING (auth.uid() = id);

-- Allow users to insert their own data
-- CREATE POLICY "users_insert_own" ON users
--     FOR INSERT
--     WITH CHECK (auth.uid() = id);

-- Allow users to update their own data
-- CREATE POLICY "users_update_own" ON users
--     FOR UPDATE
--     USING (auth.uid() = id)
--     WITH CHECK (auth.uid() = id);

-- Allow super admins to read all user data
-- CREATE POLICY "users_select_admin" ON users
--     FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM users 
--             WHERE id = auth.uid() AND role = 'super'
--         )
--     );

-- Allow super admins to update all user data
-- CREATE POLICY "users_update_admin" ON users
--     FOR UPDATE
--     USING (
--         EXISTS (
--             SELECT 1 FROM users 
--             WHERE id = auth.uid() AND role = 'super'
--         )
--     )
--     WITH CHECK (
--         EXISTS (
--             SELECT 1 FROM users 
--             WHERE id = auth.uid() AND role = 'super'
--         )
--     );

-- =====================================================
-- 4. VERIFY POLICIES AFTER RESET
-- =====================================================

-- Check that policies were created successfully
SELECT 
    'POLICIES_AFTER_RESET' as section,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- =====================================================
-- 5. TEST RLS AFTER RESET
-- =====================================================

-- Test if RLS is working properly
SET row_security = on;

-- Test user access
SELECT 
    'RLS_TEST_AFTER_RESET' as test_type,
    COUNT(*) as accessible_users
FROM users;

-- Test specific user access
SELECT 
    'USER_ACCESS_TEST_AFTER_RESET' as test_type,
    id,
    email,
    role
FROM users 
WHERE id = '05bd895d-f02f-4da4-8a18-2895c722d6aa';

-- =====================================================
-- 6. ALTERNATIVE: DISABLE RLS TEMPORARILY
-- =====================================================

-- If you want to temporarily disable RLS to test
-- Uncomment the line below
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS later
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
