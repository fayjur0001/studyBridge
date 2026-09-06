"use client";

import { useEffect, useState } from "react";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import UniversityCard from "@/components/universities/UniversityCard";
import { api } from "@/lib/api";
import { Paginated, University } from "@/lib/types";

const REGIONS = ["North America", "Europe", "Asia-Pacific", "Middle East"];

export default function UniversitiesListingPage() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [maxRanking, setMaxRanking] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedRegion, setAppliedRegion] = useState("");
  const [appliedMaxRanking, setAppliedMaxRanking] = useState("");
  const [page, setPage] = useState(1);
  const [universities, setUniversities] = useState<University[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: "6" });
    if (appliedSearch) params.set("search", appliedSearch);
    if (appliedRegion) params.set("region", appliedRegion);
    if (appliedMaxRanking) params.set("maxRanking", appliedMaxRanking);

    api
      .get<Paginated<University>>(`/api/universities?${params.toString()}`, { auth: false })
      .then((res) => {
        setUniversities((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
        setTotal(res.meta.total);
      })
      .catch(() => setError("Couldn't load universities right now. Please try again."))
      .finally(() => setLoading(false));
  }, [page, appliedSearch, appliedRegion, appliedMaxRanking]);

  function applyFilters() {
    setPage(1);
    setAppliedSearch(search.trim());
    setAppliedRegion(region);
    setAppliedMaxRanking(maxRanking);
  }

  return (
    <>
      <PublicNavbar variant="glass" current="Universities" />
      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <section className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="max-w-2xl">
              <span className="text-primary font-bold tracking-wider font-label-md uppercase mb-4 block">
                World-Class Education
              </span>
              <h1 className="font-display-lg text-display-lg text-on-surface mb-6">
                Discover your perfect <span className="text-primary">academic future.</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Explore globally accredited universities. Filter by region and ranking to find
                institutions that align with your profile and career aspirations.
              </p>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant font-label-md">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <span>{total} Accredited Universities</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl premium-shadow p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="font-label-md text-on-surface-variant ml-1">Search</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-body-md focus:ring-2 focus:ring-primary"
                  placeholder="University, city, or country"
                  type="search"
                  aria-label="Search universities"
                />
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-on-surface-variant ml-1">Region</label>
                <div className="relative">
                  <select
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-body-md focus:ring-2 focus:ring-primary appearance-none"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    <option value="">All Regions</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-on-surface-variant ml-1">Global Ranking</label>
                <div className="relative">
                  <select
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-body-md focus:ring-2 focus:ring-primary appearance-none"
                    value={maxRanking}
                    onChange={(e) => setMaxRanking(e.target.value)}
                  >
                    <option value="">Any Ranking</option>
                    <option value="50">Top 50</option>
                    <option value="100">Top 100</option>
                    <option value="500">Top 500</option>
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
            <h2 className="font-headline-md text-headline-md text-on-surface">Universities</h2>
          </div>

          {error && <p className="text-error font-body-md mb-6">{error}</p>}

          {!error && universities.length === 0 && !loading && (
            <p className="text-on-surface-variant font-body-md">No universities match these filters yet.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {universities.map((u) => (
              <UniversityCard key={u.id} university={u} />
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center gap-6">
            {universities.length < total && (
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="bg-surface-container-high hover:bg-outline-variant/20 text-on-surface font-bold px-12 py-4 rounded-full transition-all border border-outline-variant/30 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More Institutions"}
                <span className="material-symbols-outlined">refresh</span>
              </button>
            )}
            <p className="font-label-md text-on-surface-variant">
              Showing {universities.length} of {total} Universities
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
