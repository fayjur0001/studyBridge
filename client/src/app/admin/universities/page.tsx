"use client";

import { useEffect, useState, useCallback } from "react";
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
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  // Rejection modal
  const [rejectingUni, setRejectingUni] = useState<University | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingReview, setProcessingReview] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const query = statusFilter === "all" ? "" : `&status=${statusFilter}`;
    api
      .get<Paginated<University>>(`/api/universities?limit=100${query}`)
      .then((res) => {
        setUniversities(res.data);
        setTotal(res.meta.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImages([]);
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
    setImages([]);
    setError(null);
    setShowForm(true);
  }

  async function handleSave() {
    setError(null);
    if (!form.name.trim()) {
      setError("Please enter the university name.");
      return;
    }
    if (!form.country.trim()) {
      setError("Please enter the country.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        country: form.country.trim(),
        region: form.region?.trim() || undefined,
        city: form.city?.trim() || undefined,
        ranking: form.ranking && Number(form.ranking) > 0 ? Number(form.ranking) : undefined,
        websiteUrl: form.websiteUrl?.trim() || undefined,
        description: form.description?.trim() || undefined,
        admissionRequirements: form.admissionRequirements?.trim() || undefined,
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
      if (images.length) {
        const body = new FormData();
        images.forEach((image) => body.append("images", image));
        await api.post(`/api/universities/${universityId}/images`, body);
      }
      setShowForm(false);
      load();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Couldn't save this university.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      await api.patch(`/api/universities/${id}/review`, { action: "approve" });
      load();
    } catch (err) {
      alert("Failed to approve university.");
    }
  }

  async function handleConfirmReject() {
    if (!rejectingUni) return;
    setProcessingReview(true);
    try {
      await api.patch(`/api/universities/${rejectingUni.id}/review`, {
        action: "reject",
        rejectionReason: rejectionReason.trim() || "Information does not meet StudyBridge guidelines.",
      });
      setRejectingUni(null);
      setRejectionReason("");
      load();
    } catch (err) {
      alert("Failed to reject university.");
    } finally {
      setProcessingReview(false);
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
        <h2 className="font-headline-sm text-headline-sm font-semibold text-primary dark:text-[#a8c7fa]">University Management</h2>
      </header>

      <main className="ml-[260px] pt-24 px-8 pb-8 h-screen overflow-y-auto bg-surface-container-low dark:bg-[#101115] custom-scrollbar">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">University Management</h2>
            <p className="text-on-surface-variant font-body-md mt-1">
              Review agency submissions and manage verified institutions ({total} records).
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 w-fit"
          >
            <span className="material-symbols-outlined">add</span>
            Add New Institution
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-outline-variant/30 dark:border-white/10 pb-3">
          {(["all", "pending", "approved", "rejected"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === filter
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container-lowest dark:bg-[#1b1c20] text-on-surface-variant hover:text-on-surface border border-outline-variant/20 dark:border-white/10"
              }`}
            >
              {filter === "all"
                ? "All Institutions"
                : filter === "pending"
                  ? "Pending Review"
                  : filter === "approved"
                    ? "Approved & Active"
                    : "Rejected / Declined"}
            </button>
          ))}
        </div>

        {showForm && (
          <div className="rounded-3xl bg-surface-container-lowest dark:bg-[#1b1c20] border border-outline-variant/20 dark:border-white/10 p-8 mb-8 shadow-sm">
            <h3 className="font-headline-sm text-headline-sm mb-6">{editingId ? "Edit University" : "Add University"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30"
                placeholder="University name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30"
                placeholder="Country *"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
              <select
                className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/30"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              >
                <option value="">No region</option>
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Asia-Pacific">Asia-Pacific</option>
                <option value="Middle East">Middle East</option>
              </select>
              <input
                className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <input
                className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30"
                placeholder="Global ranking"
                type="number"
                min="1"
                value={form.ranking}
                onChange={(e) => setForm({ ...form, ranking: e.target.value })}
              />
              <input
                className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30"
                placeholder="Website URL (https://...)"
                type="url"
                value={form.websiteUrl}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
              />
            </div>
            <textarea
              className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 mb-4 resize-none placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30"
              rows={3}
              placeholder="Short description for students"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <textarea
              className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 mb-4 resize-none placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30"
              rows={3}
              placeholder="Admission requirements (e.g. GPA, English score, required documents)"
              value={form.admissionRequirements}
              onChange={(e) => setForm({ ...form, admissionRequirements: e.target.value })}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="text-sm text-on-surface-variant">
                Application opens
                <input
                  type="date"
                  value={form.applicationStartDate}
                  onChange={(e) => setForm({ ...form, applicationStartDate: e.target.value })}
                  className="mt-2 block w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface rounded-xl py-3 px-4 border border-outline-variant/30 dark:border-white/10"
                />
              </label>
              <label className="text-sm text-on-surface-variant">
                Application deadline
                <input
                  type="date"
                  value={form.applicationDeadline}
                  onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                  className="mt-2 block w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface rounded-xl py-3 px-4 border border-outline-variant/30 dark:border-white/10"
                />
              </label>
            </div>
            <label className="mb-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/50 dark:border-white/15 bg-surface-container-low/60 dark:bg-[#292a30]/60 px-6 py-7 text-center transition-colors hover:border-primary hover:bg-primary-container/10">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files ?? []).slice(0, 8))}
                className="sr-only"
              />
              <span className="material-symbols-outlined mb-2 text-3xl text-primary">add_photo_alternate</span>
              <span className="font-bold text-on-surface">Upload campus photos</span>
              <span className="mt-1 text-sm text-on-surface-variant">Click to choose up to 8 JPG, PNG, or WEBP images</span>
              {images.length > 0 && (
                <span className="mt-3 rounded-full bg-primary-fixed px-3 py-1 text-xs font-bold text-on-primary-fixed">
                  {images.length} image{images.length === 1 ? "" : "s"} selected
                </span>
              )}
            </label>
            {images.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-2">
                {images.map((image) => (
                  <span key={`${image.name}-${image.lastModified}`} className="max-w-52 truncate rounded-lg bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
                    {image.name}
                  </span>
                ))}
              </div>
            )}
            {error && (
              <div className="p-4 mb-4 rounded-xl bg-error/10 border border-error/30 text-error flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
                <span className="text-sm font-medium leading-relaxed">{error}</span>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2.5 text-on-surface-variant font-bold">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Universities Table */}
        <div className="rounded-3xl bg-surface-container-lowest dark:bg-[#1b1c20] border border-outline-variant/20 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/50 dark:bg-white/5 border-b border-outline-variant dark:border-white/10">
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Institution</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Country</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Source</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container dark:divide-white/5">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant font-body-md">
                      Loading universities...
                    </td>
                  </tr>
                )}
                {!loading && universities.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant font-body-md">
                      No universities found for this filter.
                    </td>
                  </tr>
                )}
                {universities.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low/40 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-container dark:bg-[#292a30] flex items-center justify-center border border-outline-variant dark:border-white/10 overflow-hidden shrink-0">
                          <span className="material-symbols-outlined text-primary">school</span>
                        </div>
                        <div>
                          <p className="font-body-md text-body-md font-bold text-on-surface">{u.name}</p>
                          <p className="font-label-md text-label-md text-on-surface-variant">
                            {u.city ? `${u.city}, ` : ""}
                            {u.country} {u.ranking ? `· Rank #${u.ranking}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-body-md text-body-md text-on-surface">{u.country}</td>
                    <td className="px-6 py-5">
                      {u.status === "approved" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                          <span className="material-symbols-outlined text-sm">check_circle</span> Approved
                        </span>
                      )}
                      {u.status === "pending" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                          <span className="material-symbols-outlined text-sm">hourglass_top</span> Pending Review
                        </span>
                      )}
                      {u.status === "rejected" && (
                        <div>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                            <span className="material-symbols-outlined text-sm">cancel</span> Declined
                          </span>
                          {u.rejectionReason && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 max-w-xs">
                              {u.rejectionReason}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {u.submittedByAgency ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary dark:text-[#a8c7fa]">
                            <span className="material-symbols-outlined text-sm">business</span>
                            {u.submittedByAgency.agencyProfile?.companyName || u.submittedByAgency.fullName}
                          </span>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">{u.submittedByAgency.email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-variant font-medium">Platform Admin</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {/* Approval actions for pending entries */}
                        {u.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(u.id)}
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                              title="Approve and Publish"
                            >
                              <span className="material-symbols-outlined text-base">check</span>
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectingUni(u);
                                setRejectionReason("");
                              }}
                              className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                              title="Decline Submission"
                            >
                              <span className="material-symbols-outlined text-base">close</span>
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openEdit(u)}
                          className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-lg">edit_note</span>
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 text-on-surface-variant hover:text-error transition-colors hover:bg-error/10 rounded-lg"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
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

      {/* Reject Modal */}
      {rejectingUni && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-[#1b1c20] rounded-3xl p-6 max-w-md w-full border border-outline-variant/30 dark:border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-4">
              <span className="material-symbols-outlined text-2xl">error</span>
              <h3 className="text-lg font-bold text-on-surface">Decline University Submission</h3>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Specify the reason why <b>&quot;{rejectingUni.name}&quot;</b> cannot be approved. The agency will receive this feedback so they can correct and resubmit.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please provide valid official accreditation or full admission criteria."
              className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl p-3 text-xs mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingUni(null)}
                className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={processingReview}
                onClick={handleConfirmReject}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {processingReview ? "Declining..." : "Decline Submission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
