"use client";

import { useEffect, useState, useCallback } from "react";
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
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);

  // Rejection modal
  const [rejectingSch, setRejectingSch] = useState<Scholarship | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingReview, setProcessingReview] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const query = statusFilter === "all" ? "" : `&status=${statusFilter}`;
    api
      .get<Paginated<Scholarship>>(`/api/scholarships?limit=100${query}`)
      .then((res) => {
        setScholarships(res.data);
        setTotal(res.meta.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api
      .get<Paginated<University>>("/api/universities?limit=200", { auth: false })
      .then((res) => setUniversities(res.data))
      .catch(() => {});
  }, []);

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
    setError(null);
    if (!form.title.trim()) {
      setError("Please enter the scholarship title.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        universityId: form.universityId?.trim() || undefined,
        title: form.title.trim(),
        provider: form.provider?.trim() || undefined,
        category: form.category?.trim() || undefined,
        amountUsd: form.amountUsd && Number(form.amountUsd) >= 0 ? Number(form.amountUsd) : undefined,
        coveragePercent: form.coveragePercent && Number(form.coveragePercent) >= 0 ? Number(form.coveragePercent) : undefined,
        deadline: form.deadline || undefined,
        eligibility: form.eligibility?.trim() || undefined,
        description: form.description?.trim() || undefined,
        applyUrl: form.applyUrl?.trim() || undefined,
      };
      if (editingId) {
        await api.patch(`/api/scholarships/${editingId}`, payload);
      } else {
        await api.post("/api/scholarships", payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Couldn't save this scholarship.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      await api.patch(`/api/scholarships/${id}/review`, { action: "approve" });
      load();
    } catch (err) {
      alert("Failed to approve scholarship.");
    }
  }

  async function handleConfirmReject() {
    if (!rejectingSch) return;
    setProcessingReview(true);
    try {
      await api.patch(`/api/scholarships/${rejectingSch.id}/review`, {
        action: "reject",
        rejectionReason: rejectionReason.trim() || "Eligibility criteria or terms need verification.",
      });
      setRejectingSch(null);
      setRejectionReason("");
      load();
    } catch (err) {
      alert("Failed to reject scholarship.");
    } finally {
      setProcessingReview(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this scholarship?")) return;
    await api.delete(`/api/scholarships/${id}`).catch(() => {});
    load();
  }

  return (
    <>
      <AdminSidebar />

      <header className="flex justify-between items-center h-16 px-8 ml-[260px] w-[calc(100%-260px)] fixed top-0 bg-surface dark:bg-[#17181d] z-40 border-b border-outline-variant dark:border-white/10 shadow-sm">
        <h2 className="font-headline-sm text-headline-sm font-semibold text-primary dark:text-[#a8c7fa]">Scholarship Management</h2>
      </header>

      <main className="ml-[260px] pt-24 px-8 pb-8 h-screen overflow-y-auto bg-surface-container-low dark:bg-[#101115] custom-scrollbar">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Scholarship Management</h2>
            <p className="text-on-surface-variant font-body-md mt-1">
              Review agency submissions and manage grants & scholarship awards ({total} records).
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 w-fit"
          >
            <span className="material-symbols-outlined">add</span>
            Add New Scholarship
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
                ? "All Scholarships"
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
            <h3 className="font-headline-sm text-headline-sm mb-6">{editingId ? "Edit Scholarship" : "Add Scholarship"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/30"
                value={form.universityId}
                onChange={(e) => setForm({ ...form, universityId: e.target.value })}
              >
                <option value="">Any / General scholarship</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.country})
                  </option>
                ))}
              </select>
              <input
                className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30"
                placeholder="Scholarship title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <input
                className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30"
                placeholder="Provider / Organisation"
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
              />
              <select
                className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/30"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Category</option>
                <option value="Merit Based">Merit Based</option>
                <option value="Need Based">Need Based</option>
                <option value="Country Specific">Country Specific</option>
                <option value="Research Grant">Research Grant</option>
              </select>
              <input
                className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30"
                placeholder="Award amount (USD)"
                type="number"
                min="0"
                value={form.amountUsd}
                onChange={(e) => setForm({ ...form, amountUsd: e.target.value })}
              />
              <input
                className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30"
                placeholder="Tuition coverage % (0-100)"
                type="number"
                min="0"
                max="100"
                value={form.coveragePercent}
                onChange={(e) => setForm({ ...form, coveragePercent: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4"
              />
              <input
                className="bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30"
                placeholder="Apply URL (https://...)"
                type="url"
                value={form.applyUrl}
                onChange={(e) => setForm({ ...form, applyUrl: e.target.value })}
              />
            </div>
            <textarea
              className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 mb-4 resize-none placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30"
              rows={2}
              placeholder="Eligibility requirements"
              value={form.eligibility}
              onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
            />
            <textarea
              className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-3 px-4 mb-4 resize-none placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/30"
              rows={3}
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
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

        {/* Scholarships Table */}
        <div className="rounded-3xl bg-surface-container-lowest dark:bg-[#1b1c20] border border-outline-variant/20 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/50 dark:bg-white/5 border-b border-outline-variant dark:border-white/10">
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Scholarship</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Institution</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider">Source</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container dark:divide-white/5">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant font-body-md">
                      Loading scholarships...
                    </td>
                  </tr>
                )}
                {!loading && scholarships.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant font-body-md">
                      No scholarships found for this filter.
                    </td>
                  </tr>
                )}
                {scholarships.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-container-low/40 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-xl">military_tech</span>
                        </div>
                        <div>
                          <p className="font-body-md text-body-md font-bold text-on-surface">{s.title}</p>
                          <p className="font-label-md text-label-md text-on-surface-variant">
                            {s.category || "General"} {s.provider ? `· ${s.provider}` : ""}
                            {s.coveragePercent ? ` · ${s.coveragePercent}%` : s.amountUsd ? ` · $${Number(s.amountUsd).toLocaleString()}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-body-md text-body-md text-on-surface">
                      {s.university?.name ?? "General / Multiple"}
                    </td>
                    <td className="px-6 py-5">
                      {s.status === "approved" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                          <span className="material-symbols-outlined text-sm">check_circle</span> Approved
                        </span>
                      )}
                      {s.status === "pending" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                          <span className="material-symbols-outlined text-sm">hourglass_top</span> Pending Review
                        </span>
                      )}
                      {s.status === "rejected" && (
                        <div>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                            <span className="material-symbols-outlined text-sm">cancel</span> Declined
                          </span>
                          {s.rejectionReason && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 max-w-xs">
                              {s.rejectionReason}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {s.submittedByAgency ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary dark:text-[#a8c7fa]">
                            <span className="material-symbols-outlined text-sm">business</span>
                            {s.submittedByAgency.agencyProfile?.companyName || s.submittedByAgency.fullName}
                          </span>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">{s.submittedByAgency.email}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-variant font-medium">Platform Admin</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {/* Approval actions for pending entries */}
                        {s.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(s.id)}
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                              title="Approve and Publish"
                            >
                              <span className="material-symbols-outlined text-base">check</span>
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectingSch(s);
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
                          onClick={() => openEdit(s)}
                          className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-lg">edit_note</span>
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
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
      {rejectingSch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-[#1b1c20] rounded-3xl p-6 max-w-md w-full border border-outline-variant/30 dark:border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-4">
              <span className="material-symbols-outlined text-2xl">error</span>
              <h3 className="text-lg font-bold text-on-surface">Decline Scholarship Submission</h3>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Specify the reason why <b>&quot;{rejectingSch.title}&quot;</b> cannot be approved. The agency will receive this feedback so they can correct and resubmit.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please clarify eligibility requirements or provide official verification link."
              className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl p-3 text-xs mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingSch(null)}
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
