"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import { api, API_BASE_URL, getAccessToken, tryRefresh } from "@/lib/api";
import { ApplicationStatus, DocumentStatus } from "@/lib/types";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { universityImage } from "@/lib/university-images";

interface ApplicationDetail {
  id: string;
  status: ApplicationStatus;
  intake: string | null;
  notes: string | null;
  agencyNotes?: string | null;
  agencyId: string | null;
  agency?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    companyName: string;
    website?: string | null;
    address?: string | null;
    isVerified: boolean;
  } | null;
  submittedAt: string | null;
  decidedAt?: string | null;
  createdAt: string;
  program: { id: string; name: string; degreeLevel: string } | null;
  university: { id: string; name: string; country: string; logoUrl: string | null } | null;
  documents: {
    id: string;
    type: string;
    fileName: string;
    status: DocumentStatus;
    reviewNote?: string | null;
  }[];
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const applicationId = params.id as string;
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [docLoadingId, setDocLoadingId] = useState<string | null>(null);

  function load() {
    api
      .get<ApplicationDetail>(`/api/applications/${applicationId}`)
      .then(setApp)
      .finally(() => setLoading(false));
  }

  useEffect(load, [applicationId]);

  async function handleSubmit() {
    setActionLoading(true);
    try {
      await api.post(`/api/applications/${applicationId}/submit`);
      load();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleWithdraw() {
    if (!confirm("Withdraw this application? This can't be undone.")) return;
    setActionLoading(true);
    try {
      await api.post(`/api/applications/${applicationId}/withdraw`);
      load();
    } finally {
      setActionLoading(false);
    }
  }

  async function openDocument(doc: { id: string; fileName: string }, download = false) {
    setDocLoadingId(doc.id);
    const previewWindow = download ? null : window.open("", "_blank");
    try {
      let token = getAccessToken();
      let response = await fetch(
        `${API_BASE_URL}/api/documents/${doc.id}/file${download ? "?download=true" : ""}`,
        {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (response.status === 401 && (await tryRefresh())) {
        token = getAccessToken();
        response = await fetch(
          `${API_BASE_URL}/api/documents/${doc.id}/file${download ? "?download=true" : ""}`,
          {
            credentials: "include",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
      }
      if (!response.ok) throw new Error("Could not open this document.");
      const url = URL.createObjectURL(await response.blob());
      if (download) {
        const link = document.createElement("a");
        link.href = url;
        link.download = doc.fileName;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        if (previewWindow) previewWindow.location.href = url;
        else window.open(url, "_blank", "noopener,noreferrer");
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }
    } catch {
      previewWindow?.close();
      alert("Could not open or download this document.");
    } finally {
      setDocLoadingId(null);
    }
  }

  return (
    <>
      <StudentSidebar />

      <main className="ml-[260px] flex-1 min-h-screen">
        <header className="flex justify-between items-center w-full px-margin-desktop h-16 sticky top-0 z-40 bg-surface-container-lowest shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96 max-w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-body-md focus:ring-2 focus:ring-primary/20"
                placeholder="Search applications..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        <div className="p-margin-desktop space-y-6">
          <nav className="flex items-center gap-2 text-outline text-label-md font-label-md">
            <Link className="hover:text-primary transition-colors" href="/student/applications">
              Applications
            </Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-on-surface font-semibold">{app?.university?.name ?? "..."}</span>
          </nav>

          {loading && (
            <p className="text-on-surface-variant font-body-md">Loading application...</p>
          )}
          {!loading && !app && (
            <p className="text-on-surface-variant font-body-md">Application not found.</p>
          )}

          {app && (
            <>
              {/* Accepted Offer Letter Celebration Banner */}
              {app.status === "accepted" && (
                <section className="bg-gradient-to-r from-emerald-500/15 via-primary-container/20 to-surface-container-lowest rounded-[24px] p-6 border-2 border-emerald-500/40 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/25">
                      <span className="material-symbols-outlined text-[28px]">celebration</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-headline-sm font-bold text-emerald-700 dark:text-emerald-400">
                          Congratulations! Offer Letter Issued 🎉
                        </h3>
                        <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-full">
                          Admitted
                        </span>
                      </div>
                      <p className="text-sm text-on-surface leading-relaxed">
                        Your application to <span className="font-bold">{app.program?.name}</span> at{" "}
                        <span className="font-bold">{app.university?.name}</span> has been accepted!
                        Please check your attached documents below to review or download your official offer letter.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Main Application Details Card */}
              <section className="bg-white rounded-[24px] p-8 occlusion-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                  <ApplicationStatusBadge status={app.status} />
                </div>
                <div className="flex items-start gap-8">
                  <div className="w-24 h-24 rounded-2xl bg-surface-container-low flex items-center justify-center border border-outline-variant/30">
                    {app.university && (
                      <img
                        className="w-16 h-16 rounded-xl object-cover"
                        alt={`${app.university.name} campus`}
                        src={universityImage(
                          app.university.name,
                          null,
                          app.university.logoUrl
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-headline-lg text-headline-lg text-primary mb-1">
                      {app.program?.name}
                    </h2>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mb-4">
                      {app.university?.name} • {app.university?.country}
                    </p>
                    <div className="flex gap-6">
                      <div className="flex flex-col">
                        <span className="text-outline font-label-md text-label-md uppercase tracking-wider">
                          Submitted On
                        </span>
                        <span className="font-semibold text-on-surface">
                          {app.submittedAt
                            ? new Date(app.submittedAt).toLocaleDateString()
                            : "Not submitted yet"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-outline font-label-md text-label-md uppercase tracking-wider">
                          Intake
                        </span>
                        <span className="font-semibold text-on-surface">
                          {app.intake || "Not set"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {app.status === "draft" && (
                      <button
                        onClick={handleSubmit}
                        disabled={actionLoading}
                        className="bg-primary text-on-primary font-body-md px-6 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[20px]">send</span>
                        Submit Application
                      </button>
                    )}
                    {!["accepted", "rejected", "withdrawn"].includes(app.status) && (
                      <button
                        onClick={handleWithdraw}
                        disabled={actionLoading}
                        className="bg-surface-container text-primary font-body-md px-6 py-3 rounded-xl hover:bg-surface-container-high transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">cancel</span>
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>

                {app.notes && (
                  <div className="mt-6 pt-6 border-t border-outline-variant/20">
                    <p className="text-label-md text-outline uppercase tracking-wider mb-1">
                      Student Notes
                    </p>
                    <p className="text-body-md text-on-surface-variant">{app.notes}</p>
                  </div>
                )}
              </section>

              {/* Agency Counselor Note / Status Updates */}
              {app.agencyNotes && (
                <section className="bg-gradient-to-r from-primary-container/20 to-surface-container-lowest rounded-[24px] p-6 border-l-4 border-primary shadow-xs">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-[24px]">mark_chat_unread</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <h4 className="font-bold text-primary text-sm">
                          Counselor Update ({app.agency?.companyName ?? "Assigned Agency"})
                        </h4>
                        <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-md font-semibold">
                          Official Update
                        </span>
                      </div>
                      <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap mt-1">
                        {app.agencyNotes}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Assigned Guidance Agency Card */}
              {app.agency && (
                <section className="bg-white rounded-[24px] p-6 occlusion-shadow border-l-4 border-secondary">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[28px]">support_agent</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-on-surface text-body-lg">
                            {app.agency.companyName}
                          </span>
                          {app.agency.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-full">
                              <span className="material-symbols-outlined text-[13px]">verified</span>
                              Assigned Partner
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-on-surface-variant mt-0.5">
                          Counselor contact:{" "}
                          <span className="font-medium text-on-surface">{app.agency.fullName}</span> (
                          {app.agency.email})
                          {app.agency.phone ? ` • ${app.agency.phone}` : ""}
                        </p>
                      </div>
                    </div>
                    {app.agency.website && (
                      <a
                        href={
                          app.agency.website.startsWith("http")
                            ? app.agency.website
                            : `https://${app.agency.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl border border-outline-variant text-sm font-semibold text-secondary hover:bg-surface-container transition-colors inline-flex items-center gap-1.5"
                      >
                        Agency Website
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      </a>
                    )}
                  </div>
                </section>
              )}

              {/* Attached Documents Section with Download / View Actions */}
              <div className="bg-white rounded-[24px] p-8 occlusion-shadow">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-primary">
                      Attached Documents & Letters
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Includes documents submitted by you and official letters/proofs attached by your agency.
                    </p>
                  </div>
                  <Link
                    href="/student/documents"
                    className="text-label-md text-primary font-bold hover:underline"
                  >
                    Manage Vault
                  </Link>
                </div>

                {app.documents.length === 0 && (
                  <p className="text-on-surface-variant font-body-md py-6 text-center">
                    No documents attached to this application yet.
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {app.documents.map((doc) => {
                    const isAgencyAttached =
                      doc.type.toLowerCase().includes("offer letter") ||
                      doc.type.toLowerCase().includes("submission") ||
                      doc.type.toLowerCase().includes("agency");

                    return (
                      <div
                        key={doc.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          isAgencyAttached
                            ? "bg-emerald-50/50 border-emerald-300/60 shadow-xs"
                            : "bg-surface-container-low border-outline-variant/20"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isAgencyAttached
                                ? "bg-emerald-500 text-white shadow-sm"
                                : "bg-white text-primary shadow-xs"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {isAgencyAttached ? "verified_user" : "description"}
                            </span>
                          </div>
                          <div className="min-w-0 truncate">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-semibold text-on-surface text-sm truncate">
                                {doc.fileName}
                              </p>
                              {isAgencyAttached && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-600/15 text-emerald-800 text-[10px] font-bold">
                                  Provided by Agency
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-outline mt-0.5">{doc.type}</p>
                            {doc.reviewNote && (
                              <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-1 italic">
                                Note: {doc.reviewNote}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => openDocument(doc, false)}
                            disabled={docLoadingId === doc.id}
                            className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors cursor-pointer"
                            title="Preview file"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              visibility
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openDocument(doc, true)}
                            disabled={docLoadingId === doc.id}
                            className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors cursor-pointer"
                            title="Download file"
                          >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
