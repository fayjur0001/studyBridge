"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { api } from "@/lib/api";

interface Agency {
  userId: string;
  companyName: string;
  licenseNumber: string | null;
  website: string | null;
  isVerified: boolean;
  email: string;
  fullName: string;
}

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<{ data: Agency[] }>("/api/admin/agencies")
      .then((res) => {
        setAgencies(res.data);
        setSelectedId((current) => current ?? res.data.find((a) => !a.isVerified)?.userId ?? res.data[0]?.userId ?? null);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const pending = agencies.filter((a) => !a.isVerified);
  const selected = agencies.find((a) => a.userId === selectedId) ?? null;

  async function setVerified(isVerified: boolean) {
    if (!selected) return;
    setUpdating(true);
    try {
      await api.patch(`/api/admin/agencies/${selected.userId}/verify`, { isVerified });
      load();
    } finally {
      setUpdating(false);
    }
  }

  return (
    <>
<AdminSidebar />


{/* Top Navigation Bar */}
<header className="flex justify-between items-center h-16 px-8 ml-[260px] w-[calc(100%-260px)] sticky top-0 z-40 bg-surface border-b border-outline-variant shadow-sm">
<div className="flex items-center gap-4">
<h2 className="font-headline-sm text-headline-sm font-semibold text-primary">Agency Approvals</h2>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-3">
<span className="font-label-md text-label-md font-medium text-on-surface-variant">Queue Status: <span className="text-primary font-bold">{pending.length} Pending</span></span>
</div>
</div>
</header>
{/* Main Content Canvas */}
<main className="ml-[260px] p-8 min-h-[calc(100vh-64px)]">
<div className="grid grid-cols-12 gap-8">
{/* List of Agencies */}
<section className="col-span-12 xl:col-span-4 space-y-6">
<div className="flex items-center justify-between mb-2">
<h3 className="font-headline-sm text-headline-sm text-on-surface">All Agencies</h3>
<span className="bg-secondary-container/20 text-on-secondary-container px-3 py-1 rounded-full font-label-md text-label-md font-bold">{agencies.length} Total</span>
</div>
<div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">

{!loading && agencies.length === 0 && (
  <p className="text-on-surface-variant font-body-md">No agencies have registered yet.</p>
)}

{agencies.map((a) => (
<div
  key={a.userId}
  onClick={() => setSelectedId(a.userId)}
  className={`bg-white p-5 rounded-2xl ambient-card border-l-4 cursor-pointer hover:bg-primary-container/5 transition-all ${a.userId === selectedId ? "border-primary" : "border-transparent"} ${a.isVerified ? "opacity-70" : ""}`}
>
<div className="flex justify-between items-start mb-3">
<h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">{a.companyName}</h4>
{a.isVerified ? (
  <span className="text-secondary font-label-md text-label-md flex items-center gap-1">
    <span className="material-symbols-outlined text-[16px]">verified</span> Verified
  </span>
) : (
  <span className="text-primary font-label-md text-label-md">Pending</span>
)}
</div>
<div className="space-y-2">
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-[18px]">person</span>
<span className="font-body-md text-body-md">Contact: {a.fullName}</span>
</div>
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-[18px]">mail</span>
<span className="font-body-md text-body-md">{a.email}</span>
</div>
</div>
</div>
))}
</div>
</section>
{/* Detail View */}
<section className="col-span-12 xl:col-span-8 space-y-6">
{selected ? (
<div className="bg-white rounded-3xl ambient-card overflow-hidden">
<div className="p-8 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
<div className="flex items-center gap-5">
<div className="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-[32px]">business</span>
</div>
<div>
<h2 className="font-headline-lg text-headline-lg text-on-surface">{selected.companyName}</h2>
<p className="text-on-surface-variant font-body-lg text-body-lg">License: {selected.licenseNumber || "Not provided"}</p>
</div>
</div>
</div>
<div className="p-8 grid grid-cols-12 gap-10">
<div className="col-span-12 lg:col-span-7 space-y-6">
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-primary">person</span>
<span className="font-body-lg text-body-lg">{selected.fullName} — {selected.email}</span>
</div>
{selected.website && (
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-primary">language</span>
<a href={selected.website} target="_blank" rel="noreferrer" className="font-body-lg text-body-lg text-primary hover:underline">{selected.website}</a>
</div>
)}
</div>
<div className="col-span-12 lg:col-span-5">
<div className="bg-surface-container-highest/30 rounded-3xl p-8">
<h4 className="font-headline-sm text-headline-sm text-on-surface mb-6">Decision Panel</h4>
<div className="space-y-4">
{!selected.isVerified ? (
<button
  onClick={() => setVerified(true)}
  disabled={updating}
  className="w-full flex items-center justify-between p-4 bg-primary text-on-primary rounded-2xl font-body-lg text-body-lg font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
>
<span className="flex items-center gap-3">
<span className="material-symbols-outlined">verified</span>
                                            Approve Agency
                                        </span>
</button>
) : (
<button
  onClick={() => setVerified(false)}
  disabled={updating}
  className="w-full flex items-center justify-between p-4 bg-error-container text-on-error-container rounded-2xl font-body-lg text-body-lg font-bold hover:brightness-95 transition-all disabled:opacity-50"
>
<span className="flex items-center gap-3">
<span className="material-symbols-outlined">cancel</span>
                                            Revoke Verification
                                        </span>
</button>
)}
</div>
</div>
</div>
</div>
</div>
) : (
<p className="text-on-surface-variant font-body-md">Select an agency to review.</p>
)}
</section>
</div>
</main>
    </>
  );
}
