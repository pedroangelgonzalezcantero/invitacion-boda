export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
export interface Database {
  public: {
    Tables: {
      guests: {
        Relationships: []
        Row: {
          id: string
          created_at: string
          name: string
          code: string
          max_companions: number
          email: string | null
          phone: string | null
          notes: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          code: string
          max_companions?: number
          email?: string | null
          phone?: string | null
          notes?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          code?: string
          max_companions?: number
          email?: string | null
          phone?: string | null
          notes?: string | null
          is_active?: boolean
        }
      }
      rsvp_responses: {
        Relationships: [
          {
            foreignKeyName: "rsvp_responses_guest_id_fkey"
            columns: ["guest_id"]
            referencedRelation: "guests"
            referencedColumns: ["id"]
          }
        ]
        Row: {
          id: string
          created_at: string
          guest_id: string
          guest_name: string
          attending: boolean
          companions_count: number
          companions_names: string | null
          menu_preference: string
          allergies: string | null
          message: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          guest_id: string
          guest_name: string
          attending: boolean
          companions_count?: number
          companions_names?: string | null
          menu_preference?: string
          allergies?: string | null
          message?: string | null
          updated_at?: string
        }
        Update: {
          guest_id?: string
          guest_name?: string
          attending?: boolean
          companions_count?: number
          companions_names?: string | null
          menu_preference?: string
          allergies?: string | null
          message?: string | null
          updated_at?: string
        }
      }
    }
  }
}
export type Guest = Database['public']['Tables']['guests']['Row']
export type RSVPResponse = Database['public']['Tables']['rsvp_responses']['Row']
