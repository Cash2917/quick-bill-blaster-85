import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceWithClient extends Invoice {
  client?: Client | null;
  client_name?: string;
}

// Client operations
export const clientService = {
  async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
    return data || [];
  },

  async create(client: Omit<ClientInsert, 'user_id'>): Promise<Client> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const clientData = {
      ...client,
      user_id: user.id,
      zip: client.zip, // Use zip field directly
    };

    const { data, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }
    return data;
  },

  async update(id: string, updates: Partial<ClientInsert>): Promise<Client> {
    const updateData = {
      ...updates,
      zip: updates.zip, // Use zip field directly
    };

    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating client:', error);
      throw error;
    }
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }
};

// Invoice operations
export const invoiceService = {
  async getAll(): Promise<InvoiceWithClient[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
    return (data as any) || [];
  },

  async getById(id: string): Promise<InvoiceWithClient> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
    return data as any;
  },

  async create(
    invoice: Omit<InvoiceInsert, 'user_id'>, 
    items: InvoiceItem[]
  ): Promise<Invoice> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get client information if client_id is provided
    let clientName = '';
    let clientEmail = '';
    let clientAddress = '';

    if (invoice.client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('name, email, address, city, state, zip, country')
        .eq('id', invoice.client_id)
        .single();
      
      if (client) {
        clientName = client.name;
        clientEmail = client.email || '';
        const addressParts = [
          client.address,
          client.city,
          client.state,
          client.zip,
          client.country
        ].filter(Boolean);
        clientAddress = addressParts.join(', ');
      }
    }

    const invoiceData = {
      ...invoice,
      user_id: user.id,
      client_name: clientName,
      client_email: clientEmail,
      client_address: clientAddress,
      line_items: items,
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
    return data;
  },

  async update(
    id: string, 
    invoice: Partial<InvoiceInsert>, 
    items?: InvoiceItem[]
  ): Promise<Invoice> {
    const updateData = {
      ...invoice,
      ...(items && { line_items: items }),
    };

    const { data, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }
};

// Generate next invoice number
export async function generateInvoiceNumber(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error generating invoice number:', error);
      throw error;
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    
    if (!data || data.length === 0) {
      return `INV-${currentYear}${currentMonth}-001`;
    }

    const lastInvoice = data[0];
    const lastNumber = lastInvoice.invoice_number;
    
    // Extract number from format INV-YYYYMM-XXX
    const match = lastNumber.match(/INV-(\d{6})-(\d{3})/);
    if (match) {
      const lastYearMonth = match[1];
      const lastSeq = parseInt(match[2]);
      
      if (lastYearMonth === `${currentYear}${currentMonth}`) {
        // Same month, increment sequence
        const nextSeq = (lastSeq + 1).toString().padStart(3, '0');
        return `INV-${currentYear}${currentMonth}-${nextSeq}`;
      }
    }
    
    // New month or different format, start from 001
    return `INV-${currentYear}${currentMonth}-001`;
  } catch (error) {
    console.error('Error in generateInvoiceNumber:', error);
    // Fallback to timestamp-based number
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${timestamp}`;
  }
}