"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AgencySidebar from "@/components/dashboard/AgencySidebar";
import { api, ApiError } from "@/lib/api";
import { setTheme } from "@/lib/theme";

interface NotifPrefs {
  emailOnApplicationUpdate: boolean;
  emailOnMessage: boolean;
  emailOnNewStudentLead: boolean;
}

interface AccountSettings {
  language: "en-GB" | "en-US" | "fr-FR" | "es-ES" | "de-DE";
  timezone: "Etc/GMT" | "Europe/Paris" | "America/New_York";
  currency: "GBP" | "USD" | "EUR";
  displayMode: "light" | "dark";
}

type TeamRole = "Admin" | "Senior Agent" | "Counselor" | "Support";
interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: TeamRole;
  status: "pending" | "active";
}
const TEAM_ROLES: TeamRole[] = ["Admin", "Senior Agent", "Counselor", "Support"];

const defaultSettings: AccountSettings = { language: "en-GB", timezone: "Etc/GMT", currency: "GBP", displayMode: "light" };

export default function AgencySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    emailOnApplicationUpdate: true,
    emailOnMessage: true,
    emailOnNewStudentLead: true,
  });
  const [accountSettings, setAccountSettings] = useState<AccountSettings>(defaultSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("Counselor");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    api.get<NotifPrefs>("/api/agency/notification-preferences").then(setNotifPrefs).catch(() => {});
    api.get<AccountSettings>("/api/agency/settings").then((settings) => {
      setAccountSettings(settings);
      setTheme(settings.displayMode);
      document.documentElement.lang = settings.language.split("-")[0];
    }).catch(() => {});
    api.get<{ data: TeamMember[] }>("/api/agency/team").then((result) => setTeam(result.data)).catch(() => {});
  }, []);

  async function inviteMember() {
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    setInviting(true);
    setMessage(null);
    try {
      const member = await api.post<TeamMember>("/api/agency/team", { fullName: inviteName, email: inviteEmail, role: inviteRole });
      setTeam((current) => [...current, member]);
      setInviteName(""); setInviteEmail(""); setInviteRole("Counselor"); setShowInvite(false);
      setMessage({ type: "success", text: "Team invitation created." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Couldn't invite this team member." });
    } finally { setInviting(false); }
  }

  async function updateMember(member: TeamMember, update: Partial<Pick<TeamMember, "role" | "status">>) {
    try {
      const saved = await api.patch<TeamMember>(`/api/agency/team/${member.id}`, update);
      setTeam((current) => current.map((item) => item.id === saved.id ? saved : item));
    } catch (err) { setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Couldn't update team member." }); }
  }

  async function removeMember(id: string) {
    if (!window.confirm("Remove this member from your agency team?")) return;
    try {
      await api.delete(`/api/agency/team/${id}`);
      setTeam((current) => current.filter((member) => member.id !== id));
    } catch (err) { setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Couldn't remove team member." }); }
  }

  async function saveAccountSettings(next: AccountSettings) {
    const previous = accountSettings;
    setAccountSettings(next);
    setTheme(next.displayMode);
    document.documentElement.lang = next.language.split("-")[0];
    setSavingSettings(true);
    try {
      const saved = await api.patch<AccountSettings>("/api/agency/settings", next);
      setAccountSettings(saved);
      setTheme(saved.displayMode);
      document.documentElement.lang = saved.language.split("-")[0];
      setMessage({ type: "success", text: "Regional and display preferences saved." });
    } catch (err) {
      setAccountSettings(previous);
      setTheme(previous.displayMode);
      document.documentElement.lang = previous.language.split("-")[0];
      setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Couldn't save preferences." });
    } finally {
      setSavingSettings(false);
    }
  }

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
<div className="flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-label-md font-semibold text-on-surface-variant">
<span className="material-symbols-outlined text-[18px] text-secondary">cloud_done</span>
Preferences save automatically
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
<div className="max-w-xl">
<div className="space-y-6">
<div>
<label className="block text-label-md font-label-md text-on-surface-variant mb-2">Change Password</label>
<div className="relative mb-3">
<input
  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 pr-12 text-body-md focus:ring-2 focus:ring-primary/20"
  placeholder="Current Password"
  type={showCurrentPassword ? "text" : "password"}
  value={currentPassword}
  onChange={(e) => setCurrentPassword(e.target.value)}
/>
<button type="button" onClick={() => setShowCurrentPassword((visible) => !visible)} aria-label={showCurrentPassword ? "Hide current password" : "Show current password"} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-outline hover:text-primary transition-colors">
<span className="material-symbols-outlined text-[20px]">{showCurrentPassword ? "visibility_off" : "visibility"}</span>
</button>
</div>
<div className="relative">
<input
  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 pr-12 text-body-md focus:ring-2 focus:ring-primary/20"
  placeholder="New Password"
  type={showNewPassword ? "text" : "password"}
  value={newPassword}
  onChange={(e) => setNewPassword(e.target.value)}
/>
<button type="button" onClick={() => setShowNewPassword((visible) => !visible)} aria-label={showNewPassword ? "Hide new password" : "Show new password"} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-outline hover:text-primary transition-colors">
<span className="material-symbols-outlined text-[20px]">{showNewPassword ? "visibility_off" : "visibility"}</span>
</button>
</div>
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
</div>
</section>
{/* Billing & Subscription Status */}
<section className="col-span-12 lg:col-span-4 bg-primary dark:bg-[#1f3f91] text-white rounded-[24px] p-container-padding card-shadow relative overflow-hidden group">
{/* Visual Decoration */}
<div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
<div className="relative z-10">
<div className="flex justify-between items-start mb-10">
<div>
<span className="px-3 py-1 bg-secondary-container dark:bg-[#6f8fff] text-on-secondary-container dark:text-[#0b256d] rounded-full text-[10px] font-bold uppercase tracking-wider">Premium Agency</span>
<h3 className="font-headline-md text-headline-md mt-3">StudyBridge Plus</h3>
</div>
<span className="material-symbols-outlined text-white/50">verified</span>
</div>
<div className="space-y-4 mb-10">
<div className="flex justify-between items-center text-sm">
<span className="text-primary-fixed-dim dark:text-[#dce5ff]">Next billing date</span>
<span className="font-bold">Oct 12, 2024</span>
</div>
<div className="flex justify-between items-center text-sm">
<span className="text-primary-fixed-dim dark:text-[#dce5ff]">Active Consultants</span>
<span className="font-bold">12 / 20</span>
</div>
<div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
<div className="h-full bg-secondary-container dark:bg-[#93aaff] w-3/5"></div>
</div>
</div>
<div className="grid grid-cols-2 gap-3">
<button disabled className="py-3 bg-white/15 text-white rounded-xl text-label-md font-semibold opacity-70 cursor-not-allowed">Manage Plan (coming soon)</button>
<button disabled className="py-3 bg-white/25 text-white rounded-xl text-label-md font-bold opacity-70 cursor-not-allowed">Payment Methods (coming soon)</button>
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
{/* Regional & display preferences */}
<section className="col-span-12 lg:col-span-5 rounded-[24px] bg-surface-container-lowest dark:bg-[#202126] p-container-padding card-shadow border border-outline-variant/15 dark:border-white/5">
<div className="flex items-center gap-3 mb-7">
<div className="w-11 h-11 rounded-full bg-primary-container dark:bg-[#dce1ff] flex items-center justify-center">
<span className="material-symbols-outlined text-primary dark:text-[#1b347a]">language</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-primary dark:text-white">Regional</h3>
<p className="text-label-md text-on-surface-variant dark:text-[#bfc3ce] mt-0.5">Language, timezone and currency</p>
</div>
</div>
<div className="space-y-5">
<label className="block">
<span className="block text-label-md font-semibold text-on-surface-variant dark:text-[#d7dbe5] mb-2">Display Language</span>
<select value={accountSettings.language} onChange={(e) => saveAccountSettings({ ...accountSettings, language: e.target.value as AccountSettings["language"] })} disabled={savingSettings} className="w-full appearance-none rounded-2xl bg-surface-container-low dark:bg-[#292a30] px-4 py-3 text-body-md text-on-surface dark:text-white border-0 focus:ring-2 focus:ring-primary/30 disabled:opacity-60">
<option value="en-GB">English (United Kingdom)</option>
<option value="en-US">English (United States)</option>
<option value="fr-FR">Français</option>
<option value="es-ES">Español</option>
<option value="de-DE">Deutsch</option>
</select>
</label>
<label className="block">
<span className="block text-label-md font-semibold text-on-surface-variant dark:text-[#d7dbe5] mb-2">Timezone</span>
<select value={accountSettings.timezone} onChange={(e) => saveAccountSettings({ ...accountSettings, timezone: e.target.value as AccountSettings["timezone"] })} disabled={savingSettings} className="w-full appearance-none rounded-2xl bg-surface-container-low dark:bg-[#292a30] px-4 py-3 text-body-md text-on-surface dark:text-white border-0 focus:ring-2 focus:ring-primary/30 disabled:opacity-60">
<option value="Etc/GMT">(GMT+00:00) Greenwich Mean Time</option>
<option value="Europe/Paris">(GMT+01:00) Central European Time</option>
<option value="America/New_York">(GMT-05:00) Eastern Time</option>
</select>
</label>
<label className="block">
<span className="block text-label-md font-semibold text-on-surface-variant dark:text-[#d7dbe5] mb-2">Currency</span>
<select value={accountSettings.currency} onChange={(e) => saveAccountSettings({ ...accountSettings, currency: e.target.value as AccountSettings["currency"] })} disabled={savingSettings} className="w-full appearance-none rounded-2xl bg-surface-container-low dark:bg-[#292a30] px-4 py-3 text-body-md text-on-surface dark:text-white border-0 focus:ring-2 focus:ring-primary/30 disabled:opacity-60">
<option value="GBP">GBP (£)</option>
<option value="USD">USD ($)</option>
<option value="EUR">EUR (€)</option>
</select>
</label>
</div>
<div className="mt-8 rounded-[22px] bg-surface-container-low dark:bg-[#292a30] p-5">
<p className="font-body-lg font-bold text-primary dark:text-[#4d74ee]">Display Mode</p>
<p className="text-label-md text-on-surface-variant dark:text-[#9ba4bf] mt-1">Choose how StudyBridge looks on your device.</p>
<div className="mt-5 flex gap-3">
<button type="button" onClick={() => saveAccountSettings({ ...accountSettings, displayMode: "light" })} disabled={savingSettings} className={`flex items-center gap-2 rounded-full px-5 py-3 text-label-md font-bold border transition-all ${accountSettings.displayMode === "light" ? "bg-white text-primary border-primary shadow-sm" : "bg-transparent text-on-surface-variant dark:text-[#c5cad7] border-outline-variant/50"}`}><span className="material-symbols-outlined">light_mode</span>Light</button>
<button type="button" onClick={() => saveAccountSettings({ ...accountSettings, displayMode: "dark" })} disabled={savingSettings} className={`flex items-center gap-2 rounded-full px-5 py-3 text-label-md font-bold border transition-all ${accountSettings.displayMode === "dark" ? "bg-[#4168db] text-white border-[#7796ff] shadow-lg shadow-[#4168db]/30" : "bg-transparent text-on-surface-variant dark:text-[#c5cad7] border-outline-variant/50"}`}><span className="material-symbols-outlined">dark_mode</span>Dark</button>
</div>
{message && <p className={`mt-4 text-label-md font-medium ${message.type === "success" ? "text-secondary dark:text-[#9cc9a0]" : "text-error"}`}>{message.text}</p>}
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
<button type="button" onClick={() => setShowInvite((open) => !open)} className="flex items-center gap-2 text-primary font-bold px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors">
<span className="material-symbols-outlined text-sm">person_add</span>
<span className="text-label-md">Invite Consultant</span>
</button>
</div>
{showInvite && <div className="mb-6 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3 rounded-2xl bg-surface-container-low p-4">
<input value={inviteName} onChange={(e) => setInviteName(e.target.value)} className="rounded-xl border-0 bg-surface-container-lowest px-3 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20" placeholder="Consultant name" />
<input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="rounded-xl border-0 bg-surface-container-lowest px-3 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20" placeholder="Email address" type="email" />
<select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as TeamRole)} className="rounded-xl border-0 bg-surface-container-lowest px-3 py-2.5 text-body-md focus:ring-2 focus:ring-primary/20">{TEAM_ROLES.map((role) => <option key={role}>{role}</option>)}</select>
<button type="button" onClick={inviteMember} disabled={inviting || !inviteName.trim() || !inviteEmail.trim()} className="rounded-xl bg-primary px-4 py-2.5 font-label-md font-bold text-on-primary disabled:opacity-50">{inviting ? "Inviting..." : "Invite"}</button>
</div>}
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
{team.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-body-md text-on-surface-variant">No team members yet. Invite your first consultant.</td></tr>}
{team.map((member) => <tr key={member.id} className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-primary">{member.fullName.split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase()}</div><div><p className="font-body-md font-semibold text-primary">{member.fullName}</p><p className="text-[11px] text-on-surface-variant">{member.email}</p></div></div></td>
<td className="py-4"><select aria-label={`Role for ${member.fullName}`} value={member.role} onChange={(e) => updateMember(member, { role: e.target.value as TeamRole })} className="rounded-lg border-0 bg-surface-container px-2.5 py-1 text-xs font-medium focus:ring-2 focus:ring-primary/20">{TEAM_ROLES.map((role) => <option key={role}>{role}</option>)}</select></td>
<td className="py-4"><button type="button" onClick={() => updateMember(member, { status: member.status === "active" ? "pending" : "active" })} className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary"><span className={`w-2 h-2 rounded-full ${member.status === "active" ? "bg-green-500" : "bg-outline-variant"}`}></span>{member.status === "active" ? "Active" : "Pending Invite"}</button></td>
<td className="py-4 text-right"><button type="button" onClick={() => removeMember(member.id)} title="Remove team member" className="p-2 text-on-surface-variant hover:bg-error/10 hover:text-error rounded-lg transition-colors"><span className="material-symbols-outlined text-[20px]">delete_outline</span></button></td>
</tr>)}
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