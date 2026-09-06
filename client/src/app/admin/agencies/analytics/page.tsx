"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { api } from "@/lib/api";

interface AgencyLeaderboardRow {
  userId: string;
  companyName: string;
  isVerified: boolean;
  isActive: boolean;
  totalApplications: number;
  accepted: number;
  rejected: number;
  totalStudents: number;
  acceptanceRate: number;
}

interface AgencyAnalytics {
  totalAgencies: number;
  verifiedAgencies: number;
  pendingAgencies: number;
  suspendedAgencies: number;
  totalApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  documentsRequested: number;
  acceptanceRate: number;
  statusCounts: Record<string, number>;
  conversionByCountry: { country: string; total: number; accepted: number; conversionRate: number }[];
  monthlyVolume: { month: string; count: number }[];
  agencyLeaderboard: AgencyLeaderboardRow[];
}

const STATUS: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-outline" },
  submitted: { label: "Submitted", color: "bg-secondary" },
  under_review: { label: "Under review", color: "bg-primary" },
  documents_requested: { label: "Docs requested", color: "bg-amber-500" },
  accepted: { label: "Accepted", color: "bg-emerald-500" },
  rejected: { label: "Rejected", color: "bg-error" },
  withdrawn: { label: "Withdrawn", color: "bg-outline-variant" },
};

