"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import Sidebar from "./Sidebar";
import { usePortalShell } from "@/shared/hooks/usePortalShell";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const shell = usePortalShell();
    const isLoginPage = pathname === "/login";
    const isAccessPage = pathname === "/access";
    const isSetPasswordPage = pathname === "/set-password";
    const isAdminPage = pathname?.startsWith("/admin");

    // Auth pages and admin pages should not have sidebar
    if (isLoginPage || isAccessPage || isSetPasswordPage || isAdminPage) {
        return (
            <>
                {children}
                <Toaster position="top-right" richColors />
            </>
        );
    }

    return (
        <div className="flex h-screen bg-neutral-50 font-sans text-neutral-900 overflow-hidden relative">
            <Sidebar shell={shell} />
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <header className="lg:hidden h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 flex-shrink-0 z-30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center text-white font-black text-sm">
                            B
                        </div>
                        <span className="text-lg font-black text-neutral-900 tracking-tighter uppercase">Betafits</span>
                    </div>
                    <button onClick={shell.openMobileMenu} className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors" aria-label="Open menu">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto bg-neutral-50 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
}
