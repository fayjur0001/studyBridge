"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import { api, ApiError } from "@/lib/api";
import { universityImage } from "@/lib/university-images";
import { ApplyModal } from "@/components/applications/ApplyModal";
import { Program, University } from "@/lib/types";

export interface DocumentSignal {
  status: "matched" | "missing" | "neutral";
  text: string;
}

export interface Recommendation {
  programId: string;
  programName: string;
  degreeLevel: string;
  field: string | null;
  tuitionFeeUsd: string | null;
  durationMonths: number | null;
  description: string | null;
  universityId: string;
  universityName: string;
  country: string;
  city: string | null;
  ranking: number | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  matchScore: number;
  tier: "reach" | "best_match" | "safe";
  reasons: string[];
  documentSignals: DocumentSignal[];
  scholarships: {
    id: string;
    title: string;
    coveragePercent: number | null;
    amountUsd: string | null;
    category: string | null;
  }[];
  suggestedAgencies: {
    userId: string;
    companyName: string;
    isDirectPartner: boolean;
    isCountrySpecialist: boolean;
  }[];
  alreadyApplied: boolean;
}

interface RecommendationsResponse {
  hasPreferences: boolean;
  studentProfile: {
    fullName: string;
    gpa: string | null;
    currentEducationLevel: string | null;
    nationality: string | null;
    preferredCountries: string[];
    preferredFields: string[];
    bio: string | null;
  };
  documentFactors: {
    totalDocuments: number;
    hasTranscript: boolean;
    hasTestScore: boolean;
    hasPassport: boolean;
    hasSOP: boolean;
    hasRecommendation: boolean;
    hasPortfolio: boolean;
    readinessScore: number;
    uploadedTypes: string[];
    missingTypes: string[];
  };
  data: Recommendation[];
}

type FilterTier = "all" | "best_match" | "reach" | "safe" | "scholarships";

