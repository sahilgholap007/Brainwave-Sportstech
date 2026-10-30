"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaTrophy, FaUsers, FaAward, FaHandshake, FaGraduationCap, FaGlobe } from "react-icons/fa";

export default function AboutAIPA() {
  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-in-out", once: true });
  }, []);

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-slate-50">
      <main className="w-full relative">
        {/* Hero Section */}
        <div
          className="relative bg-cover bg-center text-white pt-20 md:pt-28 pb-24 md:pb-32 text-center overflow-hidden"
          style={{
            backgroundImage: `url('/images/about/AIPA/A.jpeg')`,
          }}
          data-aos="fade-in"
        >
          {/* Enhanced Gradient Overlay */}
         <div className="absolute inset-0 bg-gradient-to-br from-slate-900/75 via-slate-900/60 to-[#2c3e50]/50" />

          {/* Decorative Elements */}
          <div className="absolute top-20 right-10 w-32 h-32 bg-[#f39c12]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-[#f39c12]/10 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center items-center gap-5">
            <div className="mt-10 flex justify-center gap-2" data-aos="zoom-in">
              <Image
                src="/images/brand1.avif"
                alt="AIPA Banner"
                width={250}
                height={250}
                className="rounded-full shadow-2xl shadow-[#f39c12]/30 bg-white p-2 ring-4 ring-[#f39c12]/50"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold drop-shadow-2xl px-8" data-aos="fade-down">
              All India Pickleball Association <span className="text-[#f39c12]">(AIPA)</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg md:text-xl px-8 max-w-3xl leading-relaxed drop-shadow-md" data-aos="fade-up">
              Promoting pickleball as a sport and community across India since
              2008.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <section className="bg-white py-12 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div data-aos="fade-up" data-aos-delay="0">
                <div className="text-3xl md:text-4xl font-bold text-[#2c3e50]">2008</div>
                <div className="text-sm text-slate-600 mt-2">Founded</div>
              </div>
              <div data-aos="fade-up" data-aos-delay="100">
                <div className="text-3xl md:text-4xl font-bold text-[#f39c12]">50+</div>
                <div className="text-sm text-slate-600 mt-2">Tournaments</div>
              </div>
              <div data-aos="fade-up" data-aos-delay="200">
                <div className="text-3xl md:text-4xl font-bold text-[#2c3e50]">UWPF</div>
                <div className="text-sm text-slate-600 mt-2">Partner</div>
              </div>
              <div data-aos="fade-up" data-aos-delay="300">
                <div className="text-3xl md:text-4xl font-bold text-[#f39c12]">India</div>
                <div className="text-sm text-slate-600 mt-2">Nationwide</div>
              </div>
            </div>
          </div>
        </section>

        {/* About AIPA Section */}
        <section className="py-16 md:py-24 px-8 bg-white relative overflow-hidden" data-aos="fade-right">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f39c12]/5 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
            <div>
              <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Who We Are</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-6 leading-tight">
                About the <span className="text-[#f39c12] relative inline-block">
                  AIPA
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#f39c12] opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </span>
              </h2>
              <p className="mt-4 text-gray-700 leading-7 text-lg">
                The <strong>All India Pickleball Association (AIPA)</strong> is
                the governing body of pickleball in India. Founded in 2008 by{" "}
                <strong>Mr. Sunil Valavalkar</strong>, AIPA has been instrumental in
                introducing and popularizing pickleball across the country.
              </p>
              <p className="mt-4 text-gray-700 leading-7">
                Under the mentorship of <strong>Mr. Arvind Prabhoo</strong>, AIPA
                continues to provide opportunities for players through
                tournaments, training, and support, ensuring Indian pickleball
                earns international respect and recognition.
              </p>
            </div>
            <div className="relative" data-aos="fade-left">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/home/BSAphotos/J.avif"
                  alt="AIPA Logo"
                  className="w-full h-auto"
                  layout="responsive"
                  width={16}
                  height={9}
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#f39c12] rounded-2xl opacity-20 -z-10" />
            </div>
          </div>
        </section>

        {/* Mission and Goals Section */}
        <section className="py-16 md:py-24 px-8 bg-slate-50" data-aos="fade-up">
          <div className="max-w-7xl mx-auto text-center">
            <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Our Purpose</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-6">
              Mission and <span className="text-[#f39c12]">Goals</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              AIPA's mission is to nurture and expand the pickleball community
              across India by promoting fair play, providing resources, and
              supporting players at all levels.
            </p>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300" data-aos="zoom-in">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaTrophy />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Promote Growth
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Facilitate tournaments and events to create opportunities for
                  players to showcase their talent.
                </p>
              </div>
              <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300" data-aos="zoom-in" data-aos-delay="100">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaUsers />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Build Community
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Support local organizations and encourage grassroots
                  development of pickleball.
                </p>
              </div>
              <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300" data-aos="zoom-in" data-aos-delay="200">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaAward />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Ensure Standards
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Work with international bodies to maintain fair play and
                  compliance with global standards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="py-16 md:py-24 px-8 bg-white" data-aos="fade-up">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Our Impact</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-6">
                AIPA's <span className="text-[#f39c12]">Achievements</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Over the years, AIPA has been at the forefront of organizing
                events and creating opportunities for players to shine on national
                and international platforms.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300 text-center" data-aos="zoom-in">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaTrophy />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  National Tournaments
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Successfully organized over 50 national-level tournaments.
                </p>
              </div>
              <div className="group p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300 text-center" data-aos="zoom-in" data-aos-delay="100">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaGlobe />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  International Partnerships
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Built strong relationships with UWPF and AFP to strengthen
                  India's global presence.
                </p>
              </div>
              <div className="group p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300 text-center" data-aos="zoom-in" data-aos-delay="200">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaGraduationCap />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Training Programs
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Launched training camps to develop young talent and promote
                  the sport at the grassroots level.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Join AIPA Section */}
        <section className="py-20 px-8 bg-slate-900 relative overflow-hidden" data-aos="fade-in">
          {/* Abstract background lines */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 L100 0" stroke="white" strokeWidth="0.5" />
              <path d="M20 100 L100 20" stroke="white" strokeWidth="0.5" />
              <path d="M0 80 L80 0" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              Join the AIPA <span className="text-[#f39c12]">Movement</span>
            </h2>
            <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto mb-10">
              Be a part of India's growing pickleball community. Whether you're
              a player, coach, or enthusiast, we welcome your participation.
            </p>
            <div className="mt-8">
              <a
                href="https://pickleball.in/"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#f39c12] text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Visit AIPA Website
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
