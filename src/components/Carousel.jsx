"use client";

import React, { useState, useRef } from "react";
import Slider from "react-slick";
import Image from "next/image";

const Carousel = ({ onLearnMoreClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: false,
    fade: false,
    cssEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    beforeChange: (current, next) => setCurrentSlide(next),
  };

  const slides = [
    {
      title: "Welcome to Brainwave SportsTech",
      content: "Experience cutting-edge solutions for sports technology.",
      bgImage: "/images/home/BSAphotos/W.avif",
      logoimg: "/images/logo.avif",
      logoimgtwo: "/images/brand1.avif",
      href: "/about/Brainwave",
    },
    {
      title: "Testing & Certification",
      content: "Ensuring reliability and performance of sports equipment.",
      bgImage: "/images/home/BSAphotos/M.avif",
      logoimg: "/images/logo.avif",
      logoimgtwo: "/images/brand1.avif",
      href: "/services/testing-and-certification",
    },
    {
      title: "Failure Analysis",
      content: "Innovative tools to understand and prevent equipment failure.",
      bgImage: "/images/home/BSAphotos/G.avif",
      logoimg: "/images/logo.avif",
      logoimgtwo: "/images/brand1.avif",
      href: "/services/failure-analysis",
    },
    {
      title: "Pickleball Court Construction",
      content: "High-quality facilities tailored for professional gameplay.",
      bgImage: "/images/home/D.webp",
      logoimg: "/images/logo.avif",
      logoimgtwo: "/images/brand1.avif",
      href: "/services/construction-and-certification",
    },
    {
      title: "Project Management",
      content:
        "Efficient and effective planning for sports facility development.",
      bgImage: "/images/home/E.webp",
      logoimg: "/images/logo.avif",
      logoimgtwo: "/images/brand1.avif",
      href: "/services/project-management",
    },
  ];

  return (
    <div className="carousel-container">
      <Slider ref={sliderRef} {...settings}>
        {slides.map((slide, index) => (
          <div key={index}>
            <div className="relative h-[55vh] sm:h-[65vh] lg:h-[80vh] overflow-hidden">
              {/* Background Image with Parallax Effect */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out"
                style={{
                  backgroundImage: `url(${slide.bgImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />

              {/* Enhanced Gradient Overlay for Contrast & Visibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-transparent" />
              {/* Content Container */}
              <div className="relative z-10 flex flex-col justify-center items-start h-full px-6 sm:px-12 md:px-16 lg:px-24 text-white">
                <div className="max-w-4xl space-y-4 sm:space-y-6">
                  {/* Logo Section */}
                  <div className="flex flex-row gap-4 items-center mb-4 animate-fade-in-up [animation-delay:100ms] opacity-0 [animation-fill-mode:forwards]">
                    <div className="relative group w-12 h-12 sm:w-20 sm:h-20">
                      <div className="absolute inset-0 bg-[#f39c12]/30 rounded-full blur-xl group-hover:bg-[#f39c12]/50 transition-all duration-300" />
                      <Image
                        className="relative bg-white/95 rounded-full sm:ring-4 shadow-2xl transform group-hover:scale-110 transition-transform duration-300 object-contain p-1"
                        src={slide.logoimg}
                        alt="Brainwave SportsTech Logo"
                        fill
                        priority={index === 0}
                      />
                    </div>
                    <div className="relative group w-12 h-12 sm:w-20 sm:h-20">
                      <div className="absolute inset-0 bg-[#f39c12]/30 rounded-full blur-xl group-hover:bg-[#f39c12]/50 transition-all duration-300" />
                      <Image
                        className="relative bg-white/95 rounded-full sm:ring-4 shadow-2xl transform group-hover:scale-110 transition-transform duration-300 object-contain p-1"
                        src={slide.logoimgtwo}
                        alt="AIPA Logo"
                        fill
                        priority={index === 0}
                      />
                    </div>
                  </div>

                  {/* Title with "Sporty" Style */}
                  <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-7xl font-black italic uppercase tracking-tight leading-[1.1] animate-fade-in-up [animation-delay:300ms] opacity-0 [animation-fill-mode:forwards] text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                    {slide.title}
                  </h1>

                  {/* Description */}
                  <p className="text-sm sm:text-lg max-w-xl leading-relaxed text-slate-300 font-normal animate-fade-in-up [animation-delay:500ms] opacity-0 [animation-fill-mode:forwards] line-clamp-3 md:line-clamp-none">
                    {slide.content}
                  </p>

                  {/* CTA Button */}
                  <div className="pt-2 sm:pt-4 animate-fade-in-up [animation-delay:700ms] opacity-0 [animation-fill-mode:forwards]">
                    <a
                      href={slide.href}
                      className="group inline-flex items-center gap-2 sm:gap-3 px-6 py-2.5 sm:px-8 sm:py-3.5 bg-gradient-to-r from-[#f39c12] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs sm:text-base font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
                    >
                      <span className="uppercase tracking-wider">Learn More</span>
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>

                  {/* Additional Info Badge */}
                  <div className="flex flex-wrap gap-3 pt-2 animate-fade-in-up [animation-delay:900ms] opacity-0 [animation-fill-mode:forwards]">
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm font-medium">
                      AIPA Certified
                    </div>
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm font-medium">
                      Professional Grade
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 sm:bottom-10 z-20 flex items-center gap-2 sm:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => sliderRef.current?.slickGoTo(index)}
            className={`transition-all duration-300 rounded-full shadow-md ${currentSlide === index
                ? "w-8 sm:w-12 h-2 sm:h-2.5 bg-[#f39c12]"
                : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/50 hover:bg-white/80 cursor-pointer"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style jsx global>{`
        .carousel-container {
          position: relative;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Carousel;


