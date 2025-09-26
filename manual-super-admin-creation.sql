-- Manual Super Admin Creation Script
-- Use this if the automatic signup still doesn't work

-- Step 1: Check if the user exists in auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'deyoungdoer@gmail.com';

-- Step 2: If the user exists in auth.users but not in users table, create the record manually
-- Replace 'USER_ID_FROM_STEP_1' with the actual ID from Step 1
INSERT INTO users (id, email, role, created_at, updated_at)
VALUES (
    'USER_ID_FROM_STEP_1',  -- Replace with actual auth.users.id
    'deyoungdoer@gmail.com',
    'super',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    role = 'super',
    updated_at = NOW();

-- Step 3: Verify the user was created
SELECT * FROM users WHERE email = 'deyoungdoer@gmail.com';

-- Step 4: Test login (should work now)

-- Alternative: Use the create_super_admin function (after running database-complete-fix.sql)
-- SELECT create_super_admin('deyoungdoer@gmail.com', 'super');
