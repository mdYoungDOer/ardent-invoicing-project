-- Complete RLS Fix for Ardent Invoicing
-- This script provides multiple approaches to fix the signup issue

-- ========================================
-- APPROACH 1: Simplified RLS Policies
-- ========================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Super admins can update all users" ON users;
DROP POLICY IF EXISTS "Allow user creation during signup" ON users;
DROP POLICY IF EXISTS "Super admins can insert users" ON users;
DROP POLICY IF EXISTS "Allow user signup" ON users;

-- Drop existing function
DROP FUNCTION IF EXISTS is_super_admin(UUID);

-- Create a simple function for role checking
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role FROM users 
        WHERE id = user_id 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create simplified RLS policies

-- 1. SELECT Policy - Users can view their own data, super admins can view all
CREATE POLICY "users_select_policy" ON users
    FOR SELECT
    USING (
        auth.uid() = id 
        OR get_user_role() = 'super'
    );

-- 2. UPDATE Policy - Users can update their own data, super admins can update all
CREATE POLICY "users_update_policy" ON users
    FOR UPDATE
    USING (
        auth.uid() = id 
        OR get_user_role() = 'super'
    )
    WITH CHECK (
        auth.uid() = id 
        OR get_user_role() = 'super'
    );

-- 3. INSERT Policy - Allow signup and super admin creation
CREATE POLICY "users_insert_policy" ON users
    FOR INSERT
    WITH CHECK (
        -- Allow if user is creating their own record
        auth.uid() = id
        -- OR if no users exist yet (first user)
        OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
        -- OR if current user is super admin
        OR get_user_role() = 'super'
    );

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO anon, authenticated;

-- ========================================
-- APPROACH 2: Alternative - Disable RLS Temporarily
-- ========================================
-- If the above doesn't work, you can temporarily disable RLS:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- ========================================
-- APPROACH 3: Manual User Creation Function
-- ========================================

-- Create a function to manually create users (for super admin creation)
CREATE OR REPLACE FUNCTION create_super_admin(
    admin_email TEXT,
    admin_role TEXT DEFAULT 'super'
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
    auth_user_id UUID;
BEGIN
    -- Get the auth user ID
    SELECT id INTO auth_user_id 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found in auth.users', admin_email;
    END IF;
    
    -- Insert into users table
    INSERT INTO users (id, email, role, created_at, updated_at)
    VALUES (auth_user_id, admin_email, admin_role, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        role = admin_role,
        updated_at = NOW();
    
    RETURN auth_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_super_admin(TEXT, TEXT) TO anon, authenticated;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';
