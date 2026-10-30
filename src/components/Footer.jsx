import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 py-12 border-t border-slate-800 font-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand/About */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white tracking-wide">
              Brainwave <span className="text-[#f39c12]">SportsTech</span>
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              Pioneering precision in sports technology. Authorized AIPA testing center ensuring quality, safety, and performance for every game.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 border-b border-[#f39c12]/30 pb-2 inline-block">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/terms-and-conditions" className="hover:text-[#f39c12] transition-colors duration-300 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#f39c12] rounded-full opacity-0 hover:opacity-100 transition-opacity"></span>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/shipping-and-delivery-policy" className="hover:text-[#f39c12] transition-colors duration-300 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#f39c12] rounded-full opacity-0 hover:opacity-100 transition-opacity"></span>
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-[#f39c12] transition-colors duration-300 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#f39c12] rounded-full opacity-0 hover:opacity-100 transition-opacity"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cancellation-and-refunds" className="hover:text-[#f39c12] transition-colors duration-300 flex items-center gap-2">
                  <span className="w-1 h-1 bg-[#f39c12] rounded-full opacity-0 hover:opacity-100 transition-opacity"></span>
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 border-b border-[#f39c12]/30 pb-2 inline-block">Contact Us</h3>
            <address className="not-italic space-y-4 text-sm text-slate-400">
              <p className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#f39c12] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>Unit 403-404, Motibhai Smriti Towers, Opposite Railway Station, Badlapur (W), PIN - 421503, Maharashtra, India</span>
              </p>
              <p className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#f39c12] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>+91 749-864-9919 / <br />+91 901-100-9611</span>
              </p>
              <p className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#f39c12] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <a href="mailto:enquiry@brainwavesportstech.com" className="hover:text-white transition-colors">enquiry@brainwavesportstech.com</a>
              </p>
            </address>
          </div>

          {/* Social Links - Enabled & Styled */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 border-b border-[#f39c12]/30 pb-2 inline-block">Connect With Us</h3>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#1877F2] hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg">
                <FaFacebookF size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-gradient-to-tr hover:from-[#fd5949] hover:to-[#d6249f] hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg">
                <FaInstagram size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#0077b5] hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg">
                <FaLinkedinIn size={18} />
              </a>
            </div>
            <p className="mt-6 text-xs text-slate-500">
              Stay updated with the latest in sports tech innovation.
            </p>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-slate-800 mt-12 pt-8 text-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} <span className="text-white font-medium">Brainwave SportsTech</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
