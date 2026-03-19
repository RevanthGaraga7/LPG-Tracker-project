-- Add delivery_address column to orders table
-- Run this in Supabase SQL Editor

-- Add the delivery_address column if it doesn't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_address TEXT NOT NULL DEFAULT '';

-- Copy data from address column to delivery_address if needed
UPDATE public.orders 
SET delivery_address = COALESCE(address, '')
WHERE delivery_address = '';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('address', 'delivery_address');

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';

