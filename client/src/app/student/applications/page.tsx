"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Application } from "@/lib/types";
import { ApplicationStatusBadge, applicationNextStep } from "@/components/applications/ApplicationStatusBadge";
import { universityImage } from "@/lib/university-images";

interface ApplicationStats {
  total: number;
  submitted: number;
  underReview: number;
  accepted: number;
  rejected: number;
  actionNeeded: number;
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<{ data: Application[] }>("/api/applications"),
      api.get<ApplicationStats>("/api/applications/stats"),
    ])
      .then(([appsRes, statsRes]) => {
        setApplications(appsRes.data);
        setStats(statsRes);
      })
      .finally(() => setLoading(false));
  }, []);
  const visibleApplications = applications.filter((app) => `${app.university.name} ${app.program.name} ${app.status}`.toLowerCase().includes(searchQuery.toLowerCase().trim()));

  return (
    <>
<StudentSidebar />

<main className="flex-1 ml-[260px] min-h-screen flex flex-col">

<header className="flex justify-between items-center w-full px-margin-desktop h-16 sticky top-0 z-40 bg-surface-container-lowest shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
<div className="flex items-center gap-4 flex-1">
<div className="relative w-full max-w-md group">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
<input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl font-body-md text-body-md focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest transition-all" placeholder="Search applications, universities..." type="text" />
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-4 text-on-surface-variant">
<button className="material-symbols-outlined cursor-pointer transition-transform duration-200 active:scale-95 hover:text-primary" data-icon="notifications">notifications</button>
</div>
<div className="h-8 w-[1px] bg-outline-variant"></div>
<div className="flex items-center gap-3 cursor-pointer group">
<div className="text-right hidden sm:block">
<p className="font-body-md text-body-md font-bold text-on-surface leading-tight">{user?.fullName ?? "..."}</p>
</div>
<div className="w-10 h-10 rounded-full border-2 border-primary-container bg-primary-container flex items-center justify-center font-bold text-primary">
{user?.fullName?.[0] ?? "S"}
</div>
</div>
</div>
</header>

<div className="p-margin-desktop space-y-8 max-w-[1400px] mx-auto w-full">

<div className="flex justify-between items-end">
<div>
<h2 className="font-headline-lg text-headline-lg text-primary mb-1">Application Tracking</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">Manage and monitor your journey to academic excellence.</p>
</div>
<div className="flex gap-3">
<Link href="/universities" className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-body-md text-body-md font-semibold flex items-center gap-2 hover:shadow-lg transition-all">
<span className="material-symbols-outlined" data-icon="add">add</span>
                        Browse Universities
                    </Link>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-card-gap">
<div className="bg-surface-container-lowest p-6 rounded-[24px] ambient-shadow border border-outline-variant/10">
<div className="flex justify-between items-start mb-4">
<div className="p-3 bg-secondary-container rounded-xl">
<span className="material-symbols-outlined text-on-secondary-container" data-icon="send">send</span>
</div>
<span className="text-secondary font-bold text-headline-sm">{stats?.submitted ?? 0}</span>
</div>
<p className="font-label-md text-label-md text-outline uppercase tracking-wider">Total Submitted</p>
</div>
<div className="bg-surface-container-lowest p-6 rounded-[24px] ambient-shadow border border-outline-variant/10">
<div className="flex justify-between items-start mb-4">
<div className="p-3 bg-tertiary-fixed rounded-xl">
<span className="material-symbols-outlined text-on-tertiary-fixed" data-icon="pending_actions">pending_actions</span>
</div>
<span className="text-tertiary font-bold text-headline-sm">{stats?.underReview ?? 0}</span>
</div>
<p className="font-label-md text-label-md text-outline uppercase tracking-wider">Under Review</p>
</div>
<div className="bg-surface-container-lowest p-6 rounded-[24px] ambient-shadow border border-outline-variant/10">
<div className="flex justify-between items-start mb-4">
<div className="p-3 bg-green-100 rounded-xl">
<span className="material-symbols-outlined text-green-700" data-icon="check_circle">check_circle</span>
</div>
<span className="text-green-700 font-bold text-headline-sm">{stats?.accepted ?? 0}</span>
</div>
<p className="font-label-md text-label-md text-outline uppercase tracking-wider">Accepted</p>
</div>
<div className="bg-surface-container-lowest p-6 rounded-[24px] ambient-shadow border border-outline-variant/10">
<div className="flex justify-between items-start mb-4">
<div className="p-3 bg-primary-fixed rounded-xl">
<span className="material-symbols-outlined text-primary" data-icon="assignment_late">assignment_late</span>
</div>
<span className="text-primary font-bold text-headline-sm">{stats?.actionNeeded ?? 0}</span>
</div>
<p className="font-label-md text-label-md text-outline uppercase tracking-wider">Action Required</p>
</div>
</div>

<div className="bg-surface-container-lowest rounded-[24px] ambient-shadow overflow-hidden border border-outline-variant/20">
<div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
<h3 className="font-headline-sm text-headline-sm text-on-surface">Your Applications</h3>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low/50">
<th className="px-8 py-4 font-label-md text-label-md text-outline uppercase tracking-widest">University &amp; Program</th>
<th className="px-8 py-4 font-label-md text-label-md text-outline uppercase tracking-widest">Status</th>
<th className="px-8 py-4 font-label-md text-label-md text-outline uppercase tracking-widest">Next Step</th>
<th className="px-8 py-4 font-label-md text-label-md text-outline uppercase tracking-widest"></th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/10">

{!loading && applications.length === 0 && (
  <tr>
    <td colSpan={4} className="px-8 py-12 text-center text-on-surface-variant font-body-md">
      No applications yet. <Link href="/universities" className="text-primary font-bold hover:underline">Browse universities</Link> to start one.
    </td>
  </tr>
)}

{visibleApplications.map((app) => (
<tr key={app.id} className="hover:bg-surface-container-low/30 transition-colors group">
<td className="px-8 py-6">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-xl bg-blue-soft flex items-center justify-center overflow-hidden border border-outline-variant/20">
<img className="w-full h-full object-cover" alt={`${app.university.name} campus`} src={universityImage(app.university.name, null, app.university.logoUrl)} />
</div>
<div>
<p className="font-body-lg text-body-lg font-bold text-on-surface leading-tight">{app.university.name}</p>
<p className="font-body-md text-body-md text-on-surface-variant">{app.program.name}</p>
</div>
</div>
</td>
<td className="px-8 py-6">
<ApplicationStatusBadge status={app.status} />
</td>
<td className="px-8 py-6">
<div className="flex flex-col">
<span className="font-body-md text-body-md text-on-surface font-medium">{applicationNextStep(app.status)}</span>
</div>
</td>
<td className="px-8 py-6 text-right">
<Link href={`/student/applications/${app.id}`} className="text-primary font-bold font-label-md hover:underline">
  View
</Link>
</td>
</tr>
))}
{!loading && applications.length > 0 && visibleApplications.length === 0 && (
  <tr><td colSpan={4} className="px-8 py-12 text-center text-on-surface-variant font-body-md">No applications match your search.</td></tr>
)}
</tbody>
</table>
</div>
</div>
</div>
</main>
    </>
  );
}
