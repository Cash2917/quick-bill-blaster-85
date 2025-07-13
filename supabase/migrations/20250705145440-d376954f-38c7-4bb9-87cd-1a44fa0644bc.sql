
-- Add tax_rate column to invoices table
ALTER TABLE public.invoices 
ADD COLUMN tax_rate NUMERIC DEFAULT 0;
