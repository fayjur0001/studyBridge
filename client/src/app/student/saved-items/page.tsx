"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { universityImage } from "@/lib/university-images";
import { University, Scholarship } from "@/lib/types";

interface SavedItem {
  userId: string;
  itemType: "university" | "program" | "scholarship";
  itemId: string;
}

export default function SavedItemsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"universities" | "scholarships">("universities");
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [universities, setUniversities] = useState<Record<string, University>>({});
  const [scholarships, setScholarships] = useState<Record<string, Scholarship>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: SavedItem[] }>("/api/saved-items")
      .then(async (res) => {
        setSavedItems(res.data);

        const uniIds = res.data.filter((i) => i.itemType === "university").map((i) => i.itemId);
        const schIds = res.data.filter((i) => i.itemType === "scholarship").map((i) => i.itemId);

        const [uniResults, schResults] = await Promise.all([
          Promise.all(uniIds.map((id) => api.get<University>(`/api/universities/${id}`, { auth: false }).catch(() => null))),
          Promise.all(schIds.map((id) => api.get<Scholarship>(`/api/scholarships/${id}`, { auth: false }).catch(() => null))),
        ]);

        setUniversities(Object.fromEntries(uniResults.filter(Boolean).map((u) => [u!.id, u!])));
        setScholarships(Object.fromEntries(schResults.filter(Boolean).map((s) => [s!.id, s!])));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(itemType: SavedItem["itemType"], itemId: string) {
    await api.delete(`/api/saved-items/${itemType}/${itemId}`).catch(() => {});
    setSavedItems((prev) => prev.filter((i) => !(i.itemType === itemType && i.itemId === itemId)));
  }

  const savedUniversities = savedItems.filter((i) => i.itemType === "university").map((i) => universities[i.itemId]).filter(Boolean);
  const savedScholarships = savedItems.filter((i) => i.itemType === "scholarship").map((i) => scholarships[i.itemId]).filter(Boolean);

  return (
    <>
<StudentSidebar />

<main className="md:ml-[260px] min-h-screen">

<header className="flex justify-between items-center w-full px-10 h-16 sticky top-0 z-40 bg-surface-container-lowest shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
<div className="flex items-center gap-6">
<div className="relative hidden sm:block">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
<input className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-primary/20 text-body-md transition-all" placeholder="Search programs, universities..." type="text" />
</div>
</div>
<div className="flex items-center gap-4">
<div className="flex items-center gap-3 cursor-pointer">
<div className="text-right">
<p className="font-bold text-sm text-primary leading-tight">{user?.fullName ?? "..."}</p>
</div>
<div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-primary-container flex items-center justify-center font-bold text-primary">
{user?.fullName?.[0] ?? "S"}
</div>
</div>
</div>
</header>

<div className="px-10 pt-10 pb-6">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<nav className="flex gap-2 text-xs text-outline mb-4 font-semibold uppercase tracking-wider">
<Link className="hover:text-primary transition-colors" href="/student/dashboard">Dashboard</Link>
<span>/</span>
<span className="text-primary">Saved Items</span>
</nav>
<h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Your Academic Roadmap</h2>
<p className="text-on-surface-variant text-body-lg mt-2">Manage your top university choices and matching scholarship opportunities.</p>
</div>
</div>
</div>

<div className="px-10 mb-8 border-b border-outline-variant">
<div className="flex gap-10">
<button className={activeTab === "universities" ? "relative pb-4 font-semibold text-primary transition-all flex items-center gap-2" : "relative pb-4 font-semibold text-outline hover:text-primary transition-all flex items-center gap-2"} onClick={() => setActiveTab("universities")}>
<span className="material-symbols-outlined text-lg">account_balance</span>
                    Universities ({savedUniversities.length})
                    <div className={activeTab === "universities" ? "active-tab-indicator" : "active-tab-indicator hidden"}></div>
</button>
<button className={activeTab === "scholarships" ? "relative pb-4 font-semibold text-primary transition-all flex items-center gap-2" : "relative pb-4 font-semibold text-outline hover:text-primary transition-all flex items-center gap-2"} onClick={() => setActiveTab("scholarships")}>
<span className="material-symbols-outlined text-lg">payments</span>
                    Scholarships ({savedScholarships.length})
                    <div className={activeTab === "scholarships" ? "active-tab-indicator" : "active-tab-indicator hidden"}></div>
</button>
</div>
</div>

<div className="px-10 pb-20">

<div className={activeTab === "universities" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-card-gap" : "hidden"}>
{!loading && savedUniversities.length === 0 && (
  <p className="text-on-surface-variant font-body-md col-span-full">No universities saved yet — browse the <Link href="/universities" className="text-primary font-bold hover:underline">university directory</Link> and save your favorites.</p>
)}
{savedUniversities.map((u) => (
<div key={u.id} className="bg-surface-container-lowest rounded-[24px] ambient-card overflow-hidden group">
<div className="h-32 bg-primary relative">
<div className="w-full h-full bg-cover bg-center mix-blend-overlay opacity-60" style={{backgroundImage: `url('${universityImage(u.name, u.coverImageUrl, u.logoUrl)}')`}}></div>
<div className="absolute top-4 right-4 flex gap-2">
{u.ranking && <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold shadow-sm">#{u.ranking} Global</span>}
<button onClick={() => handleRemove("university", u.id)} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-error transition-colors flex items-center justify-center" title="Remove from saved">
<span className="material-symbols-outlined text-lg">close</span>
</button>
</div>
</div>
<div className="p-8 -mt-10 relative">
<div className="bg-white p-3 rounded-2xl shadow-lg w-16 h-16 flex items-center justify-center mb-4">
<span className="material-symbols-outlined text-primary text-3xl">school</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-primary leading-tight mb-2">{u.name}</h3>
<p className="text-on-surface-variant text-sm mb-6">{[u.city, u.country].filter(Boolean).join(", ")}</p>
<div className="flex items-center justify-end">
<Link href={`/universities/${u.id}`} className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:shadow-lg transition-all active:scale-95">View Profile</Link>
</div>
</div>
</div>
))}
</div>

<div className={activeTab === "scholarships" ? "grid grid-cols-1 lg:grid-cols-2 gap-card-gap" : "hidden"}>
{!loading && savedScholarships.length === 0 && (
  <p className="text-on-surface-variant font-body-md col-span-full">No scholarships saved yet — browse <Link href="/scholarships" className="text-primary font-bold hover:underline">scholarships</Link> to save some.</p>
)}
{savedScholarships.map((s) => (
<div key={s.id} className="bg-surface-container-lowest rounded-[24px] ambient-card p-8 border-l-8 border-secondary flex flex-col md:flex-row gap-8 relative">
<button onClick={() => handleRemove("scholarship", s.id)} className="absolute top-4 right-4 text-outline hover:text-error transition-colors">
<span className="material-symbols-outlined">delete_outline</span>
</button>
<div className="md:w-1/3">
{s.category && (
<div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold mb-4">
<span className="material-symbols-outlined text-sm">stars</span>
{s.category}
</div>
)}
<h3 className="font-headline-sm text-headline-sm text-primary mb-2">{s.title}</h3>
<p className="text-on-surface-variant text-sm mb-4">{s.provider}</p>
{s.amountUsd && <div className="text-3xl font-extrabold text-secondary">${Number(s.amountUsd).toLocaleString()}</div>}
</div>
<div className="md:w-2/3 border-l border-outline-variant/30 pl-0 md:pl-8 flex flex-col justify-between">
<div>
<p className="text-[10px] uppercase font-bold text-outline tracking-wider mb-3">Eligibility</p>
<p className="text-sm text-on-surface-variant">{s.eligibility || "See scholarship page for full details."}</p>
</div>
<div className="mt-6 flex items-center justify-end">
{s.applyUrl ? (
<a href={s.applyUrl} target="_blank" rel="noreferrer" className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold hover:shadow-xl transition-all active:scale-95">Apply</a>
) : (
<span className="text-outline font-label-md">Application link coming soon</span>
)}
</div>
</div>
</div>
))}
</div>
</div>
</main>
    </>
  );
}
