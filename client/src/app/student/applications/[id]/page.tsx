"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { api } from "@/lib/api";
import { ApplicationStatus, DocumentStatus } from "@/lib/types";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";

interface ApplicationDetail {
  id: string;
  status: ApplicationStatus;
  intake: string | null;
  notes: string | null;
  submittedAt: string | null;
  createdAt: string;
  program: { id: string; name: string; degreeLevel: string } | null;
  university: { id: string; name: string; country: string; logoUrl: string | null } | null;
  documents: { id: string; type: string; fileName: string; status: DocumentStatus }[];
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const applicationId = params.id as string;
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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

  return (
    <>
<StudentSidebar />

<main className="ml-[260px] flex-1">

<header className="flex justify-between items-center w-full px-margin-desktop h-16 sticky top-0 z-40 bg-surface-container-lowest shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
<div className="flex items-center gap-4 flex-1">
<div className="relative w-96 max-w-full">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
<input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-body-md focus:ring-2 focus:ring-primary/20" placeholder="Search applications..." type="text" />
</div>
</div>
</header>
<div className="p-margin-desktop">

<nav className="flex items-center gap-2 mb-6 text-outline text-label-md font-label-md">
<Link className="hover:text-primary transition-colors" href="/student/applications">Applications</Link>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
<span className="text-on-surface font-semibold">{app?.university?.name ?? "..."}</span>
</nav>

{loading && <p className="text-on-surface-variant font-body-md">Loading application...</p>}
{!loading && !app && <p className="text-on-surface-variant font-body-md">Application not found.</p>}

{app && (
<>
<section className="bg-white rounded-[24px] p-8 occlusion-shadow mb-card-gap relative overflow-hidden">
<div className="absolute top-0 right-0 p-6">
<ApplicationStatusBadge status={app.status} />
</div>
<div className="flex items-start gap-8">
<div className="w-24 h-24 rounded-2xl bg-surface-container-low flex items-center justify-center border border-outline-variant/30">
{app.university?.logoUrl ? (
  <img className="w-16 h-16 object-contain" alt={app.university.name} src={app.university.logoUrl} />
) : (
  <span className="material-symbols-outlined text-primary text-3xl">school</span>
)}
</div>
<div className="flex-1">
<h2 className="font-headline-lg text-headline-lg text-primary mb-1">{app.program?.name}</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant mb-4">{app.university?.name} • {app.university?.country}</p>
<div className="flex gap-6">
<div className="flex flex-col">
<span className="text-outline font-label-md text-label-md uppercase tracking-wider">Submitted On</span>
<span className="font-semibold text-on-surface">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "Not submitted yet"}</span>
</div>
<div className="flex flex-col">
<span className="text-outline font-label-md text-label-md uppercase tracking-wider">Intake</span>
<span className="font-semibold text-on-surface">{app.intake || "Not set"}</span>
</div>
</div>
</div>
<div className="flex flex-col gap-3">
{app.status === "draft" && (
<button onClick={handleSubmit} disabled={actionLoading} className="bg-primary text-on-primary font-body-md px-6 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50">
<span className="material-symbols-outlined text-[20px]">send</span>
                            Submit Application
                        </button>
)}
{!["accepted", "rejected", "withdrawn"].includes(app.status) && (
<button onClick={handleWithdraw} disabled={actionLoading} className="bg-surface-container text-primary font-body-md px-6 py-3 rounded-xl hover:bg-surface-container-high transition-all flex items-center gap-2 disabled:opacity-50">
<span className="material-symbols-outlined text-[20px]">cancel</span>
                            Withdraw
                        </button>
)}
</div>
</div>
{app.notes && (
<div className="mt-6 pt-6 border-t border-outline-variant/20">
<p className="text-label-md text-outline uppercase tracking-wider mb-1">Notes</p>
<p className="text-body-md text-on-surface-variant">{app.notes}</p>
</div>
)}
</section>

<div className="bg-white rounded-[24px] p-8 occlusion-shadow">
<div className="flex justify-between items-center mb-6">
<h3 className="font-headline-sm text-headline-sm text-primary">Attached Documents</h3>
<Link href="/student/documents" className="text-label-md text-primary font-bold hover:underline">Manage Documents</Link>
</div>
{app.documents.length === 0 && (
  <p className="text-on-surface-variant font-body-md">No documents attached to this application yet.</p>
)}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{app.documents.map((doc) => (
<div key={doc.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm">
<span className="material-symbols-outlined">description</span>
</div>
<div>
<p className="font-semibold text-on-surface text-body-md">{doc.type}</p>
<p className="text-label-md text-outline">{doc.fileName}</p>
</div>
</div>
<span className={`material-symbols-outlined ${doc.status === "approved" ? "text-secondary" : doc.status === "rejected" ? "text-error" : "text-outline"}`}>
{doc.status === "approved" ? "verified" : doc.status === "rejected" ? "error" : "hourglass_top"}
</span>
</div>
))}
</div>
</div>
</>
)}
</div>
</main>
    </>
  );
}
