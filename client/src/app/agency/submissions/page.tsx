"use client";

import { useEffect, useState } from "react";
import AgencySidebar from "@/components/dashboard/AgencySidebar";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { Paginated, University, Scholarship } from "@/lib/types";

const EMPTY_UNI_FORM = {
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

const EMPTY_SCHOLARSHIP_FORM = {
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

export default function AgencySubmissionsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"universities" | "scholarships">("universities");

  // Universities state
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(true);
  const [showUniModal, setShowUniModal] = useState(false);
  const [editingUniId, setEditingUniId] = useState<string | null>(null);
  const [uniForm, setUniForm] = useState(EMPTY_UNI_FORM);
  const [uniImages, setUniImages] = useState<File[]>([]);
  const [uniError, setUniError] = useState<string | null>(null);
  const [savingUni, setSavingUni] = useState(false);

  // Scholarships state
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loadingSchs, setLoadingSchs] = useState(true);
  const [showSchModal, setShowSchModal] = useState(false);
  const [editingSchId, setEditingSchId] = useState<string | null>(null);
  const [schForm, setSchForm] = useState(EMPTY_SCHOLARSHIP_FORM);
  const [schError, setSchError] = useState<string | null>(null);
  const [savingSch, setSavingSch] = useState(false);

  // Approved universities list for scholarship dropdown
  const [approvedUnis, setApprovedUnis] = useState<University[]>([]);

  function loadUniversities() {
    setLoadingUnis(true);
    api
      .get<Paginated<University>>("/api/agency/submissions/universities?limit=100")
      .then((res) => setUniversities(res.data))
      .catch(() => {})
      .finally(() => setLoadingUnis(false));
  }

  function loadScholarships() {
    setLoadingSchs(true);
    api
      .get<Paginated<Scholarship>>("/api/agency/submissions/scholarships?limit=100")
      .then((res) => setScholarships(res.data))
      .catch(() => {})
      .finally(() => setLoadingSchs(false));
  }

  useEffect(() => {
    loadUniversities();
    loadScholarships();
    // Load approved universities for scholarship linking
    api
      .get<Paginated<University>>("/api/universities?limit=200", { auth: false })
      .then((res) => setApprovedUnis(res.data))
      .catch(() => {});
  }, []);

  // University Modal Handlers
  function openCreateUni() {
    setEditingUniId(null);
    setUniForm(EMPTY_UNI_FORM);
    setUniImages([]);
    setUniError(null);
    setShowUniModal(true);
  }

  function openEditUni(u: University) {
    setEditingUniId(u.id);
    setUniForm({
      name: u.name,
      country: u.country,
      region: u.region ?? "",
      city: u.city ?? "",
      ranking: u.ranking?.toString() ?? "",
      websiteUrl: u.websiteUrl ?? "",
      description: u.description ?? "",
      admissionRequirements: u.admissionRequirements ?? "",
      applicationStartDate: u.applicationStartDate ? u.applicationStartDate.slice(0, 10) : "",
      applicationDeadline: u.applicationDeadline ? u.applicationDeadline.slice(0, 10) : "",
    });
    setUniImages([]);
    setUniError(null);
    setShowUniModal(true);
  }

  async function handleSaveUni() {
    setUniError(null);
    if (!uniForm.name.trim()) {
      setUniError("University name is required.");
      return;
    }
    if (!uniForm.country.trim()) {
      setUniError("Country is required.");
      return;
    }

    setSavingUni(true);
    try {
      const payload = {
        name: uniForm.name.trim(),
        country: uniForm.country.trim(),
        region: uniForm.region.trim() || undefined,
        city: uniForm.city.trim() || undefined,
        ranking: uniForm.ranking && Number(uniForm.ranking) > 0 ? Number(uniForm.ranking) : undefined,
        websiteUrl: uniForm.websiteUrl.trim() || undefined,
        description: uniForm.description.trim() || undefined,
        admissionRequirements: uniForm.admissionRequirements.trim() || undefined,
        applicationStartDate: uniForm.applicationStartDate || undefined,
        applicationDeadline: uniForm.applicationDeadline || undefined,
      };

      let targetId = editingUniId;
      if (editingUniId) {
        await api.patch(`/api/universities/${editingUniId}`, payload);
      } else {
        const created = await api.post<University>("/api/universities", payload);
        targetId = created.id;
      }

      if (uniImages.length && targetId) {
        const formData = new FormData();
        uniImages.forEach((img) => formData.append("images", img));
        await api.post(`/api/universities/${targetId}/images`, formData);
      }

      setShowUniModal(false);
      loadUniversities();
    } catch (err) {
      setUniError(err instanceof ApiError ? err.message : "Failed to save university submission.");
    } finally {
      setSavingUni(false);
    }
  }

  async function handleDeleteUni(id: string) {
    if (!confirm("Delete this submitted university?")) return;
    try {
      await api.delete(`/api/universities/${id}`);
      loadUniversities();
    } catch (err) {
      alert("Could not delete university.");
    }
  }

  // Scholarship Modal Handlers
  function openCreateSch() {
    setEditingSchId(null);
    setSchForm(EMPTY_SCHOLARSHIP_FORM);
    setSchError(null);
    setShowSchModal(true);
  }

  function openEditSch(s: Scholarship) {
    setEditingSchId(s.id);
    setSchForm({
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
    setSchError(null);
    setShowSchModal(true);
  }

  async function handleSaveSch() {
    setSchError(null);
    if (!schForm.title.trim()) {
      setSchError("Scholarship title is required.");
      return;
    }

    setSavingSch(true);
    try {
      const payload = {
        universityId: schForm.universityId.trim() || undefined,
        title: schForm.title.trim(),
        provider: schForm.provider.trim() || undefined,
        category: schForm.category.trim() || undefined,
        amountUsd: schForm.amountUsd && Number(schForm.amountUsd) >= 0 ? Number(schForm.amountUsd) : undefined,
        coveragePercent: schForm.coveragePercent && Number(schForm.coveragePercent) >= 0 ? Number(schForm.coveragePercent) : undefined,
        deadline: schForm.deadline || undefined,
        eligibility: schForm.eligibility.trim() || undefined,
        description: schForm.description.trim() || undefined,
        applyUrl: schForm.applyUrl.trim() || undefined,
      };

      if (editingSchId) {
        await api.patch(`/api/scholarships/${editingSchId}`, payload);
      } else {
        await api.post("/api/scholarships", payload);
      }

      setShowSchModal(false);
      loadScholarships();
    } catch (err) {
      setSchError(err instanceof ApiError ? err.message : "Failed to save scholarship submission.");
    } finally {
      setSavingSch(false);
    }
  }

  async function handleDeleteSch(id: string) {
    if (!confirm("Delete this submitted scholarship?")) return;
    try {
      await api.delete(`/api/scholarships/${id}`);
      loadScholarships();
    } catch (err) {
      alert("Could not delete scholarship.");
    }
  }

  // Combined metrics
  const totalSubmissions = universities.length + scholarships.length;
  const pendingCount =
    universities.filter((u) => u.status === "pending").length +
    scholarships.filter((s) => s.status === "pending").length;
  const approvedCount =
    universities.filter((u) => u.status === "approved").length +
    scholarships.filter((s) => s.status === "approved").length;
  const rejectedCount =
    universities.filter((u) => u.status === "rejected").length +
    scholarships.filter((s) => s.status === "rejected").length;

  return (
    <>
      <AgencySidebar />

      <main className="ml-[260px] flex flex-col min-h-screen bg-surface-container-low dark:bg-[#101115] text-on-surface">
        {/* Header */}
        <header className="sticky top-0 w-full z-40 bg-surface/80 dark:bg-[#17181d]/80 backdrop-blur-md flex justify-between items-center px-8 py-4 h-20 border-b border-outline-variant/30 dark:border-white/10">
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary dark:text-[#a8c7fa]">
              Institutions & Scholarships
            </h1>
            <p className="text-xs text-on-surface-variant">
              Submit partner universities and grant programs for admin verification and public catalog listing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={activeTab === "universities" ? openCreateUni : openCreateSch}
              className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              {activeTab === "universities" ? "Add University" : "Add Scholarship"}
            </button>
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-primary">
              {user?.fullName?.[0] ?? "A"}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Top Metrics Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-3xl p-6 bg-surface-container-lowest dark:bg-[#1b1c20] border border-outline-variant/20 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Total Submissions</span>
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center material-symbols-outlined">domain_add</span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-on-surface">{totalSubmissions}</p>
              <p className="text-xs text-on-surface-variant mt-1">Universities & scholarships</p>
            </div>

            <div className="rounded-3xl p-6 bg-surface-container-lowest dark:bg-[#1b1c20] border border-outline-variant/20 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending Review</span>
                <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center material-symbols-outlined">hourglass_top</span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-amber-600 dark:text-amber-400">{pendingCount}</p>
              <p className="text-xs text-on-surface-variant mt-1">Under admin inspection</p>
            </div>

            <div className="rounded-3xl p-6 bg-surface-container-lowest dark:bg-[#1b1c20] border border-outline-variant/20 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Approved & Live</span>
                <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center material-symbols-outlined">check_circle</span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{approvedCount}</p>
              <p className="text-xs text-on-surface-variant mt-1">Visible to students worldwide</p>
            </div>

            <div className="rounded-3xl p-6 bg-surface-container-lowest dark:bg-[#1b1c20] border border-outline-variant/20 dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Needs Revision</span>
                <span className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center material-symbols-outlined">error</span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-rose-600 dark:text-rose-400">{rejectedCount}</p>
              <p className="text-xs text-on-surface-variant mt-1">Feedback provided by admin</p>
            </div>
          </section>

          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b border-outline-variant/30 dark:border-white/10 pb-2">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("universities")}
                className={`flex items-center gap-2 pb-3 font-bold text-sm border-b-2 transition-all ${
                  activeTab === "universities"
                    ? "border-primary text-primary dark:text-[#a8c7fa]"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-lg">school</span>
                My Universities ({universities.length})
              </button>
              <button
                onClick={() => setActiveTab("scholarships")}
                className={`flex items-center gap-2 pb-3 font-bold text-sm border-b-2 transition-all ${
                  activeTab === "scholarships"
                    ? "border-primary text-primary dark:text-[#a8c7fa]"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-lg">military_tech</span>
                My Scholarships ({scholarships.length})
              </button>
            </div>
          </div>

          {/* Universities Table */}
          {activeTab === "universities" && (
            <div className="rounded-3xl bg-surface-container-lowest dark:bg-[#1b1c20] border border-outline-variant/20 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container/50 dark:bg-white/5 border-b border-outline-variant/30 dark:border-white/10">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Institution</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Location</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Ranking</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 dark:divide-white/5">
                    {loadingUnis && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                          Loading your submitted universities...
                        </td>
                      </tr>
                    )}
                    {!loadingUnis && universities.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-14 text-center">
                          <span className="material-symbols-outlined text-primary text-4xl mb-2">school</span>
                          <p className="font-bold text-base text-on-surface">No universities submitted yet</p>
                          <p className="text-xs text-on-surface-variant mt-1">Submit an institution so students can explore and apply through your agency.</p>
                          <button
                            onClick={openCreateUni}
                            className="mt-4 inline-flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold"
                          >
                            <span className="material-symbols-outlined text-base">add</span> Add First University
                          </button>
                        </td>
                      </tr>
                    )}
                    {universities.map((uni) => (
                      <tr key={uni.id} className="hover:bg-surface-container-low/40 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-xl">school</span>
                            </div>
                            <div>
                              <p className="font-bold text-sm text-on-surface">{uni.name}</p>
                              {uni.websiteUrl && (
                                <a
                                  href={uni.websiteUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-primary hover:underline truncate max-w-xs block"
                                >
                                  {uni.websiteUrl}
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">
                          {uni.city ? `${uni.city}, ` : ""}{uni.country}
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface">
                          {uni.ranking ? `#${uni.ranking}` : "—"}
                        </td>
                        <td className="px-6 py-4">
                          {uni.status === "approved" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                              <span className="material-symbols-outlined text-sm">check_circle</span> Approved & Live
                            </span>
                          )}
                          {uni.status === "pending" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                              <span className="material-symbols-outlined text-sm">hourglass_top</span> Pending Review
                            </span>
                          )}
                          {uni.status === "rejected" && (
                            <div>
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                                <span className="material-symbols-outlined text-sm">cancel</span> Declined
                              </span>
                              {uni.rejectionReason && (
                                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 max-w-xs">
                                  <b>Reason:</b> {uni.rejectionReason}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditUni(uni)}
                              className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title={uni.status === "rejected" ? "Edit & Resubmit" : "Edit"}
                            >
                              <span className="material-symbols-outlined text-lg">
                                {uni.status === "rejected" ? "restart_alt" : "edit"}
                              </span>
                            </button>
                            <button
                              onClick={() => handleDeleteUni(uni.id)}
                              className="p-2 text-on-surface-variant hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
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
          )}

          {/* Scholarships Table */}
          {activeTab === "scholarships" && (
            <div className="rounded-3xl bg-surface-container-lowest dark:bg-[#1b1c20] border border-outline-variant/20 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container/50 dark:bg-white/5 border-b border-outline-variant/30 dark:border-white/10">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Scholarship</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Institution</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Reward / Coverage</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 dark:divide-white/5">
                    {loadingSchs && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                          Loading your submitted scholarships...
                        </td>
                      </tr>
                    )}
                    {!loadingSchs && scholarships.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-14 text-center">
                          <span className="material-symbols-outlined text-primary text-4xl mb-2">military_tech</span>
                          <p className="font-bold text-base text-on-surface">No scholarships submitted yet</p>
                          <p className="text-xs text-on-surface-variant mt-1">Submit scholarship opportunities to attract top student applicants.</p>
                          <button
                            onClick={openCreateSch}
                            className="mt-4 inline-flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold"
                          >
                            <span className="material-symbols-outlined text-base">add</span> Add First Scholarship
                          </button>
                        </td>
                      </tr>
                    )}
                    {scholarships.map((sch) => (
                      <tr key={sch.id} className="hover:bg-surface-container-low/40 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-xl">military_tech</span>
                            </div>
                            <div>
                              <p className="font-bold text-sm text-on-surface">{sch.title}</p>
                              <p className="text-xs text-on-surface-variant">
                                {sch.category || "General"} {sch.provider ? `· ${sch.provider}` : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">
                          {sch.university?.name ?? "Any / Multiple"}
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface">
                          {sch.coveragePercent ? (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{sch.coveragePercent}% Tuition</span>
                          ) : sch.amountUsd ? (
                            <span className="font-bold text-primary dark:text-[#a8c7fa]">${Number(sch.amountUsd).toLocaleString()}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {sch.status === "approved" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                              <span className="material-symbols-outlined text-sm">check_circle</span> Approved & Live
                            </span>
                          )}
                          {sch.status === "pending" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                              <span className="material-symbols-outlined text-sm">hourglass_top</span> Pending Review
                            </span>
                          )}
                          {sch.status === "rejected" && (
                            <div>
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                                <span className="material-symbols-outlined text-sm">cancel</span> Declined
                              </span>
                              {sch.rejectionReason && (
                                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 max-w-xs">
                                  <b>Reason:</b> {sch.rejectionReason}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditSch(sch)}
                              className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title={sch.status === "rejected" ? "Edit & Resubmit" : "Edit"}
                            >
                              <span className="material-symbols-outlined text-lg">
                                {sch.status === "rejected" ? "restart_alt" : "edit"}
                              </span>
                            </button>
                            <button
                              onClick={() => handleDeleteSch(sch.id)}
                              className="p-2 text-on-surface-variant hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
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
          )}
        </div>
      </main>

      {/* University Modal */}
      {showUniModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest dark:bg-[#1b1c20] rounded-3xl p-8 max-w-2xl w-full border border-outline-variant/30 dark:border-white/10 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-on-surface">
                  {editingUniId ? "Edit University Submission" : "Submit New University"}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Submissions are reviewed by StudyBridge administrators before being published.
                </p>
              </div>
              <button
                onClick={() => setShowUniModal(false)}
                className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">University Name *</label>
                  <input
                    className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm"
                    placeholder="e.g. University of Oxford"
                    value={uniForm.name}
                    onChange={(e) => setUniForm({ ...uniForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Country *</label>
                  <input
                    className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm"
                    placeholder="e.g. United Kingdom"
                    value={uniForm.country}
                    onChange={(e) => setUniForm({ ...uniForm, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Region</label>
                  <select
                    className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-3 text-sm"
                    value={uniForm.region}
                    onChange={(e) => setUniForm({ ...uniForm, region: e.target.value })}
                  >
                    <option value="">Select Region</option>
                    <option value="Europe">Europe</option>
                    <option value="North America">North America</option>
                    <option value="Asia-Pacific">Asia-Pacific</option>
                    <option value="Middle East">Middle East</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">City</label>
                  <input
                    className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm"
                    placeholder="e.g. Oxford"
                    value={uniForm.city}
                    onChange={(e) => setUniForm({ ...uniForm, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Global Ranking</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm"
                    placeholder="e.g. 5"
                    value={uniForm.ranking}
                    onChange={(e) => setUniForm({ ...uniForm, ranking: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-1 block">Official Website URL</label>
                <input
                  type="url"
                  className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm"
                  placeholder="https://www.ox.ac.uk"
                  value={uniForm.websiteUrl}
                  onChange={(e) => setUniForm({ ...uniForm, websiteUrl: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-1 block">Institution Description</label>
                <textarea
                  rows={3}
                  className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm"
                  placeholder="Overview of the university, campus life, faculty..."
                  value={uniForm.description}
                  onChange={(e) => setUniForm({ ...uniForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-1 block">Admission Requirements</label>
                <textarea
                  rows={2}
                  className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm"
                  placeholder="Minimum GPA, IELTS/TOEFL requirements, GRE/GMAT..."
                  value={uniForm.admissionRequirements}
                  onChange={(e) => setUniForm({ ...uniForm, admissionRequirements: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Application Starts</label>
                  <input
                    type="date"
                    className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2 px-3 text-sm"
                    value={uniForm.applicationStartDate}
                    onChange={(e) => setUniForm({ ...uniForm, applicationStartDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Application Deadline</label>
                  <input
                    type="date"
                    className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2 px-3 text-sm"
                    value={uniForm.applicationDeadline}
                    onChange={(e) => setUniForm({ ...uniForm, applicationDeadline: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-1 block">Upload Campus Photos</label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setUniImages(Array.from(e.target.files ?? []).slice(0, 8))}
                  className="w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {uniImages.length > 0 && (
                  <p className="text-xs text-primary font-bold mt-1.5">{uniImages.length} image(s) chosen</p>
                )}
              </div>

              {uniError && (
                <div className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {uniError}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-outline-variant/20 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowUniModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingUni}
                onClick={handleSaveUni}
                className="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {savingUni ? "Submitting..." : editingUniId ? "Update Submission" : "Submit for Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scholarship Modal */}
      {showSchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest dark:bg-[#1b1c20] rounded-3xl p-8 max-w-2xl w-full border border-outline-variant/30 dark:border-white/10 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-on-surface">
                  {editingSchId ? "Edit Scholarship Submission" : "Submit New Scholarship"}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Submissions are reviewed by StudyBridge administrators before being published.
                </p>
              </div>
              <button
                onClick={() => setShowSchModal(false)}
                className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-1 block">Scholarship Title *</label>
                <input
                  className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm"
                  placeholder="e.g. Global Chancellor's Merit Award"
                  value={schForm.title}
                  onChange={(e) => setSchForm({ ...schForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Associated University</label>
                  <select
                    className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-3 text-sm"
                    value={schForm.universityId}
                    onChange={(e) => setSchForm({ ...schForm, universityId: e.target.value })}
                  >
                    <option value="">Any / Multiple Institutions</option>
                    {approvedUnis.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.country})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Provider / Organization</label>
                  <input
                    className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm"
                    placeholder="e.g. Oxford Trust or Ministry of Ed"
                    value={schForm.provider}
                    onChange={(e) => setSchForm({ ...schForm, provider: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Category</label>
                  <select
                    className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-3 text-sm"
                    value={schForm.category}
                    onChange={(e) => setSchForm({ ...schForm, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    <option value="Merit Based">Merit Based</option>
                    <option value="Need Based">Need Based</option>
                    <option value="Country Specific">Country Specific</option>
                    <option value="Research Grant">Research Grant</option>
                    <option value="Athletic / Arts">Athletic / Arts</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Amount (USD)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm"
                    placeholder="e.g. 10000"
                    value={schForm.amountUsd}
                    onChange={(e) => setSchForm({ ...schForm, amountUsd: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Coverage %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm"
                    placeholder="e.g. 50 or 100"
                    value={schForm.coveragePercent}
                    onChange={(e) => setSchForm({ ...schForm, coveragePercent: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Application Deadline</label>
                  <input
                    type="date"
                    className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2 px-3 text-sm"
                    value={schForm.deadline}
                    onChange={(e) => setSchForm({ ...schForm, deadline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Apply / Info URL</label>
                  <input
                    type="url"
                    className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm"
                    placeholder="https://scholarship-portal.org/apply"
                    value={schForm.applyUrl}
                    onChange={(e) => setSchForm({ ...schForm, applyUrl: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-1 block">Eligibility Criteria</label>
                <textarea
                  rows={2}
                  className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm"
                  placeholder="e.g. Minimum 3.5 GPA, International students from developing countries..."
                  value={schForm.eligibility}
                  onChange={(e) => setSchForm({ ...schForm, eligibility: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-1 block">Description & Benefits</label>
                <textarea
                  rows={3}
                  className="w-full bg-surface-container-low dark:bg-[#292a30] text-on-surface border border-outline-variant/30 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm"
                  placeholder="Includes tuition waiver, monthly stipend, health coverage..."
                  value={schForm.description}
                  onChange={(e) => setSchForm({ ...schForm, description: e.target.value })}
                />
              </div>

              {schError && (
                <div className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {schError}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-outline-variant/20 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowSchModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingSch}
                onClick={handleSaveSch}
                className="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {savingSch ? "Submitting..." : editingSchId ? "Update Submission" : "Submit for Approval"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
