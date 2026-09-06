"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AgencySidebar from "@/components/dashboard/AgencySidebar";
import { api, ApiError } from "@/lib/api";

interface NotifPrefs {
  emailOnApplicationUpdate: boolean;
  emailOnMessage: boolean;
  emailOnNewStudentLead: boolean;
}

export default function AgencySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    emailOnApplicationUpdate: true,
    emailOnMessage: true,
    emailOnNewStudentLead: true,
  });

  useEffect(() => {
    api.get<NotifPrefs>("/api/agency/notification-preferences").then(setNotifPrefs).catch(() => {});
  }, []);

  async function saveNotifPref(key: keyof NotifPrefs, value: boolean) {
    setNotifPrefs((prev) => ({ ...prev, [key]: value }));
    await api.patch("/api/agency/notification-preferences", { [key]: value }).catch(() => {});
  }

  async function handleChangePassword() {
    setMessage(null);
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "New password should be at least 8 characters." });
      return;
    }
    setSaving(true);
    try {
      await api.post("/api/auth/change-password", { currentPassword, newPassword });
      setMessage({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Couldn't update your password." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
<AgencySidebar />


{/* Top Bar Shell */}
<header className="fixed top-0 left-[260px] right-0 h-20 bg-surface/80 backdrop-blur-md z-40 flex items-center justify-between px-gutter">
<div className="flex items-center flex-1 max-w-xl">
<div className="relative w-full group">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
<input className="w-full pl-12 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-body-md font-body-md transition-all" placeholder="Search consultants, leads or settings..." type="text"/>
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-2">
<button className="p-2.5 hover:bg-surface-container-low rounded-lg transition-colors relative group">
<span className="material-symbols-outlined text-on-surface-variant">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
<div className="absolute top-full right-0 mt-2 w-64 bg-white p-4 rounded-xl shadow-xl border border-outline-variant/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
<p className="font-label-md text-label-md text-primary">Notifications</p>
<p className="text-xs text-on-surface-variant mt-1">2 new student applications received.</p>
</div>
</button>
<button className="p-2.5 hover:bg-surface-container-low rounded-lg transition-colors">
<span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
</button>
</div>
<div className="h-8 w-[1px] bg-outline-variant/30"></div>
<button className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-surface-container-low rounded-full transition-colors">
<div className="text-right hidden lg:block">
<p className="text-body-md font-semibold text-primary leading-none">Global Agency Group</p>
<p className="text-[11px] text-on-surface-variant mt-1">Premium Partner</p>
</div>
<div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden">
<img className="w-full h-full object-cover" alt="A professional headshot of a corporate executive in a modern, well-lit office with a minimalist aesthetic. The lighting is soft and natural, emphasizing a clean and premium professional tone. The background features subtle blurred architectural details of a high-end educational consultancy firm." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEFuhJhwGmJMWTOFk3_SQUp_gGm3Az7_vpedLw2m4VCLGHBXS8lhTrHVkT67VBX2Uu5l4F1viZd4GS0-TNTc3-B0-ELGiYQKeMPz5e32CsGHXJePxTZaj23UdgiL6TA_X8NWQyuotHE7wBw2STqBv7pWBE7uMT_aReZyFAtmLPn6VoswP_uODtln3RvqfUHMa57VldPe1HrMuiajpZ4uvYtSZBvbwEFVLKaklR3fFUiT5_mWzRTzYv"/>
</div>
</button>
</div>
</header>
{/* Main Content Canvas */}
<main className="ml-[260px] mt-20 p-margin-desktop min-h-[calc(100vh-80px)]">
{/* Header Section */}
<div className="mb-10 flex justify-between items-end">
<div>
<h2 className="font-headline-lg text-headline-lg text-primary">Agency Settings</h2>
<p className="text-body-lg font-body-lg text-on-surface-variant mt-1">Manage your agency&apos;s profile, security, and consulting team.</p>
</div>
<div className="flex items-center gap-3">
<button className="px-6 py-2.5 rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-container transition-colors">Discard Changes</button>
<button className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold shadow-lg hover:shadow-primary/20 transition-all active:scale-95">Save Preferences</button>
</div>
</div>
{/* Settings Bento Grid */}
<div className="grid grid-cols-12 gap-card-gap">
{/* Account Security Card */}
<section className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-[24px] p-container-padding card-shadow">
<div className="flex items-center gap-3 mb-8">
<div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center">
<span className="material-symbols-outlined text-primary">security</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-primary">Account Security</h3>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div className="space-y-6">
<div>
<label className="block text-label-md font-label-md text-on-surface-variant mb-2">Change Password</label>
<input
  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-body-md focus:ring-2 focus:ring-primary/20 mb-3"
  placeholder="Current Password"
  type="password"
  value={currentPassword}
  onChange={(e) => setCurrentPassword(e.target.value)}
/>
<input
  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-body-md focus:ring-2 focus:ring-primary/20"
  placeholder="New Password"
  type="password"
  value={newPassword}
  onChange={(e) => setNewPassword(e.target.value)}
/>
{message && (
  <p className={`text-[11px] mt-2 ${message.type === "success" ? "text-primary" : "text-error"}`}>{message.text}</p>
)}
<button
  onClick={handleChangePassword}
  disabled={saving || !currentPassword || !newPassword}
  className="mt-3 bg-primary text-on-primary px-5 py-2 rounded-xl font-label-md text-label-md font-bold disabled:opacity-50"
>
  {saving ? "Updating..." : "Update Password"}
</button>
</div>
</div>
<div className="bg-secondary-fixed/30 rounded-2xl p-6 border border-secondary-fixed">
<div className="flex items-start justify-between mb-4">
<div>
<h4 className="font-body-lg font-bold text-primary">Two-Factor Authentication</h4>
<p className="text-body-md text-on-surface-variant mt-1">Coming soon — not yet available on your account.</p>
</div>
<label className="relative inline-flex items-center cursor-not-allowed opacity-50">
<input disabled className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-outline-variant rounded-full"></div>
</label>
</div>
<div className="flex items-center gap-4 mt-6 opacity-50">
<div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-primary">vibration</span>
</div>
<div>
<p className="text-label-md font-semibold text-primary">Authenticator App</p>
<p className="text-xs text-on-surface-variant">Not connected</p>
</div>
</div>
</div>
</div>
</section>
{/* Billing & Subscription Status */}
<section className="col-span-12 lg:col-span-4 bg-primary text-white rounded-[24px] p-container-padding card-shadow relative overflow-hidden group">
{/* Visual Decoration */}
<div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
<div className="relative z-10">
<div className="flex justify-between items-start mb-10">
<div>
<span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider">Premium Agency</span>
<h3 className="font-headline-md text-headline-md mt-3">StudyBridge Plus</h3>
</div>
<span className="material-symbols-outlined text-white/50">verified</span>
</div>
<div className="space-y-4 mb-10">
<div className="flex justify-between items-center text-sm">
<span className="text-primary-fixed-dim">Next billing date</span>
<span className="font-bold">Oct 12, 2024</span>
</div>
<div className="flex justify-between items-center text-sm">
<span className="text-primary-fixed-dim">Active Consultants</span>
<span className="font-bold">12 / 20</span>
</div>
<div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
<div className="h-full bg-secondary-container w-3/5"></div>
</div>
</div>
<div className="grid grid-cols-2 gap-3">
<button disabled className="py-3 bg-white/10 rounded-xl text-label-md font-semibold opacity-50 cursor-not-allowed">Manage Plan (coming soon)</button>
<button disabled className="py-3 bg-white/40 text-primary rounded-xl text-label-md font-bold opacity-50 cursor-not-allowed">Payment Methods (coming soon)</button>
</div>
</div>
</section>
{/* Notification Preferences */}
<section className="col-span-12 lg:col-span-5 bg-surface-container-lowest rounded-[24px] p-container-padding card-shadow">
<div className="flex items-center gap-3 mb-6">
<div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center">
<span className="material-symbols-outlined text-primary">notifications_active</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-primary">Notification Preferences</h3>
</div>
<div className="space-y-6">
<div className="flex items-center justify-between py-2 border-b border-outline-variant/20">
<div>
<p className="font-body-lg font-semibold text-primary">New Lead Alerts</p>
<p className="text-xs text-on-surface-variant">Email when a new student links to your agency.</p>
</div>
<div className="flex flex-col items-center gap-1">
<span className="text-[10px] text-outline uppercase font-bold">Email</span>
<input
  checked={notifPrefs.emailOnNewStudentLead}
  onChange={(e) => saveNotifPref("emailOnNewStudentLead", e.target.checked)}
  className="w-5 h-5 text-primary rounded focus:ring-primary/20 bg-surface-container-high border-none"
  type="checkbox"
/>
</div>
</div>
<div className="flex items-center justify-between py-2 border-b border-outline-variant/20">
<div>
<p className="font-body-lg font-semibold text-primary">Status Updates</p>
<p className="text-xs text-on-surface-variant">Email when a student's application status changes.</p>
</div>
<div className="flex flex-col items-center gap-1">
<span className="text-[10px] text-outline uppercase font-bold">Email</span>
<input
  checked={notifPrefs.emailOnApplicationUpdate}
  onChange={(e) => saveNotifPref("emailOnApplicationUpdate", e.target.checked)}
  className="w-5 h-5 text-primary rounded focus:ring-primary/20 bg-surface-container-high border-none"
  type="checkbox"
/>
</div>
</div>
<div className="flex items-center justify-between py-2 border-b border-outline-variant/20">
<div>
<p className="font-body-lg font-semibold text-primary">New Messages</p>
<p className="text-xs text-on-surface-variant">Email when a student sends you a message.</p>
</div>
<div className="flex flex-col items-center gap-1">
<span className="text-[10px] text-outline uppercase font-bold">Email</span>
<input
  checked={notifPrefs.emailOnMessage}
  onChange={(e) => saveNotifPref("emailOnMessage", e.target.checked)}
  className="w-5 h-5 text-primary rounded focus:ring-primary/20 bg-surface-container-high border-none"
  type="checkbox"
/>
</div>
</div>
</div>
</section>
{/* Team Management */}
<section className="col-span-12 lg:col-span-7 bg-surface-container-lowest rounded-[24px] p-container-padding card-shadow">
<div className="flex justify-between items-center mb-8">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center">
<span className="material-symbols-outlined text-primary">group_add</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-primary">Team Management</h3>
</div>
<button disabled title="Multi-seat team accounts aren't available yet" className="flex items-center gap-2 text-outline font-bold px-4 py-2 rounded-xl opacity-50 cursor-not-allowed">
<span className="material-symbols-outlined text-sm">person_add</span>
<span className="text-label-md">Invite Consultant (coming soon)</span>
</button>
</div>
<div className="overflow-x-auto">
<table className="w-full">
<thead>
<tr className="text-left border-b border-outline-variant/30">
<th className="pb-4 text-label-md text-on-surface-variant">Consultant</th>
<th className="pb-4 text-label-md text-on-surface-variant">Role</th>
<th className="pb-4 text-label-md text-on-surface-variant">Status</th>
<th className="pb-4"></th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/10">
<tr className="group hover:bg-surface-container-low/50 transition-colors">
<td className="py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-primary">JD</div>
<div>
<p className="font-body-md font-semibold text-primary">Julianne Davies</p>
<p className="text-[11px] text-on-surface-variant">julianne.d@studybridge.com</p>
</div>
</div>
</td>
<td className="py-4">
<span className="px-2.5 py-1 bg-surface-container rounded-lg text-xs font-medium">Senior Agent</span>
</td>
<td className="py-4">
<div className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-green-500"></span>
<span className="text-xs text-on-surface-variant">Active</span>
</div>
</td>
<td className="py-4 text-right">
<button className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all">
<span className="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
<tr className="group hover:bg-surface-container-low/50 transition-colors">
<td className="py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center font-bold text-tertiary">ML</div>
<div>
<p className="font-body-md font-semibold text-primary">Marcus Loh</p>
<p className="text-[11px] text-on-surface-variant">marcus.loh@studybridge.com</p>
</div>
</div>
</td>
<td className="py-4">
<span className="px-2.5 py-1 bg-surface-container rounded-lg text-xs font-medium">Support</span>
</td>
<td className="py-4">
<div className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-green-500"></span>
<span className="text-xs text-on-surface-variant">Active</span>
</div>
</td>
<td className="py-4 text-right">
<button className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all">
<span className="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
<tr className="group hover:bg-surface-container-low/50 transition-colors">
<td className="py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-error-container/30 flex items-center justify-center font-bold text-error">ES</div>
<div>
<p className="font-body-md font-semibold text-primary">Elena Soto</p>
<p className="text-[11px] text-on-surface-variant">elena.s@studybridge.com</p>
</div>
</div>
</td>
<td className="py-4">
<span className="px-2.5 py-1 bg-surface-container rounded-lg text-xs font-medium">Counselor</span>
</td>
<td className="py-4">
<div className="flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-outline-variant"></span>
<span className="text-xs text-on-surface-variant">Pending Invite</span>
</div>
</td>
<td className="py-4 text-right">
<button className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all">
<span className="material-symbols-outlined text-sm">cancel</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
</section>
</div>
{/* Footer Shell */}
<footer className="mt-20 py-gutter border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-6">
<div className="flex flex-col md:flex-row items-center gap-6">
<span className="font-headline-sm text-headline-sm font-bold text-primary">StudyBridge</span>
<p className="font-body-md text-body-md text-on-surface-variant">© 2024 StudyBridge Global Education. All rights reserved.</p>
</div>
<div className="flex items-center gap-8">
<Link className="text-on-surface-variant hover:text-primary transition-colors text-label-md font-label-md" href="/privacy">Privacy Policy</Link>
<Link className="text-on-surface-variant hover:text-primary transition-colors text-label-md font-label-md" href="/terms">Terms of Service</Link>
<Link className="text-on-surface-variant hover:text-primary transition-colors text-label-md font-label-md" href="/contact">Contact Support</Link>
</div>
</footer>
</main>


</>
  );
}
