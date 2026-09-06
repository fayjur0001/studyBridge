"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface OverviewStats {
  users: { total: number; students: number; agencies: number; admins: number; suspended: number };
  agencies: { total: number; pendingVerification: number };
  applications: { total: number; submitted: number; underReview: number; accepted: number; rejected: number };
  catalog: { universities: number; programs: number; scholarships: number };
}

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    api.get<OverviewStats>("/api/admin/overview").then(setStats).catch(() => {});
  }, []);

  return (
    <>
<AdminSidebar />


{/* Top Navigation Bar */}
<header className="fixed top-0 right-0 h-16 ml-[260px] w-[calc(100%-260px)] bg-surface border-b border-outline-variant flex justify-between items-center px-8 z-40 shadow-sm">
<div className="flex items-center gap-4 flex-1">
<div className="relative w-full max-w-md">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" data-icon="search">search</span>
<input className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2 text-body-md focus:ring-2 focus:ring-primary-container transition-all" placeholder="Search applications, agencies, or students..." type="text"/>
</div>
</div>
<div className="flex items-center gap-6">
<button className="relative text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
<span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
</button>
<button className="text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="help_outline">help_outline</span>
</button>
<div className="h-8 w-px bg-outline-variant"></div>
<div className="flex items-center gap-3 group cursor-pointer">
<div className="text-right">
<p className="font-label-md text-label-md font-bold text-on-surface">{user?.fullName ?? "..."}</p>
<p className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-tighter">Super Admin</p>
</div>
<div className="w-10 h-10 rounded-full border-2 border-primary-container bg-primary-container flex items-center justify-center font-bold text-primary">
{user?.fullName?.[0] ?? "A"}
</div>
</div>
</div>
</header>
{/* Main Content Area */}
<main className="ml-[260px] pt-16 min-h-screen">
<div className="p-container-padding max-w-[1600px] mx-auto">
{/* Page Header */}
<div className="flex justify-between items-end mb-8">
<div>
<h2 className="font-headline-lg text-headline-lg text-primary">System Overview</h2>
<p className="text-on-surface-variant mt-1">Real-time performance metrics and administrative priorities.</p>
</div>
<div className="flex gap-3">
<button className="px-4 py-2 rounded-xl bg-blue-soft border border-outline-variant text-primary font-label-md flex items-center gap-2 hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined text-[18px]" data-icon="calendar_today">calendar_today</span>
                        Last 30 Days
                    </button>
<button className="px-6 py-2 rounded-xl bg-primary text-on-primary font-label-md flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
<span className="material-symbols-outlined text-[18px]" data-icon="download">download</span>
                        Export Report
                    </button>
</div>
</div>
{/* Bento Grid - Key Metrics */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-card-gap mb-8">
{/* Metric 1: Active Users */}
<div className="ambient-card rounded-[24px] p-6 flex flex-col justify-between">
<div className="flex justify-between items-start">
<div className="p-3 bg-primary-container/10 rounded-xl">
<span className="material-symbols-outlined text-primary" data-icon="person_play">person_play</span>
</div>
<span className="text-green-600 bg-green-50 px-2 py-1 rounded-lg text-[12px] font-bold flex items-center">
<span className="material-symbols-outlined text-[14px] mr-1" data-icon="trending_up">trending_up</span> 12.5%
                        </span>
</div>
<div className="mt-4">
<p className="font-label-md text-on-surface-variant">Total Active Users</p>
<h3 className="font-headline-md text-headline-md text-on-surface">{stats?.users.total ?? 0}</h3>
</div>
</div>
{/* Metric 2: Monthly Revenue */}
<div className="ambient-card rounded-[24px] p-6 flex flex-col justify-between">
<div className="flex justify-between items-start">
<div className="p-3 bg-secondary-container/10 rounded-xl">
<span className="material-symbols-outlined text-secondary" data-icon="payments">payments</span>
</div>
<span className="text-green-600 bg-green-50 px-2 py-1 rounded-lg text-[12px] font-bold flex items-center">
<span className="material-symbols-outlined text-[14px] mr-1" data-icon="trending_up">trending_up</span> 8.2%
                        </span>
</div>
<div className="mt-4">
<p className="font-label-md text-on-surface-variant">Monthly Revenue</p>
<h3 className="font-headline-md text-headline-md text-on-surface">$1.24M</h3>
</div>
</div>
{/* Metric 3: Pending Approvals */}
<div className="ambient-card rounded-[24px] p-6 flex flex-col justify-between">
<div className="flex justify-between items-start">
<div className="p-3 bg-error-container/20 rounded-xl">
<span className="material-symbols-outlined text-error" data-icon="pending_actions">pending_actions</span>
</div>
<span className="text-on-surface-variant font-label-md">High Priority</span>
</div>
<div className="mt-4">
<p className="font-label-md text-on-surface-variant">Pending Agency Approvals</p>
<h3 className="font-headline-md text-headline-md text-on-surface">{stats?.agencies.pendingVerification ?? 0}</h3>
</div>
</div>
{/* Metric 4: Success Rate */}
<div className="ambient-card rounded-[24px] p-6 flex flex-col justify-between">
<div className="flex justify-between items-start">
<div className="p-3 bg-tertiary-fixed/30 rounded-xl">
<span className="material-symbols-outlined text-tertiary" data-icon="verified">verified</span>
</div>
<div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden self-center">
<div className="bg-primary h-full w-[94%]"></div>
</div>
</div>
<div className="mt-4">
<p className="font-label-md text-on-surface-variant">Platform Success Rate</p>
<h3 className="font-headline-md text-headline-md text-on-surface">94.8%</h3>
</div>
</div>
</div>
<div className="grid grid-cols-12 gap-card-gap">
{/* Platform Health Visualization (8 columns) */}
<div className="col-span-12 lg:col-span-8 ambient-card rounded-[24px] p-8">
<div className="flex justify-between items-center mb-8">
<div>
<h4 className="font-headline-sm text-headline-sm text-on-surface">Platform Health</h4>
<p className="font-label-md text-on-surface-variant">Growth comparison across segments (6 months)</p>
</div>
<div className="flex gap-4">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-primary"></span>
<span className="font-label-md">Students</span>
</div>
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-secondary"></span>
<span className="font-label-md">Agencies</span>
</div>
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-tertiary-container"></span>
<span className="font-label-md">Universities</span>
</div>
</div>
</div>
{/* Simulated Chart Area */}
<div className="relative h-64 w-full bg-surface-container-low rounded-xl flex items-end justify-between px-4 pb-8 overflow-hidden group">
<div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, #0d3286 1px, transparent 0)', backgroundSize: '24px 24px'}}></div>
{/* Chart Lines (Stylized placeholder using CSS) */}
<svg className="absolute inset-0 w-full h-full p-4" preserveAspectRatio="none" viewBox="0 0 800 200">
<path d="M0,180 Q100,160 200,120 T400,100 T600,60 T800,20" fill="none" stroke="#0d3286" strokeWidth="3"></path>
<path d="M0,190 Q100,180 200,150 T400,140 T600,110 T800,90" fill="none" stroke="#3156c4" strokeWidth="3"></path>
<path d="M0,195 Q100,190 200,180 T400,175 T600,160 T800,150" fill="none" stroke="#49505d" strokeWidth="3"></path>
</svg>
{/* Bars for context */}
<div className="flex flex-col items-center gap-2 z-10">
<div className="h-20 w-12 bg-primary/10 rounded-t-lg group-hover:bg-primary/20 transition-colors"></div>
<span className="font-label-md text-on-surface-variant">JAN</span>
</div>
<div className="flex flex-col items-center gap-2 z-10">
<div className="h-28 w-12 bg-primary/10 rounded-t-lg group-hover:bg-primary/20 transition-colors"></div>
<span className="font-label-md text-on-surface-variant">FEB</span>
</div>
<div className="flex flex-col items-center gap-2 z-10">
<div className="h-32 w-12 bg-primary/10 rounded-t-lg group-hover:bg-primary/20 transition-colors"></div>
<span className="font-label-md text-on-surface-variant">MAR</span>
</div>
<div className="flex flex-col items-center gap-2 z-10">
<div className="h-44 w-12 bg-primary/10 rounded-t-lg group-hover:bg-primary/20 transition-colors"></div>
<span className="font-label-md text-on-surface-variant">APR</span>
</div>
<div className="flex flex-col items-center gap-2 z-10">
<div className="h-52 w-12 bg-primary/10 rounded-t-lg group-hover:bg-primary/20 transition-colors"></div>
<span className="font-label-md text-on-surface-variant">MAY</span>
</div>
<div className="flex flex-col items-center gap-2 z-10">
<div className="h-60 w-12 bg-primary/20 rounded-t-lg group-hover:bg-primary/30 transition-colors border-t-2 border-primary"></div>
<span className="font-label-md text-on-surface-variant font-bold">JUN</span>
</div>
</div>
</div>
{/* Action Required Feed (4 columns) */}
<div className="col-span-12 lg:col-span-4 ambient-card rounded-[24px] p-8 flex flex-col">
<div className="flex items-center justify-between mb-6">
<h4 className="font-headline-sm text-headline-sm text-on-surface">Action Required</h4>
<span className="bg-error text-on-error px-2 py-0.5 rounded text-[10px] font-bold">4 URGENT</span>
</div>
<div className="space-y-4 flex-1 custom-scrollbar overflow-y-auto pr-2">
{/* Action Item 1 */}
<div className="p-4 rounded-xl bg-error-container/10 border-l-4 border-error hover:bg-error-container/20 transition-colors group cursor-pointer">
<div className="flex justify-between mb-1">
<span className="font-label-md font-bold text-on-error-container">Critical Alert</span>
<span className="text-[10px] text-on-surface-variant">2m ago</span>
</div>
<p className="text-body-md text-on-surface font-medium">Gateway timeout on European Student Applications API.</p>
<div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="text-[11px] font-bold text-error uppercase">Resolve</button>
<button className="text-[11px] font-bold text-on-surface-variant uppercase">Snooze</button>
</div>
</div>
{/* Action Item 2 */}
<div className="p-4 rounded-xl bg-surface-container border-l-4 border-primary hover:bg-surface-container-high transition-colors group cursor-pointer">
<div className="flex justify-between mb-1">
<span className="font-label-md font-bold text-primary">Agency Certification</span>
<span className="text-[10px] text-on-surface-variant">1h ago</span>
</div>
<p className="text-body-md text-on-surface font-medium">GlobalEdu Agency (London) submitted final documentation.</p>
<div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="text-[11px] font-bold text-primary uppercase">Review</button>
</div>
</div>
{/* Action Item 3 */}
<div className="p-4 rounded-xl bg-surface-container border-l-4 border-secondary hover:bg-surface-container-high transition-colors group cursor-pointer">
<div className="flex justify-between mb-1">
<span className="font-label-md font-bold text-secondary">Disputed App</span>
<span className="text-[10px] text-on-surface-variant">4h ago</span>
</div>
<p className="text-body-md text-on-surface font-medium">Student ID #8821 filed a dispute for University of Melbourne application.</p>
<div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="text-[11px] font-bold text-secondary uppercase">Investigate</button>
</div>
</div>
{/* Action Item 4 */}
<div className="p-4 rounded-xl bg-surface-container border-l-4 border-tertiary-container hover:bg-surface-container-high transition-colors group cursor-pointer">
<div className="flex justify-between mb-1">
<span className="font-label-md font-bold text-on-surface-variant">Partnership Request</span>
<span className="text-[10px] text-on-surface-variant">Yesterday</span>
</div>
<p className="text-body-md text-on-surface font-medium">Stanford University requesting portal integration details.</p>
</div>
</div>
</div>
{/* Recent Activity Log (12 columns) */}
<div className="col-span-12 ambient-card rounded-[24px] overflow-hidden">
<div className="p-8 border-b border-outline-variant flex justify-between items-center">
<div>
<h4 className="font-headline-sm text-headline-sm text-on-surface">Recent Activity Log</h4>
<p className="font-label-md text-on-surface-variant">Real-time feed of platform-wide events</p>
</div>
<div className="flex gap-2">
<button className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors">
<span className="material-symbols-outlined" data-icon="filter_list">filter_list</span>
</button>
<button className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors">
<span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead className="bg-surface-container-low text-on-surface-variant font-label-md uppercase tracking-wider">
<tr>
<th className="px-8 py-4">Event Type</th>
<th className="px-8 py-4">Entity</th>
<th className="px-8 py-4">Location</th>
<th className="px-8 py-4">Status</th>
<th className="px-8 py-4">Timestamp</th>
<th className="px-8 py-4 text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/30">
<tr className="hover:bg-surface-container-lowest transition-colors group">
<td className="px-8 py-5">
<div className="flex items-center gap-3">
<span className="w-8 h-8 rounded-full bg-primary-container/10 text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]" data-icon="school">school</span>
</span>
<span className="font-medium">University Partnership</span>
</div>
</td>
<td className="px-8 py-5 text-on-surface">Technical University of Munich</td>
<td className="px-8 py-5 text-on-surface-variant">Munich, DE</td>
<td className="px-8 py-5">
<span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[11px] font-bold">COMPLETED</span>
</td>
<td className="px-8 py-5 text-on-surface-variant">14:22:10 UTC</td>
<td className="px-8 py-5 text-right">
<button className="text-primary hover:underline font-label-md">View Details</button>
</td>
</tr>
<tr className="hover:bg-surface-container-lowest transition-colors group">
<td className="px-8 py-5">
<div className="flex items-center gap-3">
<span className="w-8 h-8 rounded-full bg-secondary-container/10 text-secondary flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]" data-icon="business_center">business_center</span>
</span>
<span className="font-medium">Agency Onboarding</span>
</div>
</td>
<td className="px-8 py-5 text-on-surface">Pathway Overseas Ltd.</td>
<td className="px-8 py-5 text-on-surface-variant">New Delhi, IN</td>
<td className="px-8 py-5">
<span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-[11px] font-bold">IN PROGRESS</span>
</td>
<td className="px-8 py-5 text-on-surface-variant">13:58:45 UTC</td>
<td className="px-8 py-5 text-right">
<button className="text-primary hover:underline font-label-md">Track</button>
</td>
</tr>
<tr className="hover:bg-surface-container-lowest transition-colors group">
<td className="px-8 py-5">
<div className="flex items-center gap-3">
<span className="w-8 h-8 rounded-full bg-primary-container/10 text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]" data-icon="grade">grade</span>
</span>
<span className="font-medium">Student Milestone</span>
</div>
</td>
<td className="px-8 py-5 text-on-surface">Maria Garcia-Velasquez</td>
<td className="px-8 py-5 text-on-surface-variant">Madrid, ES</td>
<td className="px-8 py-5">
<span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold">VISA APPROVED</span>
</td>
<td className="px-8 py-5 text-on-surface-variant">12:15:30 UTC</td>
<td className="px-8 py-5 text-right">
<button className="text-primary hover:underline font-label-md">Celebration Kit</button>
</td>
</tr>
<tr className="hover:bg-surface-container-lowest transition-colors group border-b-0">
<td className="px-8 py-5">
<div className="flex items-center gap-3">
<span className="w-8 h-8 rounded-full bg-tertiary-container/10 text-tertiary-container flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]" data-icon="security">security</span>
</span>
<span className="font-medium">Security Patch</span>
</div>
</td>
<td className="px-8 py-5 text-on-surface">System Core Node B-22</td>
<td className="px-8 py-5 text-on-surface-variant">Global Cluster</td>
<td className="px-8 py-5">
<span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-bold">AUTO-RESOLVED</span>
</td>
<td className="px-8 py-5 text-on-surface-variant">09:10:02 UTC</td>
<td className="px-8 py-5 text-right">
<button className="text-primary hover:underline font-label-md">Logs</button>
</td>
</tr>
</tbody>
</table>
</div>
<div className="p-6 bg-surface-container-low flex justify-center">
<button className="text-primary font-bold hover:text-primary-container transition-colors flex items-center gap-2">
                            Load 50 More Activities
                            <span className="material-symbols-outlined text-[18px]" data-icon="keyboard_arrow_down">keyboard_arrow_down</span>
</button>
</div>
</div>
</div>
</div>
</main>
{/* Contextual FAB (Floating Action Button) - Rendered only for Home/Overview context */}
<button className="fixed bottom-10 right-10 w-16 h-16 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center group hover:scale-110 active:scale-95 transition-all z-50 overflow-hidden">
<span className="material-symbols-outlined text-[28px] group-hover:rotate-90 transition-transform duration-300" data-icon="add">add</span>
<div className="absolute right-full mr-4 bg-primary text-on-primary px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
            Quick Actions
        </div>
</button>


</>
  );
}
