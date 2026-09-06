"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { api } from "@/lib/api";

interface Analytics {
  enrollmentFunnel: { draft: number; submitted: number; underReview: number; accepted: number };
  signupsByMonth: { month: string; count: number }[];
  applicationsByMonth: { month: string; count: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    api.get<Analytics>("/api/admin/analytics").then(setData).catch(() => {});
  }, []);

  const funnelStages = data
    ? [
        { label: "Draft", value: data.enrollmentFunnel.draft + data.enrollmentFunnel.submitted },
        { label: "Submitted", value: data.enrollmentFunnel.submitted },
        { label: "Under Review", value: data.enrollmentFunnel.underReview },
        { label: "Accepted", value: data.enrollmentFunnel.accepted },
      ]
    : [];
  const maxFunnel = Math.max(1, ...funnelStages.map((s) => s.value));
  const maxSignup = Math.max(1, ...(data?.signupsByMonth.map((s) => s.count) ?? [1]));
  const maxApps = Math.max(1, ...(data?.applicationsByMonth.map((s) => s.count) ?? [1]));

  return (
    <>
<AdminSidebar />

<header className="flex justify-between items-center h-16 px-8 ml-[260px] w-[calc(100%-260px)] fixed top-0 bg-surface z-40 border-b border-outline-variant shadow-sm">
<h2 className="font-headline-sm text-headline-sm font-semibold text-primary">Analytics & Systems</h2>
</header>

<main className="ml-[260px] pt-24 px-8 pb-8 min-h-screen bg-surface-container-low">
<div className="grid grid-cols-12 gap-6">

<div className="col-span-12 lg:col-span-8 ambient-card p-container-padding">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Enrollment Conversion Funnel</h3>
<p className="text-on-surface-variant text-body-md mb-6">Real application counts by stage, across the whole platform.</p>
<div className="flex items-end gap-4 h-64">
{funnelStages.map((s) => (
<div key={s.label} className="flex-1 h-full flex flex-col justify-end group">
<div
  className="bg-primary/70 group-hover:bg-primary transition-all rounded-t-xl w-full flex items-center justify-center"
  style={{ height: `${(s.value / maxFunnel) * 100}%`, minHeight: 4 }}
>
<span className="font-bold text-on-primary">{s.value}</span>
</div>
<p className="text-center mt-3 font-label-md text-on-surface-variant">{s.label}</p>
</div>
))}
</div>
</div>

<div className="col-span-12 lg:col-span-4 ambient-card p-container-padding bg-primary text-on-primary flex flex-col justify-center">
<h3 className="font-headline-sm text-headline-sm mb-2">Acceptance Rate</h3>
<p className="text-on-primary/60 text-body-md mb-6">Of all submitted applications, platform-wide.</p>
<span className="text-5xl font-bold">
{data && data.enrollmentFunnel.submitted > 0
  ? Math.round((data.enrollmentFunnel.accepted / data.enrollmentFunnel.submitted) * 100)
  : 0}
%
</span>
</div>

<div className="col-span-12 lg:col-span-6 ambient-card p-container-padding">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Signups by Month</h3>
{(!data || data.signupsByMonth.length === 0) && <p className="text-on-surface-variant font-body-md">No data yet.</p>}
<div className="flex items-end gap-2 h-40">
{data?.signupsByMonth.map((m) => (
<div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-2">
<div className="w-full bg-secondary rounded-t-lg" style={{ height: `${(m.count / maxSignup) * 100}%`, minHeight: 4 }}></div>
<span className="text-[10px] text-on-surface-variant font-bold">{m.month}</span>
</div>
))}
</div>
</div>

<div className="col-span-12 lg:col-span-6 ambient-card p-container-padding">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Applications by Month</h3>
{(!data || data.applicationsByMonth.length === 0) && <p className="text-on-surface-variant font-body-md">No data yet.</p>}
<div className="flex items-end gap-2 h-40">
{data?.applicationsByMonth.map((m) => (
<div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-2">
<div className="w-full bg-primary rounded-t-lg" style={{ height: `${(m.count / maxApps) * 100}%`, minHeight: 4 }}></div>
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
