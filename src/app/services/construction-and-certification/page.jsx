import Head from "next/head";
import React from "react";
import { FaCertificate, FaShieldAlt, FaWrench, FaCogs, FaCheckCircle, FaTools } from "react-icons/fa";
import Image from "next/image";

const ConstructionAndCertification = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>Court Construction & Certification | Brainwave SportsTech</title>
        <meta
          name="description"
          content="Professional pickleball court construction and certification services. Ensure your facility meets international safety and quality standards."
        />
      </Head>

      <main>
        {/* Hero Section */}
        <section className="relative bg-cover bg-center text-white pt-20 md:pt-28 pb-24 md:pb-32 min-h-[70vh] flex items-center overflow-hidden"
          style={{
            backgroundImage:
              "url('/images/services/construction-and-certification/A.jpeg')",
          }}
        >
          {/* Enhanced Gradient Overlay */}
         <div className="absolute inset-0 bg-gradient-to-br from-slate-900/75 via-slate-900/60 to-[#2c3e50]/50" />

          {/* Decorative Elements */}
          <div className="absolute top-20 right-10 w-32 h-32 bg-[#f39c12]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-[#f39c12]/10 rounded-full blur-3xl" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:flex lg:items-center gap-12">
            {/* Text Content */}
            <div className="lg:w-1/2 space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
                Build & Certify Your <span className="text-[#f39c12]">Dream Facility</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed">
                Guarantee your court meets the highest standards of safety,
                quality, and playability. Promote your facility as a professional venue.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#f39c12] text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get Certified
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-slate-900 transition-all duration-300"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Hero Image */}
            <div className="lg:w-1/2 mt-12 lg:mt-0 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/services/construction-and-certification/A.jpeg"
                  alt="Court Certification"
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

        {/* About Section */}
        <section className="py-16 md:py-24 px-6 md:px-12 lg:px-20 bg-white relative overflow-hidden" id="features">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f39c12]/5 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
            <div className="space-y-6">
              <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Excellence</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] leading-tight">
                Why <span className="text-[#f39c12] relative inline-block">
                  Certification Matters
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#f39c12] opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </span>
              </h2>
              <p className="text-gray-700 text-lg leading-7">
                Certifying a pickleball court facility ensures it meets the
                highest standards of quality and safety. This certification is
                vital to create a consistent and enjoyable playing experience for
                players of all levels.
              </p>
              <p className="text-gray-700 leading-7">
                Moreover, certification promotes your facility as a professional
                venue, attracting tournaments, leagues, and recreational players.
                Whether it’s for competitions or casual play, a certified facility
                stands out as a reliable and trusted choice.
              </p>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/services/construction-and-certification/B.jpeg"
                  alt="Certification Process"
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

        {/* Features Section */}
        <section className="bg-slate-50 py-16 md:py-24 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Our Standards</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-6">
                What We <span className="text-[#f39c12]">Provide</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaCertificate />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-3">AIPA Certification</h3>
                <p className="text-gray-600">Official certification services to ensure your facility complies with international standards.</p>
              </div>
              <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaShieldAlt />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-3">Safety Standards</h3>
                <p className="text-gray-600">Comprehensive safety checks to protect players and spectators.</p>
              </div>
              <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaWrench />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-3">Equipment Compliance</h3>
                <p className="text-gray-600">Verify that all equipment used meets international quality standards.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-white py-16 md:py-24 px-6 md:px-12 lg:px-20 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#f39c12]/5 rounded-full blur-3xl" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Testimonials</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-6">
                What Our <span className="text-[#f39c12]">Clients Say</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <p className="text-gray-600 italic mb-6 leading-relaxed">
                  "Thanks to Brainwave SportsTech, our facility is now certified and
                  attracting more tournaments than ever before."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f39c12] rounded-full flex items-center justify-center text-white font-bold">S</div>
                  <h3 className="font-bold text-[#2c3e50]">Sarah L., Manager</h3>
                </div>
              </div>
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <p className="text-gray-600 italic mb-6 leading-relaxed">
                  "Their expertise in certification and safety audits made the
                  process effortless for us."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f39c12] rounded-full flex items-center justify-center text-white font-bold">J</div>
                  <h3 className="font-bold text-[#2c3e50]">John P., Owner</h3>
                </div>
              </div>
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <p className="text-gray-600 italic mb-6 leading-relaxed">
                  "The detailed maintenance guidelines they provided have been a
                  game-changer for our facility's upkeep."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f39c12] rounded-full flex items-center justify-center text-white font-bold">R</div>
                  <h3 className="font-bold text-[#2c3e50]">Raj K., Director</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="bg-slate-900 py-20 relative overflow-hidden">
          {/* Abstract Sport Lines Background */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 L100 0" stroke="white" strokeWidth="0.5" />
              <path d="M20 100 L100 20" stroke="white" strokeWidth="0.5" />
              <path d="M0 80 L80 0" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
              Ready to Certify Your <span className="text-[#f39c12]">Facility?</span>
            </h2>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Partner with Brainwave SportsTech to build and certify your
              pickleball facility to the highest standards.
            </p>

            <div className="flex justify-center" data-aos="fade-up">
              <a
                href="/contact"
                className="group relative px-8 py-4 bg-[#f39c12] text-white font-bold text-lg rounded overflow-hidden shadow-lg hover:shadow-[#f39c12]/40 transition-all duration-300"
              >
                <span className="relative z-10 group-hover:tracking-wider transition-all">Contact Us Today</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ConstructionAndCertification;
