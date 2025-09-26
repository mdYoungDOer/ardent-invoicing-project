-- Check Super Admin User Record
-- This script verifies if the super admin user exists and has the correct role

-- 1. Check if user exists in auth.users
SELECT 
    'AUTH USERS TABLE' as table_name,
    id,
    email,
    email_confirmed_at,
    last_sign_in_at,
    created_at
FROM auth.users 
WHERE email = 'deyoungdoer@gmail.com';

-- 2. Check if user exists in public.users table
SELECT 
    'PUBLIC USERS TABLE' as table_name,
    id,
    email,
    role,
    created_at,
    updated_at
FROM users 
WHERE email = 'deyoungdoer@gmail.com';

-- 3. Check if there's a match between both tables
SELECT 
    'MATCH CHECK' as check_type,
    au.id as auth_id,
    au.email as auth_email,
    u.id as users_id,
    u.email as users_email,
    u.role,
    CASE 
        WHEN au.id IS NULL THEN '❌ User not in auth.users'
        WHEN u.id IS NULL THEN '❌ User not in users table'
        WHEN au.id = u.id THEN '✅ IDs match'
        ELSE '❌ ID mismatch'
    END as id_status,
    CASE 
        WHEN u.role = 'super' THEN '✅ Correct super admin role'
        WHEN u.role IS NULL THEN '❌ No role assigned'
        ELSE '❌ Wrong role: ' || u.role
    END as role_status
FROM auth.users au
FULL OUTER JOIN users u ON au.id = u.id
WHERE au.email = 'deyoungdoer@gmail.com' OR u.email = 'deyoungdoer@gmail.com';

-- 4. Check all users in the users table (to see what's there)
SELECT 
    'ALL USERS' as info,
    id,
    email,
    role,
    created_at
FROM users 
ORDER BY created_at DESC;

-- 5. Check RLS policies (to ensure they allow reading)
SELECT 
    'RLS POLICIES' as info,
    policyname,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has USING clause'
        ELSE 'No USING clause'
    END as has_using,
    CASE 
        WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
        ELSE 'No WITH CHECK clause'
    END as has_with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 6. Test if we can read the user record (this should work if RLS is correct)
-- This will show if the current user can access the record
SELECT 
    'ACCESS TEST' as test_type,
    id,
    email,
    role,
    '✅ Can read user record' as status
FROM users 
WHERE email = 'deyoungdoer@gmail.com';
