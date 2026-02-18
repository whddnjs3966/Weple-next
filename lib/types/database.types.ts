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
            comments: {
                Row: {
                    content: string
                    created_at: string
                    id: string
                    post_id: string
                    user_id: string
                }
                Insert: {
                    content: string
                    created_at?: string
                    id?: string
                    post_id: string
                    user_id: string
                }
                Update: {
                    content?: string
                    created_at?: string
                    id?: string
                    post_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "comments_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comments_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            posts: {
                Row: {
                    category: string | null
                    content: string
                    created_at: string
                    id: string
                    title: string
                    user_id: string
                    view_count: number | null
                }
                Insert: {
                    category?: string | null
                    content: string
                    created_at?: string
                    id?: string
                    title: string
                    user_id: string
                    view_count?: number | null
                }
                Update: {
                    category?: string | null
                    content?: string
                    created_at?: string
                    id?: string
                    title?: string
                    user_id?: string
                    view_count?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "posts_user_id_fkey"
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
                    budget_max: number | null
                    budget_min: number | null
                    full_name: string | null
                    group_id: string | null
                    id: string
                    invite_code: string | null
                    region_sido: string | null
                    region_sigungu: string | null
                    role: string | null
                    style: string | null
                    updated_at: string | null
                    username: string | null
                    website: string | null
                    wedding_date: string | null
                    wedding_group_id: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    budget_max?: number | null
                    budget_min?: number | null
                    full_name?: string | null
                    group_id?: string | null
                    id: string
                    invite_code?: string | null
                    region_sido?: string | null
                    region_sigungu?: string | null
                    role?: string | null
                    style?: string | null
                    updated_at?: string | null
                    username?: string | null
                    website?: string | null
                    wedding_date?: string | null
                    wedding_group_id?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    budget_max?: number | null
                    budget_min?: number | null
                    full_name?: string | null
                    group_id?: string | null
                    id?: string
                    invite_code?: string | null
                    region_sido?: string | null
                    region_sigungu?: string | null
                    role?: string | null
                    style?: string | null
                    updated_at?: string | null
                    username?: string | null
                    website?: string | null
                    wedding_date?: string | null
                    wedding_group_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_wedding_group_id_fkey"
                        columns: ["wedding_group_id"]
                        isOneToOne: false
                        referencedRelation: "wedding_groups"
                        referencedColumns: ["id"]
                    },
                ]
            }
            tasks: {
                Row: {
                    actual_cost: number | null
                    category: string | null
                    created_at: string
                    d_day: number | null
                    description: string | null
                    due_date: string | null
                    estimated_budget: number | null
                    id: string
                    is_completed: boolean | null
                    title: string
                    user_id: string
                }
                Insert: {
                    actual_cost?: number | null
                    category?: string | null
                    created_at?: string
                    d_day?: number | null
                    description?: string | null
                    due_date?: string | null
                    estimated_budget?: number | null
                    id?: string
                    is_completed?: boolean | null
                    title: string
                    user_id: string
                }
                Update: {
                    actual_cost?: number | null
                    category?: string | null
                    created_at?: string
                    d_day?: number | null
                    description?: string | null
                    due_date?: string | null
                    estimated_budget?: number | null
                    id?: string
                    is_completed?: boolean | null
                    title?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "tasks_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            vendor_categories: {
                Row: {
                    id: number
                    name: string
                    slug: string
                }
                Insert: {
                    id?: number
                    name: string
                    slug: string
                }
                Update: {
                    id?: number
                    name?: string
                    slug?: string
                }
                Relationships: []
            }
            vendors: {
                Row: {
                    category_id: number | null
                    contact: string | null
                    created_at: string
                    id: number
                    image_url: string | null
                    name: string
                    price_range: string | null
                    rating: number | null
                    region_sido: string | null
                    region_sigungu: string | null
                    summary: string | null
                }
                Insert: {
                    category_id?: number | null
                    contact?: string | null
                    created_at?: string
                    id?: number
                    image_url?: string | null
                    name: string
                    price_range?: string | null
                    rating?: number | null
                    region_sido?: string | null
                    region_sigungu?: string | null
                    summary?: string | null
                }
                Update: {
                    category_id?: number | null
                    contact?: string | null
                    created_at?: string
                    id?: number
                    image_url?: string | null
                    name?: string
                    price_range?: string | null
                    rating?: number | null
                    region_sido?: string | null
                    region_sigungu?: string | null
                    summary?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "vendors_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "vendor_categories"
                        referencedColumns: ["id"]
                    },
                ]
            }
            wedding_groups: {
                Row: {
                    bride_name: string | null
                    created_at: string
                    groom_name: string | null
                    id: string
                    total_budget: number | null
                    updated_at: string
                    wedding_date: string | null
                }
                Insert: {
                    bride_name?: string | null
                    created_at?: string
                    groom_name?: string | null
                    id?: string
                    total_budget?: number | null
                    updated_at?: string
                    wedding_date?: string | null
                }
                Update: {
                    bride_name?: string | null
                    created_at?: string
                    groom_name?: string | null
                    id?: string
                    total_budget?: number | null
                    updated_at?: string
                    wedding_date?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
}
    ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
}
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
}
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
