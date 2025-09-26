-- =====================================================
-- SUPABASE CONFIGURATION CHECK SCRIPT
-- =====================================================
-- This script checks for configuration issues that might affect login

-- =====================================================
-- 1. CHECK SUPABASE PROJECT CONFIGURATION
-- =====================================================

-- Check current database configuration
SELECT 
    'DATABASE_CONFIG' as section,
    current_database() as database_name,
    current_user as current_user,
    session_user as session_user,
    current_schema() as current_schema,
    current_setting('timezone') as timezone,
    version() as postgres_version;

-- =====================================================
-- 2. CHECK AUTHENTICATION SETTINGS
-- =====================================================

-- Check if auth schema is accessible
SELECT 
    'AUTH_SCHEMA_CHECK' as section,
    EXISTS (
        SELECT 1 
        FROM information_schema.schemata 
        WHERE schema_name = 'auth'
    ) as auth_schema_exists;

-- Check auth tables accessibility
SELECT 
    'AUTH_TABLES_CHECK' as section,
    EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'auth' 
        AND table_name = 'users'
    ) as auth_users_table_exists,
    EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'auth' 
        AND table_name = 'sessions'
    ) as auth_sessions_table_exists,
    EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'auth' 
        AND table_name = 'identities'
    ) as auth_identities_table_exists;

-- =====================================================
-- 3. CHECK RLS CONFIGURATION
-- =====================================================

-- Check RLS status on all tables
SELECT 
    'RLS_STATUS' as section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN 'ENABLED'
        ELSE 'DISABLED'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN ('users', 'tenants', 'invoices', 'expenses')
ORDER BY tablename;

-- =====================================================
-- 4. CHECK PERMISSIONS AND GRANTS
-- =====================================================

-- Check table permissions for current user
SELECT 
    'TABLE_PERMISSIONS' as section,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE grantee = current_user
    AND table_name IN ('users', 'tenants')
ORDER BY table_name, privilege_type;

-- Check if current user has necessary permissions
SELECT 
    'PERMISSION_CHECK' as section,
    has_table_privilege('users', 'SELECT') as can_select_users,
    has_table_privilege('users', 'INSERT') as can_insert_users,
    has_table_privilege('users', 'UPDATE') as can_update_users,
    has_table_privilege('tenants', 'SELECT') as can_select_tenants,
    has_table_privilege('tenants', 'INSERT') as can_insert_tenants;

-- =====================================================
-- 5. CHECK FOR EXTENSIONS AND FUNCTIONS
-- =====================================================

-- Check if required extensions are installed
SELECT 
    'EXTENSIONS_CHECK' as section,
    extname,
    extversion
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pgjwt')
ORDER BY extname;

-- Check if auth functions are available
SELECT 
    'AUTH_FUNCTIONS_CHECK' as section,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'auth'
    AND routine_name IN ('uid', 'role', 'jwt')
ORDER BY routine_name;

-- =====================================================
-- 6. CHECK FOR TRIGGERS AND FUNCTIONS
-- =====================================================

-- Check for triggers on users table
SELECT 
    'TRIGGERS_CHECK' as section,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users'
ORDER BY trigger_name;

-- Check for functions that might affect authentication
SELECT 
    'FUNCTIONS_CHECK' as section,
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_name LIKE '%auth%'
ORDER BY routine_name;

-- =====================================================
-- 7. CHECK FOR CONSTRAINTS AND VALIDATION
-- =====================================================

-- Check constraints on users table
SELECT 
    'CONSTRAINTS_CHECK' as section,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass
ORDER BY conname;

-- Check for check constraints specifically
SELECT 
    'CHECK_CONSTRAINTS' as section,
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass
    AND contype = 'c'
ORDER BY conname;

-- =====================================================
-- 8. CHECK FOR INDEXES
-- =====================================================

-- Check indexes on users table
SELECT 
    'INDEXES_CHECK' as section,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'users'
ORDER BY indexname;

-- =====================================================
-- 9. CHECK FOR RECENT CHANGES
-- =====================================================

-- Check for recent table modifications
SELECT 
    'RECENT_CHANGES' as section,
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN ('users', 'tenants')
ORDER BY tablename;

-- =====================================================
-- 10. CHECK SUPABASE SPECIFIC CONFIGURATIONS
-- =====================================================

-- Check for Supabase specific settings
SELECT 
    'SUPABASE_CONFIG' as section,
    name,
    setting,
    unit,
    context
FROM pg_settings 
WHERE name IN (
    'shared_preload_libraries',
    'max_connections',
    'shared_buffers',
    'effective_cache_size'
)
ORDER BY name;

-- Check for any custom configurations
SELECT 
    'CUSTOM_CONFIG' as section,
    name,
    setting
FROM pg_settings 
WHERE name LIKE '%supabase%'
    OR name LIKE '%auth%'
    OR name LIKE '%jwt%'
ORDER BY name;

-- =====================================================
-- 11. COMPREHENSIVE CONFIGURATION DIAGNOSTIC
-- =====================================================

-- Final configuration diagnostic
SELECT 
    'CONFIGURATION_DIAGNOSTIC' as section,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'auth') as auth_tables_count,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'users') as users_rls_policies,
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'users') as users_rls_enabled,
    (SELECT COUNT(*) FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto')) as required_extensions,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'auth' AND routine_name IN ('uid', 'role')) as auth_functions_available;
