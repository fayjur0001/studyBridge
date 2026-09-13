"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import { api } from "@/lib/api";

type ReportRow = {
  id: string;
  status: string;
  createdAt: string;
  studentName: string;
  studentEmail: string;
  programName: string;
  universityName: string;
};

interface ReportData {
  applications: {
    total: number;
    submitted: number;
    underReview: number;
    accepted: number;
    rejected: number;
    withdrawn: number;
  };
  rows: ReportRow[];
}

interface FinancialSummary {
  totalTurnover: number;
  netPlatformIncome: number;
  rejectionServiceFees: number;
  approvedRevenue: number;
  totalRefunded: number;
  inReviewEscrow: number;
  totalPaidCount: number;
  approvedCount: number;
  rejectedCount: number;
  underReviewCount: number;
  verificationTurnover?: number;
  studentApplicationTurnover?: number;
  platformCommission?: number;
  agencyEarnings?: number;
  paidApplicationsCount?: number;
  currency: string;
}

interface FinancialTransaction {
  id: string;
  agencyId: string;
  companyName: string;
  email: string;
  transactionId: string;
  feeAmount: number;
  currency: string;
  status: "pending_payment" | "under_review" | "documents_requested" | "approved" | "rejected";
  paymentStatus: string;
  paymentMethod: string;
  accountNumber: string | null;
  bankTranId: string | null;
  serviceFeeDeducted: number;
  refundAmount: number;
  refundStatus: string;
  refundDestination: string | null;
  adminNotes: string | null;
  paidAt: string;
  reviewedAt: string | null;
  createdAt: string;
}

interface ApplicationCommissionTransaction {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  agencyId: string | null;
  agencyName: string;
  programName: string;
  universityName: string;
  applicationFee: number;
  platformCommission: number;
  agencyShare: number;
  transactionId: string;
  paymentMethod: string;
  accountNumber: string | null;
  bankName: string | null;
  paidAt: string;
  status: string;
}

interface FinancialData {
  summary: FinancialSummary;
  transactions: FinancialTransaction[];
  applicationTransactions?: ApplicationCommissionTransaction[];
}

