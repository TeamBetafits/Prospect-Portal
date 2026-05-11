'use client';

import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

interface FAQCategory {
  title: string;
  icon: string;
  items: FAQItem[];
}

const FAQAccordionItem: React.FC<{ item: FAQItem }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-neutral-100 rounded-md bg-white transition-all duration-200 hover:border-primary-200 mb-3 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none"
      >
        <span className="text-[15px] font-bold text-neutral-900 tracking-tight pr-4">
          {item.question}
        </span>
        <svg
          className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-500' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 pt-0 text-[14px] leading-relaxed text-neutral-600 font-medium">
          {item.answer}
        </div>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  const categories: FAQCategory[] = [
    {
      title: "Getting Started",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      items: [
        {
          question: "What is this portal for?",
          answer: "This portal helps you securely share information, upload documents, and complete required steps so we can analyze and set up your employee benefits correctly."
        },
        {
          question: "What is the first thing I need to do?",
          answer: "Start with the Quick Start form on your dashboard. This tells us about your company and guides you to upload any required documents."
        },
        {
          question: "Do I need to complete everything at once?",
          answer: "No. You can save progress and return anytime. Your dashboard will always show what’s completed and what’s still needed."
        }
      ]
    },
    {
      title: "Forms & Tasks",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      items: [
        {
          question: "Why do I see certain forms assigned to me?",
          answer: "Forms are assigned based on your company’s situation (current benefits, group size, compliance needs). Not all forms apply to every company."
        },
        {
          question: "What are “Available Forms”?",
          answer: "These are optional or situational forms you may complete if relevant. If you’re unsure whether one applies to you, feel free to ask our team."
        },
        {
          question: "Can I update a form after submitting it?",
          answer: "Yes. If changes are needed, you can reopen or resubmit the form, or our team may request an update."
        }
      ]
    },
    {
      title: "Documents & Uploads",
      icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
      items: [
        {
          question: "What documents do I need to upload?",
          answer: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Benefit guides or plan summaries</li>
              <li>SBCs (Summary of Benefits & Coverage)</li>
              <li>Invoices or premium documents</li>
              <li>Employee census (if available)</li>
            </ul>
          )
        },
        {
          question: "Are my documents secure?",
          answer: "Yes. All uploads are encrypted and only visible to authorized Betafits team members."
        }
      ]
    },
    {
      title: "Timeline & Progress",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      items: [
        {
          question: "How long does this process usually take?",
          answer: "Most groups complete onboarding within a few days, depending on document availability."
        },
        {
          question: "What happens after I finish my tasks?",
          answer: "Our team reviews your information, analyzes your benefits, and prepares next steps or recommendations."
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-neutral-900 tracking-tight mb-4">Frequently Asked Questions</h1>
        <p className="text-neutral-500 font-medium max-w-2xl mx-auto leading-relaxed">
          This portal is designed to guide you through benefits onboarding step by step. 
          Below are answers to common questions about forms, documents, timelines, and support.
        </p>
      </div>

      <div className="space-y-16">
        {categories.map((category, catIdx) => (
          <div key={catIdx} className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-sm bg-primary-50 flex items-center justify-center text-primary-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">{category.title}</h2>
            </div>
            
            <div className="space-y-4">
              {category.items.map((item, itemIdx) => (
                <FAQAccordionItem key={itemIdx} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
