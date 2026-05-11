'use client';

import React, { useState } from 'react';
import { FAQCategory } from '@/types';

interface Props {
    categories: FAQCategory[];
}

export default function FAQAccordion({ categories }: Props) {
    const [openItem, setOpenItem] = useState<string | null>(null);

    const toggleItem = (id: string) => {
        setOpenItem(openItem === id ? null : id);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-12">
            {categories.map((category, catIdx) => (
                <section key={catIdx}>
                    <h2 className="text-[18px] font-bold text-neutral-900 tracking-tight mb-4 border-b border-neutral-100 pb-2">
                        {category.title}
                    </h2>
                    <div className="space-y-4">
                        {category.items.map((item, itemIdx) => {
                            const itemId = `${catIdx}-${itemIdx}`;
                            const isOpen = openItem === itemId;
                            return (
                                <div
                                    key={itemId}
                                    className={`bg-white border rounded-md transition-all duration-200 overflow-hidden ${
                                        isOpen ? 'border-primary-200 shadow-card ring-1 ring-primary-100' : 'border-neutral-200 shadow-card hover:border-neutral-300'
                                    }`}
                                >
                                    <button
                                        onClick={() => toggleItem(itemId)}
                                        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                                    >
                                        <span className={`text-[15px] font-semibold ${isOpen ? 'text-primary-800' : 'text-neutral-900'}`}>
                                            {item.question}
                                        </span>
                                        <span className={`ml-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                            <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </button>
                                    <div
                                        className={`transition-all duration-300 ease-in-out px-5 text-neutral-600 text-[14px] leading-relaxed bg-neutral-50/50 ${
                                            isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 pb-0 opacity-0'
                                        }`}
                                    >
                                        <div className="pt-2 border-t border-neutral-100 mt-2">
                                            {item.answer}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
}
