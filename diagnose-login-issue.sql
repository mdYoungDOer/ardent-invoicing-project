-- Diagnose Super Admin Login Issue
-- Run this to check if the user record exists and has the correct role

-- 1. Check if user exists in auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'deyoungdoer@gmail.com';

-- 2. Check if user exists in public.users table
SELECT 
    id,
    email,
    role,
    created_at,
    updated_at
FROM users 
WHERE email = 'deyoungdoer@gmail.com';

-- 3. Check if there's a mismatch between auth.users and users tables
SELECT 
    au.id as auth_id,
    au.email as auth_email,
    au.email_confirmed_at,
    u.id as users_id,
    u.email as users_email,
    u.role,
    CASE 
        WHEN au.id IS NULL THEN 'User not in auth.users'
        WHEN u.id IS NULL THEN 'User not in users table'
        WHEN au.id = u.id THEN 'IDs match'
        ELSE 'ID mismatch'
    END as status
FROM auth.users au
FULL OUTER JOIN users u ON au.id = u.id
WHERE au.email = 'deyoungdoer@gmail.com' OR u.email = 'deyoungdoer@gmail.com';

-- 4. Check RLS policies on users table
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 5. Test if we can read the user record (this should work if RLS is correct)
-- Run this as the authenticated user (you'll need to be logged in)
SELECT 
    id,
    email,
    role
FROM users 
WHERE email = 'deyoungdoer@gmail.com';
