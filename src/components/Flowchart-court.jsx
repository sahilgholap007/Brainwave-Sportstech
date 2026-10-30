import React from "react"
import { ArrowDown } from "lucide-react"

const Flowchart = () => {
  const steps = [
    {
      title: "Application Submission",
      description: "Submit application form with required documents and payment",
    },
    {
      title: "Initial Review",
      description: "AIPA reviews application and documentation for completeness",
    },
    {
      title: "Inspection Scheduling",
      description: "Mutually agreed date for on-site inspection is confirmed",
    },
    {
      title: "On-Site Inspection",
      description: "AIPA representative conducts thorough inspection of courts",
    },
    {
      title: "Evaluation & Report",
      description: "Inspection findings are documented and evaluated",
    },
    {
      title: "Certification Decision",
      description: "AIPA approves certification or provides improvement recommendations",
    },
    {
      title: "Certificate Issuance",
      description: "Official certification is issued for approved courts",
    },
  ]

  return (
    <div className="my-16">
      <h2 className="text-3xl font-bold text-[#2c3e50] mb-10 text-center">Certification Process Flow</h2>
      <div className="max-w-3xl mx-auto">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="bg-white rounded-lg p-6 shadow-md relative z-10">
              <h3 className="text-xl font-semibold text-[#34495e] mb-2">
                {index + 1}. {step.title}
              </h3>
              <p className="text-gray-700">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="flex justify-center my-4">
                <ArrowDown className="h-8 w-8 text-[#f39c12]" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default Flowchart
