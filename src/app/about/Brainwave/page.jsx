"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaCheckCircle, FaFlask, FaSearch, FaShieldAlt, FaBalanceScale, FaCog, FaTrophy, FaUserShield, FaHammer } from "react-icons/fa";
import { motion, useScroll, useTransform } from "framer-motion";

export default function AboutBrainwave() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    "/images/about/LAB/A.avif",
    "/images/about/LAB/B.avif",
    "/images/about/LAB/C.avif",
    "/images/about/LAB/D.avif",
    "/images/about/LAB/E.avif",
    "/images/about/LAB/F.avif",
    "/images/about/LAB/G.avif",
    "/images/about/LAB/H.avif",
    "/images/about/LAB/I.avif",
    "/images/about/LAB/J.avif",
    "/images/about/LAB/K.avif",
    "/images/about/LAB/L.avif",
    "/images/about/LAB/M.avif",
    "/images/about/LAB/N.avif",
    "/images/about/LAB/O.avif",
    "/images/about/LAB/P.avif",
    "/images/about/LAB/Q.avif",
    "/images/about/LAB/R.avif",
    "/images/about/LAB/S.avif",
    "/images/about/LAB/T.avif",
    "/images/about/LAB/U.avif",
    "/images/about/LAB/V.avif",
    "/images/about/LAB/W.avif",
    "/images/about/LAB/X.avif",
    "/images/about/LAB/Y.avif"
  ];

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleBackgroundClick = (e) => {
    if (e.target.className.includes("modal-background")) {
      closeModal();
    }
  };

  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-in-out", once: true });
  }, []);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroBgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  const handleSmoothScroll = (e) => {
    e.preventDefault();
    const target = document.getElementById("learn-more");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };


  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-slate-50">
      <main className="w-full relative">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative min-h-[70vh] flex items-center justify-center text-white pt-24 pb-32 overflow-hidden"
        >
          {/* Parallax Background */}
          <motion.div 
            style={{ y: heroBgY, opacity: heroOpacity }}
            className="absolute inset-0 z-0"
          >
            <div 
              className="w-full h-full bg-cover bg-center scale-110"
              style={{ backgroundImage: `url('/images/home/BSAphotos/D.png')` }}
            />
            {/* Professional Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-transparent" />
          </motion.div>

          {/* Technical Grid Overlay */}
          <div className="absolute inset-0 opacity-10 z-0 bg-[radial-gradient(#f39c12_1px,transparent_1px)] [background-size:20px_20px]" />

          <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-white px-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src="/images/logo.avif"
                alt="Brainwave Team"
                width={180}
                height={180}
                className="rounded-full shadow-2xl  mb-8 backdrop-blur-md"
              />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl sm:text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-6 drop-shadow-2xl whitespace-nowrap"
            >
              Brainwave <span className="bg-gradient-to-b from-[#f39c12] via-[#f39c12] to-amber-700 bg-clip-text text-transparent px-1">SportsTech</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base md:text-xl max-w-3xl leading-relaxed text-slate-200 font-medium drop-shadow-md"
            >
              Innovating and ensuring the future of pickleball equipment with <span className="text-[#f39c12]">precision</span> and sustainability.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12 flex flex-wrap justify-center gap-4"
            >
              <a
                href="#learn-more"
                className="inline-flex items-center gap-3 px-10 py-4 bg-[#f39c12] text-white font-bold rounded-full shadow-lg hover:bg-white hover:text-[#f39c12] transition-all duration-300 transform hover:-translate-y-1"
                onClick={handleSmoothScroll}
              >
                Learn More
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
              </a>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-12 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
              <div data-aos="fade-up" data-aos-delay="100">
                <div className="text-3xl md:text-4xl font-bold text-[#f39c12]">ISO</div>
                <div className="text-sm text-slate-600 mt-2">Compliant Lab</div>
              </div>
              <div data-aos="fade-up" data-aos-delay="200">
                <div className="text-3xl md:text-4xl font-bold text-[#2c3e50]">AIPA</div>
                <div className="text-sm text-slate-600 mt-2">Official Partner</div>
              </div>
              <div data-aos="fade-up" data-aos-delay="300">
                <div className="text-3xl md:text-4xl font-bold text-[#f39c12]">24/7</div>
                <div className="text-sm text-slate-600 mt-2">Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Who We Are Section */}
        <section className="bg-white py-16 md:py-24 relative overflow-hidden" data-aos="fade-right" id="learn-more">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f39c12]/5 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
            <div>
              <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">About Us</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-6 leading-tight">
                Who We <span className="text-[#f39c12] relative inline-block">
                  Are
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#f39c12] opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </span>
              </h2>
              <p className="mt-4 text-gray-700 leading-7 text-lg">
                At <strong>Brainwave SportsTech</strong>, we are at the
                forefront of pickleball equipment testing and consulting. Based
                in Mumbai, India, we are the official testing partner for the{" "}
                <strong>All India Pickleball Association (AIPA)</strong>. Our
                focus lies in ensuring safety, durability, performance, and
                sustainability through cutting-edge testing standards.
              </p>
              <p className="mt-4 text-gray-700 leading-7">
                Our ISO 9001:2015 TÜV SÜD-compliant lab adheres to the highest
                standards for quality and impartiality. With a team of
                scientists specializing in chemistry, engineering, and material
                science, we deliver precise and reliable testing solutions.
              </p>
            </div>
            <div className="relative" data-aos="fade-left">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/home/BSAphotos/_DSC1328.avif"
                  alt="Brainwave Lab"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              {/* Decorative corner element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#f39c12] rounded-2xl opacity-20 -z-10" />
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="bg-slate-50 py-16 md:py-24 relative overflow-hidden" data-aos="fade-up">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2c3e50]/5 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
            <div className="order-2 lg:order-1 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/home/BSAphotos/M.avif"
                  alt="Brainwave Team"
                  width={500}
                  height={400}
                  className="w-full h-auto"
                  data-aos="zoom-in"
                />
              </div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#2c3e50] rounded-2xl opacity-10 -z-10" />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-8">
                Why Choose <span className="text-[#f39c12]">Us?</span>
              </h2>
              <ul className="space-y-5 text-gray-700">
                <li className="flex items-start group" data-aos="fade-right">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f39c12]/10 flex items-center justify-center mr-4 group-hover:bg-[#f39c12] transition-colors">
                    <span className="text-[#f39c12] group-hover:text-white transition-colors">✔</span>
                  </div>
                  <span className="pt-1">State-of-the-art lab facilities adhering to ISO standards.</span>
                </li>
                <li className="flex items-start group" data-aos="fade-right" data-aos-delay="100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f39c12]/10 flex items-center justify-center mr-4 group-hover:bg-[#f39c12] transition-colors">
                    <span className="text-[#f39c12] group-hover:text-white transition-colors">✔</span>
                  </div>
                  <span className="pt-1">Team of expert scientists and engineers with proven expertise.</span>
                </li>
                <li className="flex items-start group" data-aos="fade-right" data-aos-delay="200">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f39c12]/10 flex items-center justify-center mr-4 group-hover:bg-[#f39c12] transition-colors">
                    <span className="text-[#f39c12] group-hover:text-white transition-colors">✔</span>
                  </div>
                  <span className="pt-1">Comprehensive services including equipment testing, R&D, and court certification.</span>
                </li>
                <li className="flex items-start group" data-aos="fade-right" data-aos-delay="300">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f39c12]/10 flex items-center justify-center mr-4 group-hover:bg-[#f39c12] transition-colors">
                    <span className="text-[#f39c12] group-hover:text-white transition-colors">✔</span>
                  </div>
                  <span className="pt-1">Commitment to innovation, precision, and sustainability.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Our Expertise Section */}
        <section className="bg-white py-16 md:py-24" data-aos="fade-up">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">What We Do</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-6">
              Our <span className="text-[#f39c12]">Expertise</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive testing and consulting services tailored for the
              pickleball industry.
            </p>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300" data-aos="fade-up">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaCheckCircle />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Equipment Testing
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Rigorous testing of paddles and Pickleballs as per AIPA
                  standards to ensure safety and performance.
                </p>
              </div>
              <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300" data-aos="fade-up" data-aos-delay="100">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaFlask />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Research & Development
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Innovating paddle design, material selection, and eco-friendly
                  manufacturing solutions.
                </p>
              </div>
              <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300" data-aos="fade-up" data-aos-delay="200">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaSearch />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Failure Analysis
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Identifying defects, material weaknesses, and performance
                  issues to deliver robust solutions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction Section (Moved from Lab) */}
        <section className="bg-white py-16 md:py-24 relative overflow-hidden" data-aos="fade-up">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f39c12]/5 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
            <div>
              <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Our Facilities</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-6 leading-tight">
                State-of-the-Art <span className="text-[#f39c12] relative inline-block">
                  Facilities
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#f39c12] opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </span>
              </h2>
              <p className="mt-4 text-gray-700 leading-7 text-lg">
                Our lab, located in Mumbai, India, is proposed to be ISO 9001:2015 TÜV
                SÜD-certified and built to meet the highest global standards for
                sports equipment testing. With cutting-edge technology, we
                ensure that pickleball paddles, Pickleballs, and court materials meet
                rigorous safety, durability, and performance benchmarks.
              </p>
              <p className="mt-4 text-gray-700 leading-7">
                Adhering to <strong>ISO/IEC 17025 : 2015</strong> standards, our
                lab is equipped with advanced tools for material analysis,
                mechanical testing, and environmental testing. We are in the
                process of obtaining accreditation from the National
                Accreditation Board for Testing and Calibration Laboratories
                (NABL), ensuring our commitment to excellence.
              </p>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/home/BSAphotos/7af63c97-911c-4c0d-842a-487c8a3a0d96.avif"
                  alt="Lab Equipment"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#f39c12] rounded-2xl opacity-20 -z-10" />
            </div>
          </div>
        </section>

        {/* Explore Lab Section with Gallery */}
       
        <section className="bg-slate-50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Gallery</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-6">
              Explore Our Lab and <span className="text-[#f39c12]">Equipment</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto mb-12">
              Take a closer look at the technology and facilities that make our
              lab a leader in sports equipment testing.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[150px] sm:auto-rows-[200px] lg:auto-rows-[250px] grid-flow-dense">
              {images.map((imageSrc, index) => {
                let spanClass = "col-span-1 row-span-1";
                const i = index % 12;
                
                // Mix of sizes for a dynamic bento effect
                if (i === 0 || i === 7) spanClass = "col-span-2 row-span-2"; // Large square
                else if (i === 3 || i === 10) spanClass = "col-span-2 row-span-1"; // Wide rectangle
                else if (i === 2 || i === 5) spanClass = "col-span-1 row-span-2"; // Tall rectangle
                
                return (
                  <div
                    key={index}
                    className={`relative group cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 ${spanClass}`}
                    onClick={() => handleImageClick(index)}
                  >
                    <div className="w-full h-full overflow-hidden relative">
                      <Image
                        src={imageSrc}
                        alt={`Lab Image ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-500 ease-in-out transform group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-6 text-left">
                      <span className="text-white font-bold text-lg md:text-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">View Image</span>
                      <span className="text-[#f39c12] text-sm md:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">Click to expand</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
       

        {/* Why Equipment Testing Matters */}
        <section className="bg-white py-16 md:py-24" data-aos="fade-up">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Importance</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-6">
              Why Equipment Testing <span className="text-[#f39c12]">Matters</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto mb-16">
              Ensuring the safety, performance, and durability of pickleball
              equipment is crucial for fair play and player confidence.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaShieldAlt />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Player Safety
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Testing ensures that paddles and Pickleballs can withstand repeated
                  use without breaking or splintering, preventing injuries.
                </p>
              </div>
              <div className="group p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaCheckCircle />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Performance Consistency
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Equipment is tested to perform reliably in various conditions,
                  ensuring a fair and predictable game.
                </p>
              </div>
              <div className="group p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaBalanceScale />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Regulatory Compliance
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Testing certifies that equipment meets standards set by AIPA
                  for professional and tournament use.
                </p>
              </div>
              <div className="group p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaCog />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Quality Control
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Identify design flaws, material weaknesses, or performance
                  issues before products hit the market.
                </p>
              </div>
              <div className="group p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaTrophy />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Fair Competition
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Testing ensures uniformity across equipment, preventing unfair
                  advantages.
                </p>
              </div>
              <div className="group p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaUserShield />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Consumer Confidence
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Rigorous testing builds trust among players, boosting brand
                  loyalty and satisfaction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Testing Services */}
        <section className="bg-slate-50 py-16 md:py-24" data-aos="fade-up">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Services</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-6">
              Our Testing <span className="text-[#f39c12]">Services</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto mb-16">
              From equipment testing to court certification, we offer a
              comprehensive suite of services for the pickleball community.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaCheckCircle />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Equipment Testing
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Testing paddles and Pickleballs for durability, safety, and
                  compliance with AIPA standards.
                </p>
              </div>
              <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaSearch />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Failure Analysis
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Identifying and resolving issues like material degradation,
                  cracks, and performance inconsistencies.
                </p>
              </div>
              <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaTrophy />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Court Certification
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Certifying court surfaces, lighting, and construction quality
                  for competitive play.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Services */}
        <section className="bg-white py-16 md:py-24" data-aos="fade-up">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">More Services</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-6">
              Additional <span className="text-[#f39c12]">Services</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto mb-16">
              Beyond testing and certification, we offer specialized services
              tailored to meet the needs of the pickleball industry.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="group p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaFlask />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Product Research & Development
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Innovating paddle design, material selection, noise reduction,
                  and eco-friendly manufacturing for the future of pickleball.
                </p>
              </div>
              <div className="group p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaHammer />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  Project Management
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  End-to-end management for constructing state-of-the-art indoor
                  and outdoor pickleball courts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-slate-900 py-20 relative overflow-hidden" data-aos="fade-in">
          {/* Abstract background lines */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 L100 0" stroke="white" strokeWidth="0.5" />
              <path d="M20 100 L100 20" stroke="white" strokeWidth="0.5" />
              <path d="M0 80 L80 0" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              Get in <span className="text-[#f39c12]">Touch</span>
            </h2>
            <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto mb-10">
              Ready to elevate your equipment's performance? Contact us today.
            </p>
            <div className="mt-8" >
              <a
                href="/contact"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#f39c12] text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Contact Us
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            </div>
          </div>
        </section>
        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 modal-background"
            onClick={handleBackgroundClick}
          >
            <div className="relative max-w-3xl mx-auto">
              <button
                onClick={closeModal}
                className="absolute top-0 right-0 bg-red-600 text-white px-4 py-2 rounded-full"
              >
                X
              </button>
              <Image
                src={images[currentImageIndex]}
                alt={`Expanded Image ${currentImageIndex + 1}`}
                width={600}
                height={400}
                className="rounded-lg shadow-lg p-3"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
