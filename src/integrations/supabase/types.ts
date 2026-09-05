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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          attachments: Json
          content: string
          conversation_id: string
          created_at: string
          feedback: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          attachments?: Json
          content?: string
          conversation_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          attachments?: Json
          content?: string
          conversation_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_settings: {
        Row: {
          allowed_types: string[]
          daily_limit: number
          enabled: boolean
          id: number
          maintenance: boolean
          max_file_mb: number
          model: string
          provider: string
          system_instructions: string
          updated_at: string
        }
        Insert: {
          allowed_types?: string[]
          daily_limit?: number
          enabled?: boolean
          id?: number
          maintenance?: boolean
          max_file_mb?: number
          model?: string
          provider?: string
          system_instructions?: string
          updated_at?: string
        }
        Update: {
          allowed_types?: string[]
          daily_limit?: number
          enabled?: boolean
          id?: number
          maintenance?: boolean
          max_file_mb?: number
          model?: string
          provider?: string
          system_instructions?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          day: string
          errors: number
          files: number
          id: string
          requests: number
          updated_at: string
          user_id: string
        }
        Insert: {
          day?: string
          errors?: number
          files?: number
          id?: string
          requests?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          day?: string
          errors?: number
          files?: number
          id?: string
          requests?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      banned_emails: {
        Row: {
          banned_at: string
          email: string
          id: string
          reason: string | null
        }
        Insert: {
          banned_at?: string
          email: string
          id?: string
          reason?: string | null
        }
        Update: {
          banned_at?: string
          email?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      content_items: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          link: string
          pinned: boolean
          pinned_at: string | null
          resource_type: string | null
          section: string | null
          subject: string
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          link: string
          pinned?: boolean
          pinned_at?: string | null
          resource_type?: string | null
          section?: string | null
          subject: string
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          link?: string
          pinned?: boolean
          pinned_at?: string | null
          resource_type?: string | null
          section?: string | null
          subject?: string
          title?: string
          type?: Database["public"]["Enums"]["content_type"]
          updated_at?: string
        }
        Relationships: []
      }
      giveaway_entries: {
        Row: {
          created_at: string
          email: string
          giveaway_id: string
          id: string
          name: string
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          giveaway_id: string
          id?: string
          name: string
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          giveaway_id?: string
          id?: string
          name?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "giveaway_entries_giveaway_id_fkey"
            columns: ["giveaway_id"]
            isOneToOne: false
            referencedRelation: "giveaways"
            referencedColumns: ["id"]
          },
        ]
      }
      giveaway_proofs: {
        Row: {
          approved_at: string | null
          caption: string | null
          created_at: string
          giveaway_id: string
          id: string
          image_url: string
          status: string
          updated_at: string
          user_id: string
          visible_until: string | null
          winner_entry_id: string
        }
        Insert: {
          approved_at?: string | null
          caption?: string | null
          created_at?: string
          giveaway_id: string
          id?: string
          image_url: string
          status?: string
          updated_at?: string
          user_id: string
          visible_until?: string | null
          winner_entry_id: string
        }
        Update: {
          approved_at?: string | null
          caption?: string | null
          created_at?: string
          giveaway_id?: string
          id?: string
          image_url?: string
          status?: string
          updated_at?: string
          user_id?: string
          visible_until?: string | null
          winner_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "giveaway_proofs_giveaway_id_fkey"
            columns: ["giveaway_id"]
            isOneToOne: false
            referencedRelation: "giveaways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "giveaway_proofs_winner_entry_id_fkey"
            columns: ["winner_entry_id"]
            isOneToOne: false
            referencedRelation: "giveaway_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      giveaway_public_winners: {
        Row: {
          created_at: string
          giveaway_id: string
          id: string
          win_position: number
          winner_entry_ref: string | null
          winner_name: string
        }
        Insert: {
          created_at?: string
          giveaway_id: string
          id?: string
          win_position?: number
          winner_entry_ref?: string | null
          winner_name: string
        }
        Update: {
          created_at?: string
          giveaway_id?: string
          id?: string
          win_position?: number
          winner_entry_ref?: string | null
          winner_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "giveaway_public_winners_giveaway_id_fkey"
            columns: ["giveaway_id"]
            isOneToOne: false
            referencedRelation: "giveaways"
            referencedColumns: ["id"]
          },
        ]
      }
      giveaway_winners: {
        Row: {
          entry_id: string
          giveaway_id: string
          id: string
          picked_at: string
          win_position: number
        }
        Insert: {
          entry_id: string
          giveaway_id: string
          id?: string
          picked_at?: string
          win_position?: number
        }
        Update: {
          entry_id?: string
          giveaway_id?: string
          id?: string
          picked_at?: string
          win_position?: number
        }
        Relationships: [
          {
            foreignKeyName: "giveaway_winners_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "giveaway_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "giveaway_winners_giveaway_id_fkey"
            columns: ["giveaway_id"]
            isOneToOne: false
            referencedRelation: "giveaways"
            referencedColumns: ["id"]
          },
        ]
      }
      giveaways: {
        Row: {
          auto_pick: boolean
          celebration_seen: boolean
          created_at: string
          created_by: string | null
          description: string | null
          entry_count: number
          id: string
          image_url: string | null
          prize: string
          result_at: string
          status: string
          title: string
          updated_at: string
          winner_count: number
          winner_entry_id: string | null
          winner_picked_at: string | null
        }
        Insert: {
          auto_pick?: boolean
          celebration_seen?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          entry_count?: number
          id?: string
          image_url?: string | null
          prize: string
          result_at: string
          status?: string
          title: string
          updated_at?: string
          winner_count?: number
          winner_entry_id?: string | null
          winner_picked_at?: string | null
        }
        Update: {
          auto_pick?: boolean
          celebration_seen?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          entry_count?: number
          id?: string
          image_url?: string | null
          prize?: string
          result_at?: string
          status?: string
          title?: string
          updated_at?: string
          winner_count?: number
          winner_entry_id?: string | null
          winner_picked_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          class_name: string | null
          coaching_institute: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          class_name?: string | null
          coaching_institute?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          class_name?: string | null
          coaching_institute?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_visitors: {
        Row: {
          created_at: string
          first_seen_at: string
          id: string
          last_seen_at: string
          updated_at: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          updated_at?: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          updated_at?: string
          visitor_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_ai_client_settings: {
        Args: never
        Returns: {
          allowed_types: string[]
          daily_limit: number
          enabled: boolean
          maintenance: boolean
          max_file_mb: number
        }[]
      }
      get_giveaway_winners: {
        Args: { _giveaway_id: string }
        Returns: {
          entry_id: string
          win_position: number
          winner_name: string
        }[]
      }
      giveaway_entry_count: { Args: { _giveaway_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      pick_giveaway_winner: { Args: { _giveaway_id: string }; Returns: string }
      pick_giveaway_winners: {
        Args: { _giveaway_id: string }
        Returns: string[]
      }
      track_visit: { Args: { _visitor_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
      content_type: "notes" | "mindmaps" | "dpp" | "pyq" | "books" | "coaching"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      content_type: ["notes", "mindmaps", "dpp", "pyq", "books", "coaching"],
    },
  },
} as const
