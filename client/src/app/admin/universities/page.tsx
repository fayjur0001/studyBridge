"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { api, ApiError } from "@/lib/api";
import { Paginated, University } from "@/lib/types";

const EMPTY_FORM = {
  name: "",
  country: "",
  region: "",
  city: "",
  ranking: "",
  websiteUrl: "",
  description: "",
  admissionRequirements: "",
  applicationStartDate: "",
  applicationDeadline: "",
};

export default function AdminUniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  function load() {
    setLoading(true);
    api
      .get<Paginated<University>>("/api/universities?limit=50", { auth: false })
      .then((res) => {
        setUniversities(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function openEdit(u: University) {
    setEditingId(u.id);
    setForm({
      name: u.name,
      country: u.country,
      region: u.region ?? "",
      city: u.city ?? "",
      ranking: u.ranking?.toString() ?? "",
      websiteUrl: u.websiteUrl ?? "",
      description: u.description ?? "",
      admissionRequirements: u.admissionRequirements ?? "",
      applicationStartDate: u.applicationStartDate?.slice(0, 10) ?? "",
      applicationDeadline: u.applicationDeadline?.slice(0, 10) ?? "",
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        country: form.country,
        region: form.region || undefined,
        city: form.city || undefined,
        ranking: form.ranking ? Number(form.ranking) : undefined,
        websiteUrl: form.websiteUrl || undefined,
        description: form.description || undefined,
        admissionRequirements: form.admissionRequirements || undefined,
        applicationStartDate: form.applicationStartDate || undefined,
        applicationDeadline: form.applicationDeadline || undefined,
      };
      let universityId: string;
      if (editingId) {
        await api.patch(`/api/universities/${editingId}`, payload);
        universityId = editingId;
      } else {
        const created = await api.post<University>("/api/universities", payload);
        universityId = created.id;
      }
      if (images.length) { const body = new FormData(); images.forEach((image) => body.append("images", image)); await api.post(`/api/universities/${universityId}/images`, body); }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save this university.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this university? This can't be undone.")) return;
    await api.delete(`/api/universities/${id}`).catch(() => {});
    load();
  }

  return (
    <>
<AdminSidebar />

<header className="flex justify-between items-center h-16 px-8 ml-[260px] w-[calc(100%-260px)] fixed top-0 bg-surface dark:bg-[#17181d] z-40 border-b border-outline-variant dark:border-white/10 shadow-sm">
<h2 className="font-headline-sm text-headline-sm font-semibold text-primary">University Management</h2>
</header>

<main className="ml-[260px] pt-24 px-8 pb-8 h-screen overflow-y-auto bg-surface-container-low dark:bg-[#101115] custom-scrollbar">

<div className="flex justify-between items-end mb-8">
<div>
<h2 className="font-headline-lg text-headline-lg text-on-surface">University Management</h2>
<p className="text-on-surface-variant font-body-md mt-1">{total} institutions in the catalog.</p>
</div>
<button onClick={openCreate} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md font-bold shadow-lg hover:shadow-xl transition-all active:scale-95">
<span className="material-symbols-outlined">add</span>
                Add New Institution
            </button>
</div>

{showForm && (
<div className="rounded-3xl bg-surface-container-lowest dark:bg-[#1b1c20] border border-outline-variant/20 dark:border-white/10 p-8 mb-8 shadow-sm">
<h3 className="font-headline-sm text-headline-sm mb-6">{editingId ? "Edit University" : "Add University"}</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
<input className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30" placeholder="University name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
<input className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30" placeholder="Country *" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
<select className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/30" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
<option value="">No region</option>
<option value="North America">North America</option>
<option value="Europe">Europe</option>
<option value="Asia-Pacific">Asia-Pacific</option>
<option value="Middle East">Middle East</option>
</select>
<input className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
<input className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30" placeholder="Global ranking" type="number" min="1" value={form.ranking} onChange={(e) => setForm({ ...form, ranking: e.target.value })} />
<input className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30" placeholder="Website URL (https://...)" type="url" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
</div>
<textarea className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 mb-4 resize-none placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30" rows={3} placeholder="Short description for students" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
<textarea className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 mb-4 resize-none placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30" rows={3} placeholder="Admission requirements (e.g. GPA, English score, required documents)" value={form.admissionRequirements} onChange={(e) => setForm({ ...form, admissionRequirements: e.target.value })} />
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><label className="text-sm text-on-surface-variant">Application opens<input type="date" value={form.applicationStartDate} onChange={(e) => setForm({ ...form, applicationStartDate: e.target.value })} className="mt-2 block w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface rounded-xl py-3 px-4 border border-outline-variant/30 dark:border-white/10" /></label><label className="text-sm text-on-surface-variant">Application deadline<input type="date" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} className="mt-2 block w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface rounded-xl py-3 px-4 border border-outline-variant/30 dark:border-white/10" /></label></div>
<label className="mb-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/50 dark:border-white/15 bg-surface-container-low/60 dark:bg-[#292a30]/60 px-6 py-7 text-center transition-colors hover:border-primary hover:bg-primary-container/10"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setImages(Array.from(e.target.files ?? []).slice(0, 8))} className="sr-only" /><span className="material-symbols-outlined mb-2 text-3xl text-primary">add_photo_alternate</span><span className="font-bold text-on-surface">Upload campus photos</span><span className="mt-1 text-sm text-on-surface-variant">Click to choose up to 8 JPG, PNG, or WEBP images</span>{images.length > 0 && <span className="mt-3 rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold text-on-primary-fixed">{images.length} image{images.length === 1 ? "" : "s"} selected</span>}</label>
{images.length > 0 && <div className="mb-5 flex flex-wrap gap-2">{images.map((image) => <span key={`${image.name}-${image.lastModified}`} className="max-w-52 truncate rounded-lg bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">{image.name}</span>)}</div>}
{error && <p className="text-error font-body-md mb-4">{error}</p>}
<div className="flex gap-3">
<button onClick={handleSave} disabled={saving} className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
<button onClick={() => setShowForm(false)} className="px-6 py-2.5 text-on-surface-variant font-bold">Cancel</button>
</div>
</div>
)}

<div className="rounded-3xl bg-surface-container-lowest dark:bg-[#1b1c20] border border-outline-variant/20 dark:border-white/10 overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container/50 border-b border-outline-variant">
<th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Institution</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Country</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Rank</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Region</th>
<th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
{!loading && universities.length === 0 && (
  <tr><td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant font-body-md">No universities yet — add the first one.</td></tr>
)}
{universities.map((u) => (
<tr key={u.id} className="table-row-hover transition-colors">
<td className="px-8 py-5">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant overflow-hidden">
<span className="material-symbols-outlined text-primary">school</span>
</div>
<div>
<p className="font-body-md text-body-md font-bold text-on-surface">{u.name}</p>
<p className="font-label-md text-label-md text-on-surface-variant">{u.city ? `${u.city}, ` : ""}{u.country}</p>
</div>
</div>
</td>
<td className="px-6 py-5 font-body-md text-body-md text-on-surface">{u.country}</td>
<td className="px-6 py-5 font-body-md text-body-md text-on-surface">{u.ranking ?? "—"}</td>
<td className="px-6 py-5 font-body-md text-body-md text-on-surface-variant">{u.region ?? "—"}</td>
<td className="px-8 py-5 text-right">
<div className="flex justify-end gap-2">
<button onClick={() => openEdit(u)} className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-primary/10 rounded-lg" title="Edit">
<span className="material-symbols-outlined">edit_note</span>
</button>
<button onClick={() => handleDelete(u.id)} className="p-2 text-on-surface-variant hover:text-error transition-colors hover:bg-error/10 rounded-lg" title="Delete">
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
