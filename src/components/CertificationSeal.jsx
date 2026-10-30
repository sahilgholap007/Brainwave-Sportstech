"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";

const CertificationSeal = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Animation values - 360 Spin from Right to Left
  const rotateY = useTransform(scrollYProgress, [0.1, 0.9], [0, -360]);
  const scale = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0.8, 1.1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0]);

  const coreValues = [
    { text: "Impartiality", x: "-20%", y: "-40%", delay: 0.2 },
    { text: "Accuracy", x: "25%", y: "0%", delay: 0.4 },
    { text: "Innovation", x: "-10%", y: "50%", delay: 0.6 },
  ];

  // Helper to generate coin thickness layers
  const thicknessLayers = Array.from({ length: 12 }).map((_, i) => i);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[70vh] bg-slate-900 py-16 overflow-hidden flex flex-col items-center justify-center"
    >
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#f39c12_1px,transparent_1px)] [background-size:30px_30px]" />

      <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-12">
        
        {/* Text Content */}
        <div className="w-full lg:w-1/2 text-left space-y-6 order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-black italic uppercase text-white tracking-tight leading-tight mb-4">
              The <span className="text-[#f39c12]">Gold Standard</span> <br/> of Trust
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              The Brainwave Certification Seal is more than a sticker. It represents rigorous laboratory testing and the highest safety standards in professional pickleball.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm"
            >
              <h4 className="text-[#f39c12] font-bold uppercase text-xs mb-1">For Manufacturers</h4>
              <p className="text-xs text-slate-300">Validate innovation with AIPA-recognized reports.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm"
            >
              <h4 className="text-[#f39c12] font-bold uppercase text-xs mb-1">For Players</h4>
              <p className="text-xs text-slate-300">Play with confidence knowing it meets peak specs.</p>
            </motion.div>
          </div>
        </div>

        {/* 3D Spinning Medal Section */}
        <div className="w-full lg:w-1/2 flex justify-center items-center order-1 lg:order-2 perspective-2000 relative">
          
          {/* THE MEDAL (Rotates) */}
          <motion.div 
            style={{ rotateY, scale, opacity, transformStyle: "preserve-3d" }}
            className="relative w-48 h-48 md:w-64 md:h-64"
          >
            {/* Holographic Glow behind the coin */}
            <div className="absolute inset-0 bg-[#f39c12] rounded-full blur-[60px] opacity-20" style={{ transform: "translateZ(-40px)" }} />
            
            {/* THICKNESS LAYERS (Coin Edge) */}
            {thicknessLayers.map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border border-amber-600/50 bg-[#c07800]"
                style={{ 
                  transform: `translateZ(${i - 6}px)`,
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)"
                }}
              />
            ))}

            {/* FRONT FACE (Medal Design) */}
            <div className="absolute inset-0 w-full h-full rounded-full border-4 border-[#f39c12] bg-gradient-to-br from-[#f39c12] via-[#ffb944] to-[#925a00] shadow-2xl flex items-center justify-center overflow-hidden backface-hidden" style={{ transform: "translateZ(6px)" }}>
              {/* Primary Metallic Shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-black/30" />
              
              {/* Dynamic Glare Sweep (Infinite Animation) */}
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -rotate-45 animate-[shimmer_3s_infinite]" />

              {/* Specular Sparkle Points */}
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full blur-[2px] animate-pulse" />
              <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-white rounded-full blur-[1px] animate-pulse delay-700" />
              
              <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.3),transparent)] animate-[spin_6s_linear_infinite]" />
              
              <div className="relative z-10 text-center p-6 border-2 border-white/40 rounded-full w-[90%] h-[90%] flex flex-col items-center justify-center bg-black/10 backdrop-blur-[2px]">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full mb-3 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-[#f39c12]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-white text-base md:text-xl font-black italic uppercase tracking-tighter drop-shadow-lg">Brainwave</h3>
                <p className="text-white font-bold text-[8px] md:text-[10px] tracking-[0.2em] uppercase opacity-90">Compliant Lab</p>
              </div>
            </div>

            {/* BACK FACE */}
            <div className="absolute inset-0 w-full h-full rounded-full border-4 border-[#f39c12] bg-gradient-to-br from-[#925a00] via-[#ffb944] to-[#f39c12] shadow-2xl flex items-center justify-center overflow-hidden backface-hidden" style={{ transform: "rotateY(180deg) translateZ(6px)" }}>
              <div className="absolute inset-0 bg-[conic-gradient(from_180deg,transparent,rgba(255,255,255,0.3),transparent)] animate-[spin_6s_linear_infinite]" />
              
              {/* Backside Glare (Infinite Animation) */}
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -rotate-45 animate-[shimmer_3s_infinite]" />

              <div className="relative z-10 text-center p-6 border-2 border-white/40 rounded-full w-[90%] h-[90%] flex flex-col items-center justify-center bg-black/10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full mb-3 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-[#f39c12]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-white text-base md:text-xl font-black italic uppercase tracking-tighter drop-shadow-lg">Brainwave</h3>
                <p className="text-white font-bold text-[8px] md:text-[10px] tracking-[0.2em] uppercase opacity-90">Compliant Lab</p>
              </div>
            </div>
          </motion.div>

          {/* CORE VALUES (Fixed, Outside the Rotating Div to prevent mirroring) */}
          <div className="absolute inset-0 pointer-events-none">
            {coreValues.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: val.delay, duration: 0.5 }}
                style={{ 
                  left: `calc(50% + ${val.x})`, 
                  top: `calc(50% + ${val.y})`,
                  x: "-50%",
                  y: "-50%",
                  scale // Link scale to medal's scale
                }}
                className="absolute bg-white/10 backdrop-blur-md border border-[#f39c12]/30 px-3 py-1.5 rounded-full hidden md:block z-50 whitespace-nowrap"
              >
                <span className="text-white text-[10px] font-black uppercase italic tracking-widest">{val.text}</span>
              </motion.div>
            ))}
          </div>

        </div>
      </div>

      <style jsx>{`
        .perspective-2000 {
          perspective: 2000px;
        }
        @keyframes shimmer {
          0% { transform: translateX(-150%) rotate(-45deg); }
          100% { transform: translateX(150%) rotate(-45deg); }
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
    </section>
  );
};

export default CertificationSeal;
