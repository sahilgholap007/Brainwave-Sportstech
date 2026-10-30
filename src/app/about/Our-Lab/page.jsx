"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaBriefcase, FaGraduationCap, FaFlask, FaAward } from "react-icons/fa";

export default function TechVisionary() {
  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-in-out", once: true });
  }, []);

  const handleSmoothScroll = (e) => {
    e.preventDefault();
    const target = document.getElementById("learn-more");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const timelineData = [
    {
      year: "2025",
      role: "Co-Founder and Director",
      company: "Brainwave SportsTech, Mumbai, India",
      description: (
        <p>
          Established Asia’s first-ever and World’s third pickleball equipment testing and
          certification laboratory for All India Pickleball Association (AIPA). Inaugurated
          on 27th January 2025, this facility is the first of its kind in India and the only
          laboratory in the world exclusively dedicated to pickleball equipment testing
          under different climatic conditions. It aims to reduce India's dependency on US-based certification bodies and to help Indian sports equipment manufacturers in
          research, quality assurance needed to enter into international market and ensure
          that the equipment comply with U-WPF equipment standards.
        </p>
      ),
      icon: <FaAward />
    },
    {
      year: "2024",
      role: "Co-Founder and Technical Director (Board of Directors and Stakeholder)",
      company: "Inderr Renewable Energy Pvt. Ltd, Bhopal, India",
      description: (
        <p>
          Responsible for erection, commissioning and execution of 3 TPD Lithium Ion
          Battery (LIB) recycling plant at Bhopal, India. This is a Greenfield Project with
          both mechanical and hydrometallurgy lines. Company aims to recover and secure
          critical minerals for manufacture of new LIBs from end-of-the-life (spent) LIBs to
          foster sustainable and circular ecosystem.
        </p>
      ),
      icon: <FaBriefcase />
    },
    {
      year: "2023",
      role: "Executive Vice-President (International Equipment Certification)",
      company: "Unified World Pickleball Federation (UWPF) Inc., Chevy Chase, Washington, USA",
      description: (
        <p>
          Working as global head of international equipment certification for pickleball
          sport equipment (polymeric and composite materials) for 79 member countries
          and 92 organizations. Oversee designing of equipment standards, test methods,
          SOPs, QC/QA lab setup and certification for equipment manufactured globally to
          ensure that sport equipment used in professional tournaments are of high quality,
          safe, and conducive to fair and competitive play. Directly reporting to BOD. This
          is a work from home position.
        </p>
      ),
      icon: <FaAward />
    },
    {
      year: "2021",
      role: "Technical Advisor",
      company: "All India Pickleball Association (AIPA), Mumbai, India",
      description: (
        <p>
          Worked on development of test methods, procedures and establishing advanced
          state-of-the-art testing and certification facility for testing paddles and pickleball
          as per Indian climatic conditions. Developed Testing Manual for AIPA.
        </p>
      ),
      icon: <FaFlask />
    },
    {
      year: "2020",
      role: "Research Co-Guide and Thesis Advisor",
      company: "Department of Chemistry, University of Mumbai, India",
      description: (
        <div className="space-y-4">
          <p>Guiding five PhD scholars for their doctoral thesis in the following areas of research:</p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
            <li>Li-ion battery recycling for circular and sustainable battery technology.</li>
            <li>Self-healing polyurethane-urea coatings with invisible QR code for aerospace applications (a DRDO project).</li>
            <li>Synthesis of UV curable polyurethane coatings from bio-renewable polyols using thiol-ene click chemistry.</li>
            <li>Novel non-yellowing styrene acrylic emulsions for exterior white paints.</li>
            <li>Nanotechnology based antiviral coatings for PPE and N95 masks.</li>
          </ul>
          <div className="pt-2">
            <strong>Research Collaborators:</strong>
            <p className="text-sm mt-1">Prof. Quinn Quio (Syracus University, USA) and Prof. V R Patil (National Center for Nanosciences and Nanotechnology, University of Mumbai), Dr Kiran Kumar Centre for Cell & Molecular Biology (CCMB), Naval Materials Research Laboratory (NMRL) and Defence Research & Development Organization (DRDO), Government of India.</p>
          </div>
        </div>
      ),
      icon: <FaGraduationCap />
    },
    {
      year: "2019-2022",
      role: "Head of R&D (Swachh Urja Alliance LLP)",
      company: "Swachh Urja Alliance LLP, Mumbai, India",
      description: (
        <p>
          Headed R&D function of Startup Company. Developed sustainable and scalable
          methods of urban mining (recycling) of Li-ion batteries. Worked on synthesis of
          wonder nanomaterial graphene, graphene oxide (GO) and reduced graphene oxide
          (rGO) from virgin and recycled graphite. Developed applications of these
          nanomaterials in coatings, high performance concrete, polymer masterbatches,
          composites, batteries and supercapacitors.
        </p>
      ),
      icon: <FaFlask />
    },
    {
      year: "2014-2019",
      role: "Senior Technical Consultant",
      company: "Harlequin Paints Pvt. Ltd., India",
      description: (
        <p>
          Worked at senior management level directly reporting to owners and directors of
          the company. I was responsible for revamping the entire polyurethane product
          range of the company to meet market challenges and competitor’s products.
        </p>
      ),
      icon: <FaBriefcase />
    },
    {
      year: "2008-2014",
      role: "PhD Chemistry (Integrated)",
      company: "University of Mumbai, India",
      description: (
        <p>
          Successfully completed a PhD in Chemistry (Integrated) from the University of Mumbai, laying the foundation for advanced research and technological innovation.
        </p>
      ),
      icon: <FaGraduationCap />
    },
    {
      year: "2000-2008",
      role: "Senior Paint Technologist",
      company: "PAINTTECH Consultants, India",
      description: (
        <p>
          Worked as team lead on several key projects and developed many innovative,
          customized products (coatings) for clientele of PAINTTECH. Closely worked
          with over 20 SSI units across India as Head (Technical Services) and dealt with
          all customer services and trouble-shooting assignments efficiently and
          confidently. Direct reporting to owner of the company.
        </p>
      ),
      icon: <FaBriefcase />
    }
  ];

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-slate-100">
      <main className="w-full relative">
        

        {/* About Dr. Sunil Peshane Section (Hero) */}
        <section className="relative pt-24 pb-20 md:pt-24 md:pb-32 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('/images/about/LAB/A.jpeg')` }}>
          {/* Heavy Light Overlay to create the light theme over the image */}
          <div className="absolute inset-0 bg-white/90 z-0" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/80 to-[#f39c12]/10 z-0" />
          
          {/* Grid pattern for high-tech feel */}
          <div className="absolute inset-0 opacity-[0.05] z-0" style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          {/* Decorative Geometric Shapes */}
          <div className="absolute top-0 right-0 -mt-32 -mr-32 w-[600px] h-[600px] rounded-full border-[80px] border-[#f39c12]/5 z-0 pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-[400px] h-[400px] rounded-full border-[60px] border-[#2c3e50]/5 z-0 pointer-events-none" />
          
          {/* Glowing orbs to add life */}
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-[#f39c12]/30 rounded-full blur-[100px] z-0 animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#3498db]/20 rounded-full blur-[100px] z-0 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
            {/* Image Side */}
            <div className="relative group" data-aos="fade-right">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square md:aspect-[4/5] max-w-md mx-auto lg:mx-0 border border-slate-200">
                <Image
                  src="/images/sp-sir-photo.avif"
                  alt="Dr. Sunil Peshane"
                  width={500}
                  height={600}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Subtle inner shadow overlay */}
                <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none" />
              </div>
              
              {/* Decorative elements around image */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border-2 border-[#f39c12] rounded-3xl opacity-60 -z-10 group-hover:-translate-x-2 group-hover:translate-y-2 transition-transform duration-500 hidden sm:block" />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-[#f39c12] to-[#e67e22] rounded-full opacity-30 blur-2xl -z-10" />
            </div>
            
            {/* Text Side */}
            <div data-aos="fade-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 mb-6 backdrop-blur-sm shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#f39c12] animate-pulse"></span>
                <span className="text-slate-600 font-bold tracking-wide text-sm uppercase">Our Tech Visionary</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#2c3e50] mb-6 leading-[1.1]">
                Dr. Sunil <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f39c12] to-[#e67e22]">Peshane</span>
              </h2>
              
              <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
                <p>
                  <strong className="text-[#2c3e50] font-semibold">Dr. Sunil Peshane</strong> is the Co-Founder and Director of Brainwave SportsTech, and a distinguished leader in materials science, sports technology, and renewable energy. With a Ph.D. in Chemistry from the University of Mumbai, he has dedicated over two decades to pioneering research, technical innovation, and industry leadership.
                </p>
                <p>
                  His extensive expertise spans from revolutionizing pickleball equipment certification globally with the Unified World Pickleball Federation (UWPF) to advancing sustainable lithium-ion battery recycling. A visionary in both industry and academia, Dr. Peshane continues to shape the future of sports equipment standards and sustainable technologies on a global scale.
                </p>
              </div>
              
              {/* Stats Highlights */}
              <div className="mt-10 flex flex-wrap gap-6 sm:gap-8">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-[#2c3e50]">25+</span>
                  <span className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-bold">Years Experience</span>
                </div>
                <div className="w-px h-12 bg-slate-200 hidden sm:block self-center"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-[#2c3e50]">Ph.D.</span>
                  <span className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-bold">Chemistry</span>
                </div>
                <div className="w-px h-12 bg-slate-200 hidden sm:block self-center"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-[#2c3e50]">Global</span>
                  <span className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-bold">Impact</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Interview Section */}
        {false && (
        <section className="bg-slate-50 py-16 md:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 relative z-10">
            <div className="text-center mb-12" data-aos="fade-up">
              <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Watch the Interview</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3">
                Insights from the <span className="text-[#f39c12]">Technical Director</span>
              </h2>
            </div>

            <div className="max-w-4xl mx-auto relative group" data-aos="zoom-in">
              {/* Video Container with Aspect Ratio */}
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white group-hover:shadow-[#f39c12]/20 transition-all duration-500">
                {/* Replace with actual video link when provided */}
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Placeholder URL
                  title="Technical Director Interview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              
              {/* Decorative background for video */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#f39c12]/10 to-[#3498db]/10 rounded-[2.5rem] -z-10 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            <div className="mt-12 text-center" data-aos="fade-up">
              <p className="text-gray-600 text-lg max-w-2xl mx-auto italic">
                "Our mission is to bring global standards to local manufacturers, 
                ensuring every player has access to high-quality, safe equipment."
              </p>
            </div>
          </div>
        </section>
        )}

        {/* Professional Timeline Section */}
        <section className="bg-white py-16 md:py-24 relative overflow-hidden" id="learn-more">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f39c12]/5 rounded-full blur-3xl" />
          
          <div className="max-w-5xl mx-auto px-8 relative z-10">
            <div className="text-center mb-16" data-aos="fade-up">
              <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Professional Journey</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3">
                Experience & <span className="text-[#f39c12]">Milestones</span>
              </h2>
            </div>

            <div className="relative md:border-l-4 border-[#f39c12]/20 md:ml-8 lg:ml-12 space-y-8 md:space-y-12 pb-8">
              {timelineData.map((item, index) => (
                <div key={index} className="relative md:pl-12" data-aos="fade-up" data-aos-delay={(index % 4) * 100}>
                  {/* Timeline Dot (Desktop only) */}
                  <div className="hidden md:flex absolute -left-[26px] top-0 w-12 h-12 bg-white border-4 border-[#f39c12] rounded-full items-center justify-center text-[#f39c12] text-lg shadow-lg z-10">
                    {item.icon}
                  </div>
                  
                  {/* Content Card */}
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 md:gap-2">
                      <div className="flex items-start gap-4 md:gap-0">
                        {/* Mobile Icon */}
                        <div className="md:hidden w-12 h-12 shrink-0 bg-white border-2 border-[#f39c12] text-[#f39c12] rounded-full flex items-center justify-center text-lg shadow-sm">
                          {item.icon}
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-[#2c3e50] group-hover:text-[#f39c12] transition-colors pt-2 md:pt-0">
                          {item.role}
                        </h3>
                      </div>
                      <span className="inline-block px-4 py-1.5 bg-[#f39c12]/10 text-[#f39c12] font-bold rounded-full text-sm self-start md:self-auto whitespace-nowrap">
                        {item.year}
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-slate-700 mb-4 flex items-start md:items-center gap-2">
                      <svg className="w-5 h-5 text-slate-400 shrink-0 mt-1 md:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      <span className="leading-tight md:leading-normal">{item.company}</span>
                    </div>
                    <div className="text-gray-600 leading-relaxed">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-slate-900 py-20 relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/home/BSAphotos/J.avif"
              alt="Contact Background"
              fill
              className="object-cover opacity-30"
            />
          </div>
          <div className="max-w-7xl mx-auto px-8 text-center relative z-10" data-aos="fade-in">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              Get in <span className="text-[#f39c12]">Touch</span>
            </h2>
            <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto mb-10">
              Have questions about our testing services or consulting? Contact us today to
              learn more.
            </p>
            <div className="mt-8">
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

      </main>
    </div>
  );
}