const STATUS_FILTERS = [
  { key: "", label: "All" },
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under Review" },
  { key: "documents_requested", label: "Documents Requested" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
  { key: "withdrawn", label: "Withdrawn" },
];

const statusTone: Record<string, string> = {
  accepted: "bg-secondary-fixed text-on-secondary-fixed",
  rejected: "bg-error-container text-on-error-container",
  under_review: "bg-primary-fixed text-on-primary-fixed",
  submitted: "bg-tertiary-fixed text-on-tertiary-fixed",
  draft: "bg-surface-container-high text-on-surface-variant",
  documents_requested: "bg-amber-100 text-amber-800",
  withdrawn: "bg-surface-container text-on-surface-variant",
};

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<"applications" | "financials">("financials");

  // Application Reports state
  const [data, setData] = useState<ReportData | null>(null);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Financial Reports state
  const [finData, setFinData] = useState<FinancialData | null>(null);
  const [finStatus, setFinStatus] = useState<string>("");
  const [finQuery, setFinQuery] = useState("");
  const [appFinQuery, setAppFinQuery] = useState("");
  const [finLedgerView, setFinLedgerView] = useState<"verification" | "application_commissions">("verification");
  const [finLoading, setFinLoading] = useState(true);

  // Check URL query for tab pre-selection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      if (p.get("tab") === "applications") {
        setActiveTab("applications");
      } else if (p.get("tab") === "financials") {
        setActiveTab("financials");
      }
    }
  }, []);

  // Fetch application reports
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const path = status ? `/api/admin/reports?status=${status}` : "/api/admin/reports";
    api
      .get<ReportData>(path)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  // Fetch financial turnover data
  function loadFinancials() {
    setFinLoading(true);
    api
      .get<FinancialData>("/api/admin/financials")
      .then((res) => setFinData(res))
      .catch(() => {})
      .finally(() => setFinLoading(false));
  }

  useEffect(() => {
    loadFinancials();
  }, []);

  // Filter applications
  const q = query.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    if (!data) return [];
    if (!q) return data.rows;
    return data.rows.filter((row) =>
      `${row.studentName} ${row.studentEmail} ${row.programName} ${row.universityName}`.toLowerCase().includes(q)
    );
  }, [data, q]);

  // Filter financial transactions (agency verification)
  const fq = finQuery.trim().toLowerCase();
  const filteredFinRows = useMemo(() => {
    if (!finData) return [];
    let list = finData.transactions;
    if (finStatus) {
      list = list.filter((t) => t.status === finStatus);
    }
    if (fq) {
      list = list.filter((t) =>
        `${t.companyName} ${t.email} ${t.transactionId} ${t.paymentMethod} ${t.accountNumber || ""} ${t.bankTranId || ""}`
          .toLowerCase()
          .includes(fq)
      );
    }
    return list;
  }, [finData, finStatus, fq]);

  // Filter student application commissions
  const afq = appFinQuery.trim().toLowerCase();
  const filteredAppFinRows = useMemo(() => {
    if (!finData?.applicationTransactions) return [];
    if (!afq) return finData.applicationTransactions;
    return finData.applicationTransactions.filter((a) =>
      `${a.studentName} ${a.studentEmail} ${a.agencyName} ${a.programName} ${a.universityName} ${a.transactionId} ${a.paymentMethod} ${a.accountNumber || ""} ${a.bankName || ""}`
        .toLowerCase()
        .includes(afq)
    );
  }, [finData, afq]);

  // Export CSV for applications
  function exportCsv() {
    if (!data) return;
    const header = ["Student", "Email", "Program", "University", "Status", "Submitted"];
    const csvRows = filteredRows.map((r) => [
      r.studentName,
      r.studentEmail,
      r.programName,
      r.universityName,
      r.status,
      new Date(r.createdAt).toISOString().slice(0, 10),
    ]);
    const csv = [header, ...csvRows]
      .map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `studybridge-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Export CSV for Financials
  function exportFinancialCsv() {
    if (!finData) return;
    if (finLedgerView === "application_commissions") {
      const header = [
        "Transaction ID",
        "Student Name",
        "Student Email",
        "Assigned Agency",
        "Program",
        "University",
        "Payment Channel",
        "Account / Bank",
        "Total Fee Paid (BDT)",
        "Platform Commission 10% (BDT)",
        "Agency Share 90% (BDT)",
        "Date",
      ];
      const rows = filteredAppFinRows.map((a) => [
        a.transactionId,
        a.studentName,
        a.studentEmail,
        a.agencyName,
        a.programName,
        a.universityName,
        a.paymentMethod,
        a.accountNumber || a.bankName || "N/A",
        a.applicationFee,
        a.platformCommission,
        a.agencyShare,
        new Date(a.paidAt).toLocaleString(),
      ]);
      const csv = [header, ...rows]
        .map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
        .join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `studybridge-student-application-commissions-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    const header = [
      "Transaction ID",
      "Agency Name",
      "Email",
      "Payment Channel",
      "Account Number",
      "Bank Reference",
      "Paid Amount (BDT)",
      "Status",
      "Platform Net Revenue (BDT)",
      "Refunded Amount (BDT)",
      "Refund Destination",
      "Date",
    ];
    const rows = filteredFinRows.map((t) => [
      t.transactionId,
      t.companyName,
      t.email,
      t.paymentMethod,
      t.accountNumber || "N/A",
      t.bankTranId || "N/A",
      t.feeAmount,
      t.status.toUpperCase(),
      t.status === "approved" ? t.feeAmount : t.status === "rejected" ? t.serviceFeeDeducted : 0,
      t.status === "rejected" ? t.refundAmount : 0,
      t.refundDestination || "N/A",
      new Date(t.paidAt || t.createdAt).toLocaleString(),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `studybridge-financial-turnover-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const handlePrint = () => {
    window.print();
  };

  const summaryCards = data
    ? [
        { label: "Total Applications", value: data.applications.total, icon: "description" },
        { label: "Under Review", value: data.applications.underReview, icon: "hourglass_top" },
        { label: "Accepted", value: data.applications.accepted, icon: "check_circle" },
        { label: "Rejected", value: data.applications.rejected, icon: "cancel" },
      ]
    : [];

  return (
    <>
      <div className="no-print">
        <AdminSidebar />
      </div>

      {/* Header bar (hidden when printing) */}
      <header className="no-print sticky top-0 z-40 ml-[260px] w-[calc(100%-260px)] h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/30">
            <button
              onClick={() => setActiveTab("financials")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "financials"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-sm">payments</span>
              Financial Turnover &amp; Revenue
              {finData && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px]">
                  ৳{finData.summary.netPlatformIncome.toLocaleString()}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "applications"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-sm">description</span>
              Application Reports
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="font-label-md text-label-md font-semibold text-primary">StudyBridge Admin</span>
        </div>
      </header>

      <main className="ml-[260px] p-container-padding space-y-gutter print:m-0 print:p-0">
        {/* ==================================================================== */}
        {/* TAB 1: FINANCIAL TURNOVER & REVENUE AUDIT (Active by default)        */}
        {/* ==================================================================== */}
        {activeTab === "financials" && (
          <div className="space-y-6">
            {/* Top Action & Headline Section */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">account_balance_wallet</span>
                    Financial Accounting &amp; Audit
                  </span>
                  <span className="text-xs text-on-surface-variant">SSLCommerz Verified Channels</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-primary mt-1">
                  Financial Turnover &amp; Revenue Audit
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Accounting audit of Agency Verification fees (৳5,000), Student Application fees (৳3,000) with 10% Platform Commissions (৳300), and 5% rejection fees.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/30 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
                  title="Print official audit report or save as PDF"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  Print Financial Statement
                </button>
                <button
                  onClick={exportFinancialCsv}
                  disabled={!finData || (finLedgerView === "verification" ? filteredFinRows.length === 0 : filteredAppFinRows.length === 0)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/30 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  title="Export to CSV spreadsheet"
                >
                  <span className="material-symbols-outlined text-base">file_download</span>
                  Export {finLedgerView === "application_commissions" ? "Commissions CSV" : "Verification CSV"}
                </button>
                <button
                  onClick={loadFinancials}
                  disabled={finLoading}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  Refresh
                </button>
              </div>
            </section>

            {/* Printable Formal Header (ONLY visible on print) */}
            <div className="hidden print:block mb-6 text-black border-b-2 border-black pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black tracking-tight">StudyBridge International</h1>
                  <p className="text-xs uppercase font-bold tracking-wider text-gray-700">
                    Official Financial Turnover &amp; Commission Audit Statement
                  </p>
                  <p className="text-[11px] text-gray-600 mt-1">
                    SSLCommerz Multi-Channel Payment Gateway Audit • Currency: Bangladeshi Taka (BDT)
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold">Generated: {new Date().toLocaleString()}</p>
                  <p>Authority: Platform Finance Administrator</p>
                  <p className="text-gray-600">Confidential Financial Audit</p>
                </div>
              </div>
            </div>

            {/* Financial Executive Summary Cards (6 Cards) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Card 1: Gross Turnover */}
              <div className="bg-surface-container-lowest p-5 rounded-3xl ambient-shadow border border-outline-variant/20 flex flex-col justify-between print:border-gray-300">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-xl">
                    payments
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                    {finData?.summary.totalPaidCount ?? 0} Transactions
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Total Turnover
                  </p>
                  <h3 className="text-2xl font-black text-primary font-mono mt-0.5">
                    ৳{(finData?.summary.totalTurnover ?? 0).toLocaleString()}
                  </h3>
                  <p className="text-[10px] text-outline mt-1 truncate" title={`৳${(finData?.summary.verificationTurnover ?? 0).toLocaleString()} Verifications + ৳${(finData?.summary.studentApplicationTurnover ?? 0).toLocaleString()} Applications`}>
                    ৳{(finData?.summary.verificationTurnover ?? 0).toLocaleString()} Verif + ৳{(finData?.summary.studentApplicationTurnover ?? 0).toLocaleString()} Apps
                  </p>
                </div>
              </div>

              {/* Card 2: Platform Commission (10%) - DEDICATED ADMIN CARD */}
              <div className="bg-primary/5 dark:bg-primary/10 p-5 rounded-3xl ambient-shadow border-2 border-primary/40 flex flex-col justify-between print:border-gray-300">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-primary p-2 bg-primary/15 rounded-xl">
                    percent
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    10% Admin Fee
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
                    Platform Commission (10%)
                  </p>
                  <h3 className="text-2xl font-black text-primary font-mono mt-0.5">
                    ৳{(finData?.summary.platformCommission ?? 0).toLocaleString()}
                  </h3>
                  <p className="text-[10px] text-primary/80 mt-1">
                    From {finData?.summary.paidApplicationsCount ?? 0} student applications
                  </p>
                </div>
              </div>

              {/* Card 3: Net Platform Income */}
              <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-5 rounded-3xl ambient-shadow border-2 border-emerald-500/30 flex flex-col justify-between print:border-gray-300">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 p-2 bg-emerald-500/10 rounded-xl">
                    account_balance_wallet
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    Net Income
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Net Platform Income
                  </p>
                  <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-0.5">
                    ৳{(finData?.summary.netPlatformIncome ?? 0).toLocaleString()}
                  </h3>
                  <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                    Approvals + Commissions + Fees
                  </p>
                </div>
              </div>

              {/* Card 4: Agency Net Earnings (90%) */}
              <div className="bg-surface-container-lowest p-5 rounded-3xl ambient-shadow border border-outline-variant/20 flex flex-col justify-between print:border-gray-300">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 p-2 bg-indigo-500/10 rounded-xl">
                    support_agent
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                    90% Agency Share
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Agency Earnings (90%)
                  </p>
                  <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                    ৳{(finData?.summary.agencyEarnings ?? 0).toLocaleString()}
                  </h3>
                  <p className="text-[10px] text-outline mt-1">
                    Dispatched to counseling agencies
                  </p>
                </div>
              </div>

              {/* Card 5: 5% Rejection Service Fees Retained */}
              <div className="bg-amber-500/5 dark:bg-amber-500/10 p-5 rounded-3xl ambient-shadow border-2 border-amber-500/30 flex flex-col justify-between print:border-gray-300">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 p-2 bg-amber-500/10 rounded-xl">
                    price_check
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200">
                    5% Retained
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-[11px] font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                    Rejection Fees
                  </p>
                  <h3 className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono mt-0.5">
                    ৳{(finData?.summary.rejectionServiceFees ?? 0).toLocaleString()}
                  </h3>
                  <p className="text-[10px] text-amber-700/80 dark:text-amber-300/80 mt-1">
                    ৳250 × {finData?.summary.rejectedCount ?? 0} rejected applications
                  </p>
                </div>
              </div>

              {/* Card 6: Total Refunded (95%) */}
              <div className="bg-surface-container-lowest p-5 rounded-3xl ambient-shadow border border-outline-variant/20 flex flex-col justify-between print:border-gray-300">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 p-2 bg-blue-500/10 rounded-xl">
                    currency_exchange
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300">
                    95% Refunded
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Total Refunded
                  </p>
                  <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                    ৳{(finData?.summary.totalRefunded ?? 0).toLocaleString()}
                  </h3>
                  <p className="text-[10px] text-outline mt-1">
                    Returned to originating accounts
                  </p>
                </div>
              </div>
            </section>

            {/* Ledger Tab Switcher (Agency Verifications vs Student Application Commissions) */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-surface-container-low rounded-2xl border border-outline-variant/30 no-print">
              <button
                type="button"
                onClick={() => setFinLedgerView("verification")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  finLedgerView === "verification"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-base">verified</span>
                Agency Verification Fees (৳5,000)
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px]">
                  {finData?.transactions.length || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFinLedgerView("application_commissions")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  finLedgerView === "application_commissions"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-base">percent</span>
                Student Application Commissions (৳3,000 / 10% Platform Commission)
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px]">
                  {finData?.applicationTransactions?.length || 0}
                </span>
              </button>
            </div>

            {/* VIEW 1: AGENCY VERIFICATION FEES AUDIT TABLE */}
            {finLedgerView === "verification" && (
              <>
                {/* Filter & Search Controls (hidden when printing) */}
                <section className="flex flex-col sm:flex-row gap-3 items-center justify-between no-print">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "", label: "All Transactions" },
                      { key: "approved", label: "Approved (Full Revenue)" },
                      { key: "rejected", label: "Rejected (5% Fee Retained)" },
                      { key: "under_review", label: "Under Review (Held)" },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setFinStatus(f.key)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          finStatus === f.key
                            ? "bg-primary text-on-primary shadow-sm"
                            : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-80">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">
                      search
                    </span>
                    <input
                      value={finQuery}
                      onChange={(e) => setFinQuery(e.target.value)}
                      placeholder="Search agency, TrxID, or account..."
                      className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </section>

                {/* Transactions Audit Ledger Table */}
                <section className="bg-surface-container-lowest rounded-3xl ambient-shadow border border-outline-variant/20 overflow-hidden print:border-gray-400">
                  <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50">
                    <div>
                      <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">receipt_long</span>
                        Agency Verification Transaction Ledger &amp; Revenue Breakdown
                      </h4>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        Detailed per-transaction audit with originating accounts and fee distribution.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-lg text-xs font-bold font-mono">
                      {filteredFinRows.length} Records
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs print:text-[10px]">
                      <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] font-extrabold tracking-wider border-b border-outline-variant/20">
                        <tr>
                          <th className="px-6 py-3.5">Agency Details</th>
                          <th className="px-6 py-3.5">TrxID &amp; Bank Ref</th>
                          <th className="px-6 py-3.5">Payment Method &amp; Account</th>
                          <th className="px-6 py-3.5 text-right">Fee Paid</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="px-6 py-3.5 text-right">Platform Net Income</th>
                          <th className="px-6 py-3.5 text-right">Refunded (95%)</th>
                          <th className="px-6 py-3.5">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/15">
                        {finLoading ? (
                          <tr>
                            <td colSpan={8} className="p-10 text-center text-on-surface-variant">
                              Loading financial transactions...
                            </td>
                          </tr>
                        ) : filteredFinRows.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-10 text-center text-on-surface-variant">
                              No financial records found matching the filters.
                            </td>
                          </tr>
                        ) : (
                          filteredFinRows.map((t) => {
                            const isApproved = t.status === "approved";
                            const isRejected = t.status === "rejected";

                            return (
                              <tr key={t.id} className="hover:bg-surface-container-low/50 transition-colors">
                                <td className="px-6 py-3.5">
                                  <p className="font-bold text-on-surface">{t.companyName}</p>
                                  <p className="text-[11px] text-on-surface-variant">{t.email}</p>
                                </td>

                                <td className="px-6 py-3.5 font-mono text-[11px]">
                                  <p className="font-semibold text-primary">{t.transactionId}</p>
                                  {t.bankTranId && (
                                    <p className="text-[10px] text-outline">Ref: {t.bankTranId}</p>
                                  )}
                                </td>

                                <td className="px-6 py-3.5">
                                  <span className="inline-flex items-center gap-1 font-bold text-on-surface">
                                    <span className="material-symbols-outlined text-sm text-primary">
                                      {t.paymentMethod.toLowerCase().includes("bank")
                                        ? "account_balance"
                                        : t.paymentMethod.toLowerCase().includes("card")
                                        ? "credit_card"
                                        : "phone_iphone"}
                                    </span>
                                    {t.paymentMethod}
                                  </span>
                                  {t.accountNumber && (
                                    <p className="text-[11px] font-mono text-outline">
                                      Acc: {t.accountNumber}
                                    </p>
                                  )}
                                </td>

                                <td className="px-6 py-3.5 text-right font-mono font-bold text-on-surface">
                                  ৳{t.feeAmount.toLocaleString()}
                                </td>

                                <td className="px-6 py-3.5">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                                      isApproved
                                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                                        : isRejected
                                        ? "bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/20"
                                        : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                                    }`}
                                  >
                                    {isApproved
                                      ? "Approved"
                                      : isRejected
                                      ? "Rejected (5% Retained)"
                                      : "Under Review"}
                                  </span>
                                  {t.adminNotes && (
                                    <p className="text-[10px] text-outline mt-0.5 truncate max-w-[160px]" title={t.adminNotes}>
                                      Note: {t.adminNotes}
                                    </p>
                                  )}
                                </td>

                                <td className="px-6 py-3.5 text-right font-mono font-black">
                                  {isApproved ? (
                                    <span className="text-emerald-600 dark:text-emerald-400">
                                      +৳{t.feeAmount.toLocaleString()}
                                    </span>
                                  ) : isRejected ? (
                                    <span className="text-amber-600 dark:text-amber-400">
                                      +৳{(t.serviceFeeDeducted || 250).toLocaleString()} (5%)
                                    </span>
                                  ) : (
                                    <span className="text-outline">৳0 (Pending)</span>
                                  )}
                                </td>

                                <td className="px-6 py-3.5 text-right font-mono">
                                  {isRejected ? (
                                    <div>
                                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                                        ৳{(t.refundAmount || 4750).toLocaleString()}
                                      </span>
                                      <p className="text-[9px] text-outline">
                                        To {t.refundDestination ? t.refundDestination.split(" ")[0] : "Account"}
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="text-outline">—</span>
                                  )}
                                </td>

                                <td className="px-6 py-3.5 text-on-surface-variant font-mono text-[11px] whitespace-nowrap">
                                  {new Date(t.paidAt || t.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>

                      {/* Totals Row */}
                      {finData && filteredFinRows.length > 0 && (
                        <tfoot className="bg-surface-container font-bold border-t-2 border-outline-variant/30 text-xs">
                          <tr>
                            <td colSpan={3} className="px-6 py-3 text-on-surface">
                              Ledger Summary Totals ({filteredFinRows.length} displayed):
                            </td>
                            <td className="px-6 py-3 text-right font-mono text-primary font-black">
                              ৳{filteredFinRows.reduce((acc, curr) => acc + curr.feeAmount, 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-3"></td>
                            <td className="px-6 py-3 text-right font-mono text-emerald-700 dark:text-emerald-300 font-black">
                              ৳{filteredFinRows.reduce((acc, curr) => {
                                if (curr.status === "approved") return acc + curr.feeAmount;
                                if (curr.status === "rejected") return acc + (curr.serviceFeeDeducted || 250);
                                return acc;
                              }, 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-3 text-right font-mono text-blue-700 dark:text-blue-300 font-black">
                              ৳{filteredFinRows.reduce((acc, curr) => {
                                if (curr.status === "rejected") return acc + (curr.refundAmount || 4750);
                                return acc;
                              }, 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-3"></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </section>
              </>
            )}

            {/* VIEW 2: STUDENT APPLICATION COMMISSIONS AUDIT TABLE */}
            {finLedgerView === "application_commissions" && (
              <>
                <section className="flex flex-col sm:flex-row gap-3 items-center justify-between no-print">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface-variant">
                      Student Agency Applications ({filteredAppFinRows.length} total paid)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                      10% Platform Commission Escrow
                    </span>
                  </div>

                  <div className="relative w-full sm:w-80">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">
                      search
                    </span>
                    <input
                      value={appFinQuery}
                      onChange={(e) => setAppFinQuery(e.target.value)}
                      placeholder="Search student, agency, program, TrxID..."
                      className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </section>

                <section className="bg-surface-container-lowest rounded-3xl ambient-shadow border border-outline-variant/20 overflow-hidden print:border-gray-400">
                  <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50">
                    <div>
                      <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">percent</span>
                        Student Application Fee &amp; Platform Commission Ledger
                      </h4>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        Audit of ৳3,000 application fee collected from students via SSLCommerz: 10% Platform Commission (৳300) and 90% Agency Counseling Share (৳2,700).
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-lg text-xs font-bold font-mono">
                      {filteredAppFinRows.length} Records
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs print:text-[10px]">
                      <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] font-extrabold tracking-wider border-b border-outline-variant/20">
                        <tr>
                          <th className="px-6 py-3.5">Student</th>
                          <th className="px-6 py-3.5">Program &amp; University</th>
                          <th className="px-6 py-3.5">Assigned Agency</th>
                          <th className="px-6 py-3.5 text-right">Application Fee</th>
                          <th className="px-6 py-3.5 text-right">Platform Commission (10%)</th>
                          <th className="px-6 py-3.5 text-right">Agency Share (90%)</th>
                          <th className="px-6 py-3.5">Payment Method &amp; TrxID</th>
                          <th className="px-6 py-3.5">Paid Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/15">
                        {finLoading ? (
                          <tr>
                            <td colSpan={8} className="p-10 text-center text-on-surface-variant">
                              Loading application commissions...
                            </td>
                          </tr>
                        ) : filteredAppFinRows.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-10 text-center text-on-surface-variant">
                              No student agency application payment records found.
                            </td>
                          </tr>
                        ) : (
                          filteredAppFinRows.map((app) => (
                            <tr key={app.id} className="hover:bg-surface-container-low/50 transition-colors">
                              <td className="px-6 py-3.5">
                                <p className="font-bold text-on-surface">{app.studentName}</p>
                                <p className="text-[11px] text-on-surface-variant">{app.studentEmail}</p>
                              </td>

                              <td className="px-6 py-3.5">
                                <p className="font-semibold text-primary">{app.programName}</p>
                                <p className="text-[11px] text-on-surface-variant">{app.universityName}</p>
                              </td>

                              <td className="px-6 py-3.5">
                                <span className="inline-flex items-center gap-1 font-bold text-on-surface">
                                  <span className="material-symbols-outlined text-sm text-primary">support_agent</span>
                                  {app.agencyName}
                                </span>
                              </td>

                              <td className="px-6 py-3.5 text-right font-mono font-bold text-on-surface">
                                ৳{app.applicationFee.toLocaleString()}
                              </td>

                              <td className="px-6 py-3.5 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                                +৳{app.platformCommission.toLocaleString()}
                              </td>

                              <td className="px-6 py-3.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                ৳{app.agencyShare.toLocaleString()}
                              </td>

                              <td className="px-6 py-3.5">
                                <p className="font-bold text-on-surface flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm text-primary">payments</span>
                                  {app.paymentMethod}
                                </p>
                                <p className="text-[10px] font-mono text-outline">{app.transactionId}</p>
                              </td>

                              <td className="px-6 py-3.5 text-on-surface-variant font-mono text-[11px] whitespace-nowrap">
                                {new Date(app.paidAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>

                      {/* Totals Row */}
                      {finData && filteredAppFinRows.length > 0 && (
                        <tfoot className="bg-surface-container font-bold border-t-2 border-outline-variant/30 text-xs">
                          <tr>
                            <td colSpan={3} className="px-6 py-3 text-on-surface">
                              Commission Summary Totals ({filteredAppFinRows.length} displayed):
                            </td>
                            <td className="px-6 py-3 text-right font-mono text-primary font-black">
                              ৳{filteredAppFinRows.reduce((a, c) => a + c.applicationFee, 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-3 text-right font-mono text-emerald-700 dark:text-emerald-300 font-black">
                              +৳{filteredAppFinRows.reduce((a, c) => a + c.platformCommission, 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-3 text-right font-mono text-indigo-700 dark:text-indigo-300 font-black">
                              ৳{filteredAppFinRows.reduce((a, c) => a + c.agencyShare, 0).toLocaleString()}
                            </td>
                            <td colSpan={2} className="px-6 py-3 text-right text-outline text-[11px]">
                              10% Admin Platform Commission
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </section>
              </>
            )}

            {/* Printable Formal Statement Footer (ONLY visible on print) */}
            <div className="hidden print:flex justify-between items-center mt-12 pt-8 border-t-2 border-black text-xs text-black">
              <div>
                <p className="font-bold">StudyBridge Automated Financial &amp; Verification Audit Trail</p>
                <p className="text-[10px] text-gray-600">
                  Electronic Verification Ledger generated by System Administrator. All records correspond to verified SSLCommerz payment sessions. Includes Agency Verifications and Student Application 10% Platform Commissions.
                </p>
              </div>
              <div className="text-center w-56 border-t border-black pt-2">
                <p className="font-bold">Authorized Finance Officer</p>
                <p className="text-[10px] text-gray-600">Platform Finance &amp; Verification Dept.</p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: STUDENT APPLICATION REPORTS                                   */}
        {/* ==================================================================== */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">Application Reports</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                  Live status and details for every application submitted on the platform.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={exportCsv}
                  disabled={!data}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-lg hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined">file_download</span>
                  Export CSV
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-4 gap-card-gap">
              {loading && !data
                ? [1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 rounded-[24px] bg-surface-container-low animate-pulse" />
                  ))
                : summaryCards.map((card) => (
                    <div
                      key={card.label}
                      className="bg-surface-container-lowest p-6 rounded-[24px] ambient-shadow flex flex-col justify-between h-32 border border-surface-container"
                    >
                      <span className="material-symbols-outlined text-primary p-2 bg-primary-container/10 rounded-lg w-fit">
                        {card.icon}
                      </span>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                          {card.label}
                        </p>
                        <h3 className="text-[28px] font-bold text-primary">{card.value}</h3>
                      </div>
                    </div>
                  ))}
            </section>

            <section className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatus(f.key)}
                  className={
                    status === f.key
                      ? "px-4 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md cursor-pointer"
                      : "px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant font-label-md text-label-md hover:bg-surface-container cursor-pointer"
                  }
                >
                  {f.label}
                </button>
              ))}
            </section>

            <section className="bg-surface-container-lowest rounded-[32px] ambient-shadow border border-surface-container overflow-hidden">
              <div className="px-8 py-6 border-b border-surface-container flex justify-between items-center">
                <h4 className="font-headline-sm text-headline-sm text-primary">Applications</h4>
                <span className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-lg text-[12px]">
                  {filteredRows.length} shown
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[11px] font-extrabold tracking-widest">
                    <tr>
                      <th className="px-8 py-4">Student</th>
                      <th className="px-8 py-4">Program</th>
                      <th className="px-8 py-4">University</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-on-surface-variant">
                          Loading...
                        </td>
                      </tr>
                    ) : filteredRows.length ? (
                      filteredRows.map((row) => (
                        <tr key={row.id} className="hover:bg-surface transition-colors">
                          <td className="px-8 py-4">
                            <div className="text-body-md font-medium">{row.studentName}</div>
                            <div className="text-[11px] text-on-surface-variant">{row.studentEmail}</div>
                          </td>
                          <td className="px-8 py-4 text-body-md text-on-surface-variant">{row.programName}</td>
                          <td className="px-8 py-4 text-body-md text-on-surface-variant">{row.universityName}</td>
                          <td className="px-8 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${
                                statusTone[row.status] ?? "bg-surface-container text-on-surface-variant"
                              }`}
                            >
                              {row.status.replaceAll("_", " ")}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-body-md text-on-surface-variant">
                            {new Date(row.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-on-surface-variant">
                          No applications match this view.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}