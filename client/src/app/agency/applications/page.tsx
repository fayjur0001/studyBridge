"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AgencySidebar from "@/components/dashboard/AgencySidebar";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { ApplicationStatus } from "@/lib/types";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import AgencyNotificationBell from "@/components/agency/AgencyNotificationBell";

interface AgencyApplication {
  id: string;
  status: ApplicationStatus;
  intake: string | null;
  agencyNotes?: string | null;
  submittedAt: string | null;
  createdAt: string;
  studentName: string;
  studentEmail: string;
  programName: string;
  universityName: string;
}

interface AgencyStats {
  totalApplications: number;
  underReview: number;
  accepted: number;
  rejected: number;
  documentsRequested: number;
}

const STATUS_CONFIG: {
  value: ApplicationStatus;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "under_review",
    label: "Under Review (Submitted to University)",
    description: "Application has been processed and submitted to the university admissions office.",
    icon: "hourglass_top",
  },
  {
    value: "documents_requested",
    label: "Documents Requested",
    description: "Student needs to supply additional or revised documents (transcripts, passport, etc.).",
    icon: "warning",
  },
  {
    value: "accepted",
    label: "Accepted (Offer Letter Issued) 🎉",
    description: "The university issued an official offer letter or acceptance confirmation.",
    icon: "celebration",
  },
  {
    value: "rejected",
    label: "Rejected",
    description: "The application was unsuccessful or not admitted by the institution.",
    icon: "cancel",
  },
];

