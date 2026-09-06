"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/locale-context";

const NAV_ITEMS = [
  { href: "/student/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/student/messaging", icon: "forum", label: "Messaging" },
  { href: "/student/ai-recommendations", icon: "auto_awesome", label: "AI Recommendations" },
  { href: "/student/applications", icon: "assignment_turned_in", label: "Applications" },
  { href: "/student/ai-tools", icon: "smart_toy", label: "AI Tools Hub" },
  { href: "/student/saved-items", icon: "bookmark", label: "Saved Items" },
  { href: "/student/documents", icon: "folder_open", label: "Document Vault" },
  { href: "/student/agencies", icon: "business", label: "Find Agencies" },
];

const EXPLORE_ITEM = { href: "/universities", icon: "school", label: "Explore Universities" };
const PROFILE_HREF = "/student/profile";
const SETTINGS_HREF = "/student/settings";

export default function StudentSidebar() {
  const pathname = usePathname();
  const { t } = useLocale();

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-primary dark:bg-[#0b1533] flex flex-col py-8 shadow-xl z-50">
      <div className="px-8 mb-10">
        <Link href="/student/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-on-primary dark:bg-[#dce1ff] flex items-center justify-center rounded-xl">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-primary dark:text-white leading-tight">
              StudyBridge
            </h1>
            <p className="font-label-md text-label-md text-primary-fixed-dim dark:text-[#c9d5ff] opacity-80">
              Academic Excellence
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "group flex items-center gap-3 bg-surface-bright text-primary rounded-l-full ml-4 pl-6 py-3 font-semibold transition-all duration-300"
                  : "group flex items-center gap-3 text-primary-fixed-dim dark:text-[#c9d5ff] hover:text-on-primary px-10 py-3 transition-all duration-300"
              }
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="font-label-md text-label-md">{item.href === "/student/agencies" ? item.label : t(item.href === "/student/dashboard" ? "dashboard" : item.href === "/student/messaging" ? "messaging" : item.href === "/student/ai-recommendations" ? "recommendations" : item.href === "/student/applications" ? "applications" : item.href === "/student/ai-tools" ? "tools" : item.href === "/student/saved-items" ? "saved" : "documents")}</span>
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-on-primary/10">
          <Link
            href={EXPLORE_ITEM.href}
            className={
              isActive(EXPLORE_ITEM.href)
                ? "group flex items-center gap-3 bg-surface-bright text-primary rounded-l-full ml-4 pl-6 py-3 font-semibold transition-all duration-300"
                : "group flex items-center gap-3 text-primary-fixed-dim dark:text-[#c9d5ff] hover:text-on-primary px-10 py-3 transition-all duration-300"
            }
          >
            <span className="material-symbols-outlined">{EXPLORE_ITEM.icon}</span>
            <span className="font-label-md text-label-md">{t("explore")}</span>
          </Link>
        </div>
      </nav>

      <div className="mt-auto px-6 space-y-4 pt-4">
        <div className="pt-4 border-t border-on-primary/10">
          <Link
            href={PROFILE_HREF}
            className={
              isActive(PROFILE_HREF)
                ? "flex items-center gap-3 text-on-primary dark:text-white px-4 py-2 mb-1 transition-colors font-semibold"
                : "flex items-center gap-3 text-primary-fixed-dim dark:text-[#c9d5ff] hover:text-on-primary px-4 py-2 mb-1 transition-colors"
            }
          >
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-md">{t("profile")}</span>
          </Link>
          <Link
            href={SETTINGS_HREF}
            className={
              isActive(SETTINGS_HREF)
                ? "flex items-center gap-3 text-on-primary dark:text-white px-4 py-2 mb-1 transition-colors font-semibold"
                : "flex items-center gap-3 text-primary-fixed-dim dark:text-[#c9d5ff] hover:text-on-primary px-4 py-2 mb-1 transition-colors"
            }
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md">{t("settings")}</span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-3 text-primary-fixed-dim dark:text-[#c9d5ff] hover:text-on-primary px-4 py-2 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md">{t("logout")}</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
