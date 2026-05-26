"use client";

import Link from "next/link";
import { useState } from "react";

export default function AppointBetafitsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "What does appointing Betafits mean?",
      answer: "It means you are authorizing Betafits to move forward under the appropriate relationship for your company, such as broker of record or fee-based engagement.",
    },
    {
      question: "What information will I need?",
      answer: "You should be prepared to provide the company signer, relevant policy numbers, and the agreement type.",
    },
    {
      question: "What happens after I submit the form?",
      answer: "Your submission is reviewed and processed through the workflow. After completion, your portal experience can be updated to reflect the next stage.",
    },
    {
      question: "Can I review my plans again before submitting?",
      answer: "Yes. You can return to your plan and benefits pages before completing this step.",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-neutral-900 tracking-tight mb-2">Appoint Betafits</h1>
          <p className="text-neutral-500 font-medium max-w-2xl leading-relaxed">
            Complete the final authorization step if you would like Betafits to move forward as your broker of record or engagement partner.
          </p>
        </div>
        <Link href="/forms/appoint-betafits" className="btn-primary flex-shrink-0 px-6 h-10 inline-flex items-center justify-center">
          Launch Appointment Form
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-md p-8 shadow-card">
        <p className="text-neutral-700 leading-relaxed">
          Betafits has prepared your benefits analysis and plan recommendations. If you decide to move forward, you can use this page to begin the formal appointment process. You’ve completed the review stage of your benefits process. If you’d like Betafits to move forward on your behalf, the next step is to complete the appointment form. This allows us to finalize the appropriate authorization and continue implementation.
        </p>
      </div>

      <section>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-6">What this means</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            ["M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", "Formal authorization", "This step confirms that Betafits is authorized to move forward under the appropriate arrangement for your company."],
            ["M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", "Required information", "The form may ask for a company signer, policy numbers, and the agreement type that applies to your engagement."],
            ["M13 5l7 7-7 7M5 5l7 7-7 7", "What happens next", "Once the form is completed and signed, the workflow can update your status and transition the portal into the next stage."],
          ].map(([icon, title, body]) => (
            <div key={title} className="bg-white border border-neutral-200 rounded-md p-6 shadow-card">
              <div className="w-10 h-10 bg-primary-50 rounded-md flex items-center justify-center text-primary-600 mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
              </div>
              <h3 className="text-[16px] font-bold text-neutral-900 mb-2">{title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-medium">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={faq.question} className="bg-white border border-neutral-200 rounded-md overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors">
                <span className="font-bold text-neutral-900">{faq.question}</span>
                <svg className={`w-5 h-5 text-neutral-400 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openFaq === idx && <div className="px-6 pb-4 text-sm text-neutral-500 font-medium leading-relaxed">{faq.answer}</div>}
            </div>
          ))}
        </div>
      </section>

      <div className="bg-neutral-900 rounded-md p-10 text-center text-white shadow-elevated">
        <h2 className="text-2xl font-bold mb-4 tracking-tight text-white">Ready to move forward?</h2>
        <p className="text-neutral-400 mb-8 max-w-lg mx-auto font-medium">
          Complete the appointment form to finalize your authorization and transition to the next stage of implementation.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/forms/appoint-betafits" className="w-full sm:w-auto px-8 h-10 bg-primary-500 text-white font-bold rounded-sm hover:bg-primary-600 transition-all inline-flex items-center justify-center">
            Launch Appointment Form
          </Link>
          <Link href="/benefit-plans" className="w-full sm:w-auto px-8 h-10 bg-transparent border border-neutral-700 text-neutral-300 font-bold rounded-sm hover:bg-neutral-800 transition-all inline-flex items-center justify-center">
            Review Benefits
          </Link>
        </div>
      </div>
    </div>
  );
}
