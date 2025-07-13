export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string
          firebase_uid: string | null
          id: string
          name: string
          phone: string | null
          state: string | null
          updated_at: string | null
          user_id: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          firebase_uid?: string | null
          id?: string
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          firebase_uid?: string | null
          id?: string
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      honestinvoice: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          invoice_id: string | null
          quantity: number
          rate: number
          updated_at: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          description: string
          id?: string
          invoice_id?: string | null
          quantity?: number
          rate?: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string | null
          quantity?: number
          rate?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string | null
          created_at: string
          currency: string | null
          due_date: string | null
          firebase_uid: string | null
          id: string
          invoice_data: Json | null
          invoice_number: string
          issue_date: string | null
          notes: string | null
          paid_at: string | null
          pdf_url: string | null
          sent_at: string | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          template_id: string | null
          terms: string | null
          total: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          currency?: string | null
          due_date?: string | null
          firebase_uid?: string | null
          id?: string
          invoice_data?: Json | null
          invoice_number: string
          issue_date?: string | null
          notes?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          template_id?: string | null
          terms?: string | null
          total?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          currency?: string | null
          due_date?: string | null
          firebase_uid?: string | null
          id?: string
          invoice_data?: Json | null
          invoice_number?: string
          issue_date?: string | null
          notes?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          template_id?: string | null
          terms?: string | null
          total?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      login_history: {
        Row: {
          id: number
          ip_address: string | null
          login_timestamp: string
          success: boolean | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          id?: never
          ip_address?: string | null
          login_timestamp?: string
          success?: boolean | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          id?: never
          ip_address?: string | null
          login_timestamp?: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      table_name: {
        Row: {
          data: Json | null
          id: number
          inserted_at: string
          name: string | null
          updated_at: string
        }
        Insert: {
          data?: Json | null
          id?: number
          inserted_at?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          data?: Json | null
          id?: number
          inserted_at?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          category: string | null
          config: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          preview_url: string | null
        }
        Insert: {
          category?: string | null
          config?: Json
          created_at?: string | null
          description?: string | null
          id: string
          is_active?: boolean | null
          name: string
          preview_url?: string | null
        }
        Update: {
          category?: string | null
          config?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          preview_url?: string | null
        }
        Relationships: []
      }
      user_id: {
        Row: {
          data: Json | null
          id: number
          inserted_at: string
          name: string | null
          updated_at: string
        }
        Insert: {
          data?: Json | null
          id?: number
          inserted_at?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          data?: Json | null
          id?: number
          inserted_at?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      User_input_data: {
        Row: {
          Created_at: string | null
          Id: string
          Invoice_data: Json | null
          Total_amount: number | null
          User_id: string | null
        }
        Insert: {
          Created_at?: string | null
          Id?: string
          Invoice_data?: Json | null
          Total_amount?: number | null
          User_id?: string | null
        }
        Update: {
          Created_at?: string | null
          Id?: string
          Invoice_data?: Json | null
          Total_amount?: number | null
          User_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          company_address: string | null
          company_name: string | null
          company_phone: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          logo_url: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          company_address?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          logo_url?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          company_address?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          logo_url?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string | null
          email: string
          firebase_uid: string
          id: string
          invoice_settings: Json | null
          logo: string | null
          name: string
          phone: string | null
          state: string | null
          subscription_plan: string | null
          subscription_status: string | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          firebase_uid: string
          id?: string
          invoice_settings?: Json | null
          logo?: string | null
          name: string
          phone?: string | null
          state?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          firebase_uid?: string
          id?: string
          invoice_settings?: Json | null
          logo?: string | null
          name?: string
          phone?: string | null
          state?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          website: string | null
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never> | { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args:
          | { _user_id: string; _role: Database["public"]["Enums"]["app_role"] }
          | { role: string }
        Returns: boolean
      }
      is_authenticated: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      request_password_reset: {
        Args: { email_address: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
