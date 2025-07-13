/*
  # Fix tax_rate column addition

  1. Changes
    - Safely add tax_rate column to invoices table if it doesn't exist
    - Use conditional logic to prevent duplicate column errors

  2. Security
    - No changes to existing RLS policies
*/

-- Add tax_rate column to invoices table only if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' 
    AND column_name = 'tax_rate'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.invoices 
    ADD COLUMN tax_rate NUMERIC DEFAULT 0;
  END IF;
END $$;