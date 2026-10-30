import React, { useEffect } from "react";
import { FaCheckCircle, FaSearch, FaFlask, FaBuilding, FaClipboardList } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

const services = [
  {
    title: "Testing & Certification",
    description:
      "ISO/IEC 17025:2015 compliant testing for paddles and Pickleball to ensure they meet AIPA and international standards.",
    icon: <FaCheckCircle />,
    href: "/services/testing-and-certification",
    delay: 0,
  },
  {
    title: "Failure Analysis",
    description:
      "in-depth diagnostic analysis determining root causes of equipment failure to drive future product improvements.",
    icon: <FaSearch />,
    href: "/services/failure-analysis",
    delay: 100,
  },
  {
    title: "R&D Innovation",
    description:
      "Collaborative research and development services to help manufacturers create next-generation sports equipment.",
    icon: <FaFlask />,
    href: "/services/research-and-development",
    delay: 200,
  },
  {
    title: "Court Construction",
    description:
      "Professional-grade court design, construction, and certification ensuring optimal surface performance and safety.",
    icon: <FaBuilding />,
    href: "/services/construction-and-certification",
    delay: 300,
  },
  {
    title: "Project Management",
    description:
      "End-to-end management for sports facility infrastructure projects, from concept to final handover.",
    icon: <FaClipboardList />,
    href: "/services/project-management",
    delay: 400,
  },
];

const ServicesSection = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <section className="w-full py-24 relative z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto" data-aos="fade-up">
          <h2 className="text-sm font-bold text-[#f39c12] uppercase tracking-widest mb-3">
            Our Expertise
          </h2>
          <h3 className="text-2xl sm:text-3xl md:text-6xl font-extrabold text-[#2c3e50] mb-6">
            Comprehensive Solutions for the <br className="hidden md:block" />
            <span className="text-[#f39c12]">Sports Ecosystem</span>
          </h3>
          <p className="text-lg text-slate-500">
            From lab-grade testing to full-scale infrastructure development, we deliver excellence at every stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <a
              key={index}
              href={service.href}
              className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300 flex flex-col items-start"
              data-aos="fade-up"
              data-aos-delay={service.delay}
            >
              {/* Icon Container */}
              <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-2xl text-[#f39c12] group-hover:bg-[#f39c12] group-hover:text-white transition-colors duration-300 mb-6">
                {service.icon}
              </div>

              {/* Content */}
              <h4 className="text-xl font-bold text-[#2c3e50] mb-3 group-hover:text-[#f39c12] transition-colors">{service.title}</h4>
              <p className="text-slate-500 leading-relaxed mb-6 group-hover:text-slate-600">
                {service.description}
              </p>

              {/* Arrow link */}
              <div className="mt-auto flex items-center text-sm font-semibold text-[#f39c12] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Learn More
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>

              {/* Hover Top Border */}
              <div className="absolute top-0 left-0 w-0 h-1 bg-[#f39c12] group-hover:w-full transition-all duration-500 rounded-t-2xl" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
