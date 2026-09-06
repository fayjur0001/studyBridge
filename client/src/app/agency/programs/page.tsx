"use client";

import { useEffect, useState } from "react";
import AgencySidebar from "@/components/dashboard/AgencySidebar";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";

interface AgencyService {
  id: string;
  name: string;
  description: string | null;
  priceUsd: string | null;
  features: string[];
  isActive: boolean;
}

const EMPTY_FORM = { name: "", description: "", priceUsd: "", features: "" };

export default function AgencyServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<AgencyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    api
      .get<{ data: AgencyService[] }>("/api/agency/services")
      .then((res) => setServices(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate() {
    setError(null);
    if (!form.name.trim()) {
      setError("Please give the service a name.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/api/agency/services", {
        name: form.name,
        description: form.description || undefined,
        priceUsd: form.priceUsd ? Number(form.priceUsd) : undefined,
        features: form.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save this service.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(service: AgencyService) {
    await api.patch(`/api/agency/services/${service.id}`, { isActive: !service.isActive });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service package?")) return;
    await api.delete(`/api/agency/services/${id}`).catch(() => {});
    load();
  }

  return (
    <>
<AgencySidebar />

<main className="ml-[260px] flex flex-col min-h-screen">
<header className="sticky top-0 w-full z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center px-gutter py-4 h-20">
<h2 className="font-headline-sm text-headline-sm font-semibold text-primary">Service Packages</h2>
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-primary">
{user?.fullName?.[0] ?? "A"}
</div>
</div>
</header>

<div className="p-margin-desktop flex-1">
<div className="flex justify-between items-end mb-10">
<div>
<h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Service Packages</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">Configure the academic support tiers offered to prospective students.</p>
</div>
<button
  onClick={() => setShowForm((v) => !v)}
  className="bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
>
<span className="material-symbols-outlined">add</span>
{showForm ? "Cancel" : "New Service Package"}
</button>
</div>

{showForm && (
<div className="bg-surface-container-lowest rounded-[24px] p-8 mb-10 ambient-occlusion">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
<input className="bg-surface-container-low border-none rounded-xl py-3 px-4" placeholder="Service name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
<input className="bg-surface-container-low border-none rounded-xl py-3 px-4" placeholder="Price (USD)" type="number" value={form.priceUsd} onChange={(e) => setForm({ ...form, priceUsd: e.target.value })} />
</div>
<textarea className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 mb-4 resize-none" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
<input className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 mb-4" placeholder="Features, comma-separated (e.g. Essay review, Mock interview)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
{error && <p className="text-error font-body-md mb-4">{error}</p>}
<button onClick={handleCreate} disabled={saving} className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold disabled:opacity-50">
{saving ? "Saving..." : "Create Service"}
</button>
</div>
)}

{!loading && services.length === 0 && (
  <p className="text-on-surface-variant font-body-md">No service packages yet — add your first one above.</p>
)}

<div className="grid grid-cols-1 md:grid-cols-2 gap-card-gap">
{services.map((service) => (
<div key={service.id} className={`bg-surface-container-lowest rounded-[24px] p-container-padding ambient-occlusion transition-all ${!service.isActive ? "opacity-60" : ""}`}>
<div className="flex justify-between items-start mb-4">
<div className="flex items-center gap-4">
<div className="w-14 h-14 rounded-2xl bg-primary-container/10 flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-3xl">auto_awesome</span>
</div>
<div>
<h3 className="font-headline-sm text-headline-sm text-on-surface">{service.name}</h3>
<p className="text-on-surface-variant font-body-md text-body-md">{service.description}</p>
</div>
</div>
<div className="flex items-center gap-4">
{service.priceUsd && <p className="font-headline-sm text-headline-sm text-primary">${Number(service.priceUsd).toLocaleString()}</p>}
<label className="relative inline-flex items-center cursor-pointer">
<input
  checked={service.isActive}
  onChange={() => toggleActive(service)}
  className="sr-only peer"
  type="checkbox"
/>
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
{service.features.length > 0 && (
<div className="flex flex-wrap gap-2 pt-4 border-t border-outline-variant/30">
{service.features.map((f) => (
<span key={f} className="bg-blue-soft/30 px-3 py-1 rounded-full text-label-md text-primary">{f}</span>
))}
</div>
)}
<button onClick={() => handleDelete(service.id)} className="mt-4 text-error font-label-md text-label-md font-bold hover:underline">Delete</button>
</div>
))}
</div>
</div>
</main>
    </>
  );
}