export default function RecommendationsPage() {
  const router = useRouter();
  const [data, setData] = useState<Recommendation[]>([]);
  const [documentFactors, setDocumentFactors] = useState<RecommendationsResponse["documentFactors"] | null>(null);
  const [studentProfile, setStudentProfile] = useState<RecommendationsResponse["studentProfile"] | null>(null);
  const [hasPreferences, setHasPreferences] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTier, setActiveTier] = useState<FilterTier>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"match" | "ranking" | "tuition">("match");

  // ApplyModal State
  const [selectedProgramForApply, setSelectedProgramForApply] = useState<Program | null>(null);
  const [selectedUniversityForApply, setSelectedUniversityForApply] = useState<University | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  function loadRecommendations() {
    setLoading(true);
    api
      .get<RecommendationsResponse>("/api/student/recommendations")
      .then((res) => {
        setData(res.data || []);
        setDocumentFactors(res.documentFactors || null);
        setStudentProfile(res.studentProfile || null);
        setHasPreferences(res.hasPreferences);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadRecommendations();
  }, []);

  function handleOpenApply(rec: Recommendation) {
    setApplyError(null);
    const prog: Program = {
      id: rec.programId,
      universityId: rec.universityId,
      name: rec.programName,
      degreeLevel: rec.degreeLevel,
      field: rec.field,
      durationMonths: rec.durationMonths,
      tuitionFeeUsd: rec.tuitionFeeUsd,
      intakeMonths: [],
      description: rec.description,
    };

    const univ: University = {
      id: rec.universityId,
      name: rec.universityName,
      country: rec.country,
      city: rec.city,
      region: "",
      ranking: rec.ranking,
      coverImageUrl: rec.coverImageUrl,
      logoUrl: rec.logoUrl,
      websiteUrl: null,
      description: null,
      admissionRequirements: null,
      applicationStartDate: null,
      applicationDeadline: null,
      galleryImageUrls: [],
      isFeatured: false,
    };

    setSelectedProgramForApply(prog);
    setSelectedUniversityForApply(univ);
    setIsApplyModalOpen(true);
  }

  async function handleConfirmApply(agencyId: string | null) {
    if (!selectedProgramForApply) return;
    setApplying(true);
    setApplyError(null);
    try {
      const application = await api.post<{ id: string }>("/api/applications", {
        programId: selectedProgramForApply.id,
        agencyId: agencyId || undefined,
      });
      setIsApplyModalOpen(false);
      router.push(`/student/applications/${application.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setApplyError("You already have an active application for this program.");
      } else {
        setApplyError(err instanceof ApiError ? err.message : "Could not start application.");
      }
    } finally {
      setApplying(false);
    }
  }

  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        // Tier filter
        if (activeTier === "scholarships") {
          if (!item.scholarships || item.scholarships.length === 0) return false;
        } else if (activeTier !== "all") {
          if (item.tier !== activeTier) return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            item.programName.toLowerCase().includes(q) ||
            item.universityName.toLowerCase().includes(q) ||
            item.country.toLowerCase().includes(q) ||
            (item.field || "").toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "ranking") {
          return (a.ranking ?? 9999) - (b.ranking ?? 9999);
        }
        if (sortBy === "tuition") {
          const tA = parseFloat(a.tuitionFeeUsd || "0");
          const tB = parseFloat(b.tuitionFeeUsd || "0");
          return tA - tB;
        }
        return b.matchScore - a.matchScore;
      });
  }, [data, activeTier, searchQuery, sortBy]);

  const top = filteredData[0];
  const rest = filteredData.slice(1);

  return (
    <>
      <StudentSidebar />

      <main className="ml-[260px] min-h-screen bg-background text-on-background pb-16">
        {/* Top Header */}
        <header className="flex justify-between items-center w-full px-margin-desktop h-16 sticky top-0 z-40 bg-surface-container-lowest shadow-[0px_2px_4px_rgba(0,0,0,0.02)] border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">auto_awesome</span>
            <h2 className="font-headline-sm font-bold text-primary">
              AI Program Matcher & Admissions Advisory
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-7 w-[1px] bg-outline-variant/30 hidden sm:block" />
            <div className="text-right hidden sm:block">
              <p className="font-label-md font-bold text-on-surface leading-tight">
                {studentProfile?.fullName ?? "Student"}
              </p>
              <p className="text-[11px] text-outline">
                {studentProfile?.gpa ? `GPA ${studentProfile.gpa}/4.0` : "Profile Active"}
              </p>
            </div>
          </div>
        </header>

        <div className="p-margin-desktop space-y-8 max-w-[1400px] mx-auto w-full">
          {/* AI Analysis Summary Bar (Document Readiness & Profile Signals) */}
          <section className="bg-gradient-to-r from-primary-container/20 via-surface-container-lowest to-secondary-container/15 rounded-3xl p-6 border border-primary/20 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Column: Readiness Score & Core Documents */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs">
                    AI
                  </span>
                  <h3 className="font-headline-sm font-bold text-primary">
                    Document & Profile Readiness Analysis
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                    {documentFactors?.readinessScore ?? 0}% Ready
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md h-2.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${documentFactors?.readinessScore ?? 10}%` }}
                  />
                </div>

                {/* Document Status Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* Transcript */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${
                      documentFactors?.hasTranscript
                        ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                        : "bg-surface-container-high text-outline border border-outline-variant/30"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {documentFactors?.hasTranscript ? "check_circle" : "pending"}
                    </span>
                    Transcript {studentProfile?.gpa ? `(GPA ${studentProfile.gpa})` : ""}
                  </span>

                  {/* Passport */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${
                      documentFactors?.hasPassport
                        ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                        : "bg-surface-container-high text-outline border border-outline-variant/30"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {documentFactors?.hasPassport ? "check_circle" : "pending"}
                    </span>
                    Passport / ID
                  </span>

                  {/* Test Score */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${
                      documentFactors?.hasTestScore
                        ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {documentFactors?.hasTestScore ? "check_circle" : "warning"}
                    </span>
                    {documentFactors?.hasTestScore ? "IELTS / Test Score" : "Test Score (Pending)"}
                  </span>

                  {/* Statement of Purpose */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${
                      documentFactors?.hasSOP
                        ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                        : "bg-surface-container-high text-outline border border-outline-variant/30"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {documentFactors?.hasSOP ? "check_circle" : "note_add"}
                    </span>
                    Statement of Purpose
                  </span>

                  <Link
                    href="/student/documents"
                    className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-0.5 ml-1"
                  >
                    Manage Vault
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Profile Summary & Edit Action */}
              <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shrink-0 flex flex-col justify-between gap-3 sm:min-w-[280px]">
                <div className="space-y-1 text-xs">
                  <p className="text-outline uppercase tracking-wider font-bold text-[10px]">
                    Evaluated Academic Profile
                  </p>
                  <p className="text-on-surface font-semibold">
                    Level: <span className="font-bold text-primary">{studentProfile?.currentEducationLevel || "Not set"}</span>
                  </p>
                  <p className="text-on-surface-variant truncate">
                    Countries:{" "}
                    <span className="text-on-surface font-medium">
                      {studentProfile?.preferredCountries?.length
                        ? studentProfile.preferredCountries.join(", ")
                        : "Any country"}
                    </span>
                  </p>
                  <p className="text-on-surface-variant truncate">
                    Field:{" "}
                    <span className="text-on-surface font-medium">
                      {studentProfile?.preferredFields?.length
                        ? studentProfile.preferredFields.join(", ")
                        : "All fields"}
                    </span>
                  </p>
                </div>

                <Link
                  href="/student/profile"
                  className="w-full text-center py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors"
                >
                  Edit Profile & Preferences
                </Link>
              </div>
            </div>
          </section>

          {/* Missing Documents Guidance Notice */}
          {documentFactors && documentFactors.missingTypes.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 text-[22px] shrink-0 mt-0.5">
                tips_and_updates
              </span>
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Boost Your Admission & Scholarship Chances
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  You have not yet uploaded: <span className="font-semibold text-on-surface">{documentFactors.missingTypes.join(", ")}</span>.
                  Uploading these to your <Link href="/student/documents" className="font-bold text-primary underline">Document Vault</Link> allows our AI to unlock unconditional university offers and full-tuition merit scholarships!
                </p>
              </div>
            </div>
          )}

          {/* Controls Bar: Category Filters & Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
              {(
                [
                  { id: "all", label: `All Matches (${data.length})` },
                  { id: "best_match", label: "🎯 Best Match" },
                  { id: "reach", label: "🌟 Ambitious (Reach)" },
                  { id: "safe", label: "🛡️ Safe Choice" },
                  { id: "scholarships", label: "💰 With Scholarships" },
                ] as const
              ).map((tab) => {
                const isActive = activeTier === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTier(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search & Sort */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by university, program..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/30 focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs rounded-xl bg-surface-container-low border border-outline-variant/30 py-2 px-3 font-semibold text-on-surface outline-none cursor-pointer"
              >
                <option value="match">Sort: Match Score</option>
                <option value="ranking">Sort: World Rank</option>
                <option value="tuition">Sort: Tuition Fee</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-16 text-center text-on-surface-variant font-body-md animate-pulse">
              <span className="material-symbols-outlined text-[36px] text-primary mb-2 animate-spin">
                progress_activity
              </span>
              <p className="font-bold">Analyzing your uploaded documents & academic profile...</p>
              <p className="text-xs text-outline mt-1">Cross-referencing global admission standards and scholarship criteria.</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredData.length === 0 && (
            <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border border-outline-variant/20">
              <span className="material-symbols-outlined text-outline text-[48px] mb-2 opacity-50">
                search_off
              </span>
              <h3 className="font-headline-sm font-bold text-on-surface">No matching programs found</h3>
              <p className="text-sm text-on-surface-variant mt-1 max-w-md mx-auto">
                Try resetting your filters or updating your preferred destinations and fields in your profile.
              </p>
              <button
                onClick={() => {
                  setActiveTier("all");
                  setSearchQuery("");
                }}
                className="mt-4 px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Featured Top Recommendation Hero Card */}
          {!loading && top && (
            <div className="bg-surface-container-lowest rounded-3xl ambient-shadow p-6 md:p-8 border-2 border-primary/30 flex flex-col lg:flex-row gap-8 relative overflow-hidden">
              {/* Image & Badges */}
              <div className="w-full lg:w-2/5 aspect-[16/11] lg:aspect-auto rounded-2xl bg-surface-container flex items-center justify-center relative overflow-hidden shadow-md">
                <img
                  className="w-full h-full object-cover"
                  alt={`${top.universityName} campus`}
                  src={universityImage(top.universityName, top.coverImageUrl, top.logoUrl)}
                  onError={(e) => {
                    e.currentTarget.src = universityImage("", null, null);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Match Score Badge */}
                <div className="absolute top-4 left-4 bg-primary text-on-primary px-3.5 py-1.5 rounded-full font-bold text-sm shadow-xl flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">stars</span>
                  {top.matchScore}% Match
                </div>

                {/* Tier Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                      top.tier === "reach"
                        ? "bg-amber-500 text-white"
                        : top.tier === "best_match"
                        ? "bg-emerald-500 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {top.tier === "reach"
                      ? "🌟 Ambitious (Reach)"
                      : top.tier === "best_match"
                      ? "🎯 Best Match"
                      : "🛡️ Safe Choice"}
                  </span>
                </div>

                {/* Location & Rank info overlaid at bottom */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="font-bold text-base leading-tight drop-shadow-md">
                    {top.universityName}
                  </p>
                  <p className="text-xs text-white/90 drop-shadow-sm flex items-center gap-2 mt-0.5">
                    <span>{top.city ? `${top.city}, ` : ""}{top.country}</span>
                    {top.ranking && (
                      <span className="px-2 py-0.5 bg-white/20 backdrop-blur-xs rounded text-[11px] font-bold">
                        Rank #{top.ranking} Global
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Right Details Column */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-secondary-fixed text-on-secondary-fixed">
                      {top.degreeLevel}
                    </span>
                    {top.field && (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-surface-container text-on-surface-variant">
                        {top.field}
                      </span>
                    )}
                    {top.durationMonths && (
                      <span className="text-xs text-outline font-medium">
                        ⏱️ {top.durationMonths} Months
                      </span>
                    )}
                    {top.tuitionFeeUsd && (
                      <span className="text-xs font-bold text-on-surface">
                        💵 ${Number(top.tuitionFeeUsd).toLocaleString()}/yr
                      </span>
                    )}
                  </div>

                  <h3 className="font-headline-md font-bold text-primary mb-2">
                    {top.programName}
                  </h3>

                  {top.description && (
                    <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                      {top.description}
                    </p>
                  )}

                  {/* Document AI Signals Section */}
                  <div className="mb-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-outline mb-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">folder_shared</span>
                      Document & Eligibility Signals
                    </p>
                    <div className="space-y-1.5">
                      {top.documentSignals.map((sig, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-2 p-2 rounded-xl text-xs ${
                            sig.status === "matched"
                              ? "bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 border border-emerald-500/20"
                              : sig.status === "missing"
                              ? "bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/20"
                              : "bg-surface-container-low text-on-surface-variant"
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${
                              sig.status === "matched"
                                ? "text-emerald-600"
                                : sig.status === "missing"
                                ? "text-amber-600"
                                : "text-outline"
                            }`}
                          >
                            {sig.status === "matched" ? "check_circle" : sig.status === "missing" ? "warning" : "info"}
                          </span>
                          <span className="leading-snug">{sig.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Why This Matches You (Profile Factors) */}
                  {top.reasons.length > 0 && (
                    <div className="bg-surface-container-low/60 rounded-2xl p-4 border border-outline-variant/20 mb-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-2">
                        Why AI Matched You to This Program
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface-variant">
                        {top.reasons.map((r, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="material-symbols-outlined text-primary text-[15px] shrink-0 mt-0.5">
                              verified
                            </span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Available Scholarships Banner */}
                  {top.scholarships.length > 0 && (
                    <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-primary-container/20 border border-emerald-500/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">
                          card_membership
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 truncate">
                            {top.scholarships[0].title}
                          </p>
                          <p className="text-[11px] text-on-surface-variant">
                            {top.scholarships[0].coveragePercent
                              ? `${top.scholarships[0].coveragePercent}% Tuition Coverage`
                              : top.scholarships[0].amountUsd
                              ? `$${Number(top.scholarships[0].amountUsd).toLocaleString()} Award`
                              : "Merit Grant Available"}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0">
                        Eligible
                      </span>
                    </div>
                  )}

                  {/* Specialized Partner Agency Support */}
                  {top.suggestedAgencies.length > 0 && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-on-surface-variant flex-wrap">
                      <span className="text-outline font-semibold">Recommended Partner Agency:</span>
                      {top.suggestedAgencies.map((ag) => (
                        <span
                          key={ag.userId}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-bold text-[11px]"
                        >
                          <span className="material-symbols-outlined text-[13px]">support_agent</span>
                          {ag.companyName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenApply(top)}
                    className="flex-1 py-3 px-6 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Apply with Agency Guidance
                  </button>
                  <Link
                    href={`/universities/${top.universityId}`}
                    className="py-3 px-5 rounded-xl border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-colors"
                  >
                    View University
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Remaining Matched Programs */}
          {!loading && rest.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-headline-sm font-bold text-on-surface">
                Other High-Compatibility Programs ({rest.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-card-gap">
                {rest.map((r) => (
                  <div
                    key={r.programId}
                    className="bg-surface-container-lowest rounded-3xl ambient-shadow p-6 border border-outline-variant/20 hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            r.tier === "reach"
                              ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                              : r.tier === "best_match"
                              ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                              : "bg-blue-500/15 text-blue-800 dark:text-blue-300"
                          }`}
                        >
                          {r.tier === "reach"
                            ? "🌟 Ambitious"
                            : r.tier === "best_match"
                            ? "🎯 Best Match"
                            : "🛡️ Safe Choice"}
                        </span>
                        <span className="text-sm font-bold text-primary px-2.5 py-0.5 bg-primary/10 rounded-full">
                          {r.matchScore}% Match
                        </span>
                      </div>

                      {/* University and Country */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden shrink-0 border border-outline-variant/20">
                          <img
                            className="w-full h-full object-cover"
                            alt={r.universityName}
                            src={universityImage(r.universityName, r.coverImageUrl, r.logoUrl)}
                            onError={(e) => {
                              e.currentTarget.src = universityImage("", null, null);
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-on-surface truncate leading-tight">
                            {r.universityName}
                          </p>
                          <p className="text-[11px] text-outline">
                            {r.country} {r.ranking ? `• Rank #${r.ranking}` : ""}
                          </p>
                        </div>
                      </div>

                      <h4 className="font-bold text-base text-primary mb-2 line-clamp-1">
                        {r.programName}
                      </h4>

                      <div className="flex items-center gap-2 flex-wrap text-xs text-on-surface-variant mb-3">
                        <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] font-medium">
                          {r.degreeLevel}
                        </span>
                        {r.tuitionFeeUsd && (
                          <span className="text-[11px] font-semibold text-on-surface">
                            ${Number(r.tuitionFeeUsd).toLocaleString()}/yr
                          </span>
                        )}
                      </div>

                      {/* Document Signals in Grid Card */}
                      <div className="space-y-1 mb-3">
                        {r.documentSignals.slice(0, 2).map((sig, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-1.5 text-[11px] p-1.5 rounded-lg ${
                              sig.status === "matched"
                                ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50/50"
                                : "text-amber-700 dark:text-amber-300 bg-amber-50/50"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px] shrink-0 mt-0.5">
                              {sig.status === "matched" ? "check_circle" : "warning"}
                            </span>
                            <span className="line-clamp-1">{sig.text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Scholarships Tag */}
                      {r.scholarships.length > 0 && (
                        <div className="mb-4 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">card_membership</span>
                          <span>{r.scholarships[0].title}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/15 mt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenApply(r)}
                        className="flex-1 py-2 px-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 transition-all cursor-pointer text-center"
                      >
                        Apply Now
                      </button>
                      <Link
                        href={`/universities/${r.universityId}`}
                        className="py-2 px-3 rounded-xl border border-outline-variant text-on-surface text-xs font-semibold hover:bg-surface-container-low transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ApplyModal for Instant Application with Selected Agency */}
      {selectedProgramForApply && selectedUniversityForApply && (
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          program={selectedProgramForApply}
          university={selectedUniversityForApply}
          onConfirm={handleConfirmApply}
          loading={applying}
        />
      )}
    </>
  );
}
