"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AgencySidebar from "@/components/dashboard/AgencySidebar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface AgencyStats {
  totalStudents: number;
  totalApplications: number;
  underReview: number;
  accepted: number;
  rejected: number;
  documentsRequested: number;
}

export default function AgencyDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AgencyStats | null>(null);

  useEffect(() => {
    api.get<AgencyStats>("/api/agency/dashboard/stats").then(setStats).catch(() => {});
  }, []);

  return (
    <>
<AgencySidebar />


{/* Top Navigation */}
<header className="ml-[260px] h-20 bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-gutter flex items-center justify-between">
<div className="flex items-center gap-8">
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
<input className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl w-[320px] focus:ring-2 focus:ring-primary/20 font-body-md text-body-md transition-all" placeholder="Search students, programs..." type="text"/>
</div>
<nav className="hidden lg:flex items-center gap-6">
<Link className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors" href="/universities">Directory</Link>
<Link className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors" href="/about">Resources</Link>
<Link className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors" href="/contact">Help</Link>
</nav>
</div>
<div className="flex items-center gap-4">
<button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors relative">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
</button>
<div className="h-8 w-[1px] bg-outline-variant/30"></div>
<div className="flex items-center gap-3">
<div className="text-right">
<p className="font-label-md text-label-md font-bold text-on-surface">{user?.fullName ?? "..."}</p>
<p className="font-label-md text-label-md text-on-surface-variant text-[10px]">Agency Partner</p>
</div>
<div className="w-10 h-10 rounded-full border-2 border-primary/10 overflow-hidden bg-primary-container flex items-center justify-center font-bold text-primary">
{user?.fullName?.[0] ?? "A"}
</div>
</div>
</div>
</header>
{/* Main Content Area */}
<main className="ml-[260px] p-margin-desktop min-h-screen">
{/* Greeting & Primary Action */}
<div className="flex justify-between items-end mb-10">
<div>
<h2 className="font-headline-lg text-headline-lg text-primary mb-1">Agency Dashboard</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">Welcome back, {user?.fullName?.split(" ")[0] ?? ""}. Here&apos;s what&apos;s happening with your students today.</p>
</div>
<button className="bg-primary text-white px-6 py-3 rounded-xl font-label-md text-label-md font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg active:scale-95">
<span className="material-symbols-outlined" data-icon="add_circle">add_circle</span>
                New Application
            </button>
</div>
{/* High-Level Stats Bento Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-card-gap mb-10">
{/* Stat 1 */}
<div className="bg-surface-container-lowest p-container-padding rounded-[24px] ambient-card border border-outline-variant/20">
<div className="flex items-center justify-between mb-4">
<div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-on-secondary-container" data-icon="group">group</span>
</div>
<span className="text-on-secondary-fixed-variant font-label-md text-label-md bg-secondary-fixed/30 px-2 py-1 rounded-full">+12%</span>
</div>
<h3 className="font-label-md text-label-md text-on-surface-variant mb-1">Total Students</h3>
<p className="font-headline-lg text-headline-lg text-on-surface font-bold">{stats?.totalStudents ?? 0}</p>
</div>
{/* Stat 2 */}
<div className="bg-surface-container-lowest p-container-padding rounded-[24px] ambient-card border border-outline-variant/20">
<div className="flex items-center justify-between mb-4">
<div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-on-primary-fixed-variant" data-icon="assignment">assignment</span>
</div>
<span className="text-on-primary-fixed-variant font-label-md text-label-md bg-primary-fixed/30 px-2 py-1 rounded-full">Active</span>
</div>
<h3 className="font-label-md text-label-md text-on-surface-variant mb-1">Active Applications</h3>
<p className="font-headline-lg text-headline-lg text-on-surface font-bold">{stats?.totalApplications ?? 0}</p>
</div>
{/* Stat 3 */}
<div className="bg-surface-container-lowest p-container-padding rounded-[24px] ambient-card border border-outline-variant/20">
<div className="flex items-center justify-between mb-4">
<div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center">
<span className="material-symbols-outlined text-on-tertiary-fixed" data-icon="payments">payments</span>
</div>
<span className="text-on-tertiary-fixed-variant font-label-md text-label-md bg-tertiary-fixed/30 px-2 py-1 rounded-full">Q3 Forecast</span>
</div>
<h3 className="font-label-md text-label-md text-on-surface-variant mb-1">Total Revenue</h3>
<p className="font-headline-lg text-headline-lg text-on-surface font-bold">$1.2M</p>
</div>
{/* Stat 4 */}
<div className="bg-surface-container-lowest p-container-padding rounded-[24px] ambient-card border border-outline-variant/20">
<div className="flex items-center justify-between mb-4">
<div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center">
<span className="material-symbols-outlined text-primary" data-icon="verified">verified</span>
</div>
<span className="text-primary font-label-md text-label-md bg-primary-fixed/30 px-2 py-1 rounded-full">Top 5%</span>
</div>
<h3 className="font-label-md text-label-md text-on-surface-variant mb-1">Success Rate</h3>
<p className="font-headline-lg text-headline-lg text-on-surface font-bold">98.4%</p>
</div>
</div>
<div className="grid grid-cols-12 gap-card-gap">
{/* Student Pipeline Chart Container */}
<div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-container-padding rounded-[24px] ambient-card border border-outline-variant/20 flex flex-col min-h-[400px]">
<div className="flex justify-between items-start mb-8">
<div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Student Pipeline</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Application progression across different stages</p>
</div>
<select className="bg-surface-container-low border-none rounded-lg font-label-md text-label-md focus:ring-primary/20">
<option>Last 6 Months</option>
<option>Year to Date</option>
</select>
</div>
{/* Simplified Visual Representation of a Pipeline Chart */}
<div className="flex-1 flex flex-col justify-between mt-4">
<div className="space-y-6">
<div className="group cursor-default">
<div className="flex justify-between mb-2">
<span className="font-label-md text-label-md text-on-surface-variant">Prospects</span>
<span className="font-label-md text-label-md font-bold text-primary">842 Students</span>
</div>
<div className="h-4 w-full bg-secondary-fixed rounded-full overflow-hidden">
<div className="h-full bg-primary w-[85%] transition-all duration-1000"></div>
</div>
</div>
<div className="group cursor-default">
<div className="flex justify-between mb-2">
<span className="font-label-md text-label-md text-on-surface-variant">Application Submitted</span>
<span className="font-label-md text-label-md font-bold text-primary">521 Students</span>
</div>
<div className="h-4 w-full bg-secondary-fixed rounded-full overflow-hidden">
<div className="h-full bg-primary w-[65%] transition-all duration-1000 delay-100"></div>
</div>
</div>
<div className="group cursor-default">
<div className="flex justify-between mb-2">
<span className="font-label-md text-label-md text-on-surface-variant">Interview Phase</span>
<span className="font-label-md text-label-md font-bold text-primary">218 Students</span>
</div>
<div className="h-4 w-full bg-secondary-fixed rounded-full overflow-hidden">
<div className="h-full bg-primary w-[35%] transition-all duration-1000 delay-200"></div>
</div>
</div>
<div className="group cursor-default">
<div className="flex justify-between mb-2">
<span className="font-label-md text-label-md text-on-surface-variant">Final Acceptance</span>
<span className="font-label-md text-label-md font-bold text-primary">156 Students</span>
</div>
<div className="h-4 w-full bg-secondary-fixed rounded-full overflow-hidden">
<div className="h-full bg-primary w-[25%] transition-all duration-1000 delay-300"></div>
</div>
</div>
</div>
<div className="mt-8 pt-6 border-t border-outline-variant/30 flex gap-8">
<div className="flex items-center gap-2">
<span className="w-3 h-3 bg-primary rounded-full"></span>
<span className="font-label-md text-label-md text-on-surface-variant">Current Enrollment</span>
</div>
<div className="flex items-center gap-2">
<span className="w-3 h-3 bg-secondary-fixed rounded-full"></span>
<span className="font-label-md text-label-md text-on-surface-variant">Projected Target</span>
</div>
</div>
</div>
</div>
{/* Urgent Tasks Widget */}
<div className="col-span-12 lg:col-span-4 space-y-card-gap">
<div className="bg-primary p-container-padding rounded-[24px] shadow-xl relative overflow-hidden h-[220px]">
<div className="relative z-10 h-full flex flex-col justify-between">
<div>
<h3 className="font-headline-sm text-headline-sm text-surface-container-lowest mb-2">Need Help?</h3>
<p className="font-body-md text-body-md text-primary-fixed-dim opacity-90">Schedule a 1-on-1 strategy session with your account manager.</p>
</div>
<button className="bg-surface-container-lowest text-primary px-4 py-2 rounded-lg font-label-md text-label-md font-bold w-fit hover:bg-primary-fixed transition-colors">Book a Call</button>
</div>
{/* Abstract geometric decor */}
<div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
<div className="absolute right-4 top-4 opacity-20">
<span className="material-symbols-outlined text-[120px]" data-icon="support_agent">support_agent</span>
</div>
</div>
<div className="bg-surface-container-lowest p-container-padding rounded-[24px] ambient-card border border-outline-variant/20">
<div className="flex items-center justify-between mb-6">
<h3 className="font-headline-sm text-headline-sm text-on-surface">Urgent Tasks</h3>
<span className="w-6 h-6 bg-error text-white text-[10px] flex items-center justify-center rounded-full font-bold">4</span>
</div>
<div className="space-y-4">
<div className="flex gap-4 p-3 bg-error-container/20 rounded-xl border-l-4 border-error">
<div className="pt-1">
<span className="material-symbols-outlined text-error text-[20px]" data-icon="priority_high">priority_high</span>
</div>
<div>
<p className="font-label-md text-label-md font-bold text-on-surface">Visa Deadline</p>
<p className="font-body-md text-body-md text-on-surface-variant">3 students for Fall &apos;24 intake</p>
<p className="font-label-md text-label-md text-error mt-1 font-semibold">Today, 5:00 PM</p>
</div>
</div>
<div className="flex gap-4 p-3 bg-surface-container-low rounded-xl">
<div className="pt-1">
<span className="material-symbols-outlined text-primary text-[20px]" data-icon="description">description</span>
</div>
<div>
<p className="font-label-md text-label-md font-bold text-on-surface">Document Review</p>
<p className="font-body-md text-body-md text-on-surface-variant">Lia Wang&apos;s transcripts</p>
<p className="font-label-md text-label-md text-on-surface-variant mt-1">Due Tomorrow</p>
</div>
</div>
<button className="w-full py-3 text-center font-label-md text-label-md text-primary font-bold hover:bg-primary-fixed/30 rounded-xl transition-all">View All Tasks</button>
</div>
</div>
</div>
{/* Recent Student Activity */}
<div className="col-span-12 bg-surface-container-lowest p-container-padding rounded-[24px] ambient-card border border-outline-variant/20">
<div className="flex justify-between items-center mb-8">
<div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Student Activity</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Track real-time progress of your applicants</p>
</div>
<button className="text-primary font-label-md text-label-md font-bold hover:underline">See Detailed Log</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="border-b border-outline-variant/30">
<th className="pb-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Student Name</th>
<th className="pb-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Program / University</th>
<th className="pb-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
<th className="pb-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Last Update</th>
<th className="pb-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/20">
<tr>
<td className="py-5">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">SC</div>
<div>
<p className="font-label-md text-label-md font-bold">Sophia Chen</p>
<p className="font-body-md text-body-md text-on-surface-variant">ID: #SB-9231</p>
</div>
</div>
</td>
<td className="py-5">
<p className="font-label-md text-label-md font-medium">BSc Computer Science</p>
<p className="font-body-md text-body-md text-on-surface-variant">University of Oxford</p>
</td>
<td className="py-5">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-secondary-fixed text-on-secondary-container">Under Review</span>
</td>
<td className="py-5 font-body-md text-body-md text-on-surface-variant">2 hours ago</td>
<td className="py-5 text-right">
<button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
<span className="material-symbols-outlined text-outline" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
<tr>
<td className="py-5">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">RK</div>
<div>
<p className="font-label-md text-label-md font-bold">Rajesh Kumar</p>
<p className="font-body-md text-body-md text-on-surface-variant">ID: #SB-9255</p>
</div>
</div>
</td>
<td className="py-5">
<p className="font-label-md text-label-md font-medium">MBA Global Management</p>
<p className="font-body-md text-body-md text-on-surface-variant">Insead Business School</p>
</td>
<td className="py-5">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-tertiary-fixed text-on-tertiary-fixed-variant">Interview Scheduled</span>
</td>
<td className="py-5 font-body-md text-body-md text-on-surface-variant">Yesterday</td>
<td className="py-5 text-right">
<button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
<span className="material-symbols-outlined text-outline" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
<tr>
<td className="py-5">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">MS</div>
<div>
<p className="font-label-md text-label-md font-bold">Maria Santos</p>
<p className="font-body-md text-body-md text-on-surface-variant">ID: #SB-8921</p>
</div>
</div>
</td>
<td className="py-5">
<p className="font-label-md text-label-md font-medium">MA Visual Arts</p>
<p className="font-body-md text-body-md text-on-surface-variant">Royal College of Art</p>
</td>
<td className="py-5">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-primary-fixed text-on-primary-fixed-variant">Offer Received</span>
</td>
<td className="py-5 font-body-md text-body-md text-on-surface-variant">Oct 12, 2023</td>
<td className="py-5 text-right">
<button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
<span className="material-symbols-outlined text-outline" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</main>
{/* Footer Shell */}
<footer className="ml-[260px] bg-surface-container-lowest border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center px-margin-desktop py-gutter">
<div className="mb-4 md:mb-0">
<h2 className="font-headline-sm text-headline-sm font-bold text-primary">StudyBridge</h2>
<p className="font-body-md text-body-md text-on-surface-variant">© 2024 StudyBridge Global Education. All rights reserved.</p>
</div>
<div className="flex flex-wrap justify-center gap-8">
<Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>
<Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="/terms">Terms of Service</Link>
<Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="/privacy">Cookie Policy</Link>
<Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="/contact">Contact Support</Link>
</div>
</footer>
{/* FAB Action (Contextual: Home/Dashboard Only) */}
<button className="fixed bottom-8 right-8 w-14 h-14 bg-secondary-container text-on-secondary-container rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
<span className="material-symbols-outlined text-[32px]" style={{fontVariationSettings: "'FILL' 1"}}>add</span>
</button>


</>
  );
}
