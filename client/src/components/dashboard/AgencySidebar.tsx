"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/agency/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/agency/students", icon: "group", label: "My Students" },
  { href: "/agency/programs", icon: "school", label: "Programs" },
  { href: "/agency/applications", icon: "assignment", label: "Applications" },
  { href: "/agency/messages", icon: "mail", label: "Messages" },
  { href: "/agency/analytics", icon: "analytics", label: "Analytics" },
];

const PROFILE_HREF = "/agency/profile";
const SETTINGS_HREF = "/agency/settings";

export default function AgencySidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-primary flex flex-col py-8 shadow-xl z-50 overflow-y-auto custom-scrollbar">
      <div className="px-8 mb-12">
        <Link href="/agency/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-container-lowest rounded-xl flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-surface-container-lowest leading-none">
              StudyBridge
            </h1>
            <p className="font-label-md text-label-md text-primary-fixed-dim opacity-70">
              Academic Portal
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "flex items-center gap-4 bg-background text-primary rounded-l-full ml-4 pl-6 py-3 font-semibold transition-all duration-300"
                  : "flex items-center gap-4 text-primary-fixed-dim hover:text-surface-container-lowest px-8 py-3 transition-colors hover:bg-primary-container/20"
              }
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-primary-container/30">
        <Link
          href={PROFILE_HREF}
          className={
            isActive(PROFILE_HREF)
              ? "flex items-center gap-4 bg-background text-primary rounded-l-full ml-4 pl-6 py-3 font-semibold transition-all duration-300"
              : "flex items-center gap-4 text-primary-fixed-dim hover:text-surface-container-lowest px-8 py-3 transition-colors hover:bg-primary-container/20"
          }
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-md text-label-md">Profile</span>
        </Link>
        <Link
          href={SETTINGS_HREF}
          className={
            isActive(SETTINGS_HREF)
              ? "flex items-center gap-4 bg-background text-primary rounded-l-full ml-4 pl-6 py-3 font-semibold transition-all duration-300"
              : "flex items-center gap-4 text-primary-fixed-dim hover:text-surface-container-lowest px-8 py-3 transition-colors hover:bg-primary-container/20"
          }
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md text-label-md">Settings</span>
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-4 text-primary-fixed-dim hover:text-surface-container-lowest px-8 py-3 transition-colors hover:bg-primary-container/20"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-md text-label-md">Logout</span>
        </Link>
      </div>
    </aside>
  );
}
