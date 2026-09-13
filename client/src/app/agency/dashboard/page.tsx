"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AgencySidebar from "@/components/dashboard/AgencySidebar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import AgencyNotificationBell from "@/components/agency/AgencyNotificationBell";

interface UrgentTask {
  id: string;
  title: string;
  description: string;
  type: "warning" | "info" | "alert";
  count: number;
  link: string;
}

interface RecentApplication {
  id: string;
  studentName: string;
  studentEmail: string;
  programName: string;
  universityName: string;
  status: string;
  paymentStatus: string;
  agencyShare: string;
  applicationFee: string;
  createdAt: string;
  paidAt: string | null;
}

interface AgencyStats {
  totalStudents: number;
  totalApplications: number;
  underReview: number;
  accepted: number;
  rejected: number;
  documentsRequested: number;
  submitted: number;
  draft: number;
  totalRevenue: number;
  grossTurnover: number;
  platformCommission: number;
  paidApplications: number;
  pendingPaymentApplications: number;
  successRate: number;
  urgentTasks: UrgentTask[];
  recentApplications: RecentApplication[];
}

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  draft: {
    label: "Draft",
    badgeClass: "bg-surface-container-high text-on-surface-variant",
  },
  submitted: {
    label: "Submitted",
    badgeClass: "bg-secondary-fixed text-on-secondary-fixed",
  },
  under_review: {
    label: "Under Review",
    badgeClass: "bg-primary-fixed text-on-primary-fixed-variant font-medium",
  },
  documents_requested: {
    label: "Docs Requested",
    badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium",
  },
  accepted: {
    label: "Accepted 🎉",
    badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold",
  },
  rejected: {
    label: "Rejected",
    badgeClass: "bg-error/15 text-error font-medium",
  },
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function AgencyDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AgencyStats>("/api/agency/dashboard/stats")
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Compute maximum count for relative bar widths in pipeline
  const pipelineMax = Math.max(
    1,
    stats?.totalStudents ?? 0,
    stats?.totalApplications ?? 0
  );

  return (
    <>
      <AgencySidebar />

      {/* Top Navigation */}
      <header className="ml-[260px] h-20 bg-surface/80 dark:bg-[#17181d]/95 backdrop-blur-md sticky top-0 z-40 px-gutter flex items-center justify-between border-b border-outline-variant/20 dark:border-white/10">
        <div className="flex items-center gap-8">
          <div className="relative">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline"
              data-icon="search"
            >
              search
            </span>
            <input
              className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl w-[320px] focus:ring-2 focus:ring-primary/20 font-body-md text-body-md transition-all"
              placeholder="Search students, programs..."
              type="text"
            />
          </div>
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors"
              href="/universities"
            >
              Directory
            </Link>
            <Link
              className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors"
              href="/agency/analytics"
            >
              Analytics
            </Link>
            <Link
              className="font-body-lg text-body-lg text-on-surface-variant hover:text-primary transition-colors"
              href="/contact"
            >
              Help
            </Link>
          </nav>
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

      {/* Main Content Area */}
      <main className="ml-[260px] p-margin-desktop min-h-screen bg-background dark:bg-[#101115] text-on-background">
        {/* Greeting & Primary Action */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-1">
              Agency Dashboard
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Welcome back, {user?.fullName?.split(" ")[0] ?? ""}. Here&apos;s
              what&apos;s happening with your students today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/agency/applications"
              className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg active:scale-95"
            >
              <span className="material-symbols-outlined" data-icon="assignment">
                assignment
              </span>
              Review Applications
            </Link>
          </div>
        </div>

        {/* High-Level Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-card-gap mb-8">
          {/* Stat 1: Total Students */}
          <div className="bg-surface-container-lowest dark:bg-[#1b1c20] p-container-padding rounded-[24px] ambient-card border border-outline-variant/20 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-on-secondary-container"
                  data-icon="group"
                >
                  group
                </span>
              </div>
              <span className="text-on-secondary-fixed-variant font-label-md text-label-md bg-secondary-fixed/30 px-2.5 py-1 rounded-full font-semibold">
                Linked
              </span>
            </div>
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-1">
              Total Students
            </h3>
            <p className="font-headline-lg text-headline-lg text-on-surface font-bold">
              {stats?.totalStudents ?? 0}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Active registered students
            </p>
          </div>

          {/* Stat 2: Active Applications */}
          <div className="bg-surface-container-lowest dark:bg-[#1b1c20] p-container-padding rounded-[24px] ambient-card border border-outline-variant/20 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-on-primary-fixed-variant"
                  data-icon="assignment"
                >
                  assignment
                </span>
              </div>
              <span className="text-on-primary-fixed-variant font-label-md text-label-md bg-primary-fixed/30 px-2.5 py-1 rounded-full font-semibold">
                Pipeline
              </span>
            </div>
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-1">
              Total Applications
            </h3>
            <p className="font-headline-lg text-headline-lg text-on-surface font-bold">
              {stats?.totalApplications ?? 0}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              {stats?.underReview ?? 0} currently under review
            </p>
          </div>

          {/* Stat 3: Real Agency Revenue */}
          <div className="bg-surface-container-lowest dark:bg-[#1b1c20] p-container-padding rounded-[24px] ambient-card border border-outline-variant/20 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-emerald-600 dark:text-emerald-400"
                  data-icon="payments"
                >
                  payments
                </span>
              </div>
              <span className="text-emerald-700 dark:text-emerald-300 font-label-md text-label-md bg-emerald-500/15 px-2.5 py-1 rounded-full font-bold">
                90% Net Share
              </span>
            </div>
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-1">
              Total Agency Revenue
            </h3>
            <p className="font-headline-lg text-headline-lg text-on-surface font-bold">
              ৳{(stats?.totalRevenue ?? 0).toLocaleString()}{" "}
              <span className="text-xs font-semibold text-on-surface-variant">
                BDT
              </span>
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              {stats?.paidApplications ?? 0} paid application
              {(stats?.paidApplications ?? 0) === 1 ? "" : "s"} (৳2,700/app)
            </p>
          </div>

          {/* Stat 4: Dynamic Success Rate */}
          <div className="bg-surface-container-lowest dark:bg-[#1b1c20] p-container-padding rounded-[24px] ambient-card border border-outline-variant/20 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-primary"
                  data-icon="verified"
                >
                  verified
                </span>
              </div>
              <span className="text-primary font-label-md text-label-md bg-primary-fixed/30 px-2.5 py-1 rounded-full font-bold">
                {stats?.accepted ?? 0} Admitted
              </span>
            </div>
            <h3 className="font-label-md text-label-md text-on-surface-variant mb-1">
              Success Rate
            </h3>
            <p className="font-headline-lg text-headline-lg text-on-surface font-bold">
              {stats?.successRate ?? 0}%
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              {stats?.totalApplications
                ? `${stats.accepted} of ${stats.totalApplications} accepted`
                : "No applications yet"}
            </p>
          </div>
        </div>

        {/* Financial & Commission Summary Card */}
        <div className="mb-10 bg-surface-container-lowest dark:bg-[#1b1c20] p-6 rounded-[24px] border border-outline-variant/20 dark:border-white/10 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  account_balance_wallet
                </span>
                Agency Earnings & Revenue Breakdown
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                Standard student processing fee: ৳3,000 BDT · Net agency earnings: 90% (৳2,700) · Platform retained: 10% (৳300)
              </p>
            </div>
            <Link
              href="/agency/applications"
              className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-primary flex items-center gap-1.5 transition-colors self-start md:self-auto"
            >
              <span>Application Records</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Net Agency Revenue (90%)
              </p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                ৳{(stats?.totalRevenue ?? 0).toLocaleString()}{" "}
                <span className="text-xs font-normal">BDT</span>
              </p>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Your direct earnings from paid applications
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-primary-fixed/20 dark:bg-primary-950/20 border border-primary/20">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">
                Gross Fee Volume
              </p>
              <p className="text-2xl font-bold text-on-surface mt-1">
                ৳{(stats?.grossTurnover ?? 0).toLocaleString()}{" "}
                <span className="text-xs font-normal text-on-surface-variant">
                  BDT
                </span>
              </p>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Total application fees paid by students
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Platform Commission (10%)
              </p>
              <p className="text-2xl font-bold text-on-surface mt-1">
                ৳{(stats?.platformCommission ?? 0).toLocaleString()}{" "}
                <span className="text-xs font-normal text-on-surface-variant">
                  BDT
                </span>
              </p>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Platform service & infrastructure fee
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Payment Breakdown
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats?.paidApplications ?? 0} Paid
                </span>
                <span className="text-xs text-on-surface-variant">
                  / {stats?.pendingPaymentApplications ?? 0} Pending
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1">
                {stats?.totalApplications ?? 0} total applications
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-card-gap">
          {/* Student Pipeline Chart Container (Dynamic) */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest dark:bg-[#1b1c20] p-container-padding rounded-[24px] ambient-card border border-outline-variant/20 dark:border-white/10 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                  Student Pipeline
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Live progression across key application stages
                </p>
              </div>
              <span className="px-3 py-1 bg-surface-container-low text-xs font-bold text-primary rounded-full">
                Live Data
              </span>
            </div>

            {/* Dynamic Pipeline Progress Bars */}
            <div className="flex-1 flex flex-col justify-between mt-2 space-y-6">
              {/* Registered Students */}
              <div className="group cursor-default">
                <div className="flex justify-between mb-2">
                  <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      group
                    </span>
                    Registered / Linked Students
                  </span>
                  <span className="font-label-md text-label-md font-bold text-primary">
                    {stats?.totalStudents ?? 0} Students
                  </span>
                </div>
                <div className="h-3.5 w-full bg-secondary-fixed/50 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary transition-all duration-700 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          12,
                          Math.round(
                            ((stats?.totalStudents ?? 0) / pipelineMax) * 100
                          )
                        )
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Total Applications Submitted */}
              <div className="group cursor-default">
                <div className="flex justify-between mb-2">
                  <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      send
                    </span>
                    Applications Submitted
                  </span>
                  <span className="font-label-md text-label-md font-bold text-primary">
                    {stats?.totalApplications ?? 0} Applications
                  </span>
                </div>
                <div className="h-3.5 w-full bg-primary-fixed/40 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-700 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          12,
                          Math.round(
                            ((stats?.totalApplications ?? 0) / pipelineMax) * 100
                          )
                        )
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Under Review */}
              <div className="group cursor-default">
                <div className="flex justify-between mb-2">
                  <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-amber-500">
                      hourglass_top
                    </span>
                    Under Review by Universities
                  </span>
                  <span className="font-label-md text-label-md font-bold text-amber-600 dark:text-amber-400">
                    {stats?.underReview ?? 0} In Progress
                  </span>
                </div>
                <div className="h-3.5 w-full bg-amber-500/10 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-700 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          8,
                          Math.round(
                            ((stats?.underReview ?? 0) / pipelineMax) * 100
                          )
                        )
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Final Acceptance */}
              <div className="group cursor-default">
                <div className="flex justify-between mb-2">
                  <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-500">
                      check_circle
                    </span>
                    Admitted / Offer Received
                  </span>
                  <span className="font-label-md text-label-md font-bold text-emerald-600 dark:text-emerald-400">
                    {stats?.accepted ?? 0} Offers
                  </span>
                </div>
                <div className="h-3.5 w-full bg-emerald-500/10 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-700 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          8,
                          Math.round(
                            ((stats?.accepted ?? 0) / pipelineMax) * 100
                          )
                        )
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-outline-variant/30 flex flex-wrap gap-6 text-xs text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-secondary rounded-full"></span>
                  <span>Registered Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-primary rounded-full"></span>
                  <span>Applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                  <span>Reviewing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                  <span>Admitted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Support Banner & Real Urgent Tasks */}
          <div className="col-span-12 lg:col-span-4 space-y-card-gap">
            {/* Help / Support Card */}
            <div className="bg-primary p-container-padding rounded-[24px] shadow-xl relative overflow-hidden h-[200px]">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-surface-container-lowest mb-1">
                    Need Guidance?
                  </h3>
                  <p className="font-body-md text-body-md text-primary-fixed-dim opacity-90 text-xs">
                    Our platform support team is available 24/7 for agency partner assistance.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="bg-surface-container-lowest text-primary px-4 py-2 rounded-lg font-label-md text-label-md font-bold w-fit hover:bg-primary-fixed transition-colors text-xs"
                >
                  Contact Support
                </Link>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute right-4 top-4 opacity-20">
                <span
                  className="material-symbols-outlined text-[100px]"
                  data-icon="support_agent"
                >
                  support_agent
                </span>
              </div>
            </div>

            {/* Dynamic Urgent Tasks Card */}
            <div className="bg-surface-container-lowest dark:bg-[#1b1c20] p-container-padding rounded-[24px] ambient-card border border-outline-variant/20 dark:border-white/10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Urgent Tasks
                </h3>
                {stats?.urgentTasks && stats.urgentTasks.length > 0 ? (
                  <span className="w-6 h-6 bg-error text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                    {stats.urgentTasks.length}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                    Clear
                  </span>
                )}
              </div>

              {stats?.urgentTasks && stats.urgentTasks.length > 0 ? (
                <div className="space-y-3">
                  {stats.urgentTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={task.link}
                      className={`block p-3.5 rounded-xl border transition-all hover:scale-[1.01] ${
                        task.type === "warning"
                          ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15"
                          : task.type === "alert"
                          ? "bg-error/10 border-error/20 hover:bg-error/15"
                          : "bg-surface-container-low border-outline-variant/20 hover:bg-surface-container"
                      }`}
                    >
                      <div className="flex gap-3">
                        <span
                          className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                            task.type === "warning"
                              ? "text-amber-600 dark:text-amber-400"
                              : task.type === "alert"
                              ? "text-error"
                              : "text-primary"
                          }`}
                        >
                          {task.type === "warning"
                            ? "warning"
                            : task.type === "alert"
                            ? "priority_high"
                            : "info"}
                        </span>
                        <div>
                          <p className="font-label-md text-label-md font-bold text-on-surface text-xs">
                            {task.title} ({task.count})
                          </p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                            {task.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href="/agency/applications"
                    className="block w-full py-2.5 text-center font-label-md text-label-md text-primary font-bold hover:bg-primary-fixed/30 rounded-xl transition-all text-xs"
                  >
                    Review All Applications
                  </Link>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/15 text-center space-y-2">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-3xl">
                    task_alt
                  </span>
                  <p className="font-label-md font-bold text-on-surface text-xs">
                    All caught up!
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    No pending document reviews or urgent application blockers.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Student Activity (Live Database Table) */}
          <div className="col-span-12 bg-surface-container-lowest dark:bg-[#1b1c20] p-container-padding rounded-[24px] ambient-card border border-outline-variant/20 dark:border-white/10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Recent Student Activity
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Track real-time progress and payment status of your applicants
                </p>
              </div>
              <Link
                href="/agency/applications"
                className="text-primary font-label-md text-label-md font-bold hover:underline text-xs"
              >
                View All Applications
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-xs">
                    <th className="pb-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="pb-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      Program / University
                    </th>
                    <th className="pb-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      Admission Status
                    </th>
                    <th className="pb-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      Agency Fee (90%)
                    </th>
                    <th className="pb-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="pb-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-sm">
                  {stats?.recentApplications &&
                  stats.recentApplications.length > 0 ? (
                    stats.recentApplications.map((app) => {
                      const cfg =
                        STATUS_CONFIG[app.status] || {
                          label: app.status,
                          badgeClass:
                            "bg-surface-container-high text-on-surface-variant",
                        };
                      const isPaid = app.paymentStatus === "paid";
                      return (
                        <tr
                          key={app.id}
                          className="hover:bg-surface-container-low/40 transition-colors"
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                                {app.studentName?.[0] ?? "S"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-label-md text-label-md font-bold text-on-surface truncate">
                                  {app.studentName}
                                </p>
                                <p className="font-body-md text-body-md text-on-surface-variant text-xs truncate">
                                  {app.studentEmail}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <p className="font-label-md text-label-md font-medium text-on-surface truncate max-w-xs">
                              {app.programName}
                            </p>
                            <p className="font-body-md text-body-md text-on-surface-variant text-xs truncate max-w-xs">
                              {app.universityName}
                            </p>
                          </td>
                          <td className="py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${cfg.badgeClass}`}
                            >
                              {cfg.label}
                            </span>
                          </td>
                          <td className="py-4">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                                <span className="material-symbols-outlined text-[14px]">
                                  check_circle
                                </span>
                                ৳{Number(app.agencyShare || 2700).toLocaleString()} Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                <span className="material-symbols-outlined text-[14px]">
                                  schedule
                                </span>
                                Pending Payment
                              </span>
                            )}
                          </td>
                          <td className="py-4 font-body-md text-body-md text-on-surface-variant text-xs">
                            {formatDate(app.createdAt)}
                          </td>
                          <td className="py-4 text-right">
                            <Link
                              href={`/agency/applications`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs font-bold text-primary transition-colors"
                            >
                              <span>Manage</span>
                              <span className="material-symbols-outlined text-[14px]">
                                open_in_new
                              </span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-on-surface-variant text-sm"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-4xl text-outline">
                            inbox
                          </span>
                          <p className="font-semibold">No applications yet</p>
                          <p className="text-xs text-on-surface-variant max-w-sm">
                            When students apply to universities through your agency, their live progress and fee earnings will appear here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Shell */}
      <footer className="ml-[260px] bg-surface-container-lowest dark:bg-[#17181d] border-t border-outline-variant/30 dark:border-white/10 flex flex-col md:flex-row justify-between items-center px-margin-desktop py-gutter">
        <div className="mb-4 md:mb-0">
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
            StudyBridge
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant text-xs">
            © {new Date().getFullYear()} StudyBridge Global Education. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors text-xs"
            href="/privacy"
          >
            Privacy Policy
          </Link>
          <Link
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors text-xs"
            href="/terms"
          >
            Terms of Service
          </Link>
          <Link
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors text-xs"
            href="/contact"
          >
            Contact Support
          </Link>
        </div>
      </footer>
    </>
  );
}
