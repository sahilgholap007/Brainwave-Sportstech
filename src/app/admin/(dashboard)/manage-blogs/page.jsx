"use client"
import { useEffect, useState } from "react"
import { Edit, Trash2, Plus, ExternalLink, FileText, X, Save, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    addDoc,
    serverTimestamp,
    deleteDoc,
} from "firebase/firestore"
import { db } from "@/firebase/firebaseconfig" // Centralized DB
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ToastContainer } from "react-toastify"
import dynamic from "next/dynamic"

// Dynamically import Quill Editor to avoid SSR issues
const QuillEditor = dynamic(() => import("@/components/CKEditorWrapper"), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-96"><p className="text-gray-500">Loading editor...</p></div>,
})

const ManageBlogs = () => {
    const [blogs, setBlogs] = useState([])
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [blogTitle, setBlogTitle] = useState("")
    const [blogDesc, setBlogDesc] = useState("")
    const [blogContent, setBlogContent] = useState("")
    const [blogTemplate, setBlogTemplate] = useState("classic")
    const [blogImage, setBlogImage] = useState(null)
    const [blogImagePreview, setBlogImagePreview] = useState(null)
    const [blogSlug, setBlogSlug] = useState("")
    const [currentBlogId, setCurrentBlogId] = useState(null)

    // const db = getFirestore() // Removed local initialization
    const storage = getStorage()

    const fetchBlogs = async () => {
        try {


            const snapshot = await getDocs(collection(db, "blogs"))
            const blogList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            blogList.sort((a, b) => {
                if (!a.createdAt) return 1
                if (!b.createdAt) return -1
                return b.createdAt.seconds - a.createdAt.seconds
            })
            setBlogs(blogList)
        } catch (error) {
            console.error("Error fetching blogs:", error)
            toast.error("Failed to fetch blogs")
        }
    }

    useEffect(() => {
        fetchBlogs()
    }, [])

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
    }

    useEffect(() => {
        if (blogTitle && !isEditMode) {
            setBlogSlug(generateSlug(blogTitle))
        }
    }, [blogTitle, isEditMode])

    const openNewBlog = () => {
        setBlogTitle("")
        setBlogDesc("")
        setBlogContent("")
        setBlogTemplate("classic")
        setBlogSlug("")
        setBlogImage(null)
        setBlogImagePreview(null)
        setCurrentBlogId(null)
        setIsEditMode(false)
        setIsEditorOpen(true)
    }

    const openEditBlog = (blog) => {
        setBlogTitle(blog.title)
        setBlogDesc(blog.description)
        setBlogContent(blog.content || "")
        setBlogTemplate(blog.template || "classic")
        setBlogSlug(blog.slug || "")
        setBlogImage(null)
        setBlogImagePreview(blog.imageUrl)
        setCurrentBlogId(blog.id)
        setIsEditMode(true)
        setIsEditorOpen(true)
    }

    const closeEditor = () => {
        if (blogTitle || blogContent) {
            if (!window.confirm("You have unsaved changes. Are you sure you want to close?")) {
                return
            }
        }
        setIsEditorOpen(false)
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setBlogImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setBlogImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSaveBlog = async () => {
        if (!blogTitle || !blogDesc || !blogContent) {
            toast.error("Please fill in title, description, and content.")
            return
        }

        if (!isEditMode && !blogImage) {
            toast.error("Please upload a cover image.")
            return
        }

        try {
            let imageUrl = blogImagePreview

            if (blogImage) {
                const storageRef = ref(storage, `blogs/${Date.now()}_${blogImage.name}`)
                await uploadBytes(storageRef, blogImage)
                imageUrl = await getDownloadURL(storageRef)
            }

            const blogData = {
                title: blogTitle,
                description: blogDesc,
                content: blogContent,
                template: blogTemplate,
                slug: blogSlug || generateSlug(blogTitle),
                imageUrl,
                updatedAt: serverTimestamp(),
            }

            if (isEditMode && currentBlogId) {
                await updateDoc(doc(db, "blogs", currentBlogId), blogData)
                toast.success("Blog updated successfully!")
            } else {
                await addDoc(collection(db, "blogs"), {
                    ...blogData,
                    createdAt: serverTimestamp(),
                })
                toast.success("Blog created successfully!")
            }

            setIsEditorOpen(false)
            fetchBlogs()
        } catch (error) {
            console.error("Error saving blog:", error)
            toast.error("Failed to save blog.")
        }
    }

    const handleDeleteBlog = async (id) => {
        if (!window.confirm("Are you sure you want to delete this blog?")) return

        try {
            await deleteDoc(doc(db, "blogs", id))
            setBlogs(blogs.filter((b) => b.id !== id))
            toast.success("Blog deleted!")
        } catch (error) {
            console.error("Error deleting blog:", error)
            toast.error("Failed to delete blog.")
        }
    }

    // Full-screen Word-like editor
    if (isEditorOpen) {
        return (
            <div className="fixed inset-0 bg-white z-50 flex flex-col">
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

                {/* Top toolbar */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={closeEditor}
                            variant="ghost"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Blogs
                        </Button>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {isEditMode ? "Edit Blog Post" : "New Blog Post"}
                        </h2>
                    </div>
                    <Button
                        onClick={handleSaveBlog}
                        className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {isEditMode ? "Update" : "Publish"}
                    </Button>
                </div>

                {/* Main editor area */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Editor content - Word-like */}
                    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
                        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-12 min-h-full">
                            {/* Title input */}
                            <input
                                type="text"
                                placeholder="Blog Title"
                                value={blogTitle}
                                onChange={(e) => setBlogTitle(e.target.value)}
                                className="w-full text-4xl font-bold border-none outline-none mb-6 placeholder-gray-300"
                            />

                            {/* Quill Editor */}
                            <div className="prose prose-lg max-w-none">
                                <QuillEditor
                                    data={blogContent}
                                    onChange={(data) => setBlogContent(data)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right sidebar - Metadata */}
                    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Blog Settings</h3>

                        <div className="space-y-6">
                            {/* Cover Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cover Image *
                                </label>
                                {blogImagePreview && (
                                    <div className="relative mb-3">
                                        <img
                                            src={blogImagePreview}
                                            alt="Cover preview"
                                            className="w-full h-40 object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={() => {
                                                setBlogImage(null)
                                                setBlogImagePreview(null)
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Short Description *
                                </label>
                                <textarea
                                    placeholder="Brief description for blog list"
                                    value={blogDesc}
                                    onChange={(e) => setBlogDesc(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                                    rows={4}
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL Slug
                                </label>
                                <input
                                    type="text"
                                    placeholder="auto-generated"
                                    value={blogSlug}
                                    onChange={(e) => setBlogSlug(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    /blogs/{blogSlug || "slug"}
                                </p>
                            </div>

                            {/* Template */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Template
                                </label>
                                <select
                                    value={blogTemplate}
                                    onChange={(e) => setBlogTemplate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                >
                                    <option value="classic">Classic Layout</option>
                                    <option value="modern">Modern (Hero)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Blog list view
    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold mb-1">
                        <span className="text-slate-900">Manage </span>
                        <span className="text-purple-600">Blogs</span>
                    </h2>
                    <p className="text-slate-600 text-sm">Create, edit, and manage your blog posts</p>
                </div>
                <Button
                    onClick={openNewBlog}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    New Blog Post
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                    <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="relative h-48 w-full">
                            <img
                                src={blog.imageUrl || "/placeholder.svg"}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2">
                                <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                                    {blog.template === "modern" ? "Modern" : "Classic"}
                                </span>
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <h3 className="text-xl font-bold mb-2 line-clamp-1" title={blog.title}>
                                {blog.title}
                            </h3>
                            <p className="text-slate-600 text-sm mb-4 line-clamp-3" title={blog.description}>
                                {blog.description}
                            </p>

                            <div className="flex items-center justify-between mt-4 border-t pt-4">
                                <a
                                    href={`/blogs/${blog.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
                                >
                                    View Blog
                                    <ExternalLink className="h-3 w-3" />
                                </a>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditBlog(blog)}
                                        className="h-8 w-8 p-0"
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4 text-amber-500" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteBlog(blog.id)}
                                        className="h-8 w-8 p-0 hover:bg-red-50"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {blogs.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No blog posts found. Create your first blog post!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ManageBlogs
