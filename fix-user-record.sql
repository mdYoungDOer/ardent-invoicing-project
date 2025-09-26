-- Fix Super Admin User Record
-- Use this if the user exists in auth.users but not in users table

-- Step 1: Get the auth user ID
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'deyoungdoer@gmail.com';

-- Step 2: If the user exists in auth.users but not in users table, create the record
-- Replace 'YOUR_AUTH_USER_ID' with the actual ID from step 1
INSERT INTO users (id, email, role, created_at, updated_at)
VALUES (
    'YOUR_AUTH_USER_ID',  -- Replace with actual auth.users.id
    'deyoungdoer@gmail.com',
    'super',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    role = 'super',
    updated_at = NOW();

-- Step 3: Verify the user record was created/updated
SELECT * FROM users WHERE email = 'deyoungdoer@gmail.com';

-- Step 4: Test login should work now