export default function AgencyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<AgencyApplication[]>([]);
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedApp, setSelectedApp] = useState<AgencyApplication | null>(null);
  const [modalStatus, setModalStatus] = useState<ApplicationStatus>("under_review");
  const [modalNotes, setModalNotes] = useState("");
  const [modalFile, setModalFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    Promise.all([
      api.get<{ data: AgencyApplication[] }>("/api/agency/applications"),
      api.get<AgencyStats>("/api/agency/dashboard/stats"),
    ])
      .then(([appsRes, statsRes]) => {
        setApplications(appsRes.data);
        setStats(statsRes);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openStatusModal(app: AgencyApplication) {
    setSelectedApp(app);
    setModalStatus(app.status === "draft" ? "under_review" : app.status);
    setModalNotes(app.agencyNotes ?? "");
    setModalFile(null);
    setErrorMsg("");
  }

  function closeModal() {
    if (submitting) return;
    setSelectedApp(null);
    setModalFile(null);
    setErrorMsg("");
  }

  async function handleModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmitting(true);
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("status", modalStatus);
      if (modalNotes.trim()) {
        formData.append("agencyNotes", modalNotes.trim());
      }
      if (modalFile) {
        formData.append("file", modalFile);
      }

      await api.patch(`/api/agency/applications/${selectedApp.id}/status`, formData);

      setSuccessNotice(
        `Application for ${selectedApp.studentName} updated to "${modalStatus.replace(/_/g, " ")}". Student received an instant notification${
          modalFile ? " with attached file." : "."
        }`
      );
      closeModal();
      load();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Failed to update application status.");
    } finally {
      setSubmitting(false);
    }
  }

  const stats_ = [
    {
      icon: "assignment",
      label: "Total Applications",
      value: stats?.totalApplications ?? 0,
      tone: "bg-secondary-fixed text-on-secondary-container",
    },
    {
      icon: "hourglass_top",
      label: "Under Review",
      value: stats?.underReview ?? 0,
      tone: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    },
    {
      icon: "task_alt",
      label: "Accepted",
      value: stats?.accepted ?? 0,
      tone: "bg-primary-fixed text-on-primary-fixed-variant",
    },
    {
      icon: "warning",
      label: "Documents Requested",
      value: stats?.documentsRequested ?? 0,
      tone: "bg-error-container text-on-error-container",
    },
  ];

  return (
    <>
      <AgencySidebar />

      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center px-gutter py-4 h-20 ml-[260px] w-[calc(100%-260px)] border-b border-outline-variant/20">
        <div className="flex items-center gap-8">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl w-[320px] focus:ring-2 focus:ring-primary/20 font-body-md text-body-md transition-all"
              placeholder="Search by student, program..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <AgencyNotificationBell />
          <div className="h-8 w-[1px] bg-outline-variant/30"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-label-md text-label-md font-bold text-on-surface">
                {user?.fullName ?? "..."}
              </p>
              <p className="font-label-md text-label-md text-on-surface-variant text-[10px]">
                Agency Partner
              </p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary/10 overflow-hidden bg-primary-container flex items-center justify-center font-bold text-primary">
              {user?.fullName?.[0] ?? "A"}
            </div>
          </div>
        </div>
      </header>

      <main className="ml-[260px] p-margin-desktop min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-1">
              Applications & University Processing
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Track student applications, submit to universities, provide counselor notes, and attach official offer letters.
            </p>
          </div>
        </div>

        {successNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-600 text-[22px]">check_circle</span>
              <p className="text-sm font-medium">{successNotice}</p>
            </div>
            <button
              onClick={() => setSuccessNotice("")}
              className="text-emerald-700 hover:text-emerald-900 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-card-gap mb-10">
          {stats_.map((s) => (
            <div
              key={s.label}
              className="bg-surface-container-lowest p-container-padding rounded-[24px] ambient-card border border-outline-variant/20"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${s.tone}`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
              <h3 className="font-label-md text-label-md text-on-surface-variant mb-1">{s.label}</h3>
              <p className="font-headline-lg text-headline-lg text-on-surface font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-surface-container-lowest p-container-padding rounded-[24px] ambient-card border border-outline-variant/20 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="pb-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Student
                  </th>
                  <th className="pb-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Program / University
                  </th>
                  <th className="pb-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Status
                  </th>
                  <th className="pb-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    Counselor Notes
                  </th>
                  <th className="pb-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {!loading && applications.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-on-surface-variant font-body-md">
                      No applications assigned to your agency yet.
                    </td>
                  </tr>
                )}
                {applications
                  .filter((a) =>
                    `${a.studentName} ${a.studentEmail} ${a.programName} ${a.universityName} ${
                      a.agencyNotes ?? ""
                    }`
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                  .map((a) => (
                    <tr key={a.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {a.studentName?.[0] ?? "S"}
                          </div>
                          <div>
                            <p className="font-label-md text-label-md font-bold text-on-surface">
                              {a.studentName}
                            </p>
                            <p className="font-body-md text-body-md text-on-surface-variant">
                              {a.studentEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5">
                        <p className="font-label-md text-label-md font-medium text-on-surface">
                          {a.programName}
                        </p>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          {a.universityName}
                        </p>
                      </td>
                      <td className="py-5">
                        <ApplicationStatusBadge status={a.status} />
                      </td>
                      <td className="py-5 max-w-xs">
                        {a.agencyNotes ? (
                          <p className="text-xs text-on-surface-variant line-clamp-2 bg-surface-container-low/70 px-2.5 py-1 rounded-lg border border-outline-variant/15">
                            💬 {a.agencyNotes}
                          </p>
                        ) : (
                          <span className="text-xs text-outline italic">No notes added yet</span>
                        )}
                      </td>
                      <td className="py-5 text-right">
                        <button
                          type="button"
                          onClick={() => openStatusModal(a)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all shadow-xs cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit_note</span>
                          Update & Attach
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Update Status & Attach File Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-surface-container-lowest dark:bg-[#1a2238] rounded-3xl max-w-lg w-full border border-outline-variant/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/50">
              <div>
                <h3 className="font-headline-sm font-bold text-on-surface">
                  Update Application Status
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {selectedApp.studentName} · {selectedApp.programName}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleModalSubmit} className="p-6 space-y-5">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Status Selection */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Select New Status
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STATUS_CONFIG.map((cfg) => {
                    const isSelected = modalStatus === cfg.value;
                    return (
                      <button
                        type="button"
                        key={cfg.value}
                        onClick={() => setModalStatus(cfg.value)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-primary-container/20 border-primary shadow-xs ring-1 ring-primary"
                            : "bg-surface-container-low border-outline-variant/30 hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              isSelected ? "text-primary" : "text-outline"
                            }`}
                          >
                            {cfg.icon}
                          </span>
                          {isSelected && (
                            <span className="material-symbols-outlined text-primary text-[16px]">
                              check_circle
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs font-bold ${
                            isSelected ? "text-primary" : "text-on-surface"
                          }`}
                        >
                          {cfg.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Counselor Note */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Counselor Note / Message to Student
                </label>
                <textarea
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl bg-surface-container-low border border-outline-variant/30 p-3 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                  placeholder="e.g. We have processed and submitted your application to Oxford University portal today. Ref: OX-8821. Anticipated interview schedule in October."
                />
                <p className="text-[11px] text-outline mt-1">
                  The student will receive this note directly in their notification and application dashboard.
                </p>
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Attach Official Document (Optional)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-outline-variant/50 rounded-2xl p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-primary-container/5 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setModalFile(e.target.files[0]);
                      }
                    }}
                  />
                  {modalFile ? (
                    <div className="flex items-center justify-between gap-2 text-left bg-surface-container-low p-2 rounded-xl">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-primary text-[20px]">
                          description
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-bold text-on-surface truncate">
                            {modalFile.name}
                          </p>
                          <p className="text-[10px] text-outline">
                            {(modalFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalFile(null);
                        }}
                        className="text-outline hover:text-error text-xs font-bold p-1 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span className="material-symbols-outlined text-outline text-[28px] mb-1">
                        upload_file
                      </span>
                      <p className="text-xs font-bold text-on-surface">
                        Click to attach Offer Letter / Submission Proof
                      </p>
                      <p className="text-[10px] text-outline mt-0.5">
                        PDF, PNG, JPG, or DOCX (up to 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-xs font-bold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">
                        progress_activity
                      </span>
                      Updating & Notifying...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      Update & Notify Student
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
