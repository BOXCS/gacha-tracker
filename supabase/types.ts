export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          timezone: string | null
          push_token: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          timezone?: string | null
          push_token?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          timezone?: string | null
          push_token?: string | null
          created_at?: string | null
        }
      }
      game_accounts: {
        Row: {
          id: string
          user_id: string
          game_type: 'genshin' | 'hsr' | 'zzz' | 'wuwa' | 'nte' | 'endfield'
          nickname: string
          current_resin: number
          max_resin: number
          last_updated_at: string
          secondary_resin: number | null
          secondary_max: number | null
          secondary_updated_at: string | null
          sort_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          game_type: 'genshin' | 'hsr' | 'zzz' | 'wuwa' | 'nte' | 'endfield'
          nickname: string
          current_resin?: number
          max_resin: number
          last_updated_at?: string
          secondary_resin?: number | null
          secondary_max?: number | null
          secondary_updated_at?: string | null
          sort_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          game_type?: 'genshin' | 'hsr' | 'zzz' | 'wuwa' | 'nte' | 'endfield'
          nickname?: string
          current_resin?: number
          max_resin?: number
          last_updated_at?: string
          secondary_resin?: number | null
          secondary_max?: number | null
          secondary_updated_at?: string | null
          sort_order?: number | null
          created_at?: string | null
        }
      }
      daily_tasks: {
        Row: {
          id: string
          account_id: string
          task_key: string
          label: string
          is_done: boolean | null
          date: string
          task_type: string
        }
        Insert: {
          id?: string
          account_id: string
          task_key: string
          label: string
          is_done?: boolean | null
          date: string
          task_type?: string
        }
        Update: {
          id?: string
          account_id?: string
          task_key?: string
          label?: string
          is_done?: boolean | null
          date?: string
          task_type?: string
        }
      }
      resin_history: {
        Row: {
          id: string
          account_id: string
          snapshot_resin: number
          snapshot_secondary: number | null
          recorded_at: string | null
        }
        Insert: {
          id?: string
          account_id: string
          snapshot_resin: number
          snapshot_secondary?: number | null
          recorded_at?: string | null
        }
        Update: {
          id?: string
          account_id?: string
          snapshot_resin?: number
          snapshot_secondary?: number | null
          recorded_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      game_type: 'genshin' | 'hsr' | 'zzz' | 'wuwa' | 'nte' | 'endfield'
    }
  }
}
