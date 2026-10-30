"use client"
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import ReactQuill (react-quill-new for React 19 compatibility)
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center text-gray-500">Loading editor...</div>
})

// Import Quill styles
import 'react-quill-new/dist/quill.snow.css'

export default function QuillEditorWrapper({ data, onChange }) {
  const quillRef = useRef(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Register image resize module
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      const registerImageResize = async () => {
        try {
          const Quill = (await import('react-quill-new')).Quill
          const ImageResize = (await import('quill-image-resize-module-react')).default
          Quill.register('modules/imageResize', ImageResize)
        } catch (error) {
          console.error('Error loading image resize module:', error)
        }
      }
      registerImageResize()
    }
  }, [isClient])

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
    imageResize: {
      parchment: typeof window !== 'undefined' && window.Quill ? window.Quill.import('parchment') : undefined,
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    },
    clipboard: {
      matchVisual: false,
    }
  }

  // Quill formats
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video',
    'width', 'height' // Add width and height for image resize
  ]

  if (!isClient) {
    return <div className="h-96 flex items-center justify-center text-gray-500">Loading editor...</div>
  }

  return (
    <div className="quill-editor-wrapper">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={data || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Start writing your blog content..."
        className="bg-white"
      />
      <style jsx global>{`
        .quill-editor-wrapper .ql-container {
          min-height: 400px;
          font-size: 16px;
          font-family: inherit;
        }
        .quill-editor-wrapper .ql-editor {
          min-height: 400px;
          padding: 20px;
        }
        .quill-editor-wrapper .ql-toolbar {
          background: #f8f9fa;
          border: 1px solid #e5e7eb;
          border-radius: 8px 8px 0 0;
        }
        .quill-editor-wrapper .ql-container {
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        .quill-editor-wrapper .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        /* Better styling for headings in editor */
        .ql-editor h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
        .ql-editor h2 { font-size: 1.5em; font-weight: bold; margin: 0.75em 0; }
        .ql-editor h3 { font-size: 1.17em; font-weight: bold; margin: 0.83em 0; }
        .ql-editor h4 { font-size: 1em; font-weight: bold; margin: 1em 0; }
        .ql-editor h5 { font-size: 0.83em; font-weight: bold; margin: 1.5em 0; }
        .ql-editor h6 { font-size: 0.67em; font-weight: bold; margin: 2em 0; }
        /* Code block styling */
        .ql-editor pre.ql-syntax {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 1em;
          border-radius: 4px;
          overflow-x: auto;
        }
        /* Blockquote styling */
        .ql-editor blockquote {
          border-left: 4px solid #9333ea;
          padding-left: 16px;
          margin: 1em 0;
          color: #64748b;
        }
        /* Image resize handles */
        .ql-editor img {
          cursor: pointer;
        }
        .ql-editor .image-resizer {
          position: absolute;
          border: 1px dashed #9333ea;
        }
        .ql-editor .image-resizer .resize-handle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #9333ea;
          border: 1px solid white;
          border-radius: 50%;
        }
      `}</style>
    </div>
  )
}
