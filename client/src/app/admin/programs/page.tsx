"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { api, ApiError } from "@/lib/api";
import { Paginated, Program, University } from "@/lib/types";

const EMPTY_FORM = {
  universityId: "",
  name: "",
  degreeLevel: "",
  field: "",
  durationMonths: "",
  tuitionFeeUsd: "",
  description: "",
};

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<Paginated<Program>>("/api/programs?limit=50", { auth: false })
      .then((res) => {
        setPrograms(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  useEffect(() => {
    api
      .get<Paginated<University>>("/api/universities?limit=200", { auth: false })
      .then((res) => setUniversities(res.data))
      .catch(() => {});
  }, []);

  function universityName(id: string) {
    return universities.find((u) => u.id === id)?.name ?? "Unknown university";
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function openEdit(p: Program) {
    setEditingId(p.id);
    setForm({
      universityId: p.universityId,
      name: p.name,
      degreeLevel: p.degreeLevel,
      field: p.field ?? "",
      durationMonths: p.durationMonths?.toString() ?? "",
      tuitionFeeUsd: p.tuitionFeeUsd ?? "",
      description: p.description ?? "",
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (!form.universityId) {
        setError("Please choose a university for this program.");
        setSaving(false);
        return;
      }
      const payload = {
        universityId: form.universityId,
        name: form.name,
        degreeLevel: form.degreeLevel,
        field: form.field || undefined,
        durationMonths: form.durationMonths ? Number(form.durationMonths) : undefined,
        tuitionFeeUsd: form.tuitionFeeUsd ? Number(form.tuitionFeeUsd) : undefined,
        description: form.description || undefined,
      };
      if (editingId) {
        await api.patch(`/api/programs/${editingId}`, payload);
      } else {
        await api.post("/api/programs", payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save this program.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this program? This can't be undone.")) return;
    await api.delete(`/api/programs/${id}`).catch(() => {});
    load();
  }

  return (
    <>
<AdminSidebar />

<header className="flex justify-between items-center h-16 px-8 ml-[260px] w-[calc(100%-260px)] fixed top-0 bg-surface z-40 border-b border-outline-variant shadow-sm">
<h2 className="font-headline-sm text-headline-sm font-semibold text-primary">Program Management</h2>
</header>

<main className="ml-[260px] pt-24 px-8 pb-8 h-screen overflow-y-auto bg-surface-container-low custom-scrollbar">

<div className="flex justify-between items-end mb-8">
<div>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Program Management</h2>
<p className="text-on-surface-variant font-body-md mt-1">{total} degree programs across the catalog.</p>
</div>
<button onClick={openCreate} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md font-bold shadow-lg hover:shadow-xl transition-all active:scale-95">
<span className="material-symbols-outlined">add</span>
                Add New Program
            </button>
</div>

{showForm && (
<div className="ambient-card p-8 mb-8">
<h3 className="font-headline-sm text-headline-sm mb-6">{editingId ? "Edit Program" : "Add Program"}</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
<select className="bg-surface-container-low border-none rounded-xl py-3 px-4 md:col-span-2" value={form.universityId} onChange={(e) => setForm({ ...form, universityId: e.target.value })}>
<option value="">Select a university...</option>
{universities.map((u) => (
  <option key={u.id} value={u.id}>{u.name} ({u.country})</option>
))}
</select>
<input className="bg-surface-container-low border-none rounded-xl py-3 px-4" placeholder="Program Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
<select className="bg-surface-container-low border-none rounded-xl py-3 px-4" value={form.degreeLevel} onChange={(e) => setForm({ ...form, degreeLevel: e.target.value })}>
<option value="">Degree Level</option>
<option value="Bachelor's">Bachelor&apos;s</option>
<option value="Master's">Master&apos;s</option>
<option value="PhD">PhD</option>
<option value="Diploma">Diploma</option>
<option value="Certificate">Certificate</option>
</select>
<input className="bg-surface-container-low border-none rounded-xl py-3 px-4" placeholder="Field of Study" value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} />
<input className="bg-surface-container-low border-none rounded-xl py-3 px-4" placeholder="Duration (months)" type="number" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })} />
<input className="bg-surface-container-low border-none rounded-xl py-3 px-4 md:col-span-2" placeholder="Tuition Fee (USD / year)" type="number" value={form.tuitionFeeUsd} onChange={(e) => setForm({ ...form, tuitionFeeUsd: e.target.value })} />
</div>
<textarea className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 mb-4 resize-none" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
<th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Program</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">University</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Degree Level</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Duration</th>
<th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
{!loading && programs.length === 0 && (
  <tr><td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant font-body-md">No programs yet — add the first one.</td></tr>
)}
{programs.map((p) => (
<tr key={p.id} className="table-row-hover transition-colors">
<td className="px-8 py-5">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant overflow-hidden">
<span className="material-symbols-outlined text-primary">menu_book</span>
</div>
<div>
<p className="font-body-md text-body-md font-bold text-on-surface">{p.name}</p>
<p className="font-label-md text-label-md text-on-surface-variant">{p.field ?? "—"}</p>
</div>
</div>
</td>
<td className="px-6 py-5 font-body-md text-body-md text-on-surface">{universityName(p.universityId)}</td>
<td className="px-6 py-5 font-body-md text-body-md text-on-surface-variant">{p.degreeLevel}</td>
<td className="px-6 py-5 font-body-md text-body-md text-on-surface-variant">{p.durationMonths ? `${p.durationMonths} months` : "—"}</td>
<td className="px-8 py-5 text-right">
<div className="flex justify-end gap-2">
<button onClick={() => openEdit(p)} className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-primary/10 rounded-lg" title="Edit">
<span className="material-symbols-outlined">edit_note</span>
</button>
<button onClick={() => handleDelete(p.id)} className="p-2 text-on-surface-variant hover:text-error transition-colors hover:bg-error/10 rounded-lg" title="Delete">
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
