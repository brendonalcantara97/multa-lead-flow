export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      authorized_emails: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          has_account: boolean | null
          id: string
          invitation_sent: boolean | null
          invitation_sent_at: string | null
          invited_by: string | null
          is_active: boolean | null
          last_name: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          has_account?: boolean | null
          id?: string
          invitation_sent?: boolean | null
          invitation_sent_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          has_account?: boolean | null
          id?: string
          invitation_sent?: boolean | null
          invitation_sent_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lead_documents: {
        Row: {
          document_name: string
          document_type: string | null
          document_url: string | null
          file_size: number | null
          id: string
          lead_id: string
          mime_type: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          document_name: string
          document_type?: string | null
          document_url?: string | null
          file_size?: number | null
          id?: string
          lead_id: string
          mime_type?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          document_name?: string
          document_type?: string | null
          document_url?: string | null
          file_size?: number | null
          id?: string
          lead_id?: string
          mime_type?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_documents_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          created_at: string | null
          fbclid: string | null
          fbp: string | null
          gbraid: string | null
          gclid: string | null
          id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string | null
          fbclid?: string | null
          fbp?: string | null
          gbraid?: string | null
          gclid?: string | null
          id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string | null
          fbclid?: string | null
          fbp?: string | null
          gbraid?: string | null
          gclid?: string | null
          id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      lead_status_history: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string | null
          id: string
          lead_id: string
          new_status: Database["public"]["Enums"]["lead_status"]
          previous_status: Database["public"]["Enums"]["lead_status"] | null
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          lead_id: string
          new_status: Database["public"]["Enums"]["lead_status"]
          previous_status?: Database["public"]["Enums"]["lead_status"] | null
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string
          new_status?: Database["public"]["Enums"]["lead_status"]
          previous_status?: Database["public"]["Enums"]["lead_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_status_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          amount: number | null
          appealed_before: boolean | null
          assigned_to: string | null
          cnh_at_risk: boolean | null
          conversion_date: string | null
          created_at: string | null
          documents: string[] | null
          email: string | null
          first_contact_at: string | null
          id: string
          ip_address: unknown | null
          is_duplicated: boolean | null
          last_interaction_at: string | null
          last_moved_at: string | null
          lead_origin: string | null
          lead_source_id: string | null
          name: string
          observations: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          phone: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["lead_status"]
          tags: string[] | null
          updated_at: string | null
          urgency: Database["public"]["Enums"]["urgency_level"] | null
          user_agent: string | null
          user_id: string
          violation_type: Database["public"]["Enums"]["violation_type"]
        }
        Insert: {
          amount?: number | null
          appealed_before?: boolean | null
          assigned_to?: string | null
          cnh_at_risk?: boolean | null
          conversion_date?: string | null
          created_at?: string | null
          documents?: string[] | null
          email?: string | null
          first_contact_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_duplicated?: boolean | null
          last_interaction_at?: string | null
          last_moved_at?: string | null
          lead_origin?: string | null
          lead_source_id?: string | null
          name: string
          observations?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          phone: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[] | null
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
          user_agent?: string | null
          user_id: string
          violation_type: Database["public"]["Enums"]["violation_type"]
        }
        Update: {
          amount?: number | null
          appealed_before?: boolean | null
          assigned_to?: string | null
          cnh_at_risk?: boolean | null
          conversion_date?: string | null
          created_at?: string | null
          documents?: string[] | null
          email?: string | null
          first_contact_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_duplicated?: boolean | null
          last_interaction_at?: string | null
          last_moved_at?: string | null
          lead_origin?: string | null
          lead_source_id?: string | null
          name?: string
          observations?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          phone?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[] | null
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
          user_agent?: string | null
          user_id?: string
          violation_type?: Database["public"]["Enums"]["violation_type"]
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_lead_source_id_fkey"
            columns: ["lead_source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      leads_with_sources: {
        Row: {
          amount: number | null
          appealed_before: boolean | null
          assigned_to: string | null
          assigned_to_name: string | null
          cnh_at_risk: boolean | null
          conversion_date: string | null
          created_at: string | null
          documents: string[] | null
          email: string | null
          fbclid: string | null
          fbp: string | null
          first_contact_at: string | null
          gbraid: string | null
          gclid: string | null
          id: string | null
          ip_address: unknown | null
          is_duplicated: boolean | null
          last_interaction_at: string | null
          last_moved_at: string | null
          lead_origin: string | null
          lead_source_id: string | null
          name: string | null
          observations: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          phone: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          tags: string[] | null
          updated_at: string | null
          urgency: Database["public"]["Enums"]["urgency_level"] | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          violation_type: Database["public"]["Enums"]["violation_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_current_user_auth_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          first_name: string | null
          has_account: boolean | null
          id: string
          invitation_sent: boolean | null
          invitation_sent_at: string | null
          invited_by: string | null
          is_active: boolean | null
          last_name: string | null
          role: string | null
          updated_at: string
        }
      }
      get_leads_with_sources: {
        Args: Record<PropertyKey, never>
        Returns: {
          amount: number
          appealed_before: boolean
          assigned_to: string
          assigned_to_name: string
          cnh_at_risk: boolean
          conversion_date: string
          created_at: string
          documents: string[]
          email: string
          fbclid: string
          fbp: string
          first_contact_at: string
          gbraid: string
          gclid: string
          id: string
          ip_address: unknown
          is_duplicated: boolean
          last_interaction_at: string
          last_moved_at: string
          lead_origin: string
          lead_source_id: string
          name: string
          observations: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          phone: string
          rejection_reason: string
          status: Database["public"]["Enums"]["lead_status"]
          tags: string[]
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
          user_agent: string
          user_id: string
          utm_campaign: string
          utm_content: string
          utm_medium: string
          utm_source: string
          utm_term: string
          violation_type: Database["public"]["Enums"]["violation_type"]
        }[]
      }
      get_or_create_lead_source: {
        Args: {
          p_fbclid?: string
          p_fbp?: string
          p_gbraid?: string
          p_gclid?: string
          p_utm_campaign?: string
          p_utm_content?: string
          p_utm_medium?: string
          p_utm_source?: string
          p_utm_term?: string
        }
        Returns: string
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      lead_status:
        | "novo-lead"
        | "contato-realizado"
        | "documentos-recebidos"
        | "contrato-assinado"
        | "cliente"
        | "nao-cliente"
      payment_method:
        | "pix"
        | "boleto"
        | "cartao-credito"
        | "cartao-debito"
        | "transferencia"
        | "dinheiro"
      urgency_level: "alta" | "media" | "baixa"
      violation_type:
        | "excesso-velocidade"
        | "excesso-pontos"
        | "bafometro"
        | "suspensao-cnh"
        | "cassacao-cnh"
        | "outra"
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
      lead_status: [
        "novo-lead",
        "contato-realizado",
        "documentos-recebidos",
        "contrato-assinado",
        "cliente",
        "nao-cliente",
      ],
      payment_method: [
        "pix",
        "boleto",
        "cartao-credito",
        "cartao-debito",
        "transferencia",
        "dinheiro",
      ],
      urgency_level: ["alta", "media", "baixa"],
      violation_type: [
        "excesso-velocidade",
        "excesso-pontos",
        "bafometro",
        "suspensao-cnh",
        "cassacao-cnh",
        "outra",
      ],
    },
  },
} as const
