"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
}

type FilterTab = "all" | "unread" | "applications" | "documents" | "messages";

function formatRelativeTime(dateStr: string) {
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return "";
  }
}

function getNotificationIcon(type: string) {
  const t = (type || "").toLowerCase();
  if (t.includes("offer_letter")) return "celebration";
  if (t.includes("application")) return "school";
  if (t.includes("document")) return "description";
  if (t.includes("message") || t.includes("conversation")) return "chat";
  if (t.includes("verification")) return "verified";
  if (t.includes("service") || t.includes("interest")) return "handshake";
  if (t.includes("security") || t.includes("login")) return "shield";
  if (t.includes("welcome")) return "waving_hand";
  return "notifications";
}

export function getNotificationTargetUrl(item: NotificationItem, role?: string): string {
  const type = (item.type || "").toLowerCase();
  const text = `${item.title} ${item.body || ""}`.toLowerCase();
  const appIdMatch = (item.body || "").match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);

  // 1. Role: Student
  if (role === "student") {
    if (appIdMatch && (type.includes("offer_letter") || type.includes("application") || text.includes("application"))) {
      return `/student/applications/${appIdMatch[1]}`;
    }
    if (type.includes("offer_letter") || type.includes("application") || text.includes("application")) return "/student/applications";
    if (type.includes("document") || text.includes("document") || text.includes("transcript") || text.includes("passport")) return "/student/documents";
    if (type.includes("message") || type.includes("conversation") || text.includes("message") || text.includes("conversation")) return "/student/messaging";
    if (type.includes("service") || text.includes("program request") || text.includes("agency")) return "/student/agencies";
    if (type.includes("scholarship") || text.includes("scholarship")) return "/student/saved-items";
    if (type.includes("setting") || type.includes("security") || text.includes("setting") || text.includes("security")) return "/student/settings";
    return "/student/dashboard";
  }

  // 2. Role: Agency
  if (role === "agency") {
    if (type.includes("offer_letter") || type.includes("application") || text.includes("application")) return "/agency/applications";
    if (type.includes("message") || type.includes("conversation") || text.includes("message") || text.includes("conversation")) return "/agency/messages";
    if (type.includes("service") || text.includes("program request") || text.includes("program")) return "/agency/programs";
    if (type.includes("document") || text.includes("document") || type.includes("student") || text.includes("student")) return "/agency/students";
    if (type.includes("verif") || text.includes("verif") || text.includes("license")) return "/agency/profile";
    if (type.includes("analytic") || text.includes("analytic")) return "/agency/analytics";
    return "/agency/dashboard";
  }

  // 3. Role: Admin
  if (role === "admin") {
    if (type.includes("agency") || text.includes("agency") || text.includes("license")) return "/admin/agencies";
    if (type.includes("offer_letter") || type.includes("application") || text.includes("application")) return "/admin/reports";
    if (type.includes("user") || text.includes("user") || text.includes("registered")) return "/admin/users";
    if (type.includes("univ") || text.includes("university")) return "/admin/universities";
    if (type.includes("scholarship") || text.includes("scholarship")) return "/admin/scholarships";
    if (type.includes("analytic") || text.includes("analytic")) return "/admin/analytics";
    return "/admin/overview";
  }

  // Fallback
  if (type.includes("application")) return "/student/applications";
  if (type.includes("document")) return "/student/documents";
  if (type.includes("message")) return "/student/messaging";
  return "/student/dashboard";
}

export function getNotificationBadgeLabel(item: NotificationItem, role?: string): string {
  const target = getNotificationTargetUrl(item, role);
  if (target.includes("/applications")) return "Applications";
  if (target.includes("/documents")) return "Documents";
  if (target.includes("/messages") || target.includes("/messaging")) return "Messages";
  if (target.includes("/programs")) return "Programs";
  if (target.includes("/students")) return "Students";
  if (target.includes("/agencies")) return "Agencies";
  if (target.includes("/profile")) return "Profile";
  if (target.includes("/reports")) return "Reports";
  if (target.includes("/users")) return "Users";
  if (target.includes("/saved-items")) return "Saved Items";
  if (target.includes("/settings")) return "Settings";
  return "Overview";
}

