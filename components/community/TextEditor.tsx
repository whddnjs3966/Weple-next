'use client'

import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

// Dynamic import for ReactQuill (CSR Only)
const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill-new');
        return function comp({ ...props }: any) {
            return <RQ {...props} />;
        }
    },
    { ssr: false, loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-xl" /> }
);

interface TextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export default function TextEditor({ value, onChange, placeholder }: TextEditorProps) {
    const quillRef = useRef<any>(null)
    const [isUploading, setIsUploading] = useState(false)

    // Image Handler
    const imageHandler = useCallback(() => {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')
        input.click()

        input.onchange = async () => {
            if (input.files && input.files[0]) {
                const file = input.files[0]
                setIsUploading(true)

                try {
                    const supabase = createClient()
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
                    const filePath = `${fileName}`

                    const { error: uploadError } = await supabase.storage
                        .from('post-images')
                        .upload(filePath, file)

                    if (uploadError) throw uploadError

                    const { data: { publicUrl } } = supabase.storage
                        .from('post-images')
                        .getPublicUrl(filePath)

                    const quill = quillRef.current.getEditor()
                    const range = quill.getSelection(true)
                    quill.insertEmbed(range.index, 'image', publicUrl)
                    quill.setSelection(range.index + 1)
                } catch (error) {
                    console.error('Image upload failed:', error)
                    alert('이미지 업로드에 실패했습니다.')
                } finally {
                    setIsUploading(false)
                }
            }
        }
    }, [])

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'align': [] }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
        clipboard: {
            matchVisual: false,
        }
    }), [imageHandler])

    const formats = [
        'header', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'color', 'background',
        'list', 'align',
        'link', 'image'
    ]

    return (
        <div className="relative">
            {isUploading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
                        <span className="text-sm font-bold text-gray-600">이미지 업로드 중...</span>
                    </div>
                </div>
            )}
            <style jsx global>{`
                .ql-toolbar {
                    border-top-left-radius: 0.75rem;
                    border-top-right-radius: 0.75rem;
                    border-color: #E5E7EB !important;
                    background-color: #F9FAFB;
                }
                .ql-container {
                    border-bottom-left-radius: 0.75rem;
                    border-bottom-right-radius: 0.75rem;
                    border-color: #E5E7EB !important;
                    font-family: 'Pretendard', sans-serif;
                    font-size: 1rem;
                    min-height: 400px;
                }
                .ql-editor {
                    min-height: 400px;
                    line-height: 1.6;
                    color: #374151;
                }
                .ql-editor.ql-blank::before {
                    color: #9CA3AF;
                    font-style: normal;
                }
                /* Mobile optimization */
                @media (max-width: 640px) {
                    .ql-toolbar .ql-formats {
                        margin-right: 0 !important;
                    }
                    .ql-picker-label {
                        padding-left: 4px !important;
                    }
                }
            `}</style>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="bg-white rounded-xl shadow-sm"
            />
        </div>
    )
}
