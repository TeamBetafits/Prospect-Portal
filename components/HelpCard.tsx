'use client';

import React from 'react';

export default function HelpCard() {
    const handleContactSupport = () => {
        const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@betafits.com';
        window.location.href = `mailto:${supportEmail}?subject=Support Request - Portal Inquiry`;
    };

    return (
        <div className="bg-neutral-900 rounded-md p-8 text-white relative overflow-hidden group shadow-elevated flex flex-col justify-between">
            <div className="relative z-10">
                <h3 className="text-[22px] font-bold mb-3 tracking-tight">Need assistance?</h3>
                <p className="text-[#a1c270] text-[15px] font-medium leading-relaxed mb-8 max-w-[260px]">
                    Our support team is available 9am-5pm EST to help you navigate your intake workflow.
                </p>
            </div>
            <div className="relative z-10">
                <button 
                    onClick={handleContactSupport}
                    className="w-full bg-[#f3f7ed] hover:bg-white py-4 rounded-[8px] font-bold text-[13px] text-[#536b2e] transition-all uppercase tracking-[0.05em] active:scale-[0.98] shadow-card"
                >
                    Contact Support
                </button>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-black/10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-black/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
        </div>
    );
}
