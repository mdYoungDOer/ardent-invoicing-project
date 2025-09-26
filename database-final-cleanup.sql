-- Final RLS Policy Cleanup for Super Admin Signup
-- This removes conflicting policies and ensures clean signup

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view other users in their tenant" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Super admins can update all users" ON users;
DROP POLICY IF EXISTS "Allow user creation during signup" ON users;
DROP POLICY IF EXISTS "Super admins can insert users" ON users;
DROP POLICY IF EXISTS "Allow user signup" ON users;

-- Drop existing functions
DROP FUNCTION IF EXISTS is_super_admin(UUID);
DROP FUNCTION IF EXISTS get_user_role(UUID);

-- Create a simple function for role checking
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
    -- Return null if no user_id provided
    IF user_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Return the role if user exists
    RETURN (
        SELECT role FROM users 
        WHERE id = user_id 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create clean, simple RLS policies

-- 1. SELECT Policy - Users can view their own data, super admins can view all
CREATE POLICY "clean_select_policy" ON users
    FOR SELECT
    USING (
        auth.uid() = id 
        OR get_user_role() = 'super'
    );

-- 2. UPDATE Policy - Users can update their own data, super admins can update all
CREATE POLICY "clean_update_policy" ON users
    FOR UPDATE
    USING (
        auth.uid() = id 
        OR get_user_role() = 'super'
    )
    WITH CHECK (
        auth.uid() = id 
        OR get_user_role() = 'super'
    );

-- 3. INSERT Policy - Allow signup (this is the critical one)
CREATE POLICY "clean_insert_policy" ON users
    FOR INSERT
    WITH CHECK (
        -- Allow if user is creating their own record
        auth.uid() = id
        -- OR if no users exist yet (first user can be super admin)
        OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
        -- OR if current user is super admin
        OR get_user_role() = 'super'
    );

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO anon, authenticated;

-- Create a function to manually create users (backup method)
CREATE OR REPLACE FUNCTION create_super_admin(
    admin_email TEXT,
    admin_role TEXT DEFAULT 'super'
)
RETURNS UUID AS $$
DECLARE
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

-- Verify the policies were created
SELECT schemaname, tablename, policyname, cmd, with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
