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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          key_name: string
          key_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name: string
          key_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name?: string
          key_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      api_settings: {
        Row: {
          api_key: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          setting_name: string
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          setting_name: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          setting_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string
          description: string | null
          id: string
          location: string | null
          time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      case_expenses: {
        Row: {
          amount: number
          case_id: string
          created_at: string
          description: string
          expense_date: string
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          case_id: string
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          case_id?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      case_fees: {
        Row: {
          amount: number
          case_id: string
          created_at: string
          description: string
          fee_date: string
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          case_id: string
          created_at?: string
          description: string
          fee_date?: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          case_id?: string
          created_at?: string
          description?: string
          fee_date?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      case_payments: {
        Row: {
          amount: number
          case_id: string
          created_at: string
          description: string
          id: string
          payment_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          case_id: string
          created_at?: string
          description: string
          id?: string
          payment_date?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          case_id?: string
          created_at?: string
          description?: string
          id?: string
          payment_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      case_stages: {
        Row: {
          case_id: string | null
          case_number_ref: string | null
          court_name: string
          created_at: string
          first_session_date: string | null
          id: string
          is_resolved: boolean | null
          resolution_date: string | null
          resolution_details: string | null
          stage_name: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          case_number_ref?: string | null
          court_name: string
          created_at?: string
          first_session_date?: string | null
          id?: string
          is_resolved?: boolean | null
          resolution_date?: string | null
          resolution_details?: string | null
          stage_name: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          case_number_ref?: string | null
          court_name?: string
          created_at?: string
          first_session_date?: string | null
          id?: string
          is_resolved?: boolean | null
          resolution_date?: string | null
          resolution_details?: string | null
          stage_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_stages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          case_number: string
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          opponent: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          case_number: string
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          opponent?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          case_number?: string
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          opponent?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_expenses: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          description: string
          expense_date: string
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_expenses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_fees: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          description: string
          fee_date: string
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          description: string
          fee_date?: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          description?: string
          fee_date?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_fees_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_payments: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          description: string
          id: string
          payment_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          description: string
          id?: string
          payment_date?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          description?: string
          id?: string
          payment_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      driver_accounting: {
        Row: {
          commission_amount: number
          commission_rate: number | null
          created_at: string | null
          driver_id: string | null
          gross_amount: number
          id: string
          net_amount: number
          payment_date: string | null
          payment_status: string | null
          trip_id: string | null
        }
        Insert: {
          commission_amount: number
          commission_rate?: number | null
          created_at?: string | null
          driver_id?: string | null
          gross_amount: number
          id?: string
          net_amount: number
          payment_date?: string | null
          payment_status?: string | null
          trip_id?: string | null
        }
        Update: {
          commission_amount?: number
          commission_rate?: number | null
          created_at?: string | null
          driver_id?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          payment_date?: string | null
          payment_status?: string | null
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_accounting_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_accounting_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_locations: {
        Row: {
          driver_id: string | null
          heading: number | null
          id: string
          latitude: number
          longitude: number
          speed: number | null
          updated_at: string | null
        }
        Insert: {
          driver_id?: string | null
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          speed?: number | null
          updated_at?: string | null
        }
        Update: {
          driver_id?: string | null
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          speed?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_locations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fkh: {
        Row: {
          id: number
          text: string
          titl: string
        }
        Insert: {
          id: number
          text: string
          titl: string
        }
        Update: {
          id?: number
          text?: string
          titl?: string
        }
        Relationships: []
      }
      Fkh: {
        Row: {
          id: number
          text: string
          titl: string
        }
        Insert: {
          id: number
          text: string
          titl: string
        }
        Update: {
          id?: number
          text?: string
          titl?: string
        }
        Relationships: []
      }
      governorates: {
        Row: {
          code: string
          id: string
          name_ar: string
          name_en: string
        }
        Insert: {
          code: string
          id?: string
          name_ar: string
          name_en: string
        }
        Update: {
          code?: string
          id?: string
          name_ar?: string
          name_en?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      office_expenses: {
        Row: {
          amount: number
          created_at: string
          description: string
          expense_date: string
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      office_income: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          income_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          income_date?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          income_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          admin_commission: number
          created_at: string
          currency: string
          customer_id: string
          driver_earnings: number
          driver_id: string
          id: string
          payment_method: string
          status: string
          total_amount: number
          trip_id: string
        }
        Insert: {
          admin_commission: number
          created_at?: string
          currency?: string
          customer_id: string
          driver_earnings: number
          driver_id: string
          id?: string
          payment_method?: string
          status?: string
          total_amount: number
          trip_id: string
        }
        Update: {
          admin_commission?: number
          created_at?: string
          currency?: string
          customer_id?: string
          driver_earnings?: number
          driver_id?: string
          id?: string
          payment_method?: string
          status?: string
          total_amount?: number
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_settings: {
        Row: {
          base_price: number
          created_at: string | null
          created_by: string | null
          governorate_id: string | null
          id: string
          is_active: boolean | null
          night_multiplier: number | null
          peak_hour_multiplier: number | null
          price_per_km: number
          price_per_minute: number
        }
        Insert: {
          base_price?: number
          created_at?: string | null
          created_by?: string | null
          governorate_id?: string | null
          id?: string
          is_active?: boolean | null
          night_multiplier?: number | null
          peak_hour_multiplier?: number | null
          price_per_km?: number
          price_per_minute?: number
        }
        Update: {
          base_price?: number
          created_at?: string | null
          created_by?: string | null
          governorate_id?: string | null
          id?: string
          is_active?: boolean | null
          night_multiplier?: number | null
          peak_hour_multiplier?: number | null
          price_per_km?: number
          price_per_minute?: number
        }
        Relationships: [
          {
            foreignKeyName: "pricing_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_settings_governorate_id_fkey"
            columns: ["governorate_id"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          current_location: Json | null
          driver_license_number: string | null
          email: string | null
          full_name: string | null
          governorate_id: string | null
          id: string
          is_online: boolean | null
          phone_number: string | null
          phone_verified: boolean | null
          preferred_currency: string | null
          role: Database["public"]["Enums"]["user_role"]
          sms_verification_code: string | null
          sms_verification_expires_at: string | null
          status: string | null
          vehicle_info: Json | null
          verification_code: string | null
          verification_code_generated_at: string | null
          verification_code_sent: boolean | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          current_location?: Json | null
          driver_license_number?: string | null
          email?: string | null
          full_name?: string | null
          governorate_id?: string | null
          id: string
          is_online?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          preferred_currency?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          sms_verification_code?: string | null
          sms_verification_expires_at?: string | null
          status?: string | null
          vehicle_info?: Json | null
          verification_code?: string | null
          verification_code_generated_at?: string | null
          verification_code_sent?: boolean | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          current_location?: Json | null
          driver_license_number?: string | null
          email?: string | null
          full_name?: string | null
          governorate_id?: string | null
          id?: string
          is_online?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          preferred_currency?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          sms_verification_code?: string | null
          sms_verification_expires_at?: string | null
          status?: string | null
          vehicle_info?: Json | null
          verification_code?: string | null
          verification_code_generated_at?: string | null
          verification_code_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_governorate_id_fkey"
            columns: ["governorate_id"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["id"]
          },
        ]
      }
      promotional_offers: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          governorate_id: string | null
          id: string
          is_active: boolean
          max_discount: number
          min_trip_amount: number
          start_date: string
          title: string
          updated_at: string
          usage_limit: number
          used_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          end_date: string
          governorate_id?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number
          min_trip_amount?: number
          start_date: string
          title: string
          updated_at?: string
          usage_limit?: number
          used_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          governorate_id?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number
          min_trip_amount?: number
          start_date?: string
          title?: string
          updated_at?: string
          usage_limit?: number
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotional_offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotional_offers_governorate_id_fkey"
            columns: ["governorate_id"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          case_number: string
          client_name: string
          court_name: string
          created_at: string
          id: string
          is_resolved: boolean | null
          is_transferred: boolean | null
          next_postponement_reason: string | null
          next_session_date: string | null
          opponent: string | null
          postponement_reason: string | null
          resolution_date: string | null
          session_date: string
          stage_id: string | null
          updated_at: string
        }
        Insert: {
          case_number: string
          client_name: string
          court_name: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          is_transferred?: boolean | null
          next_postponement_reason?: string | null
          next_session_date?: string | null
          opponent?: string | null
          postponement_reason?: string | null
          resolution_date?: string | null
          session_date: string
          stage_id?: string | null
          updated_at?: string
        }
        Update: {
          case_number?: string
          client_name?: string
          court_name?: string
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          is_transferred?: boolean | null
          next_postponement_reason?: string | null
          next_session_date?: string | null
          opponent?: string | null
          postponement_reason?: string | null
          resolution_date?: string | null
          session_date?: string
          stage_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "case_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          notes: string | null
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          notes?: string | null
          start_date: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_by: string | null
          id: string
          is_encrypted: boolean | null
          setting_key: string
          setting_type: string | null
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_by?: string | null
          id?: string
          is_encrypted?: boolean | null
          setting_key: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_by?: string | null
          id?: string
          is_encrypted?: boolean | null
          setting_key?: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          priority: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      trips: {
        Row: {
          actual_distance: number | null
          actual_duration: number | null
          admin_commission: number | null
          base_price: number
          completed_at: string | null
          created_at: string
          currency: string
          customer_id: string
          driver_earnings: number | null
          driver_id: string
          end_location: Json
          estimated_arrival: string | null
          estimated_distance: number | null
          estimated_duration: number | null
          feedback: string | null
          final_price: number | null
          id: string
          pickup_time: string | null
          rating: number | null
          route_path: Json | null
          start_location: Json
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          actual_distance?: number | null
          actual_duration?: number | null
          admin_commission?: number | null
          base_price: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          customer_id: string
          driver_earnings?: number | null
          driver_id: string
          end_location: Json
          estimated_arrival?: string | null
          estimated_distance?: number | null
          estimated_duration?: number | null
          feedback?: string | null
          final_price?: number | null
          id?: string
          pickup_time?: string | null
          rating?: number | null
          route_path?: Json | null
          start_location: Json
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          actual_distance?: number | null
          actual_duration?: number | null
          admin_commission?: number | null
          base_price?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          customer_id?: string
          driver_earnings?: number | null
          driver_id?: string
          end_location?: Json
          estimated_arrival?: string | null
          estimated_distance?: number | null
          estimated_duration?: number | null
          feedback?: string | null
          final_price?: number | null
          id?: string
          pickup_time?: string | null
          rating?: number | null
          route_path?: Json | null
          start_location?: Json
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_subscription_valid: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "user" | "driver"
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
      user_role: ["admin", "user", "driver"],
    },
  },
} as const
