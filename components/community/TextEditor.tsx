'use client'

import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ImagePlus } from 'lucide-react'

// Dynamic import for ReactQuill (CSR Only)
const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill-new');
        const { default: BlotFormatter } = await import('quill-blot-formatter');
        // @ts-ignore
        RQ.Quill.register('modules/blotFormatter', BlotFormatter);
        return function comp({ ...props }: any) {
            return <RQ {...props} />;
        }
    },
    { ssr: false, loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-xl" /> }
);

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

interface TextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export default function TextEditor({ value, onChange, placeholder }: TextEditorProps) {
    const quillRef = useRef<any>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 이미지 파일을 Supabase Storage에 업로드하고 에디터에 삽입
    const uploadAndInsertImage = useCallback(async (file: File) => {
        if (file.size > MAX_SIZE) {
            alert('이미지 크기는 5MB 이하만 가능합니다.')
            return
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            alert(`지원하지 않는 이미지 형식입니다 (${file.type}). JPG, PNG, GIF, WebP만 가능합니다.`)
            return
        }

        setIsUploading(true)

        try {
            const supabase = createClient()
            const ext = file.name?.split('.').pop() || file.type.split('/')[1] || 'png'
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`

            const { error: uploadError } = await supabase.storage
                .from('post-images')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('post-images')
                .getPublicUrl(fileName)

            const quill = quillRef.current?.getEditor()
            if (quill) {
                const range = quill.getSelection(true)
                quill.insertEmbed(range.index, 'image', publicUrl)
                quill.setSelection(range.index + 1)
            }
        } catch (error: any) {
            console.error('Image upload failed:', error)
            alert(`이미지 업로드에 실패했습니다: ${error.message || JSON.stringify(error)}`)
        } finally {
            setIsUploading(false)
        }
    }, [])

    // 툴바 이미지 버튼 핸들러
    const imageHandler = useCallback(() => {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')
        input.click()

        input.onchange = async () => {
            if (input.files && input.files[0]) {
                await uploadAndInsertImage(input.files[0])
            }
        }
    }, [uploadAndInsertImage])

    // 이미지 클릭 시 크기 조절 프롬프트 및 클립보드 붙여넣기 처리
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handlePaste = (e: ClipboardEvent) => {
            const clipboardData = e.clipboardData
            if (!clipboardData) return

            const items = Array.from(clipboardData.items)
            const imageItem = items.find(item => item.type.startsWith('image/'))

            if (imageItem) {
                e.preventDefault()
                e.stopPropagation()
                const file = imageItem.getAsFile()
                if (file) {
                    uploadAndInsertImage(file)
                }
            }
        }

        container.addEventListener('paste', handlePaste, true)

        return () => {
            container.removeEventListener('paste', handlePaste, true)
        }
    }, [uploadAndInsertImage])

    // 모바일 갤러리 버튼 핸들러
    const handleMobileImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleMobileFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return
        for (let i = 0; i < files.length; i++) {
            await uploadAndInsertImage(files[i])
        }
        e.target.value = ''
    }

    const modules = useMemo(() => ({
        blotFormatter: {},
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
        <div ref={containerRef} className="relative">
            {isUploading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
                        <span className="text-sm font-bold text-gray-600">이미지 업로드 중...</span>
                    </div>
                </div>
            )}
            {/* 모바일 갤러리 접근용 숨겨진 file input (multiple 지원) */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleMobileFileChange}
            />
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
                    max-height: 60vh;
                    display: flex;
                    flex-direction: column;
                }
                .ql-editor {
                    min-height: 400px;
                    line-height: 1.6;
                    color: #374151;
                    overflow-y: auto;
                    flex: 1;
                }
                .ql-editor.ql-blank::before {
                    color: #9CA3AF;
                    font-style: normal;
                }
                .ql-editor img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 0.5rem 0;
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
            {/* 모바일 전용 사진 추가 버튼 */}
            <button
                type="button"
                onClick={handleMobileImageClick}
                className="sm:hidden mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/50 text-pink-500 font-bold text-sm hover:bg-pink-50 active:scale-[0.98] transition-all"
            >
                <ImagePlus size={18} />
                갤러리에서 사진 추가
            </button>
        </div>
    )
}
