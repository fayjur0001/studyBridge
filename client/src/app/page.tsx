"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { api, ApiError } from "@/lib/api";
import { setTheme } from "@/lib/theme";

interface AccountSettings {
  language: "en-GB" | "en-US" | "fr-FR" | "es-ES" | "de-DE";
  timezone: "Etc/GMT" | "Europe/Paris" | "America/New_York";
  currency: "GBP" | "USD" | "EUR";
  displayMode: "light" | "dark";
}

const defaults: AccountSettings = { language: "en-GB", timezone: "Etc/GMT", currency: "GBP", displayMode: "light" };

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AccountSettings>(defaults);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    api.get<AccountSettings>("/api/admin/settings").then((saved) => {
      setSettings(saved);
      setTheme(saved.displayMode);
      document.documentElement.lang = saved.language.split("-")[0];
    }).catch(() => setMessage({ type: "error", text: "Couldn't load your settings." }));
  }, []);

  async function savePreferences() {
    setSaving(true); setMessage(null);
    try {
      const saved = await api.patch<AccountSettings>("/api/admin/settings", settings);
      setSettings(saved);
      setTheme(saved.displayMode);
      document.documentElement.lang = saved.language.split("-")[0];
      setMessage({ type: "success", text: "Regional and display settings saved." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof ApiError ? error.message : "Couldn't save settings." });
    } finally { setSaving(false); }
  }

  async function changePassword() {
    if (newPassword.length < 8) { setMessage({ type: "error", text: "New password must be at least 8 characters." }); return; }
    setChangingPassword(true); setMessage(null);
    try {
      await api.post("/api/auth/change-password", { currentPassword, newPassword });
      setCurrentPassword(""); setNewPassword("");
      setMessage({ type: "success", text: "Password updated successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof ApiError ? error.message : "Couldn't update password." });
    } finally { setChangingPassword(false); }
  }

  function update<K extends keyof AccountSettings>(key: K, value: AccountSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    if (key === "displayMode") setTheme(value as "light" | "dark");
  }

  return <><AdminSidebar /><main className="ml-[260px] min-h-screen bg-background text-on-background">
    <header className="sticky top-0 z-40 h-20 px-8 flex items-center bg-surface/90 dark:bg-[#17181d]/95 backdrop-blur-md border-b border-outline-variant/20 dark:border-white/10"><div><p className="text-label-md uppercase tracking-[.16em] text-on-surface-variant font-bold">Administration</p><h1 className="font-headline-md text-primary">General Settings</h1></div></header>
    <div className="max-w-5xl p-8 space-y-7"><div><h2 className="font-headline-lg text-on-surface">Platform preferences</h2><p className="text-on-surface-variant mt-2">Personalise your admin workspace. Changes are saved to your account.</p></div>
      {message && <p className={`rounded-xl px-4 py-3 text-sm font-medium ${message.type === "success" ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-error-container text-on-error-container"}`}>{message.text}</p>}
      <section className="rounded-[24px] bg-surface-container-lowest dark:bg-[#1b1c20] border border-outline-variant/20 dark:border-white/10 p-8">
        <div className="flex gap-4 items-center mb-8"><div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center"><span className="material-symbols-outlined text-3xl">language</span></div><div><h2 className="font-headline-sm text-on-surface">Regional</h2><p className="text-sm text-on-surface-variant">Language, timezone and currency</p></div></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <SettingSelect label="Display Language" value={settings.language} onChange={(value) => update("language", value as AccountSettings["language"])} options={[["en-GB", "English (United Kingdom)"], ["en-US", "English (United States)"], ["fr-FR", "French"], ["es-ES", "Spanish"], ["de-DE", "German"]]} />
          <SettingSelect label="Timezone" value={settings.timezone} onChange={(value) => update("timezone", value as AccountSettings["timezone"])} options={[["Etc/GMT", "(GMT+00:00) Greenwich Mean Time"], ["Europe/Paris", "(GMT+01:00) Central European Time"], ["America/New_York", "(GMT-05:00) Eastern Time"]]} />
          <SettingSelect label="Currency" value={settings.currency} onChange={(value) => update("currency", value as AccountSettings["currency"])} options={[["GBP", "GBP (£)"], ["USD", "USD ($)"], ["EUR", "EUR (€)"]]} />
        </div>
        <div className="mt-8 rounded-3xl bg-surface-container-low dark:bg-[#292a30] p-6"><h3 className="font-headline-sm text-primary">Display Mode</h3><p className="text-sm text-on-surface-variant mt-1">Choose how StudyBridge looks on your device.</p><div className="flex flex-wrap gap-3 mt-5"><button type="button" onClick={() => update("displayMode", "light")} aria-pressed={settings.displayMode === "light"} className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold border ${settings.displayMode === "light" ? "bg-white text-primary border-primary shadow-sm" : "text-on-surface-variant border-outline-variant"}`}><span className="material-symbols-outlined">light_mode</span>Light</button><button type="button" onClick={() => update("displayMode", "dark")} aria-pressed={settings.displayMode === "dark"} className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold border ${settings.displayMode === "dark" ? "bg-[#4168db] text-white border-[#7796ff] shadow-lg" : "text-on-surface-variant border-outline-variant"}`}><span className="material-symbols-outlined">dark_mode</span>Dark</button></div></div>
        <div className="flex justify-end mt-6"><button onClick={savePreferences} disabled={saving} className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold disabled:opacity-50">{saving ? "Saving..." : "Save preferences"}</button></div>
      </section>
      <section className="rounded-[24px] bg-surface-container-lowest dark:bg-[#1b1c20] border border-outline-variant/20 dark:border-white/10 p-8"><div className="flex gap-4 items-center mb-7"><div className="w-12 h-12 rounded-2xl bg-error-container text-on-error-container flex items-center justify-center"><span className="material-symbols-outlined text-2xl">lock</span></div><div><h2 className="font-headline-sm text-on-surface">Account security</h2><p className="text-sm text-on-surface-variant">Update your administrator password.</p></div></div><div className="grid md:grid-cols-2 gap-4"><input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" placeholder="Current password" className="rounded-xl bg-surface-container-low px-4 py-3 text-on-surface border-0 focus:ring-2 focus:ring-primary/30"/><input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="New password (min. 8 characters)" className="rounded-xl bg-surface-container-low px-4 py-3 text-on-surface border-0 focus:ring-2 focus:ring-primary/30"/></div><button onClick={changePassword} disabled={changingPassword || !currentPassword || !newPassword} className="mt-5 px-5 py-3 rounded-xl bg-surface-container-high text-primary font-bold disabled:opacity-50">{changingPassword ? "Updating..." : "Update password"}</button></section>
    </div>
  </main></>;
}

function SettingSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) {
  return <label className="block"><span className="block text-sm font-bold text-on-surface-variant mb-2">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl bg-surface-container-low px-4 py-3 text-on-surface border-0 focus:ring-2 focus:ring-primary/30">{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>;
}