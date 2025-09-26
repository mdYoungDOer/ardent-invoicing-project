-- Fix Missing User Record Issue
-- The user exists in auth.users but not in users table

-- Step 1: Check if user exists in users table
SELECT * FROM users WHERE email = 'deyoungdoer@gmail.com';

-- Step 2: If no results above, create the user record
INSERT INTO users (id, email, role, created_at, updated_at)
VALUES (
    '891f3647-3249-431a-a972-d0f1bc31802e',  -- User ID from auth.users
    'deyoungdoer@gmail.com',
    'super',
    NOW(),
    NOW()
);

-- Step 3: Verify the user record was created
SELECT * FROM users WHERE email = 'deyoungdoer@gmail.com';

-- Step 4: Test login should work now
