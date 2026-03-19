-- ==============================================================================
-- LPG Cylinder Booking and Tracking System - Schema Improvements
-- Migration Date: 2026-03-09
-- ==============================================================================

-- ==============================================================================
-- 1. FIX COLUMN NAME: Rename 'address' to 'delivery_address'
-- ==============================================================================

-- Rename the address column to delivery_address if it exists
ALTER TABLE public.orders
RENAME COLUMN address TO delivery_address;

-- Ensure delivery_address has correct constraints
ALTER TABLE public.orders
ALTER COLUMN delivery_address SET NOT NULL;

-- If delivery_address doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'delivery_address'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN delivery_address TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- ==============================================================================
-- 2. ADD AUTOMATIC UPDATE TRIGGER FOR updated_at
-- ==============================================================================

-- Create or replace the update trigger function with public schema
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists to avoid duplicates
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;

-- Create the trigger for orders table
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Also add trigger for agent_locations
DROP TRIGGER IF EXISTS update_agent_locations_updated_at ON public.agent_locations;

CREATE TRIGGER update_agent_locations_updated_at
    BEFORE UPDATE ON public.agent_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- 3. IMPROVE ADMIN ROLE POLICY SECURITY
-- ==============================================================================

-- Replace the existing admin policy with WITH CHECK clause
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles"
    ON public.user_roles
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ==============================================================================
-- 4. ALLOW PROFILE CREATION POLICY
-- ==============================================================================

-- Add missing INSERT policy for profiles table
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- 5. IMPROVE AGENT LOCATION UPDATE SECURITY
-- ==============================================================================

-- Update the agent location policy with WITH CHECK clause
DROP POLICY IF EXISTS "Agents can update own location" ON public.agent_locations;

CREATE POLICY "Agents can update own location"
    ON public.agent_locations
    FOR ALL
    TO authenticated
    USING (auth.uid() = agent_id)
    WITH CHECK (auth.uid() = agent_id);

-- ==============================================================================
-- 6. ADD PERFORMANCE INDEXES FOR FASTER QUERIES
-- ==============================================================================

-- Index on orders.user_id for faster customer order lookups
CREATE INDEX idx_orders_user_id ON public.orders(user_id);

-- Index on orders.agent_id for faster agent order lookups
CREATE INDEX idx_orders_agent_id ON public.orders(agent_id);

-- Index on agent_locations.agent_id for faster location lookups
CREATE INDEX idx_agent_locations_agent_id ON public.agent_locations(agent_id);

-- ==============================================================================
-- 7. ENSURE REALTIME SUPPORT REMAINS ENABLED
-- ==============================================================================

-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Enable realtime for agent_locations table
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_locations;

-- ==============================================================================
-- 8. VERIFICATION QUERIES
-- ==============================================================================

-- Verify orders table schema
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify triggers exist
SELECT 
    trigger_name, 
    event_object_table, 
    action_timing, 
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_name LIKE '%updated_at%'
AND event_object_schema = 'public';

-- Verify RLS policies
SELECT 
    tablename, 
    policyname, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('orders', 'user_roles', 'profiles', 'agent_locations')
ORDER BY tablename, policyname;

-- Verify indexes
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('orders', 'user_roles', 'profiles', 'agent_locations')
ORDER BY tablename, indexname;

-- ==============================================================================
-- 9. FORCE SCHEMA CACHE REFRESH
-- ==============================================================================

NOTIFY pgrst, 'reload schema';

-- ==============================================================================
-- MIGRATION COMPLETE
-- ==============================================================================

