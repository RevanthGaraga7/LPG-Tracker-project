-- Supabase Schema Cache Fix
-- Run this in Supabase SQL Editor to refresh the schema cache after creating tables

-- 1. Force schema cache refresh
NOTIFY pgrst, 'reload schema';

-- 2. Verify all required tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'user_roles', 'profiles', 'agent_locations')
ORDER BY table_name;

-- 3. Check RLS policies for orders table
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'orders';

-- 4. Check RLS policies for user_roles table
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_roles';

-- 5. Test insert into orders (this will fail if table doesn't exist or RLS blocks it)
-- Run this separately to test:
-- INSERT INTO orders (user_id, cylinder_type, quantity, address, status)
-- VALUES ('test-uuid-here', 'standard', 1, 'test address', 'booked');

-- 6. Test select from user_roles
-- Run this separately to test:
-- SELECT * FROM user_roles LIMIT 1;

