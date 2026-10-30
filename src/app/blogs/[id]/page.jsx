"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase/firebaseconfig"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import AOS from "aos"
import "aos/dist/aos.css"

export default function BlogDetailPage() {
    const params = useParams()
    const [blog, setBlog] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
        })
    }, [])

    useEffect(() => {
        const fetchBlog = async () => {
            if (!params.id) return

            try {
                setLoading(true)
                const blogDoc = await getDoc(doc(db, "blogs", params.id))

                if (blogDoc.exists()) {
                    setBlog({ id: blogDoc.id, ...blogDoc.data() })
                } else {
                    setError("Blog post not found")
                }
            } catch (err) {
                console.error("Error fetching blog:", err)
                setError("Failed to load blog post")
            } finally {
                setLoading(false)
            }
        }

        fetchBlog()
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading blog post...</p>
                </div>
            </div>
        )
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">{error || "Blog post not found"}</p>
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Blogs
                    </Link>
                </div>
            </div>
        )
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return ""
        const date = new Date(timestamp.seconds * 1000)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const readingTime = (content) => {
        if (!content) return "1 min read"
        const wordsPerMinute = 200
        const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length
        const minutes = Math.ceil(words / wordsPerMinute)
        return `${minutes} min read`
    }

    // Modern Template (Hero Image with overlay)
    if (blog.template === "modern") {
        return (
            <div className="min-h-screen bg-white">
                {/* Hero Section with Image */}
                <div className="relative h-[60vh] min-h-[500px] w-full">
                    <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
                        <div className="max-w-4xl mx-auto">
                            <Link
                                href="/blogs"
                                className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Blogs
                            </Link>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4" data-aos="fade-up">
                                {blog.title}
                            </h1>

                            <p className="text-xl text-white/90 mb-6" data-aos="fade-up" data-aos-delay="100">
                                {blog.description}
                            </p>

                            <div className="flex items-center gap-6 text-white/80 text-sm" data-aos="fade-up" data-aos-delay="200">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(blog.createdAt)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {readingTime(blog.content)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <article
                        className="prose prose-lg max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-700 prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-lg"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                        data-aos="fade-up"
                    />
                </div>
            </div>
        )
    }

    // Classic Template (Standard Layout)
    return (
        <div className="min-h-screen bg-white py-28 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/blogs"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                    data-aos="fade-right"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Blogs
                </Link>

                {/* Header */}
                <header className="mb-8" data-aos="fade-up">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        {blog.title}
                    </h1>

                    <p className="text-xl text-gray-600 mb-6">
                        {blog.description}
                    </p>

                    <div className="flex items-center gap-6 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(blog.createdAt)}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {readingTime(blog.content)}
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                <div className="mb-12" data-aos="fade-up" data-aos-delay="100">
                    <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="w-full h-auto rounded-xl shadow-lg"
                    />
                </div>

                {/* Content */}
                <article
                    className="prose prose-lg max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-700 prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-lg"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                    data-aos="fade-up"
                    data-aos-delay="200"
                />
            </div>
        </div>
    )
}
