"use client";

import { useEffect, useState } from "react";
import AgencySidebar from "@/components/dashboard/AgencySidebar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface Analytics {
  totalApplications: number;
  conversionByCountry: { country: string; total: number; accepted: number; conversionRate: number }[];
  monthlyVolume: { month: string; count: number }[];
}

export default function AgencyAnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    api.get<Analytics>("/api/agency/analytics").then(setData).catch(() => {});
  }, []);

  const maxCountryTotal = Math.max(1, ...(data?.conversionByCountry.map((c) => c.total) ?? [1]));
  const maxMonthCount = Math.max(1, ...(data?.monthlyVolume.map((m) => m.count) ?? [1]));

  return (
    <>
<AgencySidebar />

<main className="ml-[260px] min-h-screen">

<header className="sticky top-0 w-full z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center px-gutter py-4 h-20">
<h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Performance Analytics</h2>
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-primary">
{user?.fullName?.[0] ?? "A"}
</div>
</div>
</header>

<div className="p-margin-desktop grid grid-cols-12 gap-card-gap">

<div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-[24px] p-container-padding ambient-occlusion">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Conversion Rate by Country</h3>
{(!data || data.conversionByCountry.length === 0) && (
  <p className="text-on-surface-variant font-body-md">No applications yet — this will fill in once your students start applying.</p>
)}
<div className="space-y-4">
{data?.conversionByCountry.map((c) => (
<div key={c.country}>
<div className="flex justify-between font-label-md text-label-md mb-1">
<span className="font-bold text-on-surface">{c.country}</span>
<span className="text-on-surface-variant">{c.accepted}/{c.total} accepted ({c.conversionRate}%)</span>
</div>
<div className="h-3 bg-surface-container-low rounded-full overflow-hidden">
<div className="h-full bg-primary rounded-full" style={{ width: `${(c.total / maxCountryTotal) * 100}%` }}></div>
</div>
</div>
))}
</div>
</div>

<div className="col-span-12 lg:col-span-4 bg-primary text-on-primary rounded-[24px] p-container-padding flex flex-col justify-between">
<p className="text-primary-fixed-dim text-sm uppercase tracking-widest font-bold">Total Applications</p>
<h4 className="text-[40px] font-bold mt-2">{data?.totalApplications ?? 0}</h4>
<p className="text-primary-fixed-dim font-body-md mt-4">Across all students linked to your agency.</p>
</div>

<div className="col-span-12 bg-surface-container-lowest rounded-[24px] p-container-padding ambient-occlusion">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Monthly Application Volume</h3>
{(!data || data.monthlyVolume.length === 0) && (
  <p className="text-on-surface-variant font-body-md">No data yet.</p>
)}
<div className="flex items-end gap-3 h-40">
{data?.monthlyVolume.map((m) => (
<div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-2">
<div className="w-full bg-primary/80 rounded-t-lg transition-all" style={{ height: `${(m.count / maxMonthCount) * 100}%`, minHeight: 4 }}></div>
<span className="text-[10px] text-on-surface-variant font-bold">{m.month}</span>
</div>
))}
</div>
</div>
</div>
</main>
    </>
  );
}
