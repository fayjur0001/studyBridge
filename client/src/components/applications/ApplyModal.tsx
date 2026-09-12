"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Program, SuggestedAgency, University } from "@/lib/types";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program;
  university: University;
  onConfirm: (agencyId: string | null) => Promise<void>;
  loading: boolean;
}

export function ApplyModal({
  isOpen,
  onClose,
  program,
  university,
  onConfirm,
  loading,
}: ApplyModalProps) {
  const [agencies, setAgencies] = useState<SuggestedAgency[]>([]);
  const [fetchingAgencies, setFetchingAgencies] = useState(true);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const params = new URLSearchParams();
    if (university.country) params.set("country", university.country);
    if (university.id) params.set("universityId", university.id);

    api
      .get<{ data: SuggestedAgency[] }>(`/api/agency/suggested?${params.toString()}`, { auth: false })
      .then((res) => {
        if (!active) return;
        const list = res.data || [];
        setAgencies(list);
        // If there's a direct partner or country specialist, preselect the top matching agency by default
        const bestMatch = list.find((a) => a.isDirectPartner) || list.find((a) => a.isCountrySpecialist);
        if (bestMatch) {
          setSelectedAgencyId(bestMatch.userId);
        } else {
          setSelectedAgencyId(null);
        }
      })
      .catch(() => {
        if (active) setAgencies([]);
      })
      .finally(() => {
        if (active) setFetchingAgencies(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, university.id, university.country]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-surface rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-outline-variant/20 bg-surface-container-low">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-container/20 px-2.5 py-1 rounded-full mb-2">
              <span className="material-symbols-outlined text-[14px]">school</span>
              University Application
            </span>
            <h2 className="text-headline-sm font-headline-sm text-primary">
              {program.name}
            </h2>
            <p className="text-body-md text-on-surface-variant flex items-center gap-1.5 mt-0.5">
              <span className="material-symbols-outlined text-[16px] text-outline">location_on</span>
              {university.name} • {university.country}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            title="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Information Notice */}
          <div className="p-4 rounded-2xl bg-secondary-container/10 border border-secondary/20 flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-[22px] mt-0.5">support_agent</span>
            <div>
              <p className="text-sm font-semibold text-primary">Agency Guidance & Support</p>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                Applying with an authorized agency gives you personalized counseling, SOP review, visa guidance, and full application tracking at zero extra cost.
              </p>
            </div>
          </div>

          {/* Section: Agency Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-outline">
                Recommended Agencies for {university.country}
              </h3>
              {agencies.length > 0 && (
                <span className="text-xs text-primary font-medium">
                  {agencies.filter(a => a.isDirectPartner || a.isCountrySpecialist).length} specialized agency found
                </span>
              )}
            </div>

            {fetchingAgencies ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low animate-pulse flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-outline-variant/20" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-outline-variant/20 rounded w-1/3" />
                      <div className="h-3 bg-outline-variant/20 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {agencies.map((agency) => {
                  const isSelected = selectedAgencyId === agency.userId;
                  return (
                    <div
                      key={agency.userId}
                      onClick={() => setSelectedAgencyId(agency.userId)}
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                        isSelected
                          ? "border-primary bg-primary-container/10 shadow-sm ring-2 ring-primary/20"
                          : "border-outline-variant/30 bg-surface-container-low hover:border-outline hover:bg-surface-container"
                      }`}
                    >
                      {/* Radio Indicator */}
                      <div className="mt-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? "border-primary bg-primary text-white" : "border-outline"
                          }`}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>

                      {/* Agency Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-base text-on-surface">
                            {agency.companyName}
                          </span>
                          {agency.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              <span className="material-symbols-outlined text-[13px]">verified</span>
                              Verified
                            </span>
                          )}
                          {agency.isDirectPartner && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                              <span className="material-symbols-outlined text-[13px]">stars</span>
                              Official Partner
                            </span>
                          )}
                          {!agency.isDirectPartner && agency.isCountrySpecialist && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                              <span className="material-symbols-outlined text-[13px]">public</span>
                              {university.country} Specialist
                            </span>
                          )}
                        </div>

                        {agency.description && (
                          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-2">
                            {agency.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-outline flex-wrap">
                          {agency.address && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                              {agency.address}
                            </span>
                          )}
                          {agency.supportedCountries?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">travel_explore</span>
                              Covers: {agency.supportedCountries.slice(0, 3).join(", ")}
                              {agency.supportedCountries.length > 3 ? " +" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Direct Application Option */}
                <div
                  onClick={() => setSelectedAgencyId(null)}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    selectedAgencyId === null
                      ? "border-primary bg-primary-container/10 shadow-sm ring-2 ring-primary/20"
                      : "border-outline-variant/30 bg-surface-container-low hover:border-outline hover:bg-surface-container"
                  }`}
                >
                  <div className="mt-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedAgencyId === null ? "border-primary bg-primary text-white" : "border-outline"
                      }`}
                    >
                      {selectedAgencyId === null && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-base text-on-surface">
                        Apply Directly on My Own
                      </span>
                      <span className="text-[11px] font-medium text-outline bg-surface-container px-2 py-0.5 rounded-full">
                        Self-managed
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Proceed without assigning an education agency. You will independently prepare, submit, and communicate with the university.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-outline-variant/20 bg-surface-container-low">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-medium text-sm hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedAgencyId)}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting Application...
              </>
            ) : selectedAgencyId ? (
              <>
                Continue with Selected Agency
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            ) : (
              <>
                Continue Directly
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
