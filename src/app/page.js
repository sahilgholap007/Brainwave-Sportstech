"use client";
import AboutUs from "@/components/AboutUs";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Carousel from "../components/Carousel";
import React, { useState, useEffect, useRef } from "react";
import Flowchart from "@/components/Flowchart";
import Downloads from "@/components/Downloads";
import Scroller from "@/components/Scroller";
import banner from "../../public/images/banner.png";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import PickleballVolley from "@/components/PickleballVolley";
import CertificationSeal from "@/components/CertificationSeal";

import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/firebaseconfig";

export default function Home() {
  const [user, setUser] = useState(null);
  const [dynamicLogos, setDynamicLogos] = useState([]);
  const servicesRef = useRef(null);
  const ctaRef = useRef(null);

  const { scrollYProgress: ctaScrollY } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"],
  });

  const ctaBgY = useTransform(ctaScrollY, [0, 1], ["-15%", "15%"]);

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Ensure this runs only in the browser
    if (typeof window !== "undefined") {
      const storedUser = window.localStorage.getItem("user");
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const q = query(
          collection(db, "companyLogos"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedLogos = querySnapshot.docs.map((doc) => ({
          src: doc.data().imageUrl,
          alt: doc.data().name,
          width: 150,
          height: 150,
        }));
        setDynamicLogos(fetchedLogos);
      } catch (error) {
        console.error("Error fetching logos:", error);
      }
    };

    fetchLogos();
  }, []);

  const items = [...dynamicLogos];
  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-slate-100">
      {/* Main Content */}
      <main className="w-full relative">
        <Carousel onLearnMoreClick={scrollToServices} />

        {/* Valued Customers Section - Sleek Strip */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="py-12 bg-white border-b border-gray-100"
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 border-l-4 border-[#f39c12] pl-4">
                Trusted by Industry Leaders
              </h2>
            </div>

            <div className="w-full opacity-80 mb-8">
              <Scroller
                items={items}
                speed="slow"
                direction="left"
                key={items.length}
              />
            </div>

            {/* Section Heading for Buttons */}
            <div className="text-center mb-6 mt-8 border-t border-gray-100 pt-8">
              <h3 className="text-lg md:text-xl font-bold text-slate-700">
                View Our Approved Pickleballs and Paddles
              </h3>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/aipa-approved/pickleballs"
                className="group px-6 py-3 text-sm font-bold text-white bg-[#f39c12] rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wider flex items-center gap-2"
              >
                <span>View AIPA Approved Pickleballs</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </Link>
              <Link
                href="/aipa-approved/paddles"
                className="group px-6 py-3 text-sm font-bold text-white bg-[#f39c12] rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wider flex items-center gap-2"
              >
                <span>View AIPA Approved Paddles</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Content Sections with distinctive backgrounds */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white"
        >
          <AboutUs />
        </motion.div>

        <PickleballVolley />

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="bg-slate-100 relative overflow-hidden" 
          ref={servicesRef}
        >
          {/* Subtle background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f39c12]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <ServicesSection />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className=" justify-center items-center flex opacity-90 transition-all duration-500"
        >
          <Image alt="banner" src={banner} className="max-w-full h-auto" />
        </motion.div>
        <CertificationSeal />
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="bg-white"
        >
          <Flowchart />
        </motion.div>

        {/* CTA Section */}
        <motion.section 
          ref={ctaRef}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="py-32 relative overflow-hidden"
        >
          {/* Background Image with True Parallax */}
          <motion.div 
            style={{ y: ctaBgY }}
            className="absolute inset-0 z-0 h-[140%] -top-[20%]"
          >
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: "url('/images/home/BSAphotos/M.avif')" }}
            />
          </motion.div>
          
          {/* Gradient Overlay for professional contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-900/60 z-0" />

          <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
              Ready to Get Certified?
            </h2>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Join the league of professionals. Ensure your equipment meets the highest standards of performance and safety.
            </p>

            <div
              className="flex flex-wrap justify-center gap-6"
              data-aos="fade-up"
            >
              <Link
                href="/forms/pickle-ball-testing"
                className="group relative px-4 py-3 bg-[#f39c12] text-white font-bold text-lg rounded overflow-hidden shadow-lg hover:shadow-[#f39c12]/40 transition-all duration-300"
              >
                <span className="relative z-10 group-hover:tracking-wider transition-all">Apply for Pickleball Ball Testing</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
              <Link
                href="/forms/pickle-ball-paddle-testing"
                className="group relative px-4 py-3 bg-transparent border-2 border-white text-white font-bold text-lg rounded overflow-hidden hover:bg-white hover:text-slate-900 transition-all duration-300"
              >
                <span className="relative z-10">Apply for Paddle Testing</span>
              </Link>
            </div>

          </div>
        </motion.section>
      </main>
    </div>
  );
}
