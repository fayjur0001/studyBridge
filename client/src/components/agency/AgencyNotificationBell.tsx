"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Notification { id: string; title: string; body: string | null; isRead: boolean; createdAt: string; }

export default function AgencyNotificationBell() {
  const [open, setOpen] = useState(false); const [items, setItems] = useState<Notification[]>([]); const [loaded, setLoaded] = useState(false);
  const unread = items.filter((item) => !item.isRead).length;
  async function toggle() { const next = !open; setOpen(next); if (next && !loaded) { const result = await api.get<{ data: Notification[] }>("/api/agency/notifications").catch(() => ({ data: [] })); setItems(result.data); setLoaded(true); } }
  async function markRead() { await api.patch("/api/agency/notifications/read").catch(() => {}); setItems((current) => current.map((item) => ({ ...item, isRead: true }))); }
  return <div className="relative"><button onClick={toggle} aria-label="Open notifications" className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors relative"><span className="material-symbols-outlined">notifications</span>{unread > 0 && <span className="absolute top-1.5 right-1.5 min-w-2 h-2 bg-error rounded-full" />}</button>{open && <div className="absolute right-0 top-[calc(100%+0.5rem)] w-80 max-h-96 overflow-y-auto z-50 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xl p-3"><div className="flex justify-between items-center px-2 py-2"><p className="font-bold text-on-surface">Notifications</p>{unread > 0 && <button onClick={markRead} className="text-xs text-primary font-bold">Mark all read</button>}</div>{!loaded ? <p className="p-4 text-sm text-on-surface-variant">Loading…</p> : items.length === 0 ? <p className="p-4 text-sm text-on-surface-variant">No notifications yet.</p> : items.map((item) => <Link key={item.id} href="/agency/programs" onClick={() => setOpen(false)} className={`block p-3 rounded-xl mb-1 hover:bg-surface-container-low ${item.isRead ? "" : "bg-primary-fixed/30"}`}><p className="font-bold text-sm text-on-surface">{item.title}</p><p className="text-xs text-on-surface-variant mt-1">{item.body}</p></Link>)}</div>}</div>;
}
