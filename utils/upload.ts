import { createClient } from '@/lib/supabase/client'

export async function uploadImage(file: File): Promise<string | null> {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `post-images/${fileName}`

    const { data, error } = await supabase.storage
        .from('post-images')
        .upload(filePath, file)

    if (error) {
        console.error('Error uploading image:', error)
        return null
    }

    const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath)

    return publicUrl
}
