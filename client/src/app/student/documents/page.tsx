"use client";

import { useEffect, useRef, useState } from "react";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, API_BASE_URL, getAccessToken, tryRefresh } from "@/lib/api";
import { StudentDocument, DocumentStatus } from "@/lib/types";
import NotificationBell from "@/components/notifications/NotificationBell";

const DOCUMENT_TYPES = [
  "Passport / ID",
  "Transcript",
  "Test Score",
  "Portfolio",
  "Recommendation Letter",
  "Statement of Purpose",
  "Other",
];

const STATUS_DISPLAY: Record<DocumentStatus, { label: string; icon: string; className: string }> = {
  pending: { label: "Pending Review", icon: "hourglass_top", className: "text-outline" },
  approved: { label: "Verified", icon: "check_circle", className: "text-primary" },
  rejected: { label: "Needs Attention", icon: "warning", className: "text-error" },
};

export default function DocumentVaultPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState(DOCUMENT_TYPES[0]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    api
      .get<{ data: StudentDocument[] }>("/api/documents")
      .then((res) => setDocuments(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", uploadType);
      await api.post("/api/documents", formData);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await api.delete(`/api/documents/${id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete this document.");
    }
  }

  async function openDocument(doc: StudentDocument, download = false) {
    setError(null);
    const previewWindow = download ? null : window.open("", "_blank");
    try {
      let token = getAccessToken();
      let response = await fetch(`${API_BASE_URL}/api/documents/${doc.id}/file${download ? "?download=true" : ""}`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.status === 401 && await tryRefresh()) {
        token = getAccessToken();
        response = await fetch(`${API_BASE_URL}/api/documents/${doc.id}/file${download ? "?download=true" : ""}`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
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
    } catch (err) {
      previewWindow?.close();
      setError(err instanceof Error ? err.message : "Could not open this document.");
    }
  }

  const categories = documents.reduce<Record<string, number>>((acc, doc) => {
    acc[doc.type] = (acc[doc.type] ?? 0) + 1;
    return acc;
  }, {});
  const visibleDocuments = documents.filter((doc) => `${doc.fileName} ${doc.type} ${doc.status}`.toLowerCase().includes(searchQuery.toLowerCase().trim()));

  return (
    <>
<StudentSidebar />

<main className="ml-[260px] flex-1 flex flex-col h-screen overflow-y-auto">

<header className="flex justify-between items-center w-full px-margin-desktop h-16 sticky top-0 z-40 bg-surface-container-lowest shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
<div className="flex items-center gap-8 flex-1">
<div className="relative w-full max-w-md">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
<input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-full border-none focus:ring-2 focus:ring-primary/20 font-body-md text-body-md" placeholder="Search academic documents..." type="text" />
</div>
</div>
<div className="flex items-center gap-6">
<NotificationBell />
<div className="flex items-center gap-3 group cursor-pointer">
<div className="text-right hidden sm:block">
<p className="font-label-md text-label-md font-bold text-on-surface">{user?.fullName ?? "..."}</p>
</div>
<div className="w-10 h-10 rounded-full border-2 border-primary-container bg-primary-container flex items-center justify-center font-bold text-primary">
{user?.fullName?.[0] ?? "S"}
</div>
</div>
</div>
</header>

<div className="p-margin-desktop space-y-gutter">

<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<nav className="flex items-center gap-2 text-outline font-label-md text-label-md mb-2">
<span>Dashboard</span>
<span className="material-symbols-outlined text-xs">chevron_right</span>
<span className="text-primary font-bold">Documents</span>
</nav>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Student Document Vault</h2>
<p className="text-on-surface-variant font-body-md text-body-md max-w-xl">Securely manage your academic records, identity proofs, and portfolio for international university applications.</p>
</div>
<div className="flex gap-3 items-center">
<select
  value={uploadType}
  onChange={(e) => setUploadType(e.target.value)}
  className="bg-surface-container-low border-none rounded-xl py-3 px-4 font-body-md text-body-md focus:ring-2 focus:ring-primary/20"
>
{DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
</select>
<input ref={fileInputRef} type="file" onChange={handleFileSelected} className="hidden" id="doc-upload-input" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" />
<label htmlFor="doc-upload-input" className="px-6 py-3 bg-secondary text-on-secondary rounded-xl font-label-md text-label-md font-bold flex items-center gap-2 shadow-lg shadow-secondary/20 hover:scale-105 transition-transform active:scale-95 cursor-pointer">
<span className="material-symbols-outlined">cloud_upload</span>
{uploading ? "Uploading..." : "Upload Document"}
</label>
</div>
</div>

{error && <p className="text-error font-body-md">{error}</p>}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-card-gap">
{Object.keys(categories).length === 0 && !loading && (
  <p className="text-on-surface-variant font-body-md col-span-full">No documents uploaded yet — use the button above to add your first one.</p>
)}
{Object.entries(categories).map(([type, count]) => (
<div key={type} className="bg-surface-container-lowest p-container-padding rounded-[24px] ambient-shadow border border-outline-variant/30 hover:border-primary/30 transition-all">
<div className="flex justify-between items-start mb-6">
<div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
<span className="material-symbols-outlined text-primary">folder</span>
</div>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">{type}</h3>
<p className="text-outline font-label-md text-label-md">{count} File{count === 1 ? "" : "s"}</p>
</div>
))}
</div>

<section className="bg-surface-container-lowest rounded-[24px] ambient-shadow overflow-hidden">
<div className="px-container-padding py-6 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
<h4 className="font-headline-sm text-headline-sm text-on-surface">All Documents</h4>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low/50">
<th className="px-container-padding py-4 font-label-md text-label-md text-outline uppercase tracking-wider">Filename</th>
<th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">Date Uploaded</th>
<th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">Category</th>
<th className="px-6 py-4 font-label-md text-label-md text-outline uppercase tracking-wider">Status</th>
<th className="px-container-padding py-4 font-label-md text-label-md text-outline uppercase tracking-wider text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/10">

{!loading && documents.length === 0 && (
  <tr><td colSpan={5} className="px-container-padding py-12 text-center text-on-surface-variant font-body-md">No documents yet.</td></tr>
)}

{visibleDocuments.map((doc) => {
  const status = STATUS_DISPLAY[doc.status];
  return (
<tr key={doc.id} className="hover:bg-surface-bright transition-colors group">
<td className="px-container-padding py-5">
<div className="flex items-center gap-3">
<div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-primary">description</span>
</div>
<div>
<p className="font-body-md text-body-md font-bold text-on-surface">{doc.fileName}</p>
</div>
</div>
</td>
<td className="px-6 py-5 font-body-md text-body-md text-on-surface-variant">{new Date(doc.createdAt).toLocaleDateString()}</td>
<td className="px-6 py-5">
<span className="px-3 py-1 bg-primary/10 text-primary font-label-md text-label-md rounded-full">{doc.type}</span>
</td>
<td className="px-6 py-5">
<div className={`flex items-center gap-1.5 ${status.className}`}>
<span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>{status.icon}</span>
<span className="font-label-md text-label-md font-bold">{status.label}</span>
</div>
{doc.reviewNote && <p className="text-[11px] text-outline mt-1">{doc.reviewNote}</p>}
</td>
<td className="px-container-padding py-5 text-right">
<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button onClick={() => openDocument(doc)} className="p-2 hover:bg-primary/5 rounded-lg text-primary" title="Preview" aria-label={`Preview ${doc.fileName}`}>
<span className="material-symbols-outlined">visibility</span>
</button>
<button onClick={() => openDocument(doc, true)} className="p-2 hover:bg-primary/5 rounded-lg text-primary" title="Download" aria-label={`Download ${doc.fileName}`}>
<span className="material-symbols-outlined">download</span>
</button>
<button onClick={() => handleDelete(doc.id)} className="p-2 hover:bg-error/5 rounded-lg text-error" title="Delete">
<span className="material-symbols-outlined">delete</span>
</button>
</div>
</td>
</tr>
  );
})}
{!loading && documents.length > 0 && visibleDocuments.length === 0 && (
  <tr><td colSpan={5} className="px-container-padding py-12 text-center text-on-surface-variant font-body-md">No documents match your search.</td></tr>
)}
</tbody>
</table>
</div>
</section>
</div>
</main>
    </>
  );
}
