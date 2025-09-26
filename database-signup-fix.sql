-- Fix RLS Policy for User Signup
-- This script specifically fixes the "new row violates row-level security policy" error

-- Drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Super admins can update all users" ON users;
DROP POLICY IF EXISTS "Allow user signup" ON users;
DROP POLICY IF EXISTS "Super admins can insert users" ON users;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS is_super_admin(UUID);

-- Create a new function that's more permissive for signup
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    -- If no user_id provided, return false
    IF user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if the user exists and has super role
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id 
        AND role = 'super'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies that allow signup

-- Policy 1: Allow users to view their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy 2: Allow super admins to view all users (using function)
CREATE POLICY "Super admins can view all users" ON users
    FOR SELECT
    USING (is_super_admin());

-- Policy 3: Allow users to update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 4: Allow super admins to update all users
CREATE POLICY "Super admins can update all users" ON users
    FOR UPDATE
    USING (is_super_admin());

-- Policy 5: CRITICAL - Allow user creation during signup
-- This policy must be very permissive to allow initial user creation
CREATE POLICY "Allow user creation during signup" ON users
    FOR INSERT
    WITH CHECK (
        -- Allow if the user is creating their own record
        auth.uid() = id
        -- OR if there are no users yet (first user can be super admin)
        OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
        -- OR if the current user is a super admin
        OR is_super_admin()
    );

-- Policy 6: Allow super admins to insert users
CREATE POLICY "Super admins can insert users" ON users
    FOR INSERT
    WITH CHECK (is_super_admin());

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO anon, authenticated;

-- Alternative approach: Temporarily disable RLS for testing
-- Uncomment the line below if the above doesn't work
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS (uncomment if you disabled it above)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
