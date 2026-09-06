"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import { api } from "@/lib/api";
import { Paginated, Scholarship } from "@/lib/types";

const CATEGORY_STYLES: Record<string, string> = {
  "Merit Based": "bg-primary-fixed text-primary",
  "Need Based": "bg-secondary-container/30 text-secondary",
  "Portfolio Based": "bg-tertiary-container/40 text-tertiary",
};

function daysLeftLabel(deadline: string | null) {
  if (!deadline) return null;
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "Deadline passed";
  return `${days} Day${days === 1 ? "" : "s"} Left`;
}

export default function ScholarshipsListingPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedCategory, setAppliedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "6" });
    if (appliedSearch) params.set("search", appliedSearch);
    if (appliedCategory) params.set("category", appliedCategory);

    api
      .get<Paginated<Scholarship>>(`/api/scholarships?${params.toString()}`, { auth: false })
      .then((res) => {
        setScholarships((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  }, [page, appliedSearch, appliedCategory]);

  function applyFilters() {
    setPage(1);
    setAppliedSearch(search.trim());
    setAppliedCategory(category);
  }

  return (
    <>
      <PublicNavbar variant="glass" current="Scholarships" />
      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="max-w-2xl">
              <span className="text-primary font-bold tracking-wider font-label-md uppercase mb-4 block">
                Fund Your Future
              </span>
              <h1 className="font-display-lg text-display-lg text-on-surface mb-6">
                Scholarships worth{" "}
                <span className="text-primary">chasing.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Browse merit-based, need-based, and specialized scholarships
                from trusted foundations and universities around the world.
              </p>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant font-label-md">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                military_tech
              </span>
              <span>{total} Active Scholarships</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl premium-shadow p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label-md text-on-surface-variant ml-1">Search</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-body-md focus:ring-2 focus:ring-primary"
                  placeholder="Scholarship or provider"
                  type="search"
                  aria-label="Search scholarships"
                />
              </div>
              <div className="space-y-2 max-w-xs">
                <label className="font-label-md text-on-surface-variant ml-1">Award Type</label>
                <div className="relative">
                  <select
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-body-md focus:ring-2 focus:ring-primary appearance-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="Merit Based">Merit Based</option>
                    <option value="Need Based">Need Based</option>
                    <option value="Portfolio Based">Portfolio Based</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto self-end">
              <button
                onClick={applyFilters}
                className="w-full md:w-auto bg-secondary text-on-secondary px-8 py-3 rounded-xl font-bold font-body-md hover:bg-secondary-container transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">tune</span>
                Apply Filters
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline-md text-headline-md text-on-surface">Featured Scholarships</h2>
          </div>

          {!loading && scholarships.length === 0 && (
            <p className="text-on-surface-variant font-body-md">No scholarships match these filters yet.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {scholarships.map((s) => (
              <Link
                key={s.id}
                href={`/scholarships/${s.id}`}
                className="bg-surface-container-lowest rounded-[24px] premium-shadow premium-shadow-hover transition-all duration-300 overflow-hidden flex flex-col group border border-outline-variant/10 p-8"
              >
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  {s.category && (
                    <span className={`px-3 py-1 rounded-full font-label-md text-label-md ${CATEGORY_STYLES[s.category] ?? "bg-surface-container text-on-surface-variant"}`}>
                      {s.category}
                    </span>
                  )}
                  {daysLeftLabel(s.deadline) && (
                    <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full font-label-md text-label-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">alarm</span>
                      {daysLeftLabel(s.deadline)}
                    </span>
                  )}
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors mb-1">
                  {s.title}
                </h3>
                <p className="flex items-center gap-1 text-on-surface-variant font-body-md mb-4">
                  <span className="material-symbols-outlined text-sm">account_balance</span>
                  {s.provider}
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant/80 line-clamp-2 mb-6">
                  {s.description}
                </p>
                <div className="mt-auto pt-6 border-t border-outline-variant/30 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-tighter text-on-surface-variant/70">Award Value</p>
                    <p className="font-bold text-primary text-headline-sm">
                      {s.amountUsd ? `$${Number(s.amountUsd).toLocaleString()}` : "Varies"}
                    </p>
                  </div>
                  <span className="text-primary font-bold font-label-md flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center gap-6">
            {scholarships.length < total && (
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="bg-surface-container-high hover:bg-outline-variant/20 text-on-surface font-bold px-12 py-4 rounded-full transition-all border border-outline-variant/30 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More Scholarships"}
                <span className="material-symbols-outlined">refresh</span>
              </button>
            )}
            <p className="font-label-md text-on-surface-variant">
              Showing {scholarships.length} of {total} Scholarships
            </p>
          </div>
        </section>

        <section className="mt-24 bg-primary rounded-[32px] p-12 md:p-20 relative overflow-hidden text-center md:text-left">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h2 className="font-headline-lg text-headline-lg text-on-primary mb-4">
                Not sure which scholarship fits you?
              </h2>
              <p className="font-body-lg text-body-lg text-on-primary/80 mb-0">
                Create an account to save scholarships and track your applications from one dashboard.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Link
                href="/register"
                className="bg-on-primary text-primary px-8 py-4 rounded-full font-bold font-body-md hover:shadow-lg transition-all active:scale-95"
              >
                Get Started
              </Link>
              <Link
                href="/about"
                className="border-2 border-on-primary text-on-primary px-8 py-4 rounded-full font-bold font-body-md hover:bg-on-primary/10 transition-all active:scale-95"
              >
                Learn How It Works
              </Link>
            </div>
          </div>

          <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-container/40 rounded-full blur-3xl"></div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
