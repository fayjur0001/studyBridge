"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { api, ApiError } from "@/lib/api";
import { Paginated, Scholarship, University } from "@/lib/types";

const EMPTY_FORM = {
  universityId: "",
  title: "",
  provider: "",
  category: "",
  amountUsd: "",
  coveragePercent: "",
  deadline: "",
  eligibility: "",
  description: "",
  applyUrl: "",
};

export default function AdminScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);

  function load() {
    setLoading(true);
    api
      .get<Paginated<Scholarship>>("/api/scholarships?limit=50", { auth: false })
      .then((res) => {
        setScholarships(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => { api.get<Paginated<University>>("/api/universities?limit=200", { auth: false }).then((res) => setUniversities(res.data)).catch(() => {}); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function openEdit(s: Scholarship) {
    setEditingId(s.id);
    setForm({
      universityId: s.universityId ?? "",
      title: s.title,
      provider: s.provider ?? "",
      category: s.category ?? "",
      amountUsd: s.amountUsd ?? "",
      coveragePercent: s.coveragePercent?.toString() ?? "",
      deadline: s.deadline ? s.deadline.slice(0, 10) : "",
      eligibility: s.eligibility ?? "",
      description: s.description ?? "",
      applyUrl: s.applyUrl ?? "",
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        universityId: form.universityId || undefined,
        title: form.title,
        provider: form.provider || undefined,
        category: form.category || undefined,
        amountUsd: form.amountUsd ? Number(form.amountUsd) : undefined,
        coveragePercent: form.coveragePercent ? Number(form.coveragePercent) : undefined,
        deadline: form.deadline || undefined,
        eligibility: form.eligibility || undefined,
        description: form.description || undefined,
        applyUrl: form.applyUrl || undefined,
      };
      if (editingId) {
        await api.patch(`/api/scholarships/${editingId}`, payload);
      } else {
        await api.post("/api/scholarships", payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save this scholarship.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this scholarship? This can't be undone.")) return;
    await api.delete(`/api/scholarships/${id}`).catch(() => {});
    load();
  }

  return (
    <>
<AdminSidebar />

<header className="flex justify-between items-center h-16 px-8 ml-[260px] w-[calc(100%-260px)] fixed top-0 bg-surface z-40 border-b border-outline-variant shadow-sm">
<h2 className="font-headline-sm text-headline-sm font-semibold text-primary">Scholarship Management</h2>
</header>

<main className="ml-[260px] pt-24 px-8 pb-8 h-screen overflow-y-auto bg-surface-container-low custom-scrollbar">

<div className="flex justify-between items-end mb-8">
<div>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Scholarship Management</h2>
<p className="text-on-surface-variant font-body-md mt-1">{total} scholarships in the catalog.</p>
</div>
<button onClick={openCreate} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md font-bold shadow-lg hover:shadow-xl transition-all active:scale-95">
<span className="material-symbols-outlined">add</span>
                Add Scholarship
            </button>
</div>

{showForm && (
<div className="rounded-3xl bg-surface-container-lowest dark:bg-[#1b1c20] border border-outline-variant/20 dark:border-white/10 p-8 mb-8">
<h3 className="font-headline-sm text-headline-sm mb-6">{editingId ? "Edit Scholarship" : "Add Scholarship"}</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
<input className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4" placeholder="Scholarship title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
<input className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4" placeholder="Provider / foundation" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
<select className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4" value={form.universityId} onChange={(e) => setForm({ ...form, universityId: e.target.value })}><option value="">Independent scholarship (no university)</option>{universities.map((university) => <option key={university.id} value={university.id}>{university.name}</option>)}</select>
<select className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
<option value="">No category</option>
<option value="Merit Based">Merit Based</option>
<option value="Need Based">Need Based</option>
<option value="Portfolio Based">Portfolio Based</option>
</select>
<input className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4" placeholder="Award amount (USD)" type="number" min="0" value={form.amountUsd} onChange={(e) => setForm({ ...form, amountUsd: e.target.value })} />
<input className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4" placeholder="Coverage percentage (0–100)" type="number" min="0" max="100" value={form.coveragePercent} onChange={(e) => setForm({ ...form, coveragePercent: e.target.value })} />
<input className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4" aria-label="Application deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
<input className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 md:col-span-2" placeholder="Official application URL (https://...)" type="url" value={form.applyUrl} onChange={(e) => setForm({ ...form, applyUrl: e.target.value })} />
</div>
<textarea className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 mb-4 resize-none" rows={3} placeholder="Eligibility requirements (GPA, nationality, study level, documents, etc.)" value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} />
<textarea className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 mb-4 resize-none" rows={4} placeholder="Scholarship description, benefits, and application guidance" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
{error && <p className="text-error font-body-md mb-4">{error}</p>}
<div className="flex gap-3">
<button onClick={handleSave} disabled={saving} className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
<button onClick={() => setShowForm(false)} className="px-6 py-2.5 text-on-surface-variant font-bold">Cancel</button>
</div>
</div>
)}

<div className="ambient-card overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container/50 border-b border-outline-variant">
<th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Scholarship</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Category</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Amount</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Deadline</th>
<th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
{!loading && scholarships.length === 0 && (
  <tr><td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant font-body-md">No scholarships yet — add the first one.</td></tr>
)}
{scholarships.map((s) => (
<tr key={s.id} className="table-row-hover transition-colors">
<td className="px-8 py-5">
<p className="font-body-md text-body-md font-bold text-on-surface">{s.title}</p>
<p className="font-label-md text-label-md text-on-surface-variant">{s.provider}</p>
</td>
<td className="px-6 py-5 font-body-md text-body-md text-on-surface">{s.category ?? "—"}</td>
<td className="px-6 py-5 font-body-md text-body-md text-on-surface">{s.amountUsd ? `$${Number(s.amountUsd).toLocaleString()}` : "—"}</td>
<td className="px-6 py-5 font-body-md text-body-md text-on-surface-variant">{s.deadline ? new Date(s.deadline).toLocaleDateString() : "—"}</td>
<td className="px-8 py-5 text-right">
<div className="flex justify-end gap-2">
<button onClick={() => openEdit(s)} className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-primary/10 rounded-lg" title="Edit">
<span className="material-symbols-outlined">edit_note</span>
</button>
<button onClick={() => handleDelete(s.id)} className="p-2 text-on-surface-variant hover:text-error transition-colors hover:bg-error/10 rounded-lg" title="Delete">
<span className="material-symbols-outlined">delete</span>
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
