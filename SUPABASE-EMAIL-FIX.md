# 🔧 Fix Email Confirmation Redirect Issue

## Problem
Email confirmation links are redirecting to `localhost:3000/` instead of your custom domain `ardentinvoicing.com`.

## Solution Steps

### 1. **Update Supabase Auth Settings**

Go to your Supabase project dashboard:
1. **Navigate to**: Authentication → URL Configuration
2. **Update Site URL**: Change from `http://localhost:3000` to `https://ardentinvoicing.com`
3. **Update Redirect URLs**: Add these URLs:
   ```
   https://ardentinvoicing.com
   https://ardentinvoicing.com/auth/callback
   https://ardentinvoicing.com/dashboard
   https://ardentinvoicing.com/admin/dashboard
   ```

### 2. **Update Environment Variables**

In your DigitalOcean App Platform, ensure you have:
```bash
NEXT_PUBLIC_APP_URL=https://ardentinvoicing.com
NEXTAUTH_URL=https://ardentinvoicing.com
```

### 3. **Update Supabase Client Configuration**

The Supabase client should automatically use the correct URL from environment variables, but verify in your code that you're using:
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
```

### 4. **Test the Fix**

1. **Clear browser cache** and cookies
2. **Try registering** a new super admin account
3. **Check email** - confirmation link should now redirect to `ardentinvoicing.com`
4. **Verify** the user is created successfully in Supabase Auth

## Alternative: Update Supabase Project Settings

If you can't access the dashboard, you can also update via SQL:

```sql
-- Update auth configuration
UPDATE auth.config 
SET site_url = 'https://ardentinvoicing.com'
WHERE id = 1;

-- Add redirect URLs
INSERT INTO auth.redirect_urls (url) 
VALUES ('https://ardentinvoicing.com')
ON CONFLICT (url) DO NOTHING;

INSERT INTO auth.redirect_urls (url) 
VALUES ('https://ardentinvoicing.com/auth/callback')
ON CONFLICT (url) DO NOTHING;
```

## Verification

After making these changes:
- ✅ Email confirmation links redirect to your custom domain
- ✅ Super admin registration works without RLS errors
- ✅ Users can successfully confirm their accounts
- ✅ Authentication flow works end-to-end

## Common Issues

1. **Still redirecting to localhost?**
   - Check that `NEXT_PUBLIC_APP_URL` is set correctly
   - Verify Supabase Site URL is updated
   - Clear browser cache completely

2. **RLS policy errors persist?**
   - Run the `database-rls-fix.sql` script
   - Check that the `is_super_admin()` function is created
   - Verify policies are using the function instead of direct table references

3. **User created but can't login?**
   - Ensure the user confirmed their email
   - Check that the user has the correct role assigned
   - Verify the tenant is created properly for SME users
