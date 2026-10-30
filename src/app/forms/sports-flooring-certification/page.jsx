"use client";
import Downloads from "@/components/Downloads";
import Flowchart from "@/components/Flowchart";
import React, { useState } from "react";

const SportsFlooringStandards = () => {
  const [selectedStandard, setSelectedStandard] = useState("AIPA");

  const standards = {
    AIPA: {
      title: "AIPA Sports Flooring Certification Standards",
      description:
        "The AIPA and Brainwave SportsTech laboratory evaluate sports flooring systems for pickleball playability, shock absorption, slip resistance, and surface durability under international EN, ASTM, and ISO standards.",
      tableData: [
        {
          test: "Shock Absorption (Force Reduction)",
          specimensRequired: 2,
          complianceLimits: "≥ 45% (EN 14904 / ASTM F2772)",
        },
        {
          test: "Vertical Deformation Test",
          specimensRequired: 2,
          complianceLimits: "≤ 3.5 mm (EN 14904 / DIN 18032)",
        },
        {
          test: "Surface Friction & Slip Resistance",
          specimensRequired: 2,
          complianceLimits: "80 ≤ PTV ≤ 110 (Pendulum / BPN)",
        },
        {
          test: "Ball Rebound & Bounce Uniformity",
          specimensRequired: 2,
          complianceLimits: "≥ 90% relative to standard concrete slab",
        },
        {
          test: "Rolling Load Resistance",
          specimensRequired: 2,
          complianceLimits: "No indentation or cracking at 1,500 N",
        },
        {
          test: "Tensile Strength & Tear Resistance",
          specimensRequired: 2,
          complianceLimits: "Compliant with ASTM D412 / EN ISO 527",
        },
      ],
      cards: [
        {
          title: "Shock Absorption & Impact Attenuation",
          description:
            "Evaluates impact absorption to protect players' joints, ligaments, and knees during aggressive lateral movements.",
        },
        {
          title: "Surface Friction & Slip Resistance",
          description:
            "Measures dry and wet traction to ensure optimal grip without risking sudden deceleration or ankle rolling.",
        },
        {
          title: "Ball Bounce Uniformity",
          description:
            "Verifies consistent pickleball rebound height and angle across the entire play surface with zero dead spots.",
        },
        {
          title: "Vertical Deformation & Ergonomics",
          description:
            "Measures floor deflection under player foot strike to ensure proper elasticity and prevent premature player fatigue.",
        },
        {
          title: "Wear Resistance & Weatherability",
          description:
            "Assesses UV stability, abrasion resistance, and layer adhesion for indoor and outdoor sports flooring systems.",
        },
        {
          title: "Submission Guidelines",
          description:
            "Manufacturers must ship two (2) sample specimens measuring 500mm x 500mm each to our Badlapur testing laboratory.",
        },
      ],
      benefits: [
        {
          title: "Player Safety & Injury Prevention",
          description:
            "Certified sports flooring guarantees biomechanical protection, reducing player joint strain and fall impact risks.",
        },
        {
          title: "Commercial & Tournament Endorsement",
          description:
            "AIPA certification qualifies your flooring product for official national tournaments, club facilities, and civic tenders.",
        },
        {
          title: "Quality Assurance & Global Trust",
          description:
            "Demonstrates compliance with international ASTM and EN standards, giving facility developers complete technical confidence.",
        },
      ],
      applyLink: "/forms/sports-flooring-certification/application-form",
    },
  };

  const selectedData = standards[selectedStandard];
  const priceData = [
    { type: "Comprehensive Sports Flooring Certification & Testing", price: 60000 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section 
        className="relative text-white py-20 md:py-32 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `linear-gradient(to bottom right, rgba(15, 23, 42, 0.65), rgba(30, 41, 59, 0.7)), url('/images/home/D.webp')` }}
      >
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-[#f39c12]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-[#f39c12]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Abstract background lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 L100 0" stroke="white" strokeWidth="0.5" />
            <path d="M20 100 L100 20" stroke="white" strokeWidth="0.5" />
            <path d="M0 80 L80 0" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Testing & Certification Standards</span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mt-3 mb-6 leading-tight">
            {selectedData.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            {selectedData.description}
          </p>
          <div className="mt-8">
            <a
              href={selectedData.applyLink}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#f39c12] text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Apply Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16 md:py-24">
        {/* Feature Cards Grid */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedData.cards.map((card, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-[#f39c12]/10 text-[#f39c12] flex items-center justify-center font-bold mb-4">
                  {index + 1}
                </div>
                <h3 className="text-lg font-bold text-[#2c3e50] mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Table */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Pricing</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#2c3e50] mt-3 mb-4">
              Testing & Certification <span className="text-[#f39c12]">Fee</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#2c3e50] text-white">
                    <th className="px-6 py-4 text-left text-sm font-bold">Evaluation Scope</th>
                    <th className="px-6 py-4 text-right text-sm font-bold">Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {priceData.map((row, index) => (
                    <tr key={index} className="bg-white border-b border-slate-100">
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {row.type}
                        <span className="block text-xs text-gray-500 mt-0.5">+ 18% GST (if applicable)</span>
                      </td>
                      <td className="px-6 py-4 text-right text-[#2c3e50] font-bold text-xl">
                        ₹{row.price.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Flowchart */}
        <Flowchart />

        {/* Apply Now Button */}
        <div className="text-center my-16">
          <a
            href={selectedData.applyLink}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#f39c12] text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-lg"
          >
            Apply for Flooring Certification
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Why Get Certified</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#2c3e50] mt-3 mb-4">
              Certification <span className="text-[#f39c12]">Benefits</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {selectedData.benefits.map((benefit, index) => (
              <div
                key={index}
                className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-[#f39c12]/30 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4 group-hover:text-[#f39c12] transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Downloads */}
        <Downloads />
      </div>
    </div>
  );
};

export default SportsFlooringStandards;
