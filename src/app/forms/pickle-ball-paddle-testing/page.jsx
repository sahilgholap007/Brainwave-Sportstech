"use client";
import Downloads from "@/components/Downloads";
import Flowchart from "@/components/Flowchart";
import { useState } from "react";

export default function PaddleStandards() {
  const [selectedStandard, setSelectedStandard] = useState("AIPA");

  const standards = {
    AIPA: {
      title: "AIPA Pickleball Paddle Standards",
      description:
        "Explore the rigorous standards set by AIPA to ensure quality, fairness, and consistency in pickleball paddles.",
      tableData: [
        {
          test: "Paddle Dimensions Test",
          paddlesRequired: 2,
          complianceLimits:
            "Length ≤ 17 inch (43.2 cm), Length + Width ≤ 24 inch (61 cm)",
        },
        {
          test: "Paddle Surface Coefficient of Friction Test",
          paddlesRequired: 2,
          complianceLimits: "Average μ ≤ 0.1875",
        },
        {
          test: "Paddle Deflection Test",
          paddlesRequired: 2,
          complianceLimits: "Average Deflection ≤ 0.005 inch (0.127 mm)",
        },
        {
          test: "Paddle Surface Light Reflection/Gloss Test",
          paddlesRequired: 2,
          complianceLimits: "Maximum Gloss ≤ 80 GU",
        },
        {
          test: "Paddle Surface Roughness Test",
          paddlesRequired: 2,
          complianceLimits:
            "Average Rz Reading ≤ 30 μm, Average Rt Reading ≤ 40 μm",
        },
      ],
      cards: [
        {
          title: "Paddle Dimensions Test",
          description:
            "Length ≤ 17 inches (43.2 cm); Length + Width ≤ 24 inches (61 cm). Ensures paddles meet official size specifications for fair play.",
        },
        {
          title: "Surface Coefficient of Friction Test",
          description:
            "Average μ ≤ 0.1875. Measures the paddle's surface grip to ensure consistency in ball control.",
        },
        {
          title: "Paddle Deflection Test",
          description:
            "Average Deflection ≤ 0.005 inches (0.127 mm). Assesses rigidity and resistance to deformation during play.",
        },
        {
          title: "Surface Light Reflection/Gloss Test",
          description:
            "Maximum Gloss ≤ 80 GU. Ensures surfaces do not reflect excessive light that could distract players.",
        },
        {
          title: "Surface Roughness Test",
          description:
            "Average Rz ≤ 30 μm; Average Rt ≤ 40 μm. Evaluates texture to confirm compliance with grip standards.",
        },
        {
          title: "Submission Guidelines",
          description:
            "Manufacturers must submit six identical paddle samples alongside relevant documentation for evaluation.",
        },
      ],
      benefits: [
        {
          title: "Recognition",
          description:
            "AIPA-certified paddles are trusted worldwide by players and organizations.",
        },
        {
          title: "Market Advantage",
          description:
            "Certification highlights your commitment to quality, attracting more customers.",
        },
        {
          title: "Credibility",
          description:
            "Adherence to global standards enhances brand reputation.",
        },
      ],
      applyLink: "pickle-ball-paddle-testing/application-form",
    },
  };

  const selectedData = standards[selectedStandard];
  const priceData = [
    { type: "New", price: 51000 },
    { type: "Resubmission", price: 21000 },
    { type: "Renewal", price: 12000 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section 
        className="relative text-white py-20 md:py-32 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `linear-gradient(to bottom right, rgba(44, 62, 80, 0.45), rgba(30, 41, 59, 0.45)), url('/images/home/BSAphotos/G.avif')` }}
      >


        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Testing Standards</span>
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
        {/* Performance Attributes Table */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Standards</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#2c3e50] mt-3 mb-4">
              Expected Performance <span className="text-[#f39c12]">Attributes</span>
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#2c3e50] text-white">
                    <th className="px-6 py-4 text-left text-sm font-bold">Test</th>
                    <th className="px-6 py-4 text-center text-sm font-bold">
                      Number of Paddles Required (Total 6)
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Compliance Limits</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedData.tableData.map((row, index) => (
                    <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} border-b border-slate-100 hover:bg-[#f39c12]/5 transition-colors`}>
                      <td className="px-6 py-4 text-gray-700 font-medium">{row.test}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 bg-[#f39c12]/10 text-[#f39c12] rounded-full text-sm font-semibold">
                          {row.paddlesRequired}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{row.complianceLimits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Pricing</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#2c3e50] mt-3 mb-4">
              Testing and Certification <span className="text-[#f39c12]">Fees</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#2c3e50] text-white">
                    <th className="px-6 py-4 text-left text-sm font-bold">Certification Fees</th>
                    <th className="px-6 py-4 text-right text-sm font-bold">Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {priceData.map((row, index) => (
                    <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} border-b border-slate-100`}>
                      <td className="px-6 py-4 text-gray-700 font-medium">{row.type}</td>
                      <td className="px-6 py-4 text-right text-[#2c3e50] font-bold text-lg">
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
            Apply Now
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
}
