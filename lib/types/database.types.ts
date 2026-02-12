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
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    wedding_date: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    wedding_date?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    wedding_date?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            tasks: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    d_day: number | null
                    due_date: string | null
                    estimated_budget: number | null
                    is_completed: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description?: string | null
                    d_day?: number | null
                    due_date?: string | null
                    estimated_budget?: number | null
                    is_completed?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    d_day?: number | null
                    due_date?: string | null
                    estimated_budget?: number | null
                    is_completed?: boolean | null
                    created_at?: string
                }
                Relationships: []
            }
            posts: {
                Row: {
                    id: string
                    user_id: string
                    category: 'notice' | 'free'
                    title: string
                    content: string
                    view_count: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    category: 'notice' | 'free'
                    title: string
                    content: string
                    view_count?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    category?: 'notice' | 'free'
                    title?: string
                    content?: string
                    view_count?: number
                    created_at?: string
                }
                Relationships: []
            }
            comments: {
                Row: {
                    id: string
                    user_id: string
                    post_id: number
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    post_id: number
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    post_id?: number
                    content?: string
                    created_at?: string
                }
                Relationships: []
            }
            vendors: {
                Row: {
                    id: number
                    name: string
                    category_id: number | null
                    region_sido: string | null
                    region_sigungu: string | null
                    rating: number | null
                    image_url: string | null
                    summary: string | null
                    contact: string | null
                    price_range: string | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    name: string
                    category_id?: number | null
                    region_sido?: string | null
                    region_sigungu?: string | null
                    rating?: number | null
                    image_url?: string | null
                    summary?: string | null
                    contact?: string | null
                    price_range?: string | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    name?: string
                    category_id?: number | null
                    region_sido?: string | null
                    region_sigungu?: string | null
                    rating?: number | null
                    image_url?: string | null
                    summary?: string | null
                    contact?: string | null
                    price_range?: string | null
                    created_at?: string
                }
                Relationships: []
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
        }
    }
}
