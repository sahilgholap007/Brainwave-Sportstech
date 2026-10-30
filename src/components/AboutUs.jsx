import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";


const AboutUs = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <section className="relative w-full py-20 px-6 md:px-12 lg:px-24 overflow-hidden">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

          {/* Left Section - Image Composition */}
          <div className="w-full lg:w-1/2 relative" data-aos="fade-right">
            <div className="relative h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <div
                className="absolute inset-0 bg-cover bg-center hover:scale-105 transition-transform duration-700"
                style={{
                  backgroundImage: `url("/images/home/BSAphotos/G.avif")`
                }}
              />
              <div className="absolute bottom-8 left-8 z-20 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-1 bg-[#f39c12]" />
                  <span className="text-sm font-bold tracking-widest uppercase">Since 2025</span>
                </div>
                <h3 className="text-2xl font-bold">AIPA's Official Pickleball Equipment Testing Lab</h3>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#f39c12] rounded-full opacity-20 blur-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-600 rounded-full opacity-20 blur-2xl -z-10" />
          </div>

          {/* Right Section - Content */}
          <div className="w-full lg:w-1/2" data-aos="fade-left">
            <h4 className="text-[#f39c12] font-bold tracking-wider uppercase mb-2">Who We Are</h4>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] leading-tight mb-8">
              Pioneering <span className="text-[#f39c12] relative inline-block">
                Precision
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#f39c12] opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </span> in Sports Technology
            </h2>

            <div className="space-y-6 text-lg text-slate-600">
              <p className="leading-relaxed">
                <span className="font-bold text-slate-800">Brainwave SportsTech</span> represents the intersection of science and sport. Based in Mumbai, we operate an <span className="text-slate-800 font-semibold border-b-2 border-[#f39c12]/30">ISO/IEC 17025:2015 compliant laboratory</span> dedicated to ensuring every piece of equipment meets the rigorous demands of professional play.
              </p>
              <p className="leading-relaxed">
                As the authorized testing partner of the <span className="font-bold text-slate-800">All India Pickleball Association (AIPA)</span>, we don't just test; we innovate. From analyzing material composition to validating court surface integrity, our mission is to elevate the game through uncompromised quality and safety.
              </p>
            </div>

            <div className="mt-10">
              <a
                href="/about/Brainwave"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#2c3e50] text-white font-semibold rounded-lg shadow-lg hover:bg-[#f39c12] hover:shadow-[#f39c12]/30 transition-all duration-300 transform hover:-translate-y-1"
              >
                Discover Our Story
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
