"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import React from "react";

const CourtBackground = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.08]">
      {/* Top Court Section */}
      <motion.svg
        style={{ y: y1 }}
        className="absolute top-0 left-0 w-full h-full text-[#f39c12]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Sidelines */}
        <line x1="10" y1="0" x2="10" y2="100" stroke="currentColor" strokeWidth="0.2" />
        <line x1="90" y1="0" x2="90" y2="100" stroke="currentColor" strokeWidth="0.2" />
        
        {/* Kitchen Line */}
        <line x1="10" y1="30" x2="90" y2="30" stroke="currentColor" strokeWidth="0.2" />
        
        {/* Center Line */}
        <line x1="50" y1="30" x2="50" y2="100" stroke="currentColor" strokeWidth="0.2" />
      </motion.svg>

      {/* Bottom Court Section (Moving Opposite) */}
      <motion.svg
        style={{ y: y2 }}
        className="absolute bottom-0 left-0 w-full h-full text-slate-900"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <line x1="10" y1="70" x2="90" y2="70" stroke="currentColor" strokeWidth="0.2" />
        <line x1="50" y1="0" x2="50" y2="70" stroke="currentColor" strokeWidth="0.2" />
      </motion.svg>

      {/* Abstract Grid Dots */}
      <div className="absolute inset-0 bg-[radial-gradient(#f39c12_1px,transparent_1px)] [background-size:40px_40px] opacity-10" />
    </div>
  );
};

export default CourtBackground;
