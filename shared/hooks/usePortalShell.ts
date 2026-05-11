"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { PORTAL_NAV_ITEMS } from "@/shared/constants/navigation";

export function usePortalShell() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname?.startsWith(path));

  const navigate = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const openAccountSettings = () => {
    setIsProfileMenuOpen(false);
    navigate("/account-settings");
  };

  const signOutUser = async () => {
    setIsProfileMenuOpen(false);
    await signOut({ callbackUrl: "/login" });
  };

  return {
    isCollapsed,
    isMobileMenuOpen,
    isProfileMenuOpen,
    navItems: PORTAL_NAV_ITEMS,
    pathname,
    profileMenuRef,
    session,
    closeMobileMenu: () => setIsMobileMenuOpen(false),
    isActive,
    navigate,
    openAccountSettings,
    openMobileMenu: () => setIsMobileMenuOpen(true),
    signOutUser,
    toggleCollapsed: () => setIsCollapsed((value) => !value),
    toggleProfileMenu: () => setIsProfileMenuOpen((value) => !value),
  };
}
