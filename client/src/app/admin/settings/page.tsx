import type { Metadata } from "next";
import AdminSidebar from "@/components/dashboard/AdminSidebar";

export const metadata: Metadata = {
  title: "Platform Settings",
};

export default function AdminSettingsPage() {
  return (
    <>
<AdminSidebar />

<main className="ml-[260px] h-screen overflow-y-auto bg-background custom-scrollbar">
{/* Top Navigation Bar */}
<header className="sticky top-0 z-40 flex justify-between items-center h-16 px-8 bg-surface dark:bg-surface-dim border-b border-outline-variant shadow-sm">
<div className="flex items-center gap-6 w-1/2">
<h2 className="font-headline-sm text-headline-sm font-semibold text-primary dark:text-primary-fixed whitespace-nowrap">Platform Settings</h2>
<div className="relative w-full max-w-md">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" data-icon="search">search</span>
<input className="w-full pl-10 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary-container text-body-md font-body-md transition-all" placeholder="Search roles, permissions, config..." type="text"/>
</div>
</div>
<div className="flex items-center gap-4">
<button className="p-2 rounded-full hover:bg-surface-container-high transition-colors relative">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="notifications">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
</button>
<button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="help_outline">help_outline</span>
</button>
</div>
</header>
{/* Dashboard Content Grid */}
<div className="p-8 space-y-8">
<div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl px-6 py-4 flex items-center gap-3">
<span className="material-symbols-outlined">construction</span>
<p className="font-body-md text-body-md">
The app currently uses 3 fixed roles (student/agency/admin) rather than configurable permissions, and there&apos;s no API key system, email-template editor, or audit log built yet. The controls below are placeholders — let&apos;s scope what you actually need before wiring them up.
</p>
</div>
{/* Section 3: RBAC & Technical Settings */}
<section className="grid grid-cols-12 gap-6">
{/* RBAC Manager */}
<div className="col-span-8 ambient-card p-container-padding overflow-hidden">
<div className="flex justify-between items-center mb-8">
<h3 className="font-headline-sm text-headline-sm">Role-Based Access Control</h3>
<button className="flex items-center gap-2 text-primary font-bold">
<span className="material-symbols-outlined" data-icon="add_moderator">add_moderator</span>
                            Create New Role
                        </button>
</div>
<table className="w-full text-left">
<thead>
<tr className="border-b border-outline-variant">
<th className="pb-4 font-bold text-label-md uppercase tracking-wider text-on-surface-variant">Role Name</th>
<th className="pb-4 font-bold text-label-md uppercase tracking-wider text-on-surface-variant">Permissions Scope</th>
<th className="pb-4 font-bold text-label-md uppercase tracking-wider text-on-surface-variant">Users</th>
<th className="pb-4 font-bold text-label-md uppercase tracking-wider text-on-surface-variant">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/30">
<tr>
<td className="py-4">
<span className="font-bold block">Super Administrator</span>
<span className="text-label-md text-on-surface-variant">Full system access</span>
</td>
<td className="py-4">
<div className="flex gap-1 flex-wrap">
<span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold rounded uppercase">Global</span>
<span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold rounded uppercase">Finances</span>
</div>
</td>
<td className="py-4 font-bold text-body-md">3</td>
<td className="py-4">
<button className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant"><span className="material-symbols-outlined text-sm" data-icon="edit">edit</span></button>
</td>
</tr>
<tr>
<td className="py-4">
<span className="font-bold block">Enrollment Manager</span>
<span className="text-label-md text-on-surface-variant">Student & Agency logic</span>
</td>
<td className="py-4">
<div className="flex gap-1 flex-wrap">
<span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold rounded uppercase">Users</span>
<span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold rounded uppercase">Matching</span>
</div>
</td>
<td className="py-4 font-bold text-body-md">12</td>
<td className="py-4">
<button className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant"><span className="material-symbols-outlined text-sm" data-icon="edit">edit</span></button>
</td>
</tr>
<tr>
<td className="py-4">
<span className="font-bold block">Content Editor</span>
<span className="text-label-md text-on-surface-variant">CMS & Knowledge Base</span>
</td>
<td className="py-4">
<div className="flex gap-1 flex-wrap">
<span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded uppercase">Content</span>
<span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded uppercase">Reports</span>
</div>
</td>
<td className="py-4 font-bold text-body-md">24</td>
<td className="py-4">
<button className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant"><span className="material-symbols-outlined text-sm" data-icon="edit">edit</span></button>
</td>
</tr>
</tbody>
</table>
</div>
{/* API & Email Config */}
<div className="col-span-4 flex flex-col gap-6">
<div className="ambient-card p-6 bg-surface-container-high border-2 border-dashed border-outline-variant">
<div className="flex items-center gap-3 mb-4">
<span className="material-symbols-outlined text-primary" data-icon="key">key</span>
<h4 className="font-bold text-body-lg">Active API Keys</h4>
</div>
<div className="space-y-4">
<div className="p-3 bg-surface rounded-xl flex items-center justify-between">
<code className="text-xs font-mono text-on-surface-variant">SB_LIVE_4920...382</code>
<span className="material-symbols-outlined text-sm cursor-pointer" data-icon="content_copy">content_copy</span>
</div>
<p className="text-label-md text-on-surface-variant italic">Last rotated 14 days ago by Sarah Jenkins</p>
<button className="w-full py-2 text-primary font-bold border border-primary rounded-lg hover:bg-primary/5">Generate New Key</button>
</div>
</div>
<div className="ambient-card p-6 flex flex-col justify-between">
<div>
<div className="flex items-center gap-3 mb-4">
<span className="material-symbols-outlined text-secondary" data-icon="mail">mail</span>
<h4 className="font-bold text-body-lg">Email Templates</h4>
</div>
<p className="text-body-md text-on-surface-variant mb-6">Manage automated outreach and system notifications.</p>
</div>
<div className="space-y-2">
<button className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-surface-container transition-colors">
<span className="font-medium">Welcome Series</span>
<span className="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
</button>
<button className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-surface-container transition-colors">
<span className="font-medium">Enrollment Update</span>
<span className="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
</div>
</section>
{/* Section 4: Security & Logs */}
<section className="grid grid-cols-12 gap-6 pb-12">
<div className="col-span-12 ambient-card p-container-padding">
<div className="flex justify-between items-center mb-6">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center">
<span className="material-symbols-outlined" data-icon="security">security</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm">Security Log & Maintenance</h3>
<p className="text-on-surface-variant text-body-md">Real-time system health and admin login activity.</p>
</div>
</div>
<div className="flex gap-3">
<button className="px-4 py-2 bg-surface-container rounded-lg font-bold flex items-center gap-2">
<span className="material-symbols-outlined text-sm" data-icon="filter_list">filter_list</span>
                                Filter Logs
                            </button>
<button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold">Export .CSV</button>
</div>
</div>
<div className="space-y-4">
<div className="flex items-center gap-6 p-4 bg-surface rounded-2xl border border-outline-variant/30 hover:border-primary transition-colors">
<div className="flex flex-col items-center">
<span className="font-bold text-error">12:04</span>
<span className="text-[10px] text-on-surface-variant uppercase">Today</span>
</div>
<div className="w-[2px] h-10 bg-outline-variant/30"></div>
<div className="flex-1">
<div className="flex items-center gap-2 mb-1">
<span className="px-2 py-0.5 bg-error-container text-on-error-container text-[10px] font-bold rounded">Critical Alert</span>
<span className="font-bold">Failed Backup Attempt</span>
</div>
<p className="text-body-md text-on-surface-variant">S3 Bucket &quot;study-bridge-assets-production&quot; returned Access Denied. Verify IAM credentials.</p>
</div>
<button className="text-primary font-bold text-body-md hover:underline">Investigate</button>
</div>
<div className="flex items-center gap-6 p-4 bg-surface rounded-2xl border border-outline-variant/30">
<div className="flex flex-col items-center">
<span className="font-bold">09:42</span>
<span className="text-[10px] text-on-surface-variant uppercase">Today</span>
</div>
<div className="w-[2px] h-10 bg-outline-variant/30"></div>
<div className="flex-1">
<div className="flex items-center gap-2 mb-1">
<span className="px-2 py-0.5 bg-secondary-container/20 text-secondary text-[10px] font-bold rounded">Security</span>
<span className="font-bold">Admin Login: Sarah Jenkins</span>
</div>
<p className="text-body-md text-on-surface-variant">IP: 192.168.1.1 (London, UK) - 2FA Verified (Duo Push).</p>
</div>
<span className="text-on-surface-variant italic text-body-md">Verified</span>
</div>
<div className="flex items-center gap-6 p-4 bg-surface rounded-2xl border border-outline-variant/30">
<div className="flex flex-col items-center">
<span className="font-bold">Yesterday</span>
<span className="text-[10px] text-on-surface-variant uppercase">23:15</span>
</div>
<div className="w-[2px] h-10 bg-outline-variant/30"></div>
<div className="flex-1">
<div className="flex items-center gap-2 mb-1">
<span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded">System</span>
<span className="font-bold">Automatic Maintenance Complete</span>
</div>
<p className="text-body-md text-on-surface-variant">Database index optimization and cache purge completed successfully. System performance increased by 14%.</p>
</div>
<span className="text-on-surface-variant italic text-body-md text-sm">Automated</span>
</div>
</div>
</div>
</section>


</div>
</main>
</>
  );
}
