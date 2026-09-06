"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { getCurrentTheme, setTheme, ThemeMode } from "@/lib/theme";

const links = [
  { label: "Universities", href: "/universities" },
  { label: "Scholarships", href: "/scholarships" },
  { label: "Countries", href: "/destinations" },
  { label: "Contact", href: "/contact" },
];

interface PublicNavbarProps {
  variant?: "glass" | "solid";
  current?: string;
}

export default function PublicNavbar({
  variant = "solid",
  current,
}: PublicNavbarProps) {
  const { user, loading } = useAuth();
  const dashboardHref = user?.role === "student" ? "/student/dashboard" : user?.role === "agency" ? "/agency/dashboard" : "/admin/overview";

  // Public pages previously had no way to switch themes at all — dark mode
  // only existed inside a logged-in dashboard's Settings page. Read whatever
  // the inline anti-flash script (or a dashboard preference) already applied
  // as the initial state, then let visitors flip it from here too.
  const [mode, setMode] = useState<ThemeMode>(() => getCurrentTheme());

  function toggleTheme() {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    setTheme(next);
    setMode(next);
  }
  const wrapperClass =
    variant === "glass"
      ? "sticky top-0 w-full z-50 glass-header border-b border-outline-variant/30"
      : "sticky top-0 w-full z-50 bg-surface shadow-sm";

  return (
    <header className={wrapperClass}>
      <nav className="flex justify-between items-center w-full px-4 md:px-margin-desktop py-4 max-w-7xl mx-auto">
        <Link
          href="/"
          className="font-headline-md text-headline-md font-bold text-primary tracking-tight"
        >
          StudyBridge
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                current === link.label
                  ? "font-body-md text-body-md text-primary border-b-2 border-primary pb-0.5 font-bold transition-colors"
                  : "font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="h-10 w-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              {mode === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>
          {!loading && user ? (
            <Link href={dashboardHref} className="inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-4 py-2.5 font-bold text-sm hover:opacity-90 transition-opacity"><span className="material-symbols-outlined text-lg">arrow_back</span>Back to Dashboard</Link>
          ) : !loading ? <><Link href="/login" className="hidden sm:block font-body-md font-bold text-primary hover:opacity-80 transition-all">Log In</Link><Button href="/register" size="sm">Get Started</Button></> : null}
        </div>
      </nav>
    </header>
  );
}