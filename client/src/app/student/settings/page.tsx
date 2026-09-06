"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/locale-context";

interface NotifPrefs {
  emailOnApplicationUpdate: boolean;
  emailOnMessage: boolean;
}

interface AccountSettings {
  language: "en-GB" | "en-US" | "fr-FR" | "es-ES" | "de-DE";
  timezone: "Etc/GMT" | "Europe/Paris" | "America/New_York";
  currency: "GBP" | "USD" | "EUR";
  displayMode: "light" | "dark";
}

interface Session {
  id: string;
  deviceName: string | null;
  ipAddress: string | null;
  createdAt: string;
  isCurrent: boolean;
}

const defaultSettings: AccountSettings = { language: "en-GB", timezone: "Etc/GMT", currency: "GBP", displayMode: "light" };

export default function StudentSettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { setLocale } = useLocale();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    emailOnApplicationUpdate: true,
    emailOnMessage: true,
  });
  const [accountSettings, setAccountSettings] = useState<AccountSettings>(defaultSettings);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    api.get<NotifPrefs>("/api/student/notification-preferences").then(setNotifPrefs).catch(() => {});
    api.get<AccountSettings>("/api/student/settings").then((settings) => {
      setAccountSettings(settings);
      document.documentElement.classList.toggle("dark", settings.displayMode === "dark");
      document.documentElement.lang = settings.language.split("-")[0];
      setLocale(settings.language);
    }).catch(() => {});
    api.get<Session[]>("/api/student/sessions").then(setSessions).catch(() => {});
  }, []);

  async function saveNotifPref(key: keyof NotifPrefs, value: boolean) {
    setNotifPrefs((prev) => ({ ...prev, [key]: value }));
    try {
      await api.patch("/api/student/notification-preferences", { [key]: value });
    } catch {
      setNotifPrefs((prev) => ({ ...prev, [key]: !value }));
      setMessage({ type: "error", text: "Couldn't save notification preference." });
    }
  }

  async function saveAccountSettings(next: AccountSettings) {
    const previous = accountSettings;
    // Reflect a choice immediately; the request below makes it persistent.
    setAccountSettings(next);
    document.documentElement.classList.toggle("dark", next.displayMode === "dark");
    document.documentElement.lang = next.language.split("-")[0];
    setLocale(next.language);
    setSavingSettings(true);
    try {
      const saved = await api.patch<AccountSettings>("/api/student/settings", next);
      setAccountSettings(saved);
      document.documentElement.classList.toggle("dark", saved.displayMode === "dark");
      document.documentElement.lang = saved.language.split("-")[0];
      setLocale(saved.language);
      setMessage({ type: "success", text: "Preferences saved." });
    } catch (err) {
      setAccountSettings(previous);
      document.documentElement.classList.toggle("dark", previous.displayMode === "dark");
      document.documentElement.lang = previous.language.split("-")[0];
      setLocale(previous.language);
      setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Couldn't save preferences." });
    } finally {
      setSavingSettings(false);
    }
  }

  async function terminateSession(id: string) {
    try {
      await api.delete(`/api/student/sessions/${id}`);
      setSessions((current) => current.filter((session) => session.id !== id));
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Couldn't end this session." });
    }
  }

  async function deactivateAccount() {
    if (!window.confirm("Deactivate your account? You will be signed out and an administrator will need to reactivate it.")) return;
    setDeactivating(true);
    try {
      await api.post("/api/student/deactivate");
      await logout();
      router.replace("/");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Couldn't deactivate your account." });
      setDeactivating(false);
    }
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
<StudentSidebar />

<main className="ml-[260px] min-h-screen">

<header className="flex justify-between items-center w-full px-margin-desktop h-16 sticky top-0 z-40 bg-surface-container-lowest dark:bg-inverse-surface shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
<div className="flex items-center gap-6">
<h2 className="font-headline-sm text-headline-sm font-bold text-primary dark:text-inverse-primary">Settings</h2>
<div className="relative hidden lg:block">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
<input className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-primary/20 text-body-md font-body-md transition-all" placeholder="Search preferences..." type="text" />
</div>
</div>
</header>
<div className="p-container-padding max-w-7xl mx-auto space-y-gutter">

<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
<div>
<h3 className="font-headline-lg text-headline-lg text-on-background">System Preferences</h3>
<p className="font-body-lg text-body-lg text-on-surface-variant mt-1">Manage your account security, notifications, and regional settings.</p>
</div>
</div>

<div className="grid grid-cols-12 gap-card-gap">

<section className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-3xl p-margin-desktop card-shadow border border-surface-variant/20">
<div className="flex items-center gap-3 mb-8">
<span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-xl" data-icon="security" style={{fontVariationSettings: "'FILL' 1"}}>security</span>
<h4 className="font-headline-sm text-headline-sm text-on-background">Account Security</h4>
</div>
<div className="space-y-8">

<div className="flex flex-col md:flex-row gap-6 items-start">
<div className="w-full md:w-1/3">
<h5 className="font-body-lg text-body-lg font-semibold text-on-background">Update Password</h5>
<p className="font-label-md text-label-md text-on-surface-variant mt-1">Change your password regularly for better security.</p>
</div>
<div className="flex-1 w-full">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
<div className="space-y-1.5">
<label className="font-label-md text-label-md text-on-surface-variant">Current Password</label>
<div className="relative">
<input
  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 pr-11 focus:ring-2 focus:ring-primary/20 transition-all"
  placeholder="••••••••"
  type={showCurrentPassword ? "text" : "password"}
  value={currentPassword}
  onChange={(e) => setCurrentPassword(e.target.value)}
/>
<button
  type="button"
  onClick={() => setShowCurrentPassword((v) => !v)}
  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
>
<span className="material-symbols-outlined text-[20px]">
  {showCurrentPassword ? "visibility_off" : "visibility"}
</span>
</button>
</div>
</div>
<div className="space-y-1.5">
<label className="font-label-md text-label-md text-on-surface-variant">New Password</label>
<div className="relative">
<input
  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 pr-11 focus:ring-2 focus:ring-primary/20 transition-all"
  placeholder="••••••••"
  type={showNewPassword ? "text" : "password"}
  value={newPassword}
  onChange={(e) => setNewPassword(e.target.value)}
/>
<button
  type="button"
  onClick={() => setShowNewPassword((v) => !v)}
  aria-label={showNewPassword ? "Hide password" : "Show password"}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
>
<span className="material-symbols-outlined text-[20px]">
  {showNewPassword ? "visibility_off" : "visibility"}
</span>
</button>
</div>
</div>
</div>
{message && (
  <p className={`font-label-md text-label-md mb-3 ${message.type === "success" ? "text-primary" : "text-error"}`}>{message.text}</p>
)}
<button
  onClick={handleChangePassword}
  disabled={saving || !currentPassword || !newPassword}
  className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-body-md text-body-md font-semibold hover:opacity-90 transition-all disabled:opacity-50"
>
  {saving ? "Updating..." : "Update Password"}
</button>
</div>
</div>
<hr className="border-surface-variant/40" />

<div className="flex flex-col md:flex-row gap-6 items-start">
<div className="w-full md:w-1/3">
<h5 className="font-body-lg text-body-lg font-semibold text-on-background">Active Sessions</h5>
<p className="font-label-md text-label-md text-on-surface-variant mt-1">Review your recent login activity.</p>
</div>
<div className="flex-1 w-full space-y-3">
{sessions.length === 0 ? <p className="p-4 bg-surface-container-low rounded-xl font-label-md text-on-surface-variant">No active sessions found.</p> : sessions.map((session) => (
<div key={session.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-outline">{session.deviceName?.toLowerCase().includes("iphone") || session.deviceName?.toLowerCase().includes("android") ? "smartphone" : "laptop_mac"}</span>
<div>
<p className="font-body-md text-body-md font-semibold text-on-surface">{session.deviceName ?? "Unknown device"}{session.ipAddress ? ` • ${session.ipAddress}` : ""}</p>
<p className="font-label-md text-label-md text-on-surface-variant">{session.isCurrent ? "Active now" : `Signed in ${new Date(session.createdAt).toLocaleString()}`}</p>
</div>
</div>
{session.isCurrent ? <span className="font-label-md text-label-md text-secondary font-semibold px-3 py-1 bg-secondary-fixed rounded-full">Current</span> : <button onClick={() => terminateSession(session.id)} className="text-error hover:underline font-label-md text-label-md">Terminate</button>}
</div>
))}
</div>
</div>
</div>
</section>

<section className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-3xl p-8 card-shadow border border-surface-variant/20 self-start">
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-tertiary bg-tertiary-fixed p-2 rounded-xl" data-icon="language">language</span>
<h4 className="font-headline-sm text-headline-sm text-on-background">Regional</h4>
</div>
{savingSettings && <p className="mb-4 font-label-md text-primary">Saving preferences...</p>}
<div className="space-y-6">
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant px-1">Display Language</label>
<div className="relative">
<select value={accountSettings.language} onChange={(e) => saveAccountSettings({ ...accountSettings, language: e.target.value as AccountSettings["language"] })} disabled={savingSettings} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 appearance-none font-body-md text-body-md disabled:opacity-60">
<option value="en-GB">English (United Kingdom)</option>
<option value="en-US">English (United States)</option>
<option value="fr-FR">French (France)</option>
<option value="es-ES">Spanish (Spain)</option>
<option value="de-DE">German (Germany)</option>
</select>
<span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline" data-icon="expand_more">expand_more</span>
</div>
</div>
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant px-1">Timezone</label>
<div className="relative">
<select value={accountSettings.timezone} onChange={(e) => saveAccountSettings({ ...accountSettings, timezone: e.target.value as AccountSettings["timezone"] })} disabled={savingSettings} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 appearance-none font-body-md text-body-md disabled:opacity-60">
<option value="Etc/GMT">(GMT+00:00) Greenwich Mean Time</option>
<option value="Europe/Paris">(GMT+01:00) Central European Time</option>
<option value="America/New_York">(GMT-05:00) Eastern Time</option>
</select>
<span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline" data-icon="schedule">schedule</span>
</div>
</div>
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant px-1">Currency</label>
<div className="relative">
<select value={accountSettings.currency} onChange={(e) => saveAccountSettings({ ...accountSettings, currency: e.target.value as AccountSettings["currency"] })} disabled={savingSettings} className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 appearance-none font-body-md text-body-md disabled:opacity-60">
<option value="GBP">GBP (£)</option>
<option value="USD">USD ($)</option>
<option value="EUR">EUR (€)</option>
</select>
<span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline" data-icon="payments">payments</span>
</div>
</div>
</div>
</section>

<section id="notifications" className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-card-gap">

<div className="col-span-1 md:col-span-3 flex items-center gap-3">
<span className="material-symbols-outlined text-secondary bg-secondary-fixed p-2 rounded-xl" data-icon="notifications_active" style={{fontVariationSettings: "'FILL' 1"}}>notifications_active</span>
<h4 className="font-headline-sm text-headline-sm text-on-background">Notification Preferences</h4>
</div>

<div className="bg-surface-container-lowest p-8 rounded-3xl card-shadow border border-surface-variant/20">
<div className="flex items-center justify-between mb-6">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary" data-icon="mail">mail</span>
<h5 className="font-body-lg text-body-lg font-bold">Application Updates</h5>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input
  checked={notifPrefs.emailOnApplicationUpdate}
  onChange={(e) => saveNotifPref("emailOnApplicationUpdate", e.target.checked)}
  className="sr-only peer"
  type="checkbox"
/>
<div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">Email me when one of my applications changes status.</p>
</div>

<div className="bg-surface-container-lowest p-8 rounded-3xl card-shadow border border-surface-variant/20">
<div className="flex items-center justify-between mb-6">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-secondary" data-icon="send_to_mobile">send_to_mobile</span>
<h5 className="font-body-lg text-body-lg font-bold">New Messages</h5>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input
  checked={notifPrefs.emailOnMessage}
  onChange={(e) => saveNotifPref("emailOnMessage", e.target.checked)}
  className="sr-only peer"
  type="checkbox"
/>
<div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
</label>
</div>
<p className="font-body-md text-body-md text-on-surface-variant">Email me when I get a new message.</p>
</div>

<div className="bg-primary dark:bg-inverse-surface p-8 rounded-3xl shadow-xl flex flex-col justify-between text-on-primary">
<div>
<h5 className="font-body-lg text-body-lg font-bold mb-2">Display Mode</h5>
<p className="font-label-md text-label-md opacity-80 mb-6">Choose how StudyBridge looks on your device.</p>
<div className="grid grid-cols-2 gap-3">
<button onClick={() => saveAccountSettings({ ...accountSettings, displayMode: "light" })} disabled={savingSettings} aria-pressed={accountSettings.displayMode === "light"} className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all border disabled:opacity-60 ${accountSettings.displayMode === "light" ? "bg-white/25 border-white/40" : "bg-white/10 hover:bg-white/20 border-white/10"}`}>
<span className="material-symbols-outlined text-[18px]" data-icon="light_mode">light_mode</span>
<span className="font-label-md text-label-md font-semibold">Light</span>
</button>
<button onClick={() => saveAccountSettings({ ...accountSettings, displayMode: "dark" })} disabled={savingSettings} aria-pressed={accountSettings.displayMode === "dark"} className={`flex items-center justify-center gap-2 py-3 rounded-xl transition-all border disabled:opacity-60 ${accountSettings.displayMode === "dark" ? "bg-secondary-container border-white/40" : "bg-primary-container hover:bg-secondary-container border-white/20"}`}>
<span className="material-symbols-outlined text-[18px]" data-icon="dark_mode">dark_mode</span>
<span className="font-label-md text-label-md font-semibold">Dark</span>
</button>
</div>
</div>
</div>
</section>

<section className="col-span-12 bg-error-container/10 border border-error/20 rounded-3xl p-8 mt-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-error p-2 bg-error/10 rounded-xl" data-icon="report">report</span>
<div>
<h4 className="font-body-lg text-body-lg font-bold text-on-error-container">Deactivate Account</h4>
<p className="font-label-md text-label-md text-on-error-container opacity-70">This will temporarily disable your account and hide your profile.</p>
</div>
</div>
<button onClick={deactivateAccount} disabled={deactivating} className="text-error border border-error/30 hover:bg-error hover:text-white px-6 py-2 rounded-xl font-label-md text-label-md font-semibold transition-all disabled:opacity-50">
                            {deactivating ? "Deactivating..." : "Deactivate Account"}
                        </button>
</div>
</section>
</div>
</div>
</main>

<div className="fixed bottom-0 left-[260px] right-0 h-4 bg-gradient-to-t from-background to-transparent pointer-events-none z-10"></div>
    </>
  );
}
