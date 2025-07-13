
-- Create clients table
CREATE TABLE public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create invoice_items table for flexible invoice line items
CREATE TABLE public.invoice_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    rate DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update the existing invoices table to be more comprehensive
ALTER TABLE public.invoices 
DROP COLUMN IF EXISTS invoice_data,
ADD COLUMN IF NOT EXISTS client_id UUID,
ADD COLUMN IF NOT EXISTS invoice_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add foreign key constraints
ALTER TABLE public.clients
ADD CONSTRAINT fk_clients_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.invoice_items
ADD CONSTRAINT fk_invoice_items_invoice_id 
FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;

ALTER TABLE public.invoices
ADD CONSTRAINT fk_invoices_client_id 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

-- Add RLS policies
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY "Users can view their own clients" ON public.clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON public.clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON public.clients
    FOR DELETE USING (auth.uid() = user_id);

-- Invoice items policies
CREATE POLICY "Users can view their own invoice items" ON public.invoice_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.invoices 
            WHERE invoices.id = invoice_items.invoice_id 
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own invoice items" ON public.invoice_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.invoices 
            WHERE invoices.id = invoice_items.invoice_id 
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own invoice items" ON public.invoice_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.invoices 
            WHERE invoices.id = invoice_items.invoice_id 
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own invoice items" ON public.invoice_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.invoices 
            WHERE invoices.id = invoice_items.invoice_id 
            AND invoices.user_id = auth.uid()
        )
    );

-- Update invoice policies to work with new structure
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can insert their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

CREATE POLICY "Users can view their own invoices" ON public.invoices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices" ON public.invoices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" ON public.invoices
    FOR UPDATE using (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" ON public.invoices
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
