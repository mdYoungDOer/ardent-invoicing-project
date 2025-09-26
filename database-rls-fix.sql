-- Fix RLS Policy Infinite Recursion for users table
-- This script fixes the circular dependency issue

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Super admins can update all users" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Super admins can insert users" ON users;

-- Create fixed RLS policies for users table
-- These policies avoid circular references by not referencing the users table in their conditions

-- Policy 1: Users can view their own data (using auth.uid() instead of checking users table)
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy 2: Super admins can view all users (using direct role check)
CREATE POLICY "Super admins can view all users" ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'super'
        )
    );

-- Policy 3: Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 4: Super admins can update all users
CREATE POLICY "Super admins can update all users" ON users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'super'
        )
    );

-- Policy 5: Allow user creation during signup (no role check needed)
CREATE POLICY "Allow user signup" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy 6: Super admins can insert users
CREATE POLICY "Super admins can insert users" ON users
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'super'
        )
    );

-- Alternative approach: Create a function to check if user is super admin
-- This avoids the circular reference issue
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the user exists and has super role
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id 
        AND role = 'super'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update policies to use the function
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can update all users" ON users;
DROP POLICY IF EXISTS "Super admins can insert users" ON users;

-- Recreate with function-based approach
CREATE POLICY "Super admins can view all users" ON users
    FOR SELECT
    USING (is_super_admin());

CREATE POLICY "Super admins can update all users" ON users
    FOR UPDATE
    USING (is_super_admin());

CREATE POLICY "Super admins can insert users" ON users
    FOR INSERT
    WITH CHECK (is_super_admin());

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO anon, authenticated;
