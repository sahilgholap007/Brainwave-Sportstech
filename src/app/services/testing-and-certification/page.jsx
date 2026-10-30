// pages/pickleball-testing.js

import Head from "next/head";
import Image from "next/image";
import {
  FaShieldAlt,
  FaBolt,
  FaCheckCircle,
  FaTrophy,
  FaClock,
} from "react-icons/fa";

export default function PickleballTesting() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>Pickleball Equipment Testing & Certification</title>
        <meta
          name="description"
          content="Professional Pickleball Equipment Testing & Certification services by Brainwave SportsTech. Ensure compliance, quality, and performance for your pickleball equipment."
        />
      </Head>

      <main>
        {/* Hero Section */}
        <section className="relative bg-cover bg-center text-white pt-20 md:pt-28 pb-24 md:pb-32 min-h-[70vh] flex items-center overflow-hidden"
          style={{
            backgroundImage:
              "url('/images/services/testing-and-certification/A.jpeg')",
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
                Certify Your Pickleball Equipment with <span className="text-[#f39c12]">Confidence</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed">
                Ensure your equipment meets AIPA standards with Brainwave
                SportsTech's industry-leading testing and certification
                services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#f39c12] text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  Get Started
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
                  src="/images/services/testing-and-certification/A.jpeg"
                  alt="Pickleball Testing"
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

        {/* About Service */}
        <section className="py-16 md:py-24 px-6 md:px-12 lg:px-20 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f39c12]/5 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
            <div className="space-y-6">
              <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Our Services</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] leading-tight">
                Comprehensive <span className="text-[#f39c12] relative inline-block">
                  Testing Services
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#f39c12] opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </span>
              </h2>
              <p className="text-gray-700 text-lg leading-7">
                At <strong>Brainwave SportsTech</strong>, we specialize in
                testing and certifying pickleball equipment to meet
                international standards. Our state-of-the-art lab is accredited
                with ISO/IEC 17025 : 2015 standards, ensuring globally reliable
                results.
              </p>
              <p className="text-gray-700 leading-7">
                With our expertise and advanced technology, we deliver fast and
                accurate testing for manufacturers, vendors, and traders,
                enabling them to stay competitive in the market.
              </p>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/home/BSAphotos/W.avif"
                  alt="Pickleball Testing"
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

        {/* Stats Section */}
        <section className="bg-slate-50 py-16 md:py-24 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Our Impact</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-6">
                Trusted by Industry <span className="text-[#f39c12]">Leaders</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaTrophy />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-[#2c3e50] mb-2">500+</h3>
                <p className="text-gray-600">Certified Products</p>
              </div>
              <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaClock />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-[#2c3e50] mb-2">72 Hrs</h3>
                <p className="text-gray-600">Fast Turnaround Time</p>
              </div>
              <div className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaCheckCircle />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-[#2c3e50] mb-2">100%</h3>
                <p className="text-gray-600">Accuracy & Reliability</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 px-6 md:px-12 lg:px-20 bg-white" id="features">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Why Choose Us</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-6">
                Why Choose Our <span className="text-[#f39c12]">Services?</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaShieldAlt />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 text-center group-hover:text-[#f39c12] transition-colors">
                  Compliant Labs
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Accredited lab facilities adhering to global standards.
                </p>
              </div>
              <div className="group p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaBolt />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 text-center group-hover:text-[#f39c12] transition-colors">
                  Fast Turnaround
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Get accurate results within a guaranteed timeframe.
                </p>
              </div>
              <div className="group p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300">
                <div className="w-16 h-16 bg-[#f39c12]/10 rounded-xl flex items-center justify-center text-3xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mx-auto mb-6">
                  <FaCheckCircle />
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 text-center group-hover:text-[#f39c12] transition-colors">
                  Affordable Pricing
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Competitive pricing for all our testing and certification
                  services.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-slate-50 py-16 md:py-24 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Testimonials</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3 mb-6">
                What Our Clients <span className="text-[#f39c12]">Say</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 p-8">
                <p className="text-gray-600 italic mb-6 leading-relaxed">
                  "Brainwave SportsTech helped us certify our new product line in
                  record time. The team is professional and reliable."
                </p>
                <h3 className="text-lg font-bold text-[#2c3e50]">
                  - John D., Manufacturer
                </h3>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 p-8">
                <p className="text-gray-600 italic mb-6 leading-relaxed">
                  "Their testing services gave us the confidence to launch
                  internationally. Highly recommended!"
                </p>
                <h3 className="text-lg font-bold text-[#2c3e50]">
                  - Sarah L., Vendor
                </h3>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 p-8">
                <p className="text-gray-600 italic mb-6 leading-relaxed">
                  "Excellent service with quick turnaround. Brainwave is the best
                  in the business."
                </p>
                <h3 className="text-lg font-bold text-[#2c3e50]">
                  - Raj P., Trader
                </h3>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          className="bg-slate-900 py-20 relative overflow-hidden"
        >
          {/* Abstract background lines */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 L100 0" stroke="white" strokeWidth="0.5" />
              <path d="M20 100 L100 20" stroke="white" strokeWidth="0.5" />
              <path d="M0 80 L80 0" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              Ready to Get Your Equipment <span className="text-[#f39c12]">Tested?</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
              Partner with Brainwave SportsTech for reliable, accurate, and
              affordable pickleball equipment testing and certification.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#f39c12] text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Contact Us
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
