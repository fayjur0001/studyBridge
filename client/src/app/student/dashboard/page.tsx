"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Application } from "@/lib/types";

interface ApplicationStats {
  total: number;
  submitted: number;
  underReview: number;
  accepted: number;
  rejected: number;
  actionNeeded: number;
}

interface Agency {
  userId: string;
  companyName: string;
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [messagingAgencyId, setMessagingAgencyId] = useState<string | null>(null);

  useEffect(() => {
    api.get<ApplicationStats>("/api/applications/stats").then(setStats).catch(() => {});
    api
      .get<{ data: Application[] }>("/api/applications")
      .then((res) => setApplications(res.data.slice(0, 2)))
      .catch(() => {});
    api
      .get<{ agencies: Agency[] }>("/api/student/me")
      .then((res) => setAgencies(res.agencies ?? []))
      .catch(() => {});
  }, []);

  async function handleMessageAgency(agency: Agency) {
    setMessagingAgencyId(agency.userId);
    try {
      await api.post("/api/conversations", {
        recipientId: agency.userId,
        message: `Hi, I have a question about my applications.`,
      });
      router.push("/student/messaging");
    } finally {
      setMessagingAgencyId(null);
    }
  }

  return (
    <>
<div className="flex h-screen w-full">

<StudentSidebar />

<main className="flex-1 ml-[260px] h-screen overflow-y-auto custom-scrollbar bg-background">

<header className="flex justify-between items-center w-full px-margin-desktop h-16 sticky top-0 z-40 bg-surface-container-lowest shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
<div className="flex items-center gap-6 flex-1">
<div className="relative w-full max-w-md group">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
<input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full font-body-md text-body-md focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Search programs, documents, or status..." type="text" />
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-4">
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95">
<span className="material-symbols-outlined">help</span>
</button>
</div>
<div className="h-8 w-[1px] bg-outline-variant mx-2"></div>
<div className="flex items-center gap-3 cursor-pointer group">
<div className="text-right hidden sm:block">
<p className="font-label-md text-label-md font-bold text-on-surface">{user?.fullName ?? "..."}</p>
<p className="font-label-md text-label-md text-outline">Graduate Applicant</p>
</div>
<div className="w-10 h-10 rounded-full border-2 border-primary-container bg-primary-container flex items-center justify-center font-bold text-primary">
{user?.fullName?.[0] ?? "S"}
</div>
</div>
</div>
</header>
<div className="px-margin-desktop py-8 max-w-7xl mx-auto">

<section className="grid grid-cols-12 gap-card-gap mb-12">
<div className="col-span-12 lg:col-span-8 premium-card relative overflow-hidden p-container-padding bg-gradient-to-br from-primary to-primary-container text-on-primary">
<div className="relative z-10">
<h2 className="font-headline-lg text-headline-lg mb-2">Welcome back, {user?.fullName?.split(" ")[0] ?? ""}!</h2>
<p className="text-primary-fixed-dim max-w-md mb-8">You&apos;re making great progress on your international applications. Complete your language proficiency tests to boost your eligibility.</p>
</div>
<div className="absolute right-0 bottom-0 w-64 h-full pointer-events-none opacity-20 transform translate-x-12 translate-y-12">
<span className="material-symbols-outlined text-[240px]" style={{fontVariationSettings: "'FILL' 1"}}>auto_stories</span>
</div>
</div>

<div className="col-span-12 lg:col-span-4 premium-card p-container-padding flex flex-col justify-between">
<div className="flex justify-between items-start">
<div className="w-12 h-12 rounded-2xl bg-tertiary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-tertiary-container" style={{fontVariationSettings: "'FILL' 1"}}>analytics</span>
</div>
</div>
<div className="mt-6">
<p className="text-outline font-label-md mb-1 uppercase tracking-wider">Applications Needing Action</p>
<h3 className="font-display-lg text-display-lg text-primary">{stats?.actionNeeded ?? 0}</h3>
</div>
<p className="font-body-md text-body-md text-on-surface-variant mt-2">Documents requested that still need your attention.</p>
</div>
</section>

<section className="grid grid-cols-1 md:grid-cols-2 gap-card-gap mb-12">
<div className="premium-card p-container-padding flex items-center gap-6">
<div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>send</span>
</div>
<div>
<p className="text-outline font-label-md uppercase tracking-wider">Active Applications</p>
<h4 className="font-headline-lg text-headline-lg text-on-surface">{stats?.total ?? 0}</h4>
<p className="text-secondary font-label-md flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-sm">trending_up</span>
{stats?.underReview ?? 0} under review
</p>
</div>
</div>
<div className="premium-card p-container-padding flex items-center gap-6">
<div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-tertiary-container text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>payments</span>
</div>
<div>
<p className="text-outline font-label-md uppercase tracking-wider">Accepted</p>
<h4 className="font-headline-lg text-headline-lg text-on-surface">{stats?.accepted ?? 0}</h4>
<p className="text-primary font-label-md mt-1 flex items-center gap-1">
<span className="material-symbols-outlined text-sm">check_circle</span>
{stats?.rejected ?? 0} rejected
</p>
</div>
</div>
</section>

<div className="grid grid-cols-12 gap-card-gap">

<div className="col-span-12 xl:col-span-8 premium-card p-container-padding">
<div className="flex justify-between items-center mb-8">
<h3 className="font-headline-sm text-headline-sm text-on-surface">Application Timeline</h3>
<Link href="/student/applications" className="text-primary font-label-md flex items-center gap-1 hover:underline">
                                View all applications
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
</Link>
</div>
<div className="space-y-8 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-[2px] before:bg-surface-container">

{applications.length === 0 && (
  <p className="text-on-surface-variant font-body-md pl-16">No applications yet — browse universities to get started.</p>
)}

{applications.map((app) => (
<div key={app.id} className="relative pl-16">
<div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center z-10 shadow-lg">
<span className="material-symbols-outlined text-on-primary">hourglass_empty</span>
</div>
<div className="bg-surface-container-low p-6 rounded-2xl border-l-4 border-primary">
<div className="flex justify-between items-start mb-2">
<div>
<h4 className="font-headline-sm text-headline-sm text-primary capitalize">{app.status.replace(/_/g, " ")}</h4>
<p className="font-body-md text-on-surface font-semibold">{app.university.name}</p>
<p className="text-outline font-label-md">{app.program.name}</p>
</div>
<span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">{app.status.replace(/_/g, " ")}</span>
</div>
</div>
</div>
))}
</div>
</div>

<div className="col-span-12 xl:col-span-4 space-y-card-gap">
{agencies.length > 0 && (
<div className="premium-card p-container-padding">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">
  {agencies.length === 1 ? "Your Agency" : "Your Agencies"}
</h3>
<div className="space-y-3">
{agencies.map((agency) => (
<div key={agency.userId} className="flex items-center justify-between gap-3">
<p className="font-body-md text-on-surface-variant">{agency.companyName}</p>
<button
  onClick={() => handleMessageAgency(agency)}
  disabled={messagingAgencyId === agency.userId}
  className="py-2 px-4 bg-primary text-on-primary font-semibold font-label-md rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
>
<span className="material-symbols-outlined text-[18px]">mail</span>
{messagingAgencyId === agency.userId ? "Opening..." : "Message"}
</button>
</div>
))}
</div>
</div>
)}
<div className="premium-card p-container-padding h-full">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Explore Programs</h3>
<div className="space-y-6">
<p className="font-body-md text-on-surface-variant">Browse universities and scholarships to find your next application.</p>
<Link href="/universities" className="w-full mt-4 py-3 text-primary font-semibold font-label-md border-2 border-primary/10 rounded-xl hover:bg-primary hover:text-on-primary transition-all duration-300 flex items-center justify-center">
                                Browse Universities
                            </Link>
</div>
</div>
</div>
</div>
</div>
</main>
</div>
    </>
  );
}