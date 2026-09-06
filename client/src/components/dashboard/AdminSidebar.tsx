"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/overview", icon: "dashboard", label: "Overview" },
  { href: "/admin/users", icon: "group", label: "Users" },
  { href: "/admin/agencies", icon: "business_center", label: "Agencies" },
  { href: "/admin/universities", icon: "school", label: "Universities" },
  { href: "/admin/scholarships", icon: "military_tech", label: "Scholarships" },
  { href: "/admin/reports", icon: "assessment", label: "Reports" },
  { href: "/admin/analytics", icon: "monitoring", label: "Analytics" },
];

const SETTINGS_HREF = "/admin/settings";

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <aside className="fixed h-screen w-[260px] left-0 top-0 bg-primary dark:bg-[#10172f] shadow-2xl flex flex-col py-8 z-50 overflow-y-auto custom-scrollbar">
      <div className="px-8 mb-10">
        <Link href="/admin/overview">
          <h1 className="font-headline-md text-headline-md font-bold text-on-primary dark:text-white">StudyBridge</h1>
          <p className="font-label-md text-label-md text-on-primary/60 dark:text-[#b9c7ff] tracking-wider uppercase mt-1">
            Admin Dashboard
          </p>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "bg-surface dark:bg-[#242d4c] text-primary dark:text-white rounded-l-full ml-4 pl-4 font-bold py-3 flex items-center gap-3 transition-transform duration-150 active:scale-95"
                  : "text-on-primary/80 dark:text-[#bdc9ff] px-8 py-3 flex items-center gap-3 hover:bg-primary-container/20 dark:hover:bg-white/10 hover:text-on-primary dark:hover:text-white transition-colors"
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          );
        })}
        <Link
          href={SETTINGS_HREF}
          className={
            isActive(SETTINGS_HREF)
              ? "bg-surface dark:bg-[#242d4c] text-primary dark:text-white rounded-l-full ml-4 pl-4 font-bold py-3 flex items-center gap-3 transition-transform duration-150 active:scale-95 mt-auto"
              : "text-on-primary/80 dark:text-[#bdc9ff] px-8 py-3 flex items-center gap-3 hover:bg-primary-container/20 dark:hover:bg-white/10 hover:text-on-primary dark:hover:text-white transition-colors mt-auto"
          }
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md text-label-md">Settings</span>
        </Link>
      </nav>
    </aside>
  );
}