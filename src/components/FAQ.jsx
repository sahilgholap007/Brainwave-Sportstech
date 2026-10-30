"use client"
import { useState } from "react";

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "Who is Brainwave SportsTech?",
      answer:
        "We are the authorized partner and exclusive testing laboratory for the equipment certification program of AIPA. We perform equipment testing as per their Equipment Standards Manual.",
    },
    {
      question:
        "How do I submit a paddle or Pickleball for testing and certification to AIPA?",
      answer:
        "Create your new manufacturer account at http://brainwavesportstech.com/. Click on 'Manufacturer Sign-up.' If you already have a user account, sign in using your credentials. Equipment submission requests can only be made after creating a user account.",
    },
    {
      question:
        "Can I apply for testing and certification of equipment directly from the AIPA website?",
      answer:
        "Yes, you can. You will be redirected to the Brainwave SportsTech website at www.brainwavesportstech.com. Applying through our website or via the AIPA website works the same way.",
    },
    {
      question:
        "How many paddles or Pickleball do I need to submit for testing and certification?",
      answer:
        "You need to submit SIX (6) paddles or SIX (6) pickleballs per model for new submissions, resubmissions, or renewals.",
    },
    {
      question:
        "Do Pickleball with different colors need to be submitted as a separate product?",
      answer:
        "No, Pickleball with different colors do not need to be submitted separately as long as the material of construction remains the same.AIPA accept such submissions.",
    },
    {
      question: "Can I apply for testing of multiple equipment at once?",
      answer:
        "Yes, you can submit applications for multiple equipment, add them to the cart, and pay at once.",
    },
    {
      question:
        "Is it allowed to submit a paddle without graphics or a logo printed on it?",
      answer:
        "No. At the time of submission, the paddle must have final graphics, the manufacturer’s name, the model name, and the AIPA Approved logo printed on it. Please refer to the respective websites for the artwork: AIPA logo at www.pickleball.in.",
    },
    {
      question:
        "In normal course, how long does it take for testing paddles or pickleballs?",
      answer:
        "Testing and report generation take 4 weeks from the receipt of samples in our laboratory. Reports are sent to both the client and AIPA for final approval and certification. Express services with a timeline of 1–2 weeks are available at an additional cost.",
    },
    {
      question: "Do we get videos of testing done on the equipment we submit?",
      answer:
        "Yes, videos of testing are available upon official request in case of sample failure. Video recordings of all tests are archived for 12 months for reference. They are erased after the retention period.",
    },
    {
      question: "Are paddles or Pickleball returned after testing?",
      answer:
        "No. Many of our tests are non-destructive testing (NDT), but due to stress and damage caused during testing, samples are not returned. As per AIPA guidelines, it is mandatory to preserve the samples for future reference.",
    },
    {
      question: "What is the validity period of AIPA court certification?",
      answer:
        "AIPA court certification is valid for three years from the date of issuance. After this period, recertification is required to ensure continued compliance with standards.",
    },
    {
      question: "How long does the certification process take?",
      answer:
        "The entire certification process typically takes 4-6 weeks from application submission to certificate issuance, depending on scheduling availability and the readiness of your facility.",
    },
    {
      question: "Can I get my courts certified if they don't meet all requirements?",
      answer:
        "If your courts don't meet all requirements, AIPA will provide a detailed report with recommendations for improvements. Once these improvements are implemented, you can apply for re-inspection without paying the full application fee again.",
    },
    {
      question: "What happens if my courts fail the inspection?",
      answer:
        "If your courts fail the inspection, you'll receive a detailed report outlining the areas that need improvement. You can make the necessary changes and request a re-inspection at a reduced fee within 6 months of the initial inspection.",
    },
    {
      question: "Are there different certification levels or categories?",
      answer:
        "Currently, AIPA offers a single standard certification for pickleball courts. All certified courts meet the same high standards for dimensions, surface quality, and safety features.",
    },
    {
      question: "Do I need to close my facility during inspection?",
      answer:
        "The inspection typically requires access to empty courts for accurate measurements and testing. We recommend scheduling the inspection during off-hours or blocking a few hours for the process.",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index); // Toggle the active index
  };

  return (
    <section className="py-16 md:py-24 px-6 md:px-12 lg:px-20 bg-white relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#f39c12]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#3498db]/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="text-[#f39c12] font-bold tracking-widest uppercase text-sm">Got Questions?</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#2c3e50] mt-3">
            Frequently Asked <span className="text-[#f39c12]">Questions</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:border-[#f39c12]/30"
              data-aos="fade-up"
              data-aos-delay={index * 50}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left px-6 py-5 md:px-8 md:py-6 flex justify-between items-center group transition-colors focus:outline-none"
              >
                <span className={`pr-4 text-base md:text-lg font-bold transition-colors ${activeIndex === index ? "text-[#f39c12]" : "text-[#2c3e50] group-hover:text-[#f39c12]"}`}>
                  {faq.question}
                </span>
                <span className={`transform transition-all duration-300 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activeIndex === index ? "bg-[#f39c12] text-white rotate-180" : "bg-white text-slate-400 group-hover:text-[#f39c12] shadow-sm"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </button>
              
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${activeIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="px-6 pb-6 md:px-8 md:pb-8">
                  <div className="h-px w-full bg-slate-200 mb-4" />
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
