"use client";
import Downloads from "@/components/Downloads";
import Flowchart from "@/components/Flowchart";
import React, { useState } from "react";

const PickleballStandards = () => {
  const [selectedStandard, setSelectedStandard] = useState("AIPA");

  const standards = {
    AIPA: {
      title: "AIPA Pickleball Ball Standards",
      description:
        "The AIPA ensures that pickleballs meet rigorous quality standards to guarantee consistent performance and reliability. Below are the testing criteria and compliance requirements.",
      tableData: [
        {
          test: "Pickleball Diameter Test",
          ballsRequired: 3,
          complianceLimits: "73 mm ≤ Dₐᵥ₉ ≤ 75.5 mm",
        },
        {
          test: "Pickleball Weight Test",
          ballsRequired: 3,
          complianceLimits: "22.10 g ≤ Wₐᵥ₉ ≤ 26.50 g",
        },
        {
          test: "Pickleball Bounce Test",
          ballsRequired: 5,
          complianceLimits: "75 cm ≤ Bₐᵥ₉ ≤ 85 cm",
        },
        {
          test: "Pickleball Hardness Test",
          ballsRequired: 3,
          complianceLimits: "40 ≤ Hₐᵥ₉ ≤ 50",
        },
        {
          test: "Pickleball Compression Test",
          ballsRequired: 3,
          complianceLimits: "Cₐᵥ₉ ≤ 20 kgf",
        },
      ],
      cards: [
        {
          title: "Pickleball Diameter Test",
          description:
            "Ensures the ball's diameter falls within the range of 73 mm ≤ Dₐᵥ₉ ≤ 75.5 mm for consistent play.",
        },
        {
          title: "Pickleball Weight Test",
          description:
            "Verifies the ball's weight is within 22.10 g ≤ Wₐᵥ₉ ≤ 26.50 g for uniformity in gameplay.",
        },
        {
          title: "Pickleball Bounce Test",
          description:
            "Tests the ball's bounce height, which must be between 75 cm ≤ Bₐᵥ₉ ≤ 85 cm to meet standards.",
        },
        {
          title: "Pickleball Hardness Test",
          description:
            "Ensures the hardness of the Pickleball is within the range 60 ≤ Hₐᵥ₉ ≤ 80 for optimal durability.",
        },
        {
          title: "Pickleball Compression Test",
          description:
            "Measures compression to ensure Cₐᵥ₉ ≤ 20 kgf for consistent performance.",
        },
        {
          title: "Submission Guidelines",
          description:
            "Manufacturers must submit six identical pickleballs alongside relevant documentation for evaluation.",
        },
      ],
      benefits: [
        {
          title: "Consistency in Play",
          description:
            "Certified pickleballs ensure reliable performance and gameplay consistency across matches.",
        },
        {
          title: "Market Advantage",
          description:
            "Certification highlights your product's quality, enhancing customer trust and marketability.",
        },
        {
          title: "Global Recognition",
          description:
            "AIPA-certified pickleballs are trusted by players and organizations worldwide.",
        },
      ],
      applyLink: "pickle-ball-testing/application-form",
    },
  };

  const selectedData = standards[selectedStandard];
  const priceData = [
    { type: "New", price: 21000 },
    { type: "Resubmission", price: 12000 },
    { type: "Renewal", price: 21000 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section 
        className="relative text-white py-20 md:py-32 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `linear-gradient(to bottom right, rgba(44, 62, 80, 0.45), rgba(30, 41, 59, 0.45)), url('/images/home/BSAphotos/D.png')` }}
      >
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-[#f39c12]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-[#f39c12]/10 rounded-full blur-3xl" />

        {/* Abstract background lines */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 L100 0" stroke="white" strokeWidth="0.5" />
            <path d="M20 100 L100 20" stroke="white" strokeWidth="0.5" />
            <path d="M0 80 L80 0" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>

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
                      Number of Pickleballs Required (Total 6)
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
                          {row.ballsRequired}
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
                    <th className="px-6 py-4 text-left text-sm font-bold">Testing and Certification Fees</th>
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
};

export default PickleballStandards;