export default function AdminAgencyAnalyticsPage() {
  const [data, setData] = useState<AgencyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AgencyAnalytics>("/api/admin/agencies/analytics")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxCountry = Math.max(1, ...(data?.conversionByCountry.map((c) => c.total) ?? [1]));
  const maxMonth = Math.max(1, ...(data?.monthlyVolume.map((m) => m.count) ?? [1]));

  const metrics = data
    ? [
        { label: "Total Agencies", value: data.totalAgencies, icon: "business_center", tone: "bg-primary-container text-on-primary-container" },
        { label: "Verified", value: data.verifiedAgencies, icon: "verified", tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
        { label: "Pending", value: data.pendingAgencies, icon: "pending_actions", tone: "bg-secondary-fixed text-on-secondary-fixed" },
        { label: "Suspended", value: data.suspendedAgencies, icon: "block", tone: "bg-error-container text-on-error-container" },
      ]
    : [];

  return (
    <>
      <AdminSidebar />

      <header className="flex justify-between items-center h-16 px-8 ml-[260px] w-[calc(100%-260px)] fixed top-0 bg-surface z-40 border-b border-outline-variant shadow-sm">
        <div>
          <p className="text-label-md uppercase tracking-[.16em] text-on-surface-variant font-bold">Administration</p>
          <h2 className="font-headline-sm text-headline-sm font-semibold text-primary">Agency Analytics</h2>
        </div>
        <Link href="/admin/agencies" className="text-sm font-bold text-primary hover:underline">
          Back to agency approvals
        </Link>
      </header>

      <main className="ml-[260px] pt-24 px-8 pb-8 min-h-screen bg-surface-container-low">
        <div className="max-w-[1500px] mx-auto space-y-6">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Agency Performance</h1>
            <p className="text-on-surface-variant mt-1">
              Platform-wide application volume and acceptance across every agency partner.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-3xl bg-surface-container-lowest animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {metrics.map((m) => (
                  <div key={m.label} className="rounded-3xl p-6 bg-surface-container-lowest border border-outline-variant/20 ambient-shadow">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${m.tone}`}>
                      <span className="material-symbols-outlined">{m.icon}</span>
                    </div>
                    <p className="mt-5 text-sm text-on-surface-variant">{m.label}</p>
                    <p className="mt-1 text-3xl font-bold text-on-surface">{m.value}</p>
                  </div>
                ))}
              </section>

              {data?.totalAgencies === 0 ? (
                <section className="rounded-3xl bg-surface-container-lowest border border-outline-variant/20 p-12 text-center">
                  <span className="material-symbols-outlined text-primary text-5xl">insights</span>
                  <h2 className="font-headline-sm text-on-surface mt-4">No agencies yet</h2>
                  <p className="text-on-surface-variant mt-2">
                    Agency performance will appear here once agencies sign up and get linked to students.
                  </p>
                </section>
              ) : (
                <>
                  <section className="grid grid-cols-1 xl:grid-cols-12 gap-card-gap">
                    <div className="xl:col-span-7 rounded-3xl bg-surface-container-lowest border border-outline-variant/20 ambient-shadow p-7">
                      <div className="flex justify-between gap-4 mb-7">
                        <div>
                          <h2 className="font-headline-sm text-on-surface">Applications by destination</h2>
                          <p className="text-sm text-on-surface-variant mt-1">Volume and acceptance rate by country, across all agencies.</p>
                        </div>
                        <span className="px-3 py-1.5 h-fit rounded-full bg-surface-container-low text-primary text-xs font-bold">Top markets</span>
                      </div>
                      <div className="space-y-5">
                        {data?.conversionByCountry.length ? (
                          data.conversionByCountry.map((country) => (
                            <div key={country.country}>
                              <div className="flex justify-between gap-3 text-sm mb-2">
                                <span className="font-bold text-on-surface">{country.country}</span>
                                <span className="text-on-surface-variant">
                                  {country.accepted}/{country.total} accepted · <b className="text-primary">{country.conversionRate}%</b>
                                </span>
                              </div>
                              <div className="h-2.5 rounded-full bg-surface-container-low overflow-hidden">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${(country.total / maxCountry) * 100}%` }} />
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-on-surface-variant font-body-md">No application data yet.</p>
                        )}
                      </div>
                    </div>

                    <div className="xl:col-span-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/20 ambient-shadow p-7">
                      <h2 className="font-headline-sm text-on-surface">Pipeline health</h2>
                      <p className="text-sm text-on-surface-variant mt-1 mb-6">Current application stage breakdown, platform-wide.</p>
                      <div className="space-y-4">
                        {Object.entries(STATUS)
                          .filter(([key]) => (data?.statusCounts[key] ?? 0) > 0)
                          .map(([key, meta]) => (
                            <div key={key} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className={`w-2.5 h-2.5 rounded-full ${meta.color}`} />
                                <span className="text-sm text-on-surface">{meta.label}</span>
                              </div>
                              <span className="font-bold text-on-surface">{data?.statusCounts[key]}</span>
                            </div>
                          ))}
                      </div>
                      <div className="mt-7 pt-5 border-t border-outline-variant/20 flex justify-between">
                        <span className="text-sm text-on-surface-variant">Documents need review</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">{data?.documentsRequested}</span>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-3xl bg-surface-container-lowest border border-outline-variant/20 ambient-shadow p-7">
                    <h2 className="font-headline-sm text-on-surface mb-2">Monthly application volume</h2>
                    <p className="text-sm text-on-surface-variant mb-7">Applications created over time, across all agency-linked students.</p>
                    {data?.monthlyVolume.length ? (
                      <div className="h-48 flex items-end gap-3 border-b border-outline-variant/30 pb-1">
                        {data.monthlyVolume.map((month) => (
                          <div key={month.month} className="group flex-1 min-w-10 h-full flex flex-col justify-end items-center gap-2">
                            <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">{month.count}</span>
                            <div
                              className="w-full max-w-12 bg-primary rounded-t-xl min-h-2 hover:bg-secondary transition-colors"
                              style={{ height: `${Math.max(8, (month.count / maxMonth) * 100)}%` }}
                            />
                            <span className="text-[10px] text-on-surface-variant whitespace-nowrap">{month.month.slice(5)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-on-surface-variant font-body-md">No data yet.</p>
                    )}
                  </section>

                  <section className="rounded-3xl bg-surface-container-lowest border border-outline-variant/20 ambient-shadow overflow-hidden">
                    <div className="px-8 py-6 border-b border-surface-container flex justify-between items-center">
                      <h2 className="font-headline-sm text-on-surface">Agency leaderboard</h2>
                      <span className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-lg text-[12px]">
                        {data?.agencyLeaderboard.length ?? 0} agencies
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[11px] font-extrabold tracking-widest">
                          <tr>
                            <th className="px-8 py-4">Agency</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4">Students</th>
                            <th className="px-8 py-4">Applications</th>
                            <th className="px-8 py-4">Accepted</th>
                            <th className="px-8 py-4">Acceptance Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container">
                          {data?.agencyLeaderboard.map((agency) => (
                            <tr key={agency.userId} className="hover:bg-surface transition-colors">
                              <td className="px-8 py-4 font-medium text-on-surface">{agency.companyName}</td>
                              <td className="px-8 py-4">
                                <div className="flex gap-2 flex-wrap">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                      agency.isVerified ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {agency.isVerified ? "Verified" : "Pending"}
                                  </span>
                                  {!agency.isActive && (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-error-container text-on-error-container">
                                      Suspended
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-8 py-4 text-on-surface-variant">{agency.totalStudents}</td>
                              <td className="px-8 py-4 text-on-surface-variant">{agency.totalApplications}</td>
                              <td className="px-8 py-4 text-on-surface-variant">{agency.accepted}</td>
                              <td className="px-8 py-4 font-bold text-primary">{agency.acceptanceRate}%</td>
                            </tr>
                          ))}
                          {!data?.agencyLeaderboard.length && (
                            <tr>
                              <td colSpan={6} className="p-10 text-center text-on-surface-variant">
                                No agencies to show yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}