export default function NotificationBell({ className = "" }: { className?: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [toastNotification, setToastNotification] = useState<NotificationItem | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const isFirstLoadRef = useRef(true);
  const prevItemsRef = useRef<NotificationItem[]>([]);

  async function loadNotifications() {
    try {
      const res = await api.get<{ data: NotificationItem[]; unreadCount: number }>(
        "/api/notifications"
      );
      const newItems = res.data || [];
      const newUnread =
        typeof res.unreadCount === "number"
          ? res.unreadCount
          : newItems.filter((i) => !i.isRead).length;

      // Check if a brand-new notification arrived for live toast alert
      if (!isFirstLoadRef.current && newItems.length > 0 && prevItemsRef.current.length > 0) {
        const newest = newItems[0];
        const hadAlready = prevItemsRef.current.some((p) => p.id === newest.id);
        if (!hadAlready && !newest.isRead) {
          setToastNotification(newest);
          setTimeout(() => setToastNotification(null), 6000);
        }
      }

      isFirstLoadRef.current = false;
      prevItemsRef.current = newItems;
      setItems(newItems);
      setUnreadCount(newUnread);
    } catch {
      // User might be unauthenticated or offline
    }
  }

  useEffect(() => {
    loadNotifications();
    // Poll every 25 seconds for live notifications
    const timer = setInterval(loadNotifications, 25000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      await loadNotifications();
      setLoading(false);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await api.patch("/api/notifications/read");
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }

  async function handleMarkItemAsRead(id: string) {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  }

  function handleNotificationClick(item: NotificationItem) {
    if (!item.isRead) {
      handleMarkItemAsRead(item.id);
    }
    setOpen(false);
    setToastNotification(null);
    const targetUrl = getNotificationTargetUrl(item, user?.role);
    if (targetUrl) {
      router.push(targetUrl);
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterTab === "unread") return !item.isRead;
      const t = (item.type || "").toLowerCase();
      const text = `${item.title} ${item.body || ""}`.toLowerCase();
      if (filterTab === "applications")
        return (
          t.includes("application") ||
          t.includes("offer_letter") ||
          text.includes("application") ||
          text.includes("admission")
        );
      if (filterTab === "documents")
        return t.includes("document") || text.includes("document") || text.includes("transcript");
      if (filterTab === "messages")
        return (
          t.includes("message") ||
          t.includes("conversation") ||
          text.includes("message") ||
          text.includes("conversation")
        );
      return true;
    });
  }, [items, filterTab]);

  return (
    <>
      {/* Interactive Bell Button with Dropdown Container */}
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={toggleOpen}
          aria-label="Open notifications"
          className="relative p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center cursor-pointer"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[24px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-in fade-in zoom-in-50">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-[calc(100%+0.5rem)] w-80 sm:w-[410px] max-h-[540px] flex flex-col bg-surface-container-lowest dark:bg-[#1a2238] rounded-2xl shadow-2xl border border-outline-variant/30 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low/60 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-on-surface dark:text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#a6b8ff] rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-bold text-primary dark:text-[#a6b8ff] hover:underline cursor-pointer flex items-center gap-1"
                  title="Mark all notifications as read"
                >
                  <span className="material-symbols-outlined text-[14px]">done_all</span>
                  Mark all read
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-outline-variant/15 bg-surface-container-lowest dark:bg-[#181f34] overflow-x-auto custom-scrollbar">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "unread", label: `Unread (${unreadCount})` },
                  { id: "applications", label: "Apps" },
                  { id: "documents", label: "Docs" },
                  { id: "messages", label: "Chat" },
                ] as const
              ).map((tab) => {
                const isActive = filterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterTab(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? "bg-primary text-on-primary font-semibold shadow-xs"
                        : "text-on-surface-variant hover:bg-surface-container-low"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-2 divide-y divide-outline-variant/10 custom-scrollbar">
              {loading && items.length === 0 ? (
                <div className="p-8 text-center text-sm text-on-surface-variant animate-pulse">
                  Loading notifications...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-outline text-[36px] mb-2 opacity-50">
                    notifications_paused
                  </span>
                  <p className="text-sm font-semibold text-on-surface">No notifications here</p>
                  <p className="text-xs text-outline mt-0.5">
                    {filterTab === "unread"
                      ? "You are all caught up! No unread notifications."
                      : "New updates about applications, documents, and messages will appear here."}
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isOfferLetter =
                    item.type === "offer_letter_issued" || item.type.includes("offer_letter");
                  const icon = getNotificationIcon(item.type);
                  const badgeLabel = getNotificationBadgeLabel(item, user?.role);
                  const targetUrl = getNotificationTargetUrl(item, user?.role);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleNotificationClick(item);
                        }
                      }}
                      title={`Open ${badgeLabel} (${targetUrl})`}
                      className={`group p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 relative select-none ${
                        isOfferLetter
                          ? "bg-gradient-to-r from-emerald-500/10 to-primary-container/20 border-l-3 border-emerald-500 hover:from-emerald-500/15"
                          : item.isRead
                          ? "hover:bg-surface-container-low/80 opacity-85 hover:opacity-100"
                          : "bg-primary-container/15 dark:bg-primary-container/20 hover:bg-primary-container/30 border-l-2 border-primary"
                      }`}
                    >
                      {/* Notification Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105 ${
                          isOfferLetter
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                            : item.isRead
                            ? "bg-surface-container text-outline group-hover:text-primary"
                            : "bg-primary text-on-primary shadow-sm"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{icon}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p
                            className={`text-xs truncate ${
                              isOfferLetter
                                ? "font-bold text-emerald-600 dark:text-emerald-400"
                                : item.isRead
                                ? "font-semibold text-on-surface group-hover:text-primary"
                                : "font-bold text-primary dark:text-[#a6b8ff]"
                            }`}
                          >
                            {item.title}
                          </p>
                          <span className="text-[10px] text-outline shrink-0">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>

                        {item.body && (
                          <p className="text-xs text-on-surface-variant dark:text-gray-300 line-clamp-2 leading-relaxed">
                            {item.body}
                          </p>
                        )}

                        {/* Destination indicator tag */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium transition-colors ${
                              isOfferLetter
                                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                                : "text-outline group-hover:text-primary"
                            }`}
                          >
                            <span>{badgeLabel}</span>
                            <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
                              arrow_forward
                            </span>
                          </span>
                          {isOfferLetter && (
                            <span className="px-1.5 py-0.2 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded text-[9px] font-bold uppercase tracking-wider">
                              Milestone
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Unread indicator dot */}
                      {!item.isRead && (
                        <div className="mt-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkItemAsRead(item.id);
                            }}
                            className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/20 hover:ring-primary/40 cursor-pointer transition-transform hover:scale-125"
                            title="Mark as read without opening"
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Real-time Floating Toast Alert */}
      {toastNotification && (
        <div
          onClick={() => handleNotificationClick(toastNotification)}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-surface-container-lowest dark:bg-[#1a2238] border border-primary/30 rounded-2xl shadow-2xl p-4 flex items-start gap-3 cursor-pointer animate-in slide-in-from-bottom-5 duration-300 hover:border-primary transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[20px]">
              {getNotificationIcon(toastNotification.type)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                New Notification
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setToastNotification(null);
                }}
                className="text-outline hover:text-on-surface text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-xs font-bold text-on-surface truncate">
              {toastNotification.title}
            </p>
            {toastNotification.body && (
              <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">
                {toastNotification.body}
              </p>
            )}
            <p className="text-[10px] text-primary font-bold mt-1.5 flex items-center gap-1">
              <span>View {getNotificationBadgeLabel(toastNotification, user?.role)}</span>
              <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
