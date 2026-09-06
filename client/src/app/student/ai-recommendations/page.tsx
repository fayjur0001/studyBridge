"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { api } from "@/lib/api";

interface Recommendation {
  programId: string;
  programName: string;
  degreeLevel: string;
  field: string | null;
  universityId: string;
  universityName: string;
  country: string;
  ranking: number | null;
  logoUrl: string | null;
  matchScore: number;
  reasons: string[];
}

export default function RecommendationsPage() {
  const [data, setData] = useState<Recommendation[]>([]);
  const [hasPreferences, setHasPreferences] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ hasPreferences: boolean; data: Recommendation[] }>("/api/student/recommendations")
      .then((res) => {
        setData(res.data);
        setHasPreferences(res.hasPreferences);
      })
      .finally(() => setLoading(false));
  }, []);

  const [top, ...rest] = data;

  return (
    <>
<StudentSidebar />

<main className="ml-[260px] min-h-screen">

<header className="flex justify-between items-center w-full px-margin-desktop h-16 sticky top-0 z-40 bg-surface-container-lowest shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
<h2 className="font-headline-sm text-headline-sm font-bold text-primary">Recommended For You</h2>
</header>

<div className="p-margin-desktop space-y-8">

<div>
<h2 className="font-headline-lg text-headline-lg text-primary mb-2">Programs Matched to Your Profile</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">
Ranked using your preferred countries and fields of study from your profile — a transparent match, not a black-box score.
</p>
</div>

{!hasPreferences && !loading && (
<div className="bg-primary-container/10 border border-primary/20 rounded-2xl p-6 flex items-center gap-4">
<span className="material-symbols-outlined text-primary text-3xl">info</span>
<div>
<p className="font-body-lg font-bold text-on-surface">Set your preferences to get better matches</p>
<p className="font-body-md text-on-surface-variant">
Add your preferred countries and fields of study on your <Link href="/student/profile" className="text-primary font-bold hover:underline">profile page</Link> to personalize these results.
</p>
</div>
</div>
)}

{!loading && data.length === 0 && (
  <p className="text-on-surface-variant font-body-md">No programs in the catalog yet.</p>
)}

{top && (
<div className="bg-surface-container-lowest rounded-2xl ambient-shadow p-container-padding flex flex-col md:flex-row gap-8">
<div className="w-full md:w-1/3 aspect-[4/5] rounded-xl bg-surface-container flex items-center justify-center relative overflow-hidden">
{top.logoUrl ? (
  <img className="w-full h-full object-cover" alt={top.universityName} src={top.logoUrl} />
) : (
  <span className="material-symbols-outlined text-primary text-6xl">school</span>
)}
<div className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1.5 rounded-full font-bold text-label-md shadow-lg">
{top.matchScore}% Match
</div>
</div>
<div className="flex-1 flex flex-col">
<h3 className="font-headline-md text-headline-md text-on-surface">{top.universityName}</h3>
<p className="text-primary font-semibold">{top.programName}</p>
<div className="flex flex-wrap gap-2 my-4">
<span className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full text-label-md">{top.country}</span>
<span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-label-md">{top.degreeLevel}</span>
{top.ranking && <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-label-md">Rank #{top.ranking}</span>}
</div>
{top.reasons.length > 0 && (
<div className="bg-surface-bright rounded-xl p-4 border border-outline-variant/30 mb-6">
<span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-tight block mb-3">Why it matches</span>
<ul className="space-y-2">
{top.reasons.map((r) => (
<li key={r} className="flex items-center gap-2 text-body-md text-on-surface-variant">
<span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
{r}
</li>
))}
</ul>
</div>
)}
<Link href={`/universities/${top.universityId}`} className="mt-auto bg-primary text-on-primary py-3 rounded-xl font-headline-sm text-label-md text-center hover:shadow-lg transition-all">
View Program Details
</Link>
</div>
</div>
)}

<div className="grid grid-cols-1 md:grid-cols-3 gap-card-gap">
{rest.map((r) => (
<div key={r.programId} className="bg-surface-container-lowest rounded-2xl ambient-shadow p-6 flex flex-col">
<div className="flex justify-between items-start mb-3">
<h4 className="font-headline-sm text-headline-sm text-on-surface">{r.universityName}</h4>
<span className="text-primary font-bold text-label-md">{r.matchScore}%</span>
</div>
<p className="text-body-md text-on-surface-variant mb-3">{r.programName}</p>
<div className="flex flex-wrap gap-2 mb-4">
<span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded-full text-[11px]">{r.country}</span>
{r.ranking && <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded-full text-[11px]">#{r.ranking}</span>}
</div>
<Link href={`/universities/${r.universityId}`} className="mt-auto text-primary font-bold text-label-md hover:underline">View Details</Link>
</div>
))}
</div>
</div>
</main>
    </>
  );
}
