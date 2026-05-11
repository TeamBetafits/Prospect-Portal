"use client";

import React from "react";
import Image from "next/image";
import { usePortalShell } from "@/shared/hooks/usePortalShell";

interface Props {
  shell: ReturnType<typeof usePortalShell>;
}

const Sidebar: React.FC<Props> = ({ shell }) => {
  const userName =
    shell.session?.user?.name || shell.session?.user?.email?.split("@")[0] || "User";
  const userEmail = shell.session?.user?.email || "";

  return (
    <>
      {shell.isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={shell.closeMobileMenu}
        />
      )}

      <aside
        className={`
          ${shell.isCollapsed ? "lg:w-20" : "lg:w-64"}
          ${shell.isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
          fixed lg:relative inset-y-0 left-0 border-r border-neutral-200 bg-white h-full flex flex-col flex-shrink-0 transition-all duration-300 z-50
        `}
      >
        <button
          onClick={shell.toggleCollapsed}
          className="absolute -right-3 top-8 bg-white border border-neutral-200 rounded-full p-1.5 shadow-card hover:border-neutral-300 transition-all z-20 text-neutral-400 hover:text-neutral-600 hidden lg:block"
          aria-label="Toggle sidebar"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${shell.isCollapsed ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className={`p-6 flex items-center ${shell.isCollapsed && !shell.isMobileMenuOpen ? "lg:justify-center" : "lg:justify-between"}`}>
          <div className="flex items-center">
            {shell.isCollapsed && !shell.isMobileMenuOpen ? (
              <Image
                src="/logo.png"
                alt="Betafits Icon"
                width={32}
                height={32}
                className="object-contain"
              />
            ) : (
              <Image
                src="/logo.png"
                alt="Betafits Logo"
                width={150}
                height={40}
                className="object-contain"
              />
            )}
          </div>

          {shell.isMobileMenuOpen && (
            <button onClick={shell.closeMobileMenu} className="lg:hidden p-2 text-neutral-400 hover:text-neutral-600" aria-label="Close menu">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-4 flex-1 overflow-y-auto pt-6">
          <nav className="space-y-1">
            {shell.navItems.map((item) => {
              const active = shell.isActive(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => shell.navigate(item.path)}
                  className={`w-full flex items-center ${shell.isCollapsed ? "lg:justify-center lg:px-0 px-3 gap-3" : "gap-3 px-3"} h-10 rounded-sm transition-all duration-200 group font-medium ${active
                      ? "bg-primary-50 text-primary-700"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    }`}
                >
                  <svg
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-600"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {(!shell.isCollapsed || shell.isMobileMenuOpen) && <span className="text-[14px] tracking-tight">{item.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className={`mt-auto p-4 border-t border-neutral-200 relative ${shell.isCollapsed ? "lg:flex lg:justify-center" : ""}`} ref={shell.profileMenuRef}>
          {shell.isProfileMenuOpen && (!shell.isCollapsed || shell.isMobileMenuOpen) && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-neutral-200 rounded-md shadow-modal overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
              <button
                onClick={shell.openAccountSettings}
                className="w-full text-left px-4 py-3 text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile Settings
              </button>
              <button
                onClick={shell.signOutUser}
                className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-neutral-100"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          )}

          <div
            onClick={shell.toggleProfileMenu}
            className={`flex items-center ${shell.isCollapsed && !shell.isMobileMenuOpen ? "lg:justify-center" : "gap-3 bg-neutral-50 p-2 w-full border border-neutral-200"} rounded-md transition-all cursor-pointer group ${shell.isProfileMenuOpen ? "ring-2 ring-primary-500/20" : ""}`}
          >
            <div className="w-8 h-8 bg-[#CFE1AE] text-white flex items-center justify-center rounded-md font-bold text-[12px] flex-shrink-0 shadow-card">
              {userName[0]?.toUpperCase() || "U"}
            </div>
            {(!shell.isCollapsed || shell.isMobileMenuOpen) && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13px] font-semibold text-neutral-900 truncate tracking-tight">{userName}</span>
                <span className="text-[11px] text-neutral-500 font-medium truncate">{userEmail}</span>
              </div>
            )}
            {(!shell.isCollapsed || shell.isMobileMenuOpen) && (
              <svg className={`w-4 h-4 text-neutral-400 transition-transform ${shell.isProfileMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
