"use client";
import { motion } from "framer-motion";
import React from "react";

const TechnicalCallout = ({ label, x, y, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, type: "spring" }}
      style={{ top: `${y}%`, left: `${x}%` }}
      className="absolute z-30 flex items-center gap-3 pointer-events-none"
    >
      {/* The Marker Dot */}
      <div className="relative flex items-center justify-center">
        <div className="w-3 h-3 bg-[#f39c12] rounded-full" />
        <div className="absolute w-6 h-6 border border-[#f39c12] rounded-full animate-ping opacity-50" />
      </div>

      {/* The Line & Label */}
      <div className="flex flex-col">
        <div className="h-[1px] w-12 bg-[#f39c12]/50 origin-left scale-x-100" />
        <div className="bg-black/60 backdrop-blur-md border border-white/20 px-2 py-1 rounded-sm">
          <span className="text-[10px] md:text-xs font-mono text-white whitespace-nowrap uppercase tracking-tighter">
            {label}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TechnicalCallout;
