"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Role } from "@/lib/types";

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

const ROLE_STYLES: Record<Role, string> = {
  student: "bg-tertiary-fixed text-on-tertiary-fixed",
  agency: "bg-secondary-fixed text-on-secondary-fixed",
  admin: "bg-primary-fixed text-on-primary-fixed",
};

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (search.trim()) params.set("search", search.trim());
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("isActive", statusFilter);

    api
      .get<{ data: AdminUser[]; meta: { total: number } }>(`/api/admin/users?${params.toString()}`)
      .then((res) => {
        setUsers(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = window.setTimeout(load, 250);
    return () => window.clearTimeout(timeout);
  }, [search, roleFilter, statusFilter]);

  async function toggleActive(u: AdminUser) {
    setUpdatingId(u.id);
    try {
      await api.patch(`/api/admin/users/${u.id}/active`, { isActive: !u.isActive });
      load();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <>
<AdminSidebar />


{/* Top Navigation (TopNavBar) */}
<header className="sticky top-0 z-40 bg-surface flex justify-between items-center h-16 px-8 ml-[260px] w-[calc(100%-260px)] border-b border-outline-variant">
<div className="flex items-center gap-6 flex-1">
<div className="relative w-full max-w-md">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-lg" data-icon="search">search</span>
<input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary-container transition-all" placeholder="Search by name or email..." type="search" aria-label="Search users"/>
</div>
</div>
<div className="flex items-center gap-4">
<NotificationBell />
<p className="font-headline-sm text-headline-sm font-semibold text-primary">{me?.fullName ?? "StudyBridge Admin"}</p>
</div>
</header>
{/* Main Content Canvas */}
<main className="ml-[260px] p-8 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar">
{/* Header & Top Actions */}
<div className="flex justify-between items-end mb-8">
<div>
<nav className="flex gap-2 text-on-surface-variant font-label-md text-xs mb-2">
<span>Admin</span>
<span className="material-symbols-outlined text-[12px]" data-icon="chevron_right">chevron_right</span>
<span className="text-primary font-semibold">User Management</span>
</nav>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Database Management</h2>
<p className="text-on-surface-variant font-body-md mt-1">Review, monitor, and manage the complete user ecosystem of StudyBridge.</p>
</div>
</div>
{/* Filters Section */}
<div className="ambient-card bg-surface-container-lowest rounded-[24px] p-6 mb-6">
<div className="flex flex-wrap items-center gap-4">
<div className="flex-1 min-w-[200px]">
<label className="block text-on-surface-variant font-label-md mb-2">Role</label>
<select
  className="w-full bg-surface-container-low border-none rounded-xl py-2.5 px-4 text-body-md focus:ring-2 focus:ring-primary-container"
  value={roleFilter}
  onChange={(e) => setRoleFilter(e.target.value)}
>
<option value="">All Roles</option>
<option value="student">Student</option>
<option value="agency">Agency</option>
<option value="admin">Admin</option>
</select>
</div>
<div className="flex-1 min-w-[200px]">
<label className="block text-on-surface-variant font-label-md mb-2">Status</label>
<select
  className="w-full bg-surface-container-low border-none rounded-xl py-2.5 px-4 text-body-md focus:ring-2 focus:ring-primary-container"
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
>
<option value="">All Statuses</option>
<option value="true">Active</option>
<option value="false">Suspended</option>
</select>
</div>
<div className="flex items-end h-full mt-7">
<button
  onClick={() => { setSearch(""); setRoleFilter(""); setStatusFilter(""); }}
  className="px-5 py-2.5 text-primary hover:bg-primary-container/10 rounded-xl transition-colors font-label-md"
>
                        Clear All Filters
                    </button>
</div>
</div>
</div>
{/* Main User Table */}
<div className="ambient-card bg-surface-container-lowest rounded-[24px] overflow-hidden">
<div className="p-6 border-b border-outline-variant flex justify-between items-center bg-white/50 backdrop-blur-sm">
<div className="flex items-center gap-4">
<h3 className="font-headline-sm text-headline-sm text-on-surface">Active Directory</h3>
<span className="bg-primary-fixed text-on-primary-fixed text-[10px] px-2.5 py-0.5 rounded-full font-bold">{total} USERS</span>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container/30 border-b border-outline-variant">
<th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">User Profile</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Role</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Join Date</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant">

{!loading && users.length === 0 && (
  <tr><td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant font-body-md">No users match these filters.</td></tr>
)}

{users.map((u) => (
<tr key={u.id} className={`hover:bg-primary-container/5 transition-colors group ${!u.isActive ? "bg-error/5" : ""}`}>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-primary">{u.fullName?.[0] ?? "?"}</div>
<div>
<p className="font-bold text-on-surface text-body-lg">{u.fullName}</p>
<p className="text-on-surface-variant text-xs">{u.email}</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<span className={`text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-tight ${ROLE_STYLES[u.role]}`}>{u.role}</span>
</td>
<td className="px-6 py-4 text-on-surface-variant text-body-md">{new Date(u.createdAt).toLocaleDateString()}</td>
<td className="px-6 py-4">
<div className={`flex items-center gap-1.5 font-bold text-[11px] uppercase ${u.isActive ? "text-primary" : "text-error"}`}>
<span className={`w-2 h-2 rounded-full ${u.isActive ? "bg-primary" : "bg-error"}`}></span>
{u.isActive ? "Active" : "Suspended"}
</div>
</td>
<td className="px-6 py-4 text-right">
<div className="flex justify-end items-center gap-2">
<button
  onClick={() => toggleActive(u)}
  disabled={updatingId === u.id || u.id === me?.id}
  title={u.isActive ? "Suspend Account" : "Activate Account"}
  className={`p-2 rounded-lg disabled:opacity-30 ${u.isActive ? "text-error hover:bg-error-container" : "text-secondary hover:bg-secondary-fixed"}`}
>
<span className="material-symbols-outlined">{u.isActive ? "block" : "check_circle"}</span>
</button>
</div>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
</main>
    </>
  );
}
