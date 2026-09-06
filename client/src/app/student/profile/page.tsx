"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface StudentProfileData {
  fullName: string;
  email: string;
  phone: string | null;
  studentProfile: {
    bio: string | null;
    nationality: string | null;
    currentEducationLevel: string | null;
    gpa: string | null;
    preferredCountries: string[];
    preferredFields: string[];
  } | null;
}

export default function StudentProfilePage() {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [countries, setCountries] = useState("");
  const [fields, setFields] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function load() {
    api.get<StudentProfileData>("/api/student/me").then((data) => {
      setProfile(data);
      setFullName(data.fullName);
      setPhone(data.phone ?? "");
      setBio(data.studentProfile?.bio ?? "");
      setCountries((data.studentProfile?.preferredCountries ?? []).join(", "));
      setFields((data.studentProfile?.preferredFields ?? []).join(", "));
    });
  }

  useEffect(load, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await api.patch("/api/student/me", {
        user: { fullName, phone },
        profile: {
          bio,
          preferredCountries: countries.split(",").map((c) => c.trim()).filter(Boolean),
          preferredFields: fields.split(",").map((f) => f.trim()).filter(Boolean),
        },
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const [firstName, ...lastNameParts] = fullName.split(" ");
  const lastName = lastNameParts.join(" ");

  return (
    <>
<StudentSidebar />

<main className="flex-grow ml-[260px] min-h-screen flex flex-col relative">

<header className="bg-surface-container-lowest dark:bg-inverse-surface shadow-[0px_2px_4px_rgba(0,0,0,0.02)] flex justify-between items-center w-full px-margin-desktop h-16 sticky top-0 z-40">
<div className="flex items-center gap-gutter flex-1">
<div className="relative w-full max-w-md">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
<input className="w-full bg-surface-container-low border-none rounded-full py-2 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" placeholder="Search resources, applications..." type="text" />
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
<div className="text-right">
<p className="font-bold text-body-md text-on-surface">{profile?.fullName ?? "..."}</p>
</div>
<div className="w-10 h-10 rounded-full border-2 border-primary-container bg-primary-container flex items-center justify-center font-bold text-primary">
{profile?.fullName?.[0] ?? "S"}
</div>
</div>
</div>
</header>

<section className="p-margin-desktop flex-grow">

<div className="bg-surface-container-lowest rounded-[24px] ambient-occlusion p-container-padding mb-8 relative overflow-hidden">

<div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
<div className="relative">
<div className="w-32 h-32 rounded-full border-4 border-surface-container-high bg-primary-container flex items-center justify-center text-4xl font-bold text-primary">
{profile?.fullName?.[0] ?? "S"}
</div>
</div>
<div className="text-center md:text-left">
<div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
<h2 className="font-headline-lg text-headline-lg text-primary">{profile?.fullName ?? "..."}</h2>
</div>
<p className="text-body-lg text-on-surface-variant mb-4">{profile?.email}</p>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-[24px] ambient-occlusion min-h-[600px] flex flex-col">

<div className="flex px-8 border-b border-surface-container-high">
<button className={activeTab === "personal" ? "px-6 py-5 font-bold text-primary active-tab-indicator transition-all cursor-pointer" : "px-6 py-5 font-medium text-on-surface-variant hover:text-primary transition-all cursor-pointer"} onClick={() => setActiveTab("personal")}>Personal Info</button>
<button className={activeTab === "academic" ? "px-6 py-5 font-bold text-primary active-tab-indicator transition-all cursor-pointer" : "px-6 py-5 font-medium text-on-surface-variant hover:text-primary transition-all cursor-pointer"} onClick={() => setActiveTab("academic")}>Academic History</button>
<button className={activeTab === "preferences" ? "px-6 py-5 font-bold text-primary active-tab-indicator transition-all cursor-pointer" : "px-6 py-5 font-medium text-on-surface-variant hover:text-primary transition-all cursor-pointer"} onClick={() => setActiveTab("preferences")}>Preferences</button>
</div>

<div className="p-container-padding">

<div className={activeTab === "personal" ? "space-y-8" : "hidden"}>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div className="space-y-6">
<h3 className="font-headline-sm text-headline-sm text-on-surface">Basic Details</h3>
<div className="grid grid-cols-2 gap-4">
<div className="space-y-1">
<label className="text-label-md text-on-surface-variant">First Name</label>
<input
  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-secondary transition-all"
  type="text"
  value={firstName ?? ""}
  onChange={(e) => setFullName([e.target.value, lastName].filter(Boolean).join(" "))}
/>
</div>
<div className="space-y-1">
<label className="text-label-md text-on-surface-variant">Last Name</label>
<input
  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-secondary transition-all"
  type="text"
  value={lastName}
  onChange={(e) => setFullName([firstName, e.target.value].filter(Boolean).join(" "))}
/>
</div>
</div>
<div className="space-y-1">
<label className="text-label-md text-on-surface-variant">Email Address</label>
<input className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 opacity-60" type="email" value={profile?.email ?? ""} readOnly />
</div>
<div className="space-y-1">
<label className="text-label-md text-on-surface-variant">Phone Number</label>
<input
  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-secondary transition-all"
  type="tel"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
/>
</div>
</div>
<div className="space-y-6">
<h3 className="font-headline-sm text-headline-sm text-on-surface">Bio &amp; Objective</h3>
<div className="space-y-1">
<label className="text-label-md text-on-surface-variant">About Me</label>
<textarea
  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-secondary transition-all resize-none"
  rows={4}
  value={bio}
  onChange={(e) => setBio(e.target.value)}
/>
</div>
</div>
</div>
</div>

<div className={activeTab === "academic" ? "space-y-6" : "hidden"}>
<p className="text-on-surface-variant font-body-md">Detailed education history isn&apos;t tracked yet — you can note your current level and GPA from your profile settings.</p>
</div>

<div className={activeTab === "preferences" ? "space-y-8" : "hidden"}>
<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
<div className="space-y-6">
<h3 className="font-headline-sm text-headline-sm text-on-surface">Application Interests</h3>
<div className="space-y-4">
<div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
<span className="material-symbols-outlined text-secondary">public</span>
<div className="flex-grow">
<p className="font-bold">Target Countries</p>
<input
  className="text-label-md text-on-surface-variant bg-transparent border-none w-full focus:ring-0 p-0"
  value={countries}
  onChange={(e) => setCountries(e.target.value)}
  placeholder="e.g. UK, USA, Switzerland"
/>
</div>
</div>
<div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
<span className="material-symbols-outlined text-secondary">science</span>
<div className="flex-grow">
<p className="font-bold">Field of Study</p>
<input
  className="text-label-md text-on-surface-variant bg-transparent border-none w-full focus:ring-0 p-0"
  value={fields}
  onChange={(e) => setFields(e.target.value)}
  placeholder="e.g. Artificial Intelligence, Data Science"
/>
</div>
</div>
</div>
</div>
<div className="space-y-6">
<h3 className="font-headline-sm text-headline-sm text-on-surface">Notification Settings</h3>
<div className="space-y-6">
<div className="flex items-center justify-between">
<div>
<p className="font-bold">Application Deadlines</p>
<p className="text-label-md text-on-surface-variant">Alert me 2 weeks before due dates</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<div className="flex items-center justify-between">
<div>
<p className="font-bold">Mentorship Invitations</p>
<p className="text-label-md text-on-surface-variant">Receive alerts for expert consultation</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<div className="flex items-center justify-between">
<div>
<p className="font-bold">Weekly Digest</p>
<p className="text-label-md text-on-surface-variant">Email summary of program matches</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
</div>
</div>
</div>
</div>

<div className="mt-auto px-8 py-6 border-t border-surface-container-high flex justify-end gap-4">
<button onClick={load} className="px-6 py-2 text-on-surface-variant font-bold hover:text-primary transition-colors">Discard Changes</button>
<button onClick={handleSave} disabled={saving} className="bg-primary text-on-primary px-8 py-2 rounded-xl font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50">
  {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
</button>
</div>
</div>
</section>

<footer className="p-margin-desktop pt-0 text-label-md text-on-surface-variant flex justify-between items-center opacity-60">
<p>© 2024 StudyBridge Academic Excellence. All rights reserved.</p>
<div className="flex gap-4">
<Link className="hover:underline" href="/privacy">Privacy Policy</Link>
<Link className="hover:underline" href="/terms">Terms of Service</Link>
</div>
</footer>
</main>
    </>
  );
}
