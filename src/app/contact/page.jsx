"use client";
import React, { useState, useEffect } from "react";
import { FiMapPin, FiPhone, FiMail, FiSend } from "react-icons/fi";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import Select from "react-select";
import { countryCodes } from "@/data/countryCodes";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+1",
    country: "",
    company: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'phone') {
      value = value.replace(/\D/g, ''); // Restrict to numbers only
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const response = await emailjs.send(
        "service_uy9xuw8",
        "template_d4ej33a",
        formData,
        "htLKTaVPJGNEMcvx7"
      );

      if (response.status === 200) {
        toast.success("Message sent successfully! We'll get back to you soon. 🎉");
        setFormData({
          name: "",
          email: "",
          phone: "",
          country: "",
          company: "",
          message: "",
        });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Email error:", error);
      toast.error("An error occurred. Please try again later.");
    }

    setIsSending(false);
  };

  const inputClasses = (id) => `
    w-full bg-white/60 border-2 rounded-xl px-4 py-3 text-slate-900 
    placeholder-gray-400 focus:outline-none transition-all duration-300 shadow-sm
    ${activeInput === id ? "border-[#f39c12] bg-white shadow-[0_0_15px_rgba(243,156,18,0.15)]" : "border-slate-200 hover:border-slate-300"}
  `;

  const handleCountryCodeChange = (selectedOption) => {
    setFormData({ ...formData, countryCode: selectedOption.value });
  };

  const countryOptions = countryCodes.length > 0
    ? countryCodes.map(item => ({ value: item.code, label: `${item.flag} ${item.code}` }))
    : [{ value: "+1", label: "🇺🇸 +1" }];

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? 'white' : 'rgba(255, 255, 255, 0.6)',
      borderColor: state.isFocused ? '#f39c12' : '#e2e8f0',
      borderRadius: '0.75rem',
      padding: '3px',
      boxShadow: state.isFocused ? '0 0 15px rgba(243,156,18,0.15)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '&:hover': {
        borderColor: state.isFocused ? '#f39c12' : '#cbd5e1',
      },
      minWidth: '110px',
      height: '100%',
      cursor: 'pointer',
      borderWidth: '2px'
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.75rem',
      overflow: 'hidden',
      zIndex: 50,
      width: 'max-content',
      minWidth: '100%'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#f39c12' : state.isFocused ? '#fdf6e3' : 'white',
      color: state.isSelected ? 'white' : '#0f172a',
      cursor: 'pointer'
    }),
    indicatorSeparator: () => ({ display: 'none' }),
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans pt-20">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      {/* Background Image & Overlays */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
        <img
          src="/images/contact/B.png"
          alt="Background"
          className="w-full h-full object-cover opacity-60 blur-xl scale-110"
        />
        <div className="absolute inset-0 bg-slate-50/20" />

        {/* Animated Glow Orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-[#f39c12]/10 rounded-full blur-[1]"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-blue-400/10 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 lg:py-20 max-w-7xl">


        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">

          {/* Left Side: Contact Info & Map */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-5/12 flex flex-col gap-6"
          >
            {/* Info Cards */}
            <div className="bg-white/70 backdrop-blur-xl border border-slate-200 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-grow flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Contact Information</h3>

              <div className="space-y-8">
                <div className="flex items-start gap-5 group/item">
                  <div className="w-14 h-14 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center flex-shrink-0 group-hover/item:bg-[#f39c12]/10 group-hover/item:border-[#f39c12]/30 transition-all duration-300">
                    <FiPhone className="text-2xl text-[#f39c12]" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-bold">Call Us</p>
                    <p className="text-slate-800 text-lg font-bold">+91 749-864-9919</p>
                    <p className="text-slate-800 text-lg font-bold">+91 901-100-9611</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group/item">
                  <div className="w-14 h-14 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center flex-shrink-0 group-hover/item:bg-[#f39c12]/10 group-hover/item:border-[#f39c12]/30 transition-all duration-300">
                    <FiMail className="text-2xl text-[#f39c12]" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-bold">Email Us</p>
                    <a href="mailto:testing@brainwavesportstech.com" className="text-slate-800 text-lg font-bold hover:text-[#f39c12] transition-colors break-all">
                      testing@brainwavesportstech.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-5 group/item">
                  <div className="w-14 h-14 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center justify-center flex-shrink-0 group-hover/item:bg-[#f39c12]/10 group-hover/item:border-[#f39c12]/30 transition-all duration-300">
                    <FiMapPin className="text-2xl text-[#f39c12]" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-bold">Visit Us</p>
                    <p className="text-slate-800 text-base leading-relaxed font-medium">
                      Unit 403-404, Motibhai Smriti Towers<br />
                      Opposite Railway Station, Badlapur (W)<br />
                      PIN 421503, Maharashtra, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Card */}
            <div className="h-64 rounded-3xl overflow-hidden border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group">
              <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
              <iframe
                src="https://maps.google.com/maps?q=Motibhai%20Smriti%20Towers,%20Opposite%20Railway%20Station,%20Badlapur%20(W),%20PIN%20421503,%20Maharashtra,%20India&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Brainwave SportsTech Location"
                className="opacity-90 group-hover:opacity-100 transition-all duration-500"
              ></iframe>
            </div>
          </motion.div>

          {/* Right Side: Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:w-7/12"
          >
            <div className="bg-white/70 backdrop-blur-xl border border-slate-200 p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] h-full relative overflow-hidden">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#f39c12]/10 rounded-full blur-[60px] pointer-events-none" />

              <div className="mb-8 relative z-10">
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                  Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f39c12] to-amber-500">Connect</span>
                </h3>
                <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed">
                  Whether you have a question about testing, our services, or anything else, our team is ready to answer all your questions. We will get back to you within 24 hours.
                </p>
              </div>

              <form onSubmit={sendEmail} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name <span className="text-[#f39c12]">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setActiveInput('name')}
                      onBlur={() => setActiveInput(null)}
                      placeholder="John Doe"
                      className={inputClasses('name')}
                      required
                    />
                  </div>
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email Address <span className="text-[#f39c12]">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setActiveInput('email')}
                      onBlur={() => setActiveInput(null)}
                      placeholder="john@example.com"
                      className={inputClasses('email')}
                      required
                    />
                  </div>
                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Phone Number <span className="text-[#f39c12]">*</span></label>
                    <div className="flex gap-2">
                      <div className="w-[110px] z-20">
                        <Select
                          options={countryOptions}
                          value={countryOptions.find(option => option.value === formData.countryCode) || countryOptions[0]}
                          onChange={handleCountryCodeChange}
                          styles={customSelectStyles}
                          isSearchable={true}
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onFocus={() => setActiveInput('phone')}
                        onBlur={() => setActiveInput(null)}
                        placeholder="5550000000"
                        className={`flex-1 ${inputClasses('phone')}`}
                        required
                      />
                    </div>
                  </div>
                  {/* Country */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Country <span className="text-[#f39c12]">*</span></label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      onFocus={() => setActiveInput('country')}
                      onBlur={() => setActiveInput(null)}
                      placeholder="United States"
                      className={inputClasses('country')}
                      required
                    />
                  </div>
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Company <span className="text-[#f39c12]">*</span></label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    onFocus={() => setActiveInput('company')}
                    onBlur={() => setActiveInput(null)}
                    placeholder="Your Company Name"
                    className={inputClasses('company')}
                    required
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Message <span className="text-[#f39c12]">*</span></label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setActiveInput('message')}
                    onBlur={() => setActiveInput(null)}
                    placeholder="How can we help you?"
                    rows="4"
                    className={`${inputClasses('message')} resize-none`}
                    required
                  ></textarea>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSending}
                  className={`w-full relative overflow-hidden group bg-gradient-to-r from-[#f39c12] to-[#e67e22] text-white py-4 px-8 rounded-xl font-bold text-lg shadow-[0_10px_20px_rgba(243,156,18,0.2)] transition-all duration-300 flex items-center justify-center gap-3 mt-4 ${isSending ? "opacity-70 cursor-not-allowed" : "hover:shadow-[0_15px_30px_rgba(243,156,18,0.3)]"
                    }`}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    {isSending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <FiSend className="text-xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
