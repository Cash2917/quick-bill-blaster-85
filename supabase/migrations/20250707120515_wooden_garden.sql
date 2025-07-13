/*
  # Fix Invoice Schema and Client Management

  1. Schema Updates
    - Update invoices table to match current code expectations
    - Add missing columns for client information storage
    - Fix foreign key relationships
    - Add proper indexes for performance

  2. Security
    - Update RLS policies to match new schema
    - Ensure proper user isolation

  3. Data Integrity
    - Add proper constraints and defaults
    - Ensure referential integrity
*/

-- First, let's update the invoices table to match what the code expects
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS client_name text,
ADD COLUMN IF NOT EXISTS client_email text,
ADD COLUMN IF NOT EXISTS client_address text,
ADD COLUMN IF NOT EXISTS line_items jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS sent_date timestamptz,
ADD COLUMN IF NOT EXISTS paid_date timestamptz,
ADD COLUMN IF NOT EXISTS payment_method text;

-- Update the clients table to match the code expectations
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS notes text;

-- Rename zip to zip_code in clients table if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'zip'
  ) THEN
    ALTER TABLE clients RENAME COLUMN zip TO zip_code;
  END IF;
END $$;

-- Add zip_code column if it doesn't exist
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS zip_code text;

-- Update invoices table constraints
ALTER TABLE invoices 
ALTER COLUMN subtotal SET DEFAULT 0,
ALTER COLUMN tax_rate SET DEFAULT 0,
ALTER COLUMN tax_amount SET DEFAULT 0,
ALTER COLUMN total SET DEFAULT 0,
ALTER COLUMN currency SET DEFAULT 'USD',
ALTER COLUMN status SET DEFAULT 'draft';

-- Add check constraint for invoice status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'invoices_status_check' AND table_name = 'invoices'
  ) THEN
    ALTER TABLE invoices 
    ADD CONSTRAINT invoices_status_check 
    CHECK (status IN ('draft', 'sent', 'paid', 'overdue'));
  END IF;
END $$;

-- Update foreign key relationship for clients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'clients_user_id_fkey' AND table_name = 'clients'
  ) THEN
    -- Add foreign key to auth.users if it doesn't exist
    ALTER TABLE clients 
    ADD CONSTRAINT clients_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update foreign key relationship for invoices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'invoices_user_id_fkey' AND table_name = 'invoices'
  ) THEN
    ALTER TABLE invoices 
    ADD CONSTRAINT invoices_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update foreign key for client_id in invoices (allow NULL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'invoices_client_id_fkey' AND table_name = 'invoices'
  ) THEN
    ALTER TABLE invoices 
    ADD CONSTRAINT invoices_client_id_fkey 
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;

-- Create RLS policies for clients
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for invoices
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();