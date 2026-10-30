import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const Flowchart = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  // Steps data
  const steps = [
    {
      number: "01",
      title: "Explore Services",
      details:
        "Navigate to the 'Services' section to understand our testing and certification offerings.",
    },
    {
      number: "02",
      title: "Select Testing Type",
      details:
        "Choose between Pickleball or Paddle testing based on your certification needs.",
    },
    {
      number: "03",
      title: "Review Guidelines",
      details:
        "Read the comprehensive instructions to ensure your equipment meets submission criteria.",
    },
    {
      number: "04",
      title: "Apply Online",
      details:
        "Click the application button to start your official testing request.",
    },
    {
      number: "05",
      title: "Secure Login",
      details:
        "Sign in to your account to track your application and access reports.",
    },
    {
      number: "06",
      title: "Submit Details",
      details: "Complete the form with accurate product specifications and documentation.",
    },
    {
      number: "07",
      title: "Processing",
      details:
        "Submit your application. Our lab team begins the rigorous testing process.",
    },
  ];

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Line */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f39c12]/20 to-transparent hidden lg:block -translate-y-12" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Process</span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-[#2c3e50] mt-2 mb-6" data-aos="fade-up">
            Your Roadmap to <span className="text-[#f39c12]">Certification</span>
          </h2>
          <p className="text-slate-500 text-lg" data-aos="fade-up" data-aos-delay="100">
            A seamless, transparent journey from application to approval.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative flex flex-col items-center text-center"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              {/* Number Circle */}
              <div className="w-16 h-16 rounded-full bg-white border-4 border-[#f39c12] text-[#f39c12] flex items-center justify-center text-xl font-bold shadow-lg group-hover:bg-[#f39c12] group-hover:text-white transition-all duration-300 mb-6 z-10">
                {step.number}
              </div>

              {/* Connector Line for Mobile/Desktop differentiation visually handled by background but we can add small ones */}
              {index !== steps.length - 1 && (
                <div className="lg:hidden w-1 h-8 bg-slate-200 my-2" />
              )}

              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 w-full hover:shadow-xl transition-all duration-300 min-h-[200px] flex flex-col justify-center">
                <h3 className="text-xl font-bold text-[#2c3e50] mb-3 group-hover:text-[#f39c12] transition-colors">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {step.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Flowchart;
