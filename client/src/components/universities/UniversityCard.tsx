import Link from "next/link";
import { University } from "@/lib/types";

const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDDi9gc6hDTfNh6XTMxsheKj6K4x5URTDUm4UCxjXQBPlr0aV_6xGA3KHOFUar-EI4yo5-TXaAj9PuEwWXvfAD3vZtJDsoQJ8ZEx3U4Z8cOxCV2tapJmvgVVjpOkJZBKLllgwxbxCuwQpcqMu4akjv5o_GEWk20I4Jn3cfF31tTnRSOdvWHKoiTvrLfxyfqRBdIhmlqLdpApkb0OWBkwPoETJ-ou8HSgYhpZutvmht9_r3w_zYzdE3a";

export default function UniversityCard({ university }: { university: University }) {
  return (
    <div className="bg-surface-container-lowest rounded-[24px] premium-shadow premium-shadow-hover transition-all duration-300 overflow-hidden flex flex-col group border border-outline-variant/10">
      <div className="h-48 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
        <div
          className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
          style={{ backgroundImage: `url('${university.coverImageUrl || FALLBACK_IMAGE}')` }}
        ></div>
        {university.ranking && (
          <div className="absolute top-4 right-4 z-20 bg-primary/90 text-white backdrop-blur-md px-3 py-1.5 rounded-full font-label-md flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              military_tech
            </span>
            Rank #{university.ranking}
          </div>
        )}
      </div>
      <div className="p-8 flex flex-col flex-1 relative">
        <div className="absolute -top-10 left-8 h-16 w-16 bg-white rounded-2xl premium-shadow p-2 flex items-center justify-center z-20 border border-outline-variant/20">
          {university.logoUrl ? (
            <img className="h-10 w-10 object-contain" alt={university.name} src={university.logoUrl} />
          ) : (
            <span className="material-symbols-outlined text-3xl text-primary">school</span>
          )}
        </div>
        <div className="mt-8 flex justify-between items-start mb-4">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
              {university.name}
            </h3>
            <p className="flex items-center gap-1 text-on-surface-variant font-body-md mt-1">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {[university.city, university.country].filter(Boolean).join(", ")}
            </p>
          </div>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant/80 line-clamp-2 mb-6">
          {university.description || "More details about this university are coming soon."}
        </p>
        <div className="mt-auto pt-6 border-t border-outline-variant/30 flex items-center justify-between">
          <div className="flex gap-2">
            {university.region && (
              <span className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-bold text-on-surface-variant uppercase">
                {university.region}
              </span>
            )}
          </div>
          <Link
            href={`/universities/${university.id}`}
            className="text-primary font-bold font-label-md flex items-center gap-1 hover:gap-2 transition-all"
          >
            View Profile <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
