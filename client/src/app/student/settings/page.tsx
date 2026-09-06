"use client";

import { useEffect, useState } from "react";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { api, ApiError } from "@/lib/api";

interface NotifPrefs {
  emailOnApplicationUpdate: boolean;
  emailOnMessage: boolean;
}

export default function StudentSettingsPage() {
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

  useEffect(() => {
    api.get<NotifPrefs>("/api/student/notification-preferences").then(setNotifPrefs).catch(() => {});
  }, []);

  async function saveNotifPref(key: keyof NotifPrefs, value: boolean) {
    setNotifPrefs((prev) => ({ ...prev, [key]: value }));
    await api.patch("/api/student/notification-preferences", { [key]: value }).catch(() => {});
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

<div className="flex flex-col md:flex-row gap-6 items-center">
<div className="w-full md:w-1/3">
<h5 className="font-body-lg text-body-lg font-semibold text-on-background">Two-Factor Authentication</h5>
<p className="font-label-md text-label-md text-on-surface-variant mt-1">Add an extra layer of protection to your account.</p>
</div>
<div className="flex-1 w-full flex justify-between items-center bg-secondary-fixed/30 p-5 rounded-2xl border border-secondary-fixed">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-secondary" data-icon="verified_user">verified_user</span>
<div>
<p className="font-body-md text-body-md font-semibold text-on-secondary-fixed">2FA is currently <span className="text-error">Disabled</span></p>
<p className="font-label-md text-label-md text-on-secondary-fixed-variant opacity-80">Requires verification via mobile app.</p>
</div>
</div>
<button className="bg-secondary text-on-secondary px-4 py-2 rounded-lg font-label-md text-label-md font-semibold hover:bg-secondary-container transition-all">Enable Now</button>
</div>
</div>
<hr className="border-surface-variant/40" />

<div className="flex flex-col md:flex-row gap-6 items-start">
<div className="w-full md:w-1/3">
<h5 className="font-body-lg text-body-lg font-semibold text-on-background">Active Sessions</h5>
<p className="font-label-md text-label-md text-on-surface-variant mt-1">Review your recent login activity.</p>
</div>
<div className="flex-1 w-full space-y-3">
<div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-outline" data-icon="laptop_mac">laptop_mac</span>
<div>
<p className="font-body-md text-body-md font-semibold text-on-surface">MacBook Pro M2 • London, UK</p>
<p className="font-label-md text-label-md text-on-surface-variant">Active now</p>
</div>
</div>
<span className="font-label-md text-label-md text-secondary font-semibold px-3 py-1 bg-secondary-fixed rounded-full">Current</span>
</div>
<div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl opacity-70">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-outline" data-icon="smartphone">smartphone</span>
<div>
<p className="font-body-md text-body-md font-semibold text-on-surface">iPhone 14 Pro • London, UK</p>
<p className="font-label-md text-label-md text-on-surface-variant">Last active: 2 hours ago</p>
</div>
</div>
<button className="text-error hover:underline font-label-md text-label-md">Terminate</button>
</div>
</div>
</div>
</div>
</section>

<section className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-3xl p-8 card-shadow border border-surface-variant/20 self-start">
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-tertiary bg-tertiary-fixed p-2 rounded-xl" data-icon="language">language</span>
<h4 className="font-headline-sm text-headline-sm text-on-background">Regional</h4>
</div>
<div className="space-y-6">
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant px-1">Display Language</label>
<div className="relative">
<select className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 appearance-none font-body-md text-body-md">
<option>English (United Kingdom)</option>
<option>English (United States)</option>
<option>French (France)</option>
<option>Spanish (Spain)</option>
<option>German (Germany)</option>
</select>
<span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline" data-icon="expand_more">expand_more</span>
</div>
</div>
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant px-1">Timezone</label>
<div className="relative">
<select className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 appearance-none font-body-md text-body-md">
<option>(GMT+00:00) Greenwich Mean Time</option>
<option>(GMT+01:00) Central European Time</option>
<option>(GMT-05:00) Eastern Time</option>
</select>
<span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline" data-icon="schedule">schedule</span>
</div>
</div>
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant px-1">Currency</label>
<div className="relative">
<select className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 appearance-none font-body-md text-body-md">
<option>GBP (£)</option>
<option>USD ($)</option>
<option>EUR (€)</option>
</select>
<span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline" data-icon="payments">payments</span>
</div>
</div>
</div>
</section>

<section className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-card-gap">

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
<button className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10">
<span className="material-symbols-outlined text-[18px]" data-icon="light_mode">light_mode</span>
<span className="font-label-md text-label-md font-semibold">Light</span>
</button>
<button className="flex items-center justify-center gap-2 py-3 bg-primary-container hover:bg-secondary-container rounded-xl transition-all border border-white/20">
<span className="material-symbols-outlined text-[18px]" data-icon="dark_mode">dark_mode</span>
<span className="font-label-md text-label-md font-semibold">Dark</span>
</button>
</div>
</div>
<div className="mt-8 pt-6 border-t border-white/10">
<button className="w-full flex items-center justify-between text-primary-fixed-dim hover:text-white transition-all">
<span className="font-body-md text-body-md font-semibold">Beta Feedback Program</span>
<span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
</button>
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
<button className="text-error border border-error/30 hover:bg-error hover:text-white px-6 py-2 rounded-xl font-label-md text-label-md font-semibold transition-all">
                            Deactivate Account
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