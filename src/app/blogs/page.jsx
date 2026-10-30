"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseconfig";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import ReactMarkdown from "react-markdown";

const BlogPage = () => {
    const [blogs, setBlogs] = useState([]);
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
        });
    }, []);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const blogSnapshot = await getDocs(collection(db, "blogs"));
                const blogList = blogSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setBlogs(blogList);
            } catch (error) {
                console.error("Failed to load blogs:", error);
            }
        };

        fetchBlogs();
    }, []);

    return (
        <div className="min-h-screen bg-white px-4 py-28">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-gray-900 mb-16">
                    Our Insights & Stories
                </h1>

                <div className="space-y-20">
                    {blogs.map((blog, index) => {
                        const isEven = index % 2 === 0;

                        return (
                            <Link
                                key={blog.id}
                                href={`/blogs/${blog.id}`}
                                data-aos="fade-up"
                                className={`flex flex-col-reverse md:flex-row ${!isEven ? "md:flex-row-reverse" : ""} items-center gap-10 group transition duration-300 cursor-pointer`}
                            >
                                <div className="md:w-1/2">
                                    <img
                                        src={blog.imageUrl}
                                        alt={blog.title}
                                        className="rounded-lg w-full h-80 object-cover shadow-md group-hover:shadow-xl transform group-hover:scale-[1.02] transition duration-500 ease-in-out"
                                    />
                                </div>

                                <div className="md:w-1/2 text-center md:text-left">
                                    <p className="text-sm text-gray-500 mb-2">
                                        {blog.createdAt &&
                                            new Date(blog.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                    </p>
                                    <h2 className="text-3xl font-semibold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                                        {blog.title}
                                    </h2>
                                    <p className="text-gray-700 mb-6 text-md leading-relaxed">
                                        {blog.description}
                                    </p>

                                    <span className="inline-flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all text-sm">
                                        Read Full Article
                                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BlogPage;
