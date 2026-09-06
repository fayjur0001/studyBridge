"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AgencySidebar from "@/components/dashboard/AgencySidebar";
import { api } from "@/lib/api";
import { ApplicationStatus, DocumentStatus } from "@/lib/types";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";

interface StudentDetail {
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  profile: {
    nationality: string | null;
    currentEducationLevel: string | null;
    gpa: string | null;
    bio: string | null;
    preferredCountries: string[];
  };
  applications: {
    id: string;
    status: ApplicationStatus;
    createdAt: string;
    programName: string;
    universityName: string;
    documents: {
      id: string;
      type: string;
      fileName: string;
      status: DocumentStatus;
      reviewNote: string | null;
    }[];
  }[];
}

export default function AgencyStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api
      .get<StudentDetail>(`/api/agency/students/${studentId}`)
      .then(setStudent)
      .finally(() => setLoading(false));
  }

  useEffect(load, [studentId]);

  async function handleReviewDocument(documentId: string, status: "approved" | "rejected") {
    setReviewingId(documentId);
    try {
      await api.patch(`/api/documents/${documentId}/review`, { status });
      load();
    } finally {
      setReviewingId(null);
    }
  }

  async function handleMessage() {
    if (!student) return;
    setMessaging(true);
    try {
      await api.post("/api/conversations", {
        recipientId: studentId,
        message: `Hi ${student.fullName.split(" ")[0]}, this is your StudyBridge counselor — happy to help with anything you need.`,
      });
      router.push("/agency/messages");
    } finally {
      setMessaging(false);
    }
  }

  async function handleUnlink() {
    if (!student) return;
    if (!confirm(`Unlink ${student.fullName} from your agency? They'll no longer appear in your student list.`)) return;
    setUnlinking(true);
    try {
      await api.delete(`/api/agency/students/${studentId}`);
      router.push("/agency/students");
    } finally {
      setUnlinking(false);
    }
  }

  return (
    <>
<AgencySidebar />

<div className="flex-1 ml-[260px] flex flex-col min-h-screen">
<header className="sticky top-0 w-full z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center px-gutter py-4 h-20">
<nav className="flex items-center gap-2 text-on-surface-variant">
<Link className="text-label-md font-label-md hover:text-primary transition-colors" href="/agency/students">Students</Link>
<span className="material-symbols-outlined text-sm">chevron_right</span>
<span className="text-label-md font-label-md text-primary font-semibold">{student?.fullName ?? "..."}</span>
</nav>
</header>

<main className="p-margin-desktop flex-1">
{loading && <p className="text-on-surface-variant font-body-md">Loading student profile...</p>}
{!loading && !student && <p className="text-on-surface-variant font-body-md">Student not found.</p>}

{student && (
<div className="grid grid-cols-12 gap-card-gap">
<div className="col-span-12 lg:col-span-4 flex flex-col gap-card-gap">
<div className="ambient-card p-container-padding">
<div className="flex flex-col items-center text-center">
<div className="w-32 h-32 rounded-full bg-primary-container flex items-center justify-center text-4xl font-bold text-primary mb-4">
{student.fullName?.[0] ?? "S"}
</div>
<h3 className="font-headline-md text-headline-md mb-1">{student.fullName}</h3>
<p className="text-on-surface-variant font-body-md text-body-md mb-6">{student.profile.currentEducationLevel || "Education level not set"}</p>
<div className="w-full space-y-4 pt-6 border-t border-outline-variant/30 text-left">
<div className="flex items-center justify-between">
<span className="text-on-surface-variant text-label-md font-label-md">Email</span>
<span className="text-body-md font-body-md font-medium">{student.email}</span>
</div>
<div className="flex items-center justify-between">
<span className="text-on-surface-variant text-label-md font-label-md">Phone</span>
<span className="text-body-md font-body-md font-medium">{student.phone || "—"}</span>
</div>
<div className="flex items-center justify-between">
<span className="text-on-surface-variant text-label-md font-label-md">Nationality</span>
<span className="text-body-md font-body-md font-medium">{student.profile.nationality || "—"}</span>
</div>
<div className="flex items-center justify-between">
<span className="text-on-surface-variant text-label-md font-label-md">GPA</span>
<span className="text-body-md font-body-md font-medium">{student.profile.gpa || "—"}</span>
</div>
</div>
<button
  onClick={handleMessage}
  disabled={messaging}
  className="w-full mt-6 bg-primary text-on-primary py-3 rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
>
  <span className="material-symbols-outlined text-[18px]">mail</span>
  {messaging ? "Starting..." : "Message Student"}
</button>
<button
  onClick={handleUnlink}
  disabled={unlinking}
  className="w-full mt-3 bg-surface-container text-error py-3 rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:bg-error/10 transition-all disabled:opacity-50"
>
  <span className="material-symbols-outlined text-[18px]">link_off</span>
  {unlinking ? "Unlinking..." : "Unlink Student"}
</button>
</div>
</div>
{student.profile.bio && (
<div className="ambient-card p-container-padding">
<h4 className="font-headline-sm text-headline-sm mb-3">About</h4>
<p className="text-body-md text-on-surface-variant">{student.profile.bio}</p>
</div>
)}
</div>

<div className="col-span-12 lg:col-span-8 flex flex-col gap-card-gap">
<div className="ambient-card p-container-padding">
<h4 className="font-headline-sm text-headline-sm mb-6">Applications</h4>
{student.applications.length === 0 && (
  <p className="text-on-surface-variant font-body-md">This student hasn&apos;t started any applications yet.</p>
)}
<div className="space-y-4">
{student.applications.map((app) => (
<div key={app.id} className="p-4 bg-surface-container-low rounded-xl">
<div className="flex items-center justify-between">
<div>
<p className="font-body-lg text-body-lg font-bold text-on-surface">{app.universityName}</p>
<p className="text-on-surface-variant font-body-md text-body-md">{app.programName}</p>
</div>
<ApplicationStatusBadge status={app.status} />
</div>
{app.documents.length > 0 && (
<div className="mt-4 pt-4 border-t border-outline-variant/30 space-y-2">
<p className="text-label-md text-outline uppercase tracking-wider mb-2">Documents</p>
{app.documents.map((doc) => (
<div key={doc.id} className="flex items-center justify-between bg-surface-container-lowest rounded-lg px-4 py-3">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-outline text-[20px]">description</span>
<div>
<p className="font-semibold text-on-surface text-body-md">{doc.type}</p>
<p className="text-label-md text-outline">{doc.fileName}</p>
</div>
</div>
{doc.status === "pending" ? (
<div className="flex items-center gap-2">
<button
  onClick={() => handleReviewDocument(doc.id, "approved")}
  disabled={reviewingId === doc.id}
  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-label-md font-bold disabled:opacity-50"
>
  Approve
</button>
<button
  onClick={() => handleReviewDocument(doc.id, "rejected")}
  disabled={reviewingId === doc.id}
  className="px-3 py-1.5 rounded-lg bg-surface-container text-error text-label-md font-bold disabled:opacity-50"
>
  Reject
</button>
</div>
) : (
<span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${doc.status === "approved" ? "bg-secondary-fixed text-on-secondary-fixed-variant" : "bg-error-container text-on-error-container"}`}>
{doc.status}
</span>
)}
</div>
))}
</div>
)}
</div>
))}
</div>
</div>
</div>
</div>
)}
</main>
</div>
    </>
  );
}
