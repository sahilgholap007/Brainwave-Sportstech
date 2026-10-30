import React from 'react'
import FAQ from '@/components/FAQ'

const FAQPage = () => {
  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2c3e50] to-slate-800 text-white py-20 md:py-32 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-[#f39c12]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-[#f39c12]/10 rounded-full blur-3xl" />

        {/* Abstract background lines */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 L100 0" stroke="white" strokeWidth="0.5" />
            <path d="M20 100 L100 20" stroke="white" strokeWidth="0.5" />
            <path d="M0 80 L80 0" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Help Center</span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mt-3 mb-6 leading-tight">
            Frequently Asked <span className="text-[#f39c12]">Questions</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about our testing services, certification process, and more.
          </p>
        </div>
      </section>

      {/* FAQ Component */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <FAQ />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-16 md:py-20 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#2c3e50] mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our team is here to help you with any inquiries.
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
    </div>
  )
}

export default FAQPage