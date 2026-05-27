"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { PORTAL_NAV_ITEMS } from "@/shared/constants/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

export function usePortalShell() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isBudgetVisible, setIsBudgetVisible] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const companyId = (session?.user as any)?.companyId;

  useEffect(() => {
    if (!companyId) return;

    async function checkBudget() {
      try {
        const { count, error } = await supabaseClient
          .from("benefit_budget_versions")
          .select("*", { count: "exact", head: true })
          .eq("company_id", companyId);

        if (!error && count !== null) {
          setIsBudgetVisible(count > 0);
        }
      } catch (err) {
        console.error("Failed to check published budget visibility:", err);
      }
    }
    checkBudget();
  }, [companyId]);

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

  const navItems = isBudgetVisible
    ? PORTAL_NAV_ITEMS
    : PORTAL_NAV_ITEMS.filter((item) => item.id !== "benefit-budget");

  return {
    isCollapsed,
    isMobileMenuOpen,
    isProfileMenuOpen,
    navItems,
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
