"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import { api, ApiError } from "@/lib/api";
import { Scholarship } from "@/lib/types";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function ScholarshipDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [startingDashboardApplication, setStartingDashboardApplication] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    api.get<Scholarship>(`/api/scholarships/${id}`, { auth: false }).then(setScholarship);
  }, [id]);

  async function handleSave() {
    setSaveError(null);
    try {
      await api.post("/api/saved-items", { itemType: "scholarship", itemId: id });
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof ApiError ? "Please log in as a student to save scholarships." : "Couldn't save right now.");
    }
  }

  async function handleDashboardApplication() {
    setSaveError(null);
    setStartingDashboardApplication(true);
    try {
      await api.post("/api/saved-items", { itemType: "scholarship", itemId: id });
      setSaved(true);
      router.push("/student/saved-items");
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Couldn't add this scholarship to your dashboard.");
    } finally {
      setStartingDashboardApplication(false);
    }
  }

  return (
    <>
<PublicNavbar variant="glass" current="Scholarships" />
<main className="max-w-7xl mx-auto px-margin-desktop py-10">

<section className="grid grid-cols-1 md:grid-cols-12 gap-card-gap mb-12 items-start">
<div className="md:col-span-8">
<nav className="flex items-center gap-2 mb-6 text-on-surface-variant font-label-md text-label-md">
<span>Scholarships</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
<span className="text-primary font-semibold">{scholarship?.title ?? "..."}</span>
</nav>
<div className="flex items-start gap-6 mb-8">
<div className="w-24 h-24 rounded-2xl bg-white shadow-sm flex items-center justify-center p-4 border border-outline-variant">
<span className="material-symbols-outlined text-primary text-4xl">military_tech</span>
</div>
<div>
<div className="flex items-center gap-3 mb-2 flex-wrap">
{scholarship?.category && (
<span className="bg-primary-fixed text-primary px-3 py-1 rounded-full font-label-md text-label-md">{scholarship.category}</span>
)}
</div>
<h1 className="font-display-lg text-display-lg text-primary mb-2">{scholarship?.title ?? "..."}</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-primary">account_balance</span>
{scholarship?.provider ? `Provided by ${scholarship.provider}` : "Provider not specified"}
</p>
</div>
</div>
</div>

<div className="md:col-span-4 sticky top-28">
<div className="ambient-card rounded-[24px] p-8 border border-outline-variant">
<div className="mb-6">
<p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-1">Total Award Value</p>
<h2 className="text-[40px] font-bold text-primary">{scholarship?.amountUsd ? `$${Number(scholarship.amountUsd).toLocaleString()}` : "Varies"}</h2>
</div>
<div className="space-y-4 mb-8">
<div className="flex items-center justify-between py-3 border-b border-outline-variant/30">
<span className="font-body-md text-body-md text-on-surface-variant">Deadline</span>
<span className="font-body-md text-body-md font-semibold text-error">{scholarship?.deadline ? new Date(scholarship.deadline).toLocaleDateString() : "Rolling"}</span>
</div>
{scholarship?.coveragePercent != null && (
<div className="flex items-center justify-between py-3">
<span className="font-body-md text-body-md text-on-surface-variant">Coverage</span>
<span className="font-body-md text-body-md font-semibold">{scholarship.coveragePercent}%</span>
</div>
)}
</div>
{scholarship?.applyUrl ? (
<a href={scholarship.applyUrl} target="_blank" rel="noreferrer" className="block text-center w-full bg-primary text-on-primary py-4 rounded-xl font-headline-sm text-headline-sm hover:bg-primary-container active:scale-[0.98] transition-all shadow-lg shadow-primary/20 mb-4">
                        Apply Now
                    </a>
) : user?.role === "student" ? (
<button onClick={handleDashboardApplication} disabled={startingDashboardApplication} className="block text-center w-full bg-primary text-on-primary py-4 rounded-xl font-headline-sm text-headline-sm hover:bg-primary-container active:scale-[0.98] transition-all shadow-lg shadow-primary/20 mb-4 disabled:opacity-60">{startingDashboardApplication ? "Adding to your dashboard..." : "Apply via your student dashboard"}</button>
) : (
<Link href="/login" className="block text-center w-full bg-surface-container text-primary py-4 rounded-xl font-headline-sm text-headline-sm hover:bg-surface-container-high transition-all mb-4">Log in as a student to apply</Link>
)}
<button onClick={handleSave} disabled={saved} className="w-full bg-surface-container-low text-primary py-4 rounded-xl font-headline-sm text-headline-sm hover:bg-surface-container transition-all flex items-center justify-center gap-2 disabled:opacity-60">
<span className="material-symbols-outlined">{saved ? "check" : "bookmark"}</span>
                        {saved ? "Saved" : "Save for Later"}
                    </button>
{saveError && <p className="text-error font-label-md text-label-md mt-3">{saveError}</p>}
</div>
</div>

<div className="md:col-span-8 space-y-gutter">

<div className="ambient-card rounded-[24px] p-container-padding">
<div className="flex items-center gap-3 mb-6">
<div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
<span className="material-symbols-outlined">how_to_reg</span>
</div>
<h3 className="font-headline-sm text-headline-sm">Eligibility Criteria</h3>
</div>
<p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line">
{scholarship?.eligibility || "Eligibility details haven't been added for this scholarship yet."}
</p>
</div>

<div className="ambient-card rounded-[24px] p-container-padding">
<h3 className="font-headline-md text-headline-md mb-6">About the Scholarship</h3>
<div className="prose max-w-none text-on-surface-variant font-body-md text-body-md space-y-4">
<p>{scholarship?.description || "A detailed description for this scholarship hasn't been added yet."}</p>
</div>
</div>

</div>
</section>

</main>
<PublicFooter />
    </>
  );
}
