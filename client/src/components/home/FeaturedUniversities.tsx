"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Paginated, University } from "@/lib/types";
import { universityImage, universityImageFallback } from "@/lib/university-images";

// The homepage used to be fully static (hardcoded Oxford card, stock photos)
// and never called the universities API at all, so anything an admin added
// never appeared here. This pulls the most recently added universities for
// real, so a newly-added one (with its picture) shows up immediately.
export default function FeaturedUniversities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Paginated<University>>("/api/universities?sort=newest&limit=4", { auth: false })
      .then((res) => setUniversities(res.data))
      .catch(() => setUniversities([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && universities.length === 0) return null;

  return (
    <section className="py-12 px-4 md:px-margin-desktop bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-primary font-bold tracking-wider font-label-md uppercase mb-3 block">
              On The Platform
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary">
              Partner Universities
            </h2>
          </div>
          <Link
            href="/universities"
            className="font-bold text-primary flex items-center gap-2 hover:gap-3 transition-all"
          >
            View All Universities
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl bg-surface-container-low animate-pulse"
                />
              ))
            : universities.map((u) => (
                <Link
                  key={u.id}
                  href={`/universities/${u.id}`}
                  className="group rounded-2xl overflow-hidden premium-shadow premium-shadow-hover border border-outline-variant/10 bg-surface-container-lowest flex flex-col transition-all"
                >
                  <div className="h-36 relative overflow-hidden">
                    <UniversityThumb university={u} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {u.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {[u.city, u.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}

// Falls back to the local placeholder if the real photo URL fails to load,
// instead of leaving the thumbnail blank.
function UniversityThumb({ university }: { university: University }) {
  const [src, setSrc] = useState(() =>
    universityImage(university.name, university.coverImageUrl, university.logoUrl)
  );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={university.name}
      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      onError={() => setSrc(universityImageFallback())}
    />
  );
}