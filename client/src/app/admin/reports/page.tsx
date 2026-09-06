"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
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
  applications: { total: number; submitted: number; underReview: number; accepted: number; rejected: number; withdrawn: number };
  rows: ReportRow[];
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
  const [data, setData] = useState<ReportData | null>(null);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

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

  const q = query.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    if (!data) return [];
    if (!q) return data.rows;
    return data.rows.filter((row) =>
      `${row.studentName} ${row.studentEmail} ${row.programName} ${row.universityName}`.toLowerCase().includes(q)
    );
  }, [data, q]);

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
    const csv = [header, ...csvRows].map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `studybridge-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

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
      <AdminSidebar />

      <header className="sticky top-0 z-40 ml-[260px] w-[calc(100%-260px)] h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-8 shadow-sm">
        <div className="flex items-center flex-1 max-w-xl">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary-container outline-none transition-all"
              placeholder="Search by student, program, or university..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-label-md text-label-md font-semibold text-primary">StudyBridge Admin</span>
        </div>
      </header>

      <main className="ml-[260px] p-container-padding space-y-gutter">
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
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
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
                  ? "px-4 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md"
                  : "px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant font-label-md text-label-md hover:bg-surface-container"
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
      </main>
    </>
  );
}