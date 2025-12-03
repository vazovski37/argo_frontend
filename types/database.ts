export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          is_secret: boolean | null
          name: string
          requirement_data: Json | null
          requirement_type: string
          requirement_value: number | null
          slug: string
          xp_reward: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          is_secret?: boolean | null
          name: string
          requirement_data?: Json | null
          requirement_type: string
          requirement_value?: number | null
          slug: string
          xp_reward?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          is_secret?: boolean | null
          name?: string
          requirement_data?: Json | null
          requirement_type?: string
          requirement_value?: number | null
          slug?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          name_ka: string | null
          xp_reward: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          name_ka?: string | null
          xp_reward?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_ka?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      quests: {
        Row: {
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          name: string
          prerequisites: Json | null
          quest_type: string
          slug: string
          steps: Json
          story_intro: string | null
          time_limit_hours: number | null
          xp_reward: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          name: string
          prerequisites?: Json | null
          quest_type: string
          slug: string
          steps: Json
          story_intro?: string | null
          time_limit_hours?: number | null
          xp_reward?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          name?: string
          prerequisites?: Json | null
          quest_type?: string
          slug?: string
          steps?: Json
          story_intro?: string | null
          time_limit_hours?: number | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_location_visits: {
        Row: {
          id: string
          location_id: string
          user_id: string
          visited_at: string | null
        }
        Insert: {
          id?: string
          location_id: string
          user_id: string
          visited_at?: string | null
        }
        Update: {
          id?: string
          location_id?: string
          user_id?: string
          visited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_location_visits_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          location_id: string | null
          photo_type: string | null
          photo_url: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          location_id?: string | null
          photo_type?: string | null
          photo_url: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          location_id?: string | null
          photo_type?: string | null
          photo_url?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_photos_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          achievements_earned: number | null
          created_at: string | null
          current_level: number | null
          current_rank: string | null
          id: string
          last_active_at: string | null
          locations_visited: number | null
          photos_taken: number | null
          phrases_learned: string[] | null
          quests_completed: number | null
          streak_days: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievements_earned?: number | null
          created_at?: string | null
          current_level?: number | null
          current_rank?: string | null
          id?: string
          last_active_at?: string | null
          locations_visited?: number | null
          photos_taken?: number | null
          phrases_learned?: string[] | null
          quests_completed?: number | null
          streak_days?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievements_earned?: number | null
          created_at?: string | null
          current_level?: number | null
          current_rank?: string | null
          id?: string
          last_active_at?: string | null
          locations_visited?: number | null
          photos_taken?: number | null
          phrases_learned?: string[] | null
          quests_completed?: number | null
          streak_days?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_quests: {
        Row: {
          completed_at: string | null
          current_step: number | null
          expires_at: string | null
          id: string
          quest_id: string
          started_at: string | null
          status: string | null
          steps_completed: Json | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: number | null
          expires_at?: string | null
          id?: string
          quest_id: string
          started_at?: string | null
          status?: string | null
          steps_completed?: Json | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_step?: number | null
          expires_at?: string | null
          id?: string
          quest_id?: string
          started_at?: string | null
          status?: string | null
          steps_completed?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quests_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_xp: {
        Args: { p_user_id: string; p_xp: number }
        Returns: {
          achievements_earned: number | null
          created_at: string | null
          current_level: number | null
          current_rank: string | null
          id: string
          last_active_at: string | null
          locations_visited: number | null
          photos_taken: number | null
          phrases_learned: string[] | null
          quests_completed: number | null
          streak_days: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
      }
      get_level_for_xp: { Args: { xp: number }; Returns: number }
      get_rank_for_xp: { Args: { xp: number }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']




