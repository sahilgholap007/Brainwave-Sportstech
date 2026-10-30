"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";

const PickleballVolley = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Ball Movement: Horizontal arc with ONE bounce in middle
  const ballX = useTransform(scrollYProgress, [0.1, 0.9], ["5%", "95%"]);
  const ballY = useTransform(
    scrollYProgress,
    [0.1, 0.5, 0.9],
    ["30%", "75%", "30%"] 
  );
  const ballRotate = useTransform(scrollYProgress, [0.1, 0.9], [0, 1080]);
  const ballScale = useTransform(scrollYProgress, [0.1, 0.5, 0.9], [1, 0.8, 1]);

  // Shadow follows ballX but stays at "ground" level (75%)
  const shadowOpacity = useTransform(
    scrollYProgress,
    [0.1, 0.5, 0.9],
    [0.1, 0.6, 0.1]
  );
  const shadowScale = useTransform(
    scrollYProgress,
    [0.1, 0.5, 0.9],
    [0.5, 1.2, 0.5]
  );

  return (
    <section
      ref={containerRef}
      className="relative h-[50vh] bg-slate-900 overflow-hidden flex items-center justify-center"
    >
      {/* Court Grid Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container mx-auto px-4 relative h-full flex items-center justify-center">

        {/* Center Text */}
        <div className="text-center z-10 pointer-events-none">
          <motion.h2 
            style={{ 
              opacity: useTransform(scrollYProgress, [0.15, 0.35], [0, 1]),
              scale: useTransform(scrollYProgress, [0.15, 0.35], [0.8, 1])
            }}
            className="text-5xl md:text-8xl font-black text-white italic uppercase tracking-tight drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          >
            Ultimate <span className="text-[#f39c12] bg-gradient-to-b from-[#f39c12] to-amber-700 bg-clip-text text-transparent px-4">Precision</span>
          </motion.h2>
        </div>



        {/* The Animated Ball */}
        <motion.div
          style={{
            left: ballX,
            top: ballY,
            rotate: ballRotate,
            scale: ballScale,
          }}
          className="absolute w-8 h-8 md:w-14 md:h-14 bg-[#f39c12] rounded-full shadow-[0_0_30px_rgba(243,156,18,0.8)] flex items-center justify-center border-2 border-white/40 overflow-hidden z-20"
        >
          {/* Real Pickleball Holes */}
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black/30 rounded-full" />
            ))}
          </div>
          {/* Shine effect */}
          <div className="absolute top-1 left-1 w-1/2 h-1/2 bg-white/20 rounded-full blur-[2px]" />
        </motion.div>

        {/* Shadow */}
        <motion.div
          style={{
            left: ballX,
            top: "75%",
            opacity: shadowOpacity,
            scaleX: shadowScale,
          }}
          className="absolute w-12 h-3 md:w-20 md:h-4 bg-black/60 rounded-[100%] blur-md z-10"
        />
      </div>

    </section>
  );
};

export default PickleballVolley;
