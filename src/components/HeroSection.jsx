'use client'
import Image from "next/image";
import React, { useState, useEffect } from "react";
import logo from '../../public/images/brand1.avif'

const images = [
    "https://images.unsplash.com/photo-1693142518277-3568e9ec3176?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1604014237744-3c3812b4b3c7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1617098907528-6a99e6302643?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const HeroSection = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
          const newIndex = Math.floor(window.scrollY / window.innerHeight) % images.length;
          setIndex(newIndex);
        };
    
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className="relative min-h-screen w-full bg-gradient-to-b from-[#8e44ad] to-[#986aac] text-white flex items-center gap-10">

            {/* Image Background */}
            <div
                className="w-1/2 h-screen -z-20"
                style={{
                    borderTopLeftRadius: "0",
                    borderTopRightRadius: "100%",
                    borderBottomLeftRadius: "0",
                    borderBottomRightRadius: "100%",
                    backgroundColor: "#ffffff",
                    backgroundImage: `url(${images[index]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            ></div>
            {/* Text Content */}
            <div className="w-1/2 ">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
                    Certified Excellence in Sports Equipment
                </h1>
                <p className="text-lg md:text-xl mb-6 leading-relaxed">
                    Ensure quality and safety with our trusted sports equipment certifications. We help you meet global standards for performance and durability.
                </p>
                <a
                    href="#services"
                    className="inline-block bg-[#f39c12] text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-[#8e44ad] transition-transform transform hover:scale-105 duration-300 hover:border hover:border-white"
                >
                    Get Certified
                </a>
                 
            </div>
        </section>
    );
};

export default HeroSection;
