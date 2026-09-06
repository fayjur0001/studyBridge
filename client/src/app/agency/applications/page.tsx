"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AgencySidebar from "@/components/dashboard/AgencySidebar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { ApplicationStatus } from "@/lib/types";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";

interface AgencyApplication {
  id: string;
  status: ApplicationStatus;
  intake: string | null;
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

const STATUS_OPTIONS: ApplicationStatus[] = ["under_review", "documents_requested", "accepted", "rejected"];

export default function AgencyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<AgencyApplication[]>([]);
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  async function handleStatusChange(id: string, status: ApplicationStatus) {
    setUpdatingId(id);
    try {
      await api.patch(`/api/agency/applications/${id}/status`, { status });
      load();
    } finally {
      setUpdatingId(null);
    }
  }

  const stats_ = [
    { icon: "assignment", label: "Total Applications", value: stats?.totalApplications ?? 0, tone: "bg-secondary-fixed text-on-secondary-container" },
    { icon: "hourglass_top", label: "Under Review", value: stats?.underReview ?? 0, tone: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
    { icon: "task_alt", label: "Accepted", value: stats?.accepted ?? 0, tone: "bg-primary-fixed text-on-primary-fixed-variant" },
    { icon: "warning", label: "Documents Requested", value: stats?.documentsRequested ?? 0, tone: "bg-error-container text-on-error-container" },
  ];

  return (
    <>
      <AgencySidebar />

      <header className="sticky top-0 w-full z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center px-gutter py-4 h-20 ml-[260px] w-[calc(100%-260px)]">
        <div className="flex items-center gap-8">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl w-[320px] focus:ring-2 focus:ring-primary/20 font-body-md text-body-md transition-all"
              placeholder="Search by student, program..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <div className="h-8 w-[1px] bg-outline-variant/30"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-label-md text-label-md font-bold text-on-surface">{user?.fullName ?? "..."}</p>
              <p className="font-label-md text-label-md text-on-surface-variant text-[10px]">Agency Partner</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
              {user?.fullName?.[0] ?? "A"}
            </div>
          </div>
        </div>
      </header>

      <main className="ml-[260px] p-margin-desktop min-h-screen">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-1">Applications</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Track every application your students have submitted, across every stage.
            </p>
          </div>
        </div>

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

        <div className="bg-surface-container-lowest p-container-padding rounded-[24px] ambient-card border border-outline-variant/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="pb-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Student</th>
                  <th className="pb-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Program / University</th>
                  <th className="pb-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="pb-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {!loading && applications.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-on-surface-variant font-body-md">
                      No applications from your students yet.
                    </td>
                  </tr>
                )}
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {a.studentName?.[0] ?? "S"}
                        </div>
                        <div>
                          <p className="font-label-md text-label-md font-bold">{a.studentName}</p>
                          <p className="font-body-md text-body-md text-on-surface-variant">{a.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5">
                      <p className="font-label-md text-label-md font-medium">{a.programName}</p>
                      <p className="font-body-md text-body-md text-on-surface-variant">{a.universityName}</p>
                    </td>
                    <td className="py-5">
                      <ApplicationStatusBadge status={a.status} />
                    </td>
                    <td className="py-5 text-right">
                      <select
                        className="bg-surface-container-low border-none rounded-lg font-label-md text-label-md focus:ring-primary/20 disabled:opacity-50"
                        value=""
                        disabled={updatingId === a.id}
                        onChange={(e) => e.target.value && handleStatusChange(a.id, e.target.value as ApplicationStatus)}
                      >
                        <option value="">Change status...</option>
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="ml-[260px] bg-surface-container-lowest border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center px-margin-desktop py-gutter">
        <div className="mb-4 md:mb-0">
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary">StudyBridge</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">© 2024 StudyBridge Global Education. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>
          <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="/terms">Terms of Service</Link>
          <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="/contact">Contact Support</Link>
        </div>
      </footer>
    </>
  );
}
