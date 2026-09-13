"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import { api, ApiError, API_BASE_URL } from "@/lib/api";

interface AgencyVerification {
  id: string;
  status: "pending_payment" | "paid" | "under_review" | "approved" | "rejected" | "documents_requested";
  feeAmount: string;
  currency: string;
  transactionId: string;
  paymentStatus: string;
  paymentDetails: any;
  adminNotes: string | null;
  serviceFeeDeducted: string | null;
  refundAmount: string | null;
  refundStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AgencyFile {
  id: string;
  category: "business_document" | "certification";
  title: string;
  fileName: string;
  createdAt: string;
}

interface Agency {
  userId: string;
  companyName: string;
  licenseNumber: string | null;
  website: string | null;
  address: string | null;
  description: string | null;
  isVerified: boolean;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
  latestVerification: AgencyVerification | null;
  files: AgencyFile[];
}

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notice, setNotice] = useState("");

  // Modals
  const [showDocModal, setShowDocModal] = useState(false);
  const [docNotes, setDocNotes] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  function load() {
    setLoading(true);
    api
      .get<{ data: Agency[] }>("/api/admin/agencies")
      .then((res) => {
        setAgencies(res.data);
        setNotice("");
        setSelectedId((current) =>
          current && res.data.some((a) => a.userId === current)
            ? current
            : res.data.find((a) => !a.isVerified)?.userId ?? res.data[0]?.userId ?? null
        );
      })
      .catch(() => setNotice("Couldn't load agency profiles."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const pending = agencies.filter((a) => !a.isVerified);
  const visible = useMemo(
    () =>
      agencies.filter(
        (a) =>
          (filter === "all" || filter === "pending"
            ? !a.isVerified || filter === "all"
            : a.isVerified) &&
          `${a.companyName} ${a.fullName} ${a.email} ${a.licenseNumber ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase().trim())
      ),
    [agencies, filter, query]
  );

  const selected = agencies.find((a) => a.userId === selectedId) ?? null;

  async function setVerified(isVerified: boolean) {
    if (!selected) return;
    setUpdating(true);
    setNotice("");
    try {
      await api.patch(`/api/admin/agencies/${selected.userId}/verify`, { isVerified });
      setNotice(
        isVerified
          ? `🎉 ${selected.companyName} is now officially verified and badge awarded.`
          : `${selected.companyName}'s verification was revoked.`
      );
      load();
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "Couldn't update verification.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleRequestDocuments() {
    if (!selected || !docNotes.trim()) return;
    setUpdating(true);
    setNotice("");
    try {
      await api.post(`/api/admin/agencies/${selected.userId}/request-documents`, {
        notes: docNotes.trim(),
      });
      setNotice(`Document request notification sent to ${selected.companyName}.`);
      setShowDocModal(false);
      setDocNotes("");
      load();
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "Couldn't send document request.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleRejectRefund() {
    if (!selected || !rejectReason.trim()) return;
    setUpdating(true);
    setNotice("");
    try {
      await api.post(`/api/admin/agencies/${selected.userId}/reject-refund`, {
        reason: rejectReason.trim(),
      });
      setNotice(
        `Verification declined for ${selected.companyName}. 5% service fee deducted and 95% refunded.`
      );
      setShowRejectModal(false);
      setRejectReason("");
      load();
    } catch (error) {
      setNotice(error instanceof ApiError ? error.message : "Couldn't process rejection.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <>
      <AdminSidebar />
      <main className="ml-[260px] min-h-screen bg-background text-on-background">
        <header className="sticky top-0 z-40 h-20 px-8 flex items-center justify-between bg-surface/90 dark:bg-[#17181d]/95 backdrop-blur-md border-b border-outline-variant/20 dark:border-white/10">
          <div>
            <p className="text-label-md uppercase tracking-[.16em] text-on-surface-variant font-bold">
              Administration
            </p>
            <h1 className="font-headline-md text-primary">Agency Verification & Approvals</h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <a
              href="/admin/agencies/analytics"
              className="hidden sm:inline-flex px-4 py-2.5 rounded-xl bg-surface-container-low text-primary font-bold text-sm items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">bar_chart</span>
              Agency Analytics
            </a>
            <div className="rounded-full bg-secondary-fixed px-4 py-2 text-sm font-bold text-on-secondary-fixed">
              {pending.length} pending review
            </div>
          </div>
        </header>

        <div className="max-w-[1500px] mx-auto p-8">
          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-7">
            <div>
              <h2 className="font-headline-lg text-on-surface">Review Agency Profiles & Verification</h2>
              <p className="text-on-surface-variant mt-1">
                Verify credentials, review SSLCommerz payments, request missing documents, or process approval/refund.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/admin/reports?tab=financials"
                className="self-start px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-sm hover:opacity-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">payments</span>
                Financial Turnover &amp; Audit (Print Report)
              </Link>
              <button
                onClick={load}
                disabled={loading}
                className="self-start px-4 py-2.5 rounded-xl bg-surface-container-low text-primary font-bold disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">refresh</span>Refresh
              </button>
            </div>
          </div>

          {notice && (
            <div className="mb-6 rounded-2xl bg-primary/10 border border-primary/20 p-4 text-primary font-medium flex items-center gap-3">
              <span className="material-symbols-outlined text-xl">info</span>
              {notice}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Sidebar List */}
            <section className="xl:col-span-4 rounded-3xl bg-surface-container-lowest dark:bg-[#1b1c20] border border-outline-variant/20 dark:border-white/10 p-5">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  search
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search agencies by name, email, license..."
                  type="search"
                  className="w-full rounded-xl bg-surface-container-low border-0 py-3 pl-10 pr-4 text-on-surface focus:ring-2 focus:ring-primary/30 text-sm"
                />
              </div>

              <div className="flex gap-2 mt-4">
                {(["all", "pending", "verified"] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`capitalize px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      filter === item
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {item}{" "}
                    {item === "all"
                      ? agencies.length
                      : item === "pending"
                      ? pending.length
                      : agencies.length - pending.length}
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar pr-1">
                {loading ? (
                  <p className="p-6 text-on-surface-variant text-center">Loading agency directory...</p>
                ) : visible.length ? (
                  visible.map((agency) => {
                    const isPaid = agency.latestVerification?.paymentStatus === "paid";
                    const isUnderReview = agency.latestVerification?.status === "under_review";
                    const isDocsReq = agency.latestVerification?.status === "documents_requested";
                    const isRejected = agency.latestVerification?.status === "rejected";

                    return (
                      <button
                        key={agency.userId}
                        onClick={() => setSelectedId(agency.userId)}
                        className={`w-full text-left rounded-2xl p-4 border transition-all ${
                          selectedId === agency.userId
                            ? "bg-primary/5 border-primary/40 shadow-sm"
                            : "bg-surface-container-low border-transparent hover:border-outline-variant/40"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-on-surface truncate text-sm">
                            {agency.companyName}
                          </p>
                          {agency.isVerified ? (
                            <span className="shrink-0 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">verified</span>
                              Verified
                            </span>
                          ) : isUnderReview ? (
                            <span className="shrink-0 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                              Under Review
                            </span>
                          ) : isDocsReq ? (
                            <span className="shrink-0 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                              Docs Needed
                            </span>
                          ) : isRejected ? (
                            <span className="shrink-0 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                              Rejected
                            </span>
                          ) : (
                            <span className="shrink-0 text-[11px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                              Pending
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-on-surface-variant truncate">
                          {agency.fullName} · {agency.email}
                        </p>

                        <div className="mt-2 flex items-center justify-between text-[11px] text-on-surface-variant">
                          <span>
                            {agency.licenseNumber ? `Lic: ${agency.licenseNumber}` : "No license"}
                          </span>
                          {isPaid && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-xs">payments</span>
                              ৳5,000 Paid
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="p-6 text-center text-on-surface-variant">No agencies found.</p>
                )}
              </div>
            </section>

            {/* Right Review Panel */}
            <section className="xl:col-span-8">
              {selected ? (
                <div className="rounded-3xl overflow-hidden bg-surface-container-lowest dark:bg-[#1b1c20] border border-outline-variant/20 dark:border-white/10 shadow-sm">
                  {/* Agency Header Banner */}
                  <div className="p-7 border-b border-outline-variant/20 dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-3xl">business</span>
                      </div>
                      <div>
                        <div className="flex gap-3 items-center flex-wrap">
                          <h2 className="font-headline-md text-on-surface">{selected.companyName}</h2>
                          {selected.isVerified ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">verified</span>
                              Verified Partner Badge Active
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                              Verification Pending
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          Account registered {new Date(selected.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {selected.isVerified && (
                      <button
                        onClick={() => setVerified(false)}
                        disabled={updating}
                        className="px-4 py-2 rounded-xl bg-error-container text-on-error-container font-semibold text-xs disabled:opacity-50"
                      >
                        {updating ? "Updating..." : "Revoke Verification"}
                      </button>
                    )}
                  </div>

                  {/* Verification & SSLCommerz Payment Details Box */}
                  <div className="p-7 border-b border-outline-variant/20 dark:border-white/10 bg-surface-container-low/40">
                    <h3 className="font-headline-sm text-on-surface flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary">verified_user</span>
                      Verification Request &amp; Payment Status
                    </h3>

                    {selected.latestVerification ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-surface-container-lowest dark:bg-[#17181d] border border-outline-variant/20">
                          <p className="text-xs text-on-surface-variant font-medium">Payment Status</p>
                          <p className="mt-1 font-bold text-sm flex items-center gap-1 text-on-surface">
                            {selected.latestVerification.paymentStatus === "paid" ? (
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">check_circle</span>
                                Paid via SSLCommerz
                              </span>
                            ) : selected.latestVerification.paymentStatus === "refunded_partial" ? (
                              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">currency_exchange</span>
                                95% Refunded (5% Fee)
                              </span>
                            ) : (
                              <span className="text-on-surface-variant">
                                {selected.latestVerification.paymentStatus}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-1">
                            Fee: ৳{Number(selected.latestVerification.feeAmount || 5000).toLocaleString()} BDT
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-surface-container-lowest dark:bg-[#17181d] border border-outline-variant/20">
                          <p className="text-xs text-on-surface-variant font-medium">Transaction Reference</p>
                          <p className="mt-1 font-mono text-xs font-semibold text-primary truncate" title={selected.latestVerification.transactionId}>
                            {selected.latestVerification.transactionId}
                          </p>
                          <p className="text-[11px] text-on-surface-variant mt-1">
                            Date: {new Date(selected.latestVerification.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-surface-container-lowest dark:bg-[#17181d] border border-outline-variant/20">
                          <p className="text-xs text-on-surface-variant font-medium">Current Review Status</p>
                          <p className="mt-1 font-bold text-sm capitalize text-on-surface">
                            {selected.latestVerification.status.replace("_", " ")}
                          </p>
                          {selected.latestVerification.refundAmount && (
                            <p className="text-[11px] text-rose-500 font-semibold mt-1">
                              Refund: ৳{selected.latestVerification.refundAmount} (Fee: ৳{selected.latestVerification.serviceFeeDeducted})
                            </p>
                          )}
                        </div>

                        {selected.latestVerification.paymentDetails?.paymentMethod && (
                          <div className="md:col-span-3 p-3 rounded-xl bg-surface-container-lowest dark:bg-[#17181d] border border-outline-variant/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-base">
                                account_balance_wallet
                              </span>
                              <span className="text-on-surface-variant font-medium">
                                Originating Account:
                              </span>
                              <strong className="text-on-surface font-semibold">
                                {selected.latestVerification.paymentDetails.paymentMethod}
                              </strong>
                              {selected.latestVerification.paymentDetails.accountNumber && (
                                <span className="font-mono bg-surface-container px-2 py-0.5 rounded text-[11px] text-primary font-bold">
                                  {selected.latestVerification.paymentDetails.accountNumber}
                                </span>
                              )}
                              {selected.latestVerification.paymentDetails.cardHolderName && (
                                <span className="text-on-surface-variant italic">
                                  ({selected.latestVerification.paymentDetails.cardHolderName})
                                </span>
                              )}
                            </div>
                            {selected.latestVerification.paymentDetails.bankTranId && (
                              <span className="text-[11px] font-mono text-outline">
                                Bank Ref: {selected.latestVerification.paymentDetails.bankTranId}
                              </span>
                            )}
                          </div>
                        )}

                        {selected.latestVerification.adminNotes && (
                          <div className="md:col-span-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                            <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 mb-1">
                              <span className="material-symbols-outlined text-sm">history_edu</span>
                              Admin Notes / Action History:
                            </span>
                            <p className="text-on-surface whitespace-pre-wrap">{selected.latestVerification.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-surface-container-lowest dark:bg-[#17181d] border border-outline-variant/20 text-xs text-on-surface-variant flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">info</span>
                        This agency has not submitted an official paid verification application yet.
                      </div>
                    )}

                    {/* Action Buttons Toolbar */}
                    <div className="mt-6 pt-5 border-t border-outline-variant/20 flex flex-wrap gap-3">
                      {!selected.isVerified && (
                        <button
                          onClick={() => setVerified(true)}
                          disabled={updating}
                          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                          {updating ? "Processing..." : "Approve & Award Badge"}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setDocNotes("");
                          setShowDocModal(true);
                        }}
                        disabled={updating}
                        className="px-5 py-2.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-sm hover:bg-amber-500/25 disabled:opacity-50 flex items-center gap-2 transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">assignment_late</span>
                        Request Additional Documents
                      </button>

                      <button
                        onClick={() => {
                          setRejectReason("");
                          setShowRejectModal(true);
                        }}
                        disabled={updating}
                        className="px-5 py-2.5 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold text-sm hover:bg-rose-500/25 disabled:opacity-50 flex items-center gap-2 transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">cancel</span>
                        Reject &amp; Refund (95%)
                      </button>
                    </div>
                  </div>

                  {/* Uploaded Documents & Credentials Section */}
                  <div className="p-7 border-b border-outline-variant/20 dark:border-white/10">
                    <h3 className="font-headline-sm text-on-surface flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary">folder</span>
                      Uploaded Credentials &amp; Certifications ({selected.files.length})
                    </h3>

                    {selected.files.length === 0 ? (
                      <p className="text-xs text-on-surface-variant italic">
                        No business documents or certificates uploaded yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selected.files.map((file) => (
                          <div
                            key={file.id}
                            className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0 flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-primary text-xl">
                                {file.category === "certification" ? "workspace_premium" : "picture_as_pdf"}
                              </span>
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-on-surface truncate">{file.title}</p>
                                <p className="text-[10px] text-on-surface-variant capitalize">
                                  {file.category.replace("_", " ")} · {file.fileName}
                                </p>
                              </div>
                            </div>
                            <a
                              href={`${API_BASE_URL}/api/agency/files/${file.id}/file`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-surface-container-high text-primary hover:bg-primary hover:text-on-primary transition-colors text-xs font-semibold flex items-center gap-1 shrink-0"
                            >
                              <span className="material-symbols-outlined text-xs">visibility</span>
                              View
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Agency Details Grid */}
                  <div className="grid md:grid-cols-2 gap-5 p-7">
                    <Info icon="person" label="Primary contact" value={selected.fullName} />
                    <Info icon="mail" label="Email address" value={selected.email} />
                    <Info
                      icon="badge"
                      label="License number"
                      value={selected.licenseNumber ?? "Not provided"}
                    />
                    <Info
                      icon="location_on"
                      label="Office Address"
                      value={selected.address ?? "Not provided"}
                    />
                    <div className="md:col-span-2 rounded-2xl bg-surface-container-low p-5">
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                        About Agency
                      </p>
                      <p className="mt-2 text-sm text-on-surface whitespace-pre-wrap">
                        {selected.description || "No agency description has been provided."}
                      </p>
                    </div>
                    {selected.website && (
                      <div className="md:col-span-2 rounded-2xl bg-surface-container-low p-5">
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          Official Website
                        </p>
                        <a
                          href={selected.website}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex gap-1.5 text-primary font-bold text-sm hover:underline items-center"
                        >
                          {selected.website}
                          <span className="material-symbols-outlined text-sm">open_in_new</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl bg-surface-container-lowest p-16 text-center text-on-surface-variant border border-outline-variant/20">
                  <span className="material-symbols-outlined text-5xl text-outline mb-3">business</span>
                  <p className="text-base font-medium">Select an agency from the left to review verification &amp; credentials.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Modal: Request Additional Documents */}
      {showDocModal && selected && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-surface-container-lowest dark:bg-[#1b1c20] p-7 border border-outline-variant/20 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">assignment_late</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-on-surface">Request Additional Documents</h3>
                  <p className="text-xs text-on-surface-variant">For {selected.companyName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Specify what documents or credentials need to be updated (e.g. valid trade license, tax certificate, or accreditation letter). An instant high-priority notification will be sent to the agency.
            </p>

            <textarea
              value={docNotes}
              onChange={(e) => setDocNotes(e.target.value)}
              placeholder="e.g. Please upload your updated 2024 Trade License & Tax Identification Certificate (TIN) to proceed with badge verification."
              rows={4}
              className="w-full rounded-xl bg-surface-container-low border border-outline-variant/30 p-3.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDocModal(false)}
                className="px-5 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDocuments}
                disabled={updating || !docNotes.trim()}
                className="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 disabled:opacity-50 shadow-sm"
              >
                {updating ? "Sending..." : "Send Document Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject & Refund (5% Service Fee Deduction) */}
      {showRejectModal && selected && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-surface-container-lowest dark:bg-[#1b1c20] p-7 border border-outline-variant/20 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">currency_exchange</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-on-surface">Decline Verification &amp; Process Refund</h3>
                  <p className="text-xs text-on-surface-variant">For {selected.companyName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Financial Breakdown Card */}
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-2">
              <p className="font-bold text-rose-800 dark:text-rose-200">
                5% Platform Service Fee Deduction Policy:
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                <div className="p-2 bg-surface/80 rounded-lg">
                  <p className="text-[10px] text-on-surface-variant">Paid Fee</p>
                  <p className="font-bold text-on-surface">৳5,000</p>
                </div>
                <div className="p-2 bg-surface/80 rounded-lg">
                  <p className="text-[10px] text-rose-600 font-semibold">5% Fee Retained</p>
                  <p className="font-bold text-rose-600">-৳250</p>
                </div>
                <div className="p-2 bg-surface/80 rounded-lg">
                  <p className="text-[10px] text-emerald-600 font-semibold">95% Net Refund</p>
                  <p className="font-bold text-emerald-600">৳4,750</p>
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant pt-1">
                The net amount of <strong>৳4,750 BDT</strong> will be returned to the agency&apos;s originating account:{" "}
                <strong className="text-primary font-mono">
                  {selected.latestVerification?.paymentDetails?.paymentMethod || "SSLCommerz"}
                  {selected.latestVerification?.paymentDetails?.accountNumber
                    ? ` (${selected.latestVerification.paymentDetails.accountNumber})`
                    : ""}
                </strong>
                .
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface">
                Reason for Declining (Required for Agency Notification):
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Submitted license is expired and company documents could not be verified with local registries."
                rows={3}
                className="w-full rounded-xl bg-surface-container-low border border-outline-variant/30 p-3.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-5 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectRefund}
                disabled={updating || !rejectReason.trim()}
                className="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 disabled:opacity-50 shadow-sm"
              >
                {updating ? "Processing..." : "Confirm Rejection & 95% Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Info({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-5">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <p className="mt-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-sm font-semibold text-on-surface break-words">{value}</p>
    </div>
  );
}