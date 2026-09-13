"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Program, SuggestedAgency, University } from "@/lib/types";

interface ExtendedSuggestedAgency extends SuggestedAgency {
  serviceFee?: string | number;
}

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program;
  university: University;
  onConfirm: (
    agencyId: string | null,
    paymentDetails?: {
      paymentMethod?: string;
      accountNumber?: string;
      bankName?: string;
      cardOrReference?: string;
    }
  ) => Promise<void>;
  loading: boolean;
}

const MOBILE_OPERATORS = [
  { id: "bKash", name: "bKash", color: "from-pink-500 to-rose-600", lightBg: "bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-950/40 dark:border-pink-800 dark:text-pink-300", icon: "phone_android" },
  { id: "Nagad", name: "Nagad", color: "from-orange-500 to-amber-600", lightBg: "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300", icon: "bolt" },
  { id: "Rocket", name: "Rocket", color: "from-purple-600 to-indigo-700", lightBg: "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300", icon: "rocket_launch" },
  { id: "Upay", name: "Upay", color: "from-blue-600 to-cyan-700", lightBg: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300", icon: "payments" },
];

const BANK_CHANNELS = [
  { id: "Dutch-Bangla Bank", name: "Dutch-Bangla Bank (NexusPay)", icon: "account_balance" },
  { id: "BRAC Bank", name: "BRAC Bank (Astha)", icon: "account_balance" },
  { id: "City Bank", name: "City Bank (CityTouch)", icon: "account_balance" },
  { id: "Islami Bank", name: "Islami Bank (CellFin)", icon: "account_balance" },
];

export function ApplyModal({
  isOpen,
  onClose,
  program,
  university,
  onConfirm,
  loading,
}: ApplyModalProps) {
  const [agencies, setAgencies] = useState<ExtendedSuggestedAgency[]>([]);
  const [fetchingAgencies, setFetchingAgencies] = useState(true);
  const [applyMode, setApplyMode] = useState<"agency" | "direct">("agency");
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);

  // Payment State (for Agency applications)
  const [step, setStep] = useState<"select" | "payment">("select");
  const [paymentCategory, setPaymentCategory] = useState<"mobile" | "bank">("mobile");
  const [mobileMethod, setMobileMethod] = useState("bKash");
  const [accountNumber, setAccountNumber] = useState("01712345678");
  const [pin, setPin] = useState("12345");
  const [bankName, setBankName] = useState("Dutch-Bangla Bank");
  const [bankAccount, setBankAccount] = useState("DBBL-8942-0192");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep("select");
    setFormError(null);
    let active = true;
    const params = new URLSearchParams();
    if (university.country) params.set("country", university.country);
    if (university.id) params.set("universityId", university.id);

    api
      .get<{ data: ExtendedSuggestedAgency[] }>(`/api/agency/suggested?${params.toString()}`, { auth: false })
      .then((res) => {
        if (!active) return;
        const list = res.data || [];
        setAgencies(list);
        if (list.length > 0) {
          const bestMatch = list.find((a) => a.isDirectPartner) || list.find((a) => a.isCountrySpecialist) || list[0];
          setSelectedAgencyId(bestMatch.userId);
          setApplyMode("agency");
        } else {
          setSelectedAgencyId(null);
          setApplyMode("direct");
        }
      })
      .catch(() => {
        if (active) {
          setAgencies([]);
          setSelectedAgencyId(null);
          setApplyMode("direct");
        }
      })
      .finally(() => {
        if (active) setFetchingAgencies(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, university.id, university.country]);

  if (!isOpen) return null;

  const selectedAgency = agencies.find((a) => a.userId === selectedAgencyId);
  const rawFee = selectedAgency?.serviceFee ? Number(selectedAgency.serviceFee) : 3000;
  const serviceFee = isNaN(rawFee) || rawFee <= 0 ? 3000 : rawFee;
  const platformCommission = Number((serviceFee * 0.10).toFixed(2));
  const agencyShare = Number((serviceFee - platformCommission).toFixed(2));

  function handleSwitchToAgency() {
    setApplyMode("agency");
    if (!selectedAgencyId && agencies.length > 0) {
      const bestMatch = agencies.find((a) => a.isDirectPartner) || agencies.find((a) => a.isCountrySpecialist) || agencies[0];
      setSelectedAgencyId(bestMatch.userId);
    }
  }

  function handleSwitchToDirect() {
    setApplyMode("direct");
    setSelectedAgencyId(null);
    setStep("select");
  }

  function handleProceedFromSelect() {
    if (applyMode === "direct") {
      onConfirm(null);
    } else {
      if (!selectedAgencyId) {
        setFormError("Please choose an authorized agency to continue.");
        return;
      }
      setFormError(null);
      setStep("payment");
    }
  }

  async function handleCompletePayment() {
    setFormError(null);
    if (paymentCategory === "mobile") {
      if (!accountNumber.trim()) {
        setFormError("Please provide your mobile account number.");
        return;
      }
      if (!pin.trim()) {
        setFormError("Please enter your mobile banking PIN.");
        return;
      }
      await onConfirm(selectedAgencyId, {
        paymentMethod: mobileMethod,
        accountNumber: accountNumber.trim(),
      });
    } else {
      if (!bankAccount.trim()) {
        setFormError("Please provide your bank account or reference number.");
        return;
      }
      await onConfirm(selectedAgencyId, {
        paymentMethod: "Bank Transfer",
        bankName,
        accountNumber: bankAccount.trim(),
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[94vh] flex flex-col bg-surface rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-outline-variant/20 bg-surface-container-low">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                <span className="material-symbols-outlined text-[14px]">school</span>
                University Application
              </span>
              {step === "payment" && (
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  SSLCommerz Secure Checkout
                </span>
              )}
            </div>
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
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            title="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {formError && (
            <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{formError}</span>
            </div>
          )}

          {step === "select" ? (
            <>
              {/* Dual-Mode Selector: Agency vs Direct */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-3">
                  How would you like to apply?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: With Agency Assistance */}
                  <button
                    type="button"
                    onClick={handleSwitchToAgency}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between relative cursor-pointer ${
                      applyMode === "agency"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                        : "border-outline-variant/30 bg-surface-container-low hover:border-outline hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex items-start justify-between w-full mb-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          applyMode === "agency" ? "bg-primary text-white" : "bg-primary/10 text-primary"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">support_agent</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                        Full Assistance • ৳{serviceFee.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                        Via Authorized Agency
                        {applyMode === "agency" && (
                          <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                        )}
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Dedicated counselor, SOP polishing, visa filing & verified document review.
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Direct Self-Application */}
                  <button
                    type="button"
                    onClick={handleSwitchToDirect}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between relative cursor-pointer ${
                      applyMode === "direct"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                        : "border-outline-variant/30 bg-surface-container-low hover:border-outline hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex items-start justify-between w-full mb-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          applyMode === "direct" ? "bg-primary text-white" : "bg-primary/10 text-primary"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">person</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        100% Free • ৳0
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                        Apply Directly on My Own
                        {applyMode === "direct" && (
                          <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                        )}
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Independent self-managed submission directly to university. Zero fees.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Body Content Mode 1: Agency Selection & Fee Overview */}
              {applyMode === "agency" && (
                <div className="space-y-4">
                  {/* Fee & Commission Transparency Card */}
                  <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                        Agency Application &amp; Processing Fee
                      </span>
                      <span className="text-base font-extrabold text-primary">
                        ৳{serviceFee.toLocaleString()} BDT
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      This fee covers end-to-end guidance and processing. A transparent 10% platform commission is retained by StudyBridge for security and verification.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary/10 text-xs">
                      <div className="bg-surface/80 p-2.5 rounded-xl border border-outline-variant/30">
                        <div className="text-[11px] text-outline font-semibold">Platform Commission (10%)</div>
                        <div className="font-bold text-on-surface mt-0.5">৳{platformCommission.toLocaleString()} BDT</div>
                        <div className="text-[10px] text-on-surface-variant mt-0.5">Admin escrow &amp; verification</div>
                      </div>
                      <div className="bg-surface/80 p-2.5 rounded-xl border border-outline-variant/30">
                        <div className="text-[11px] text-outline font-semibold">Agency Share (90%)</div>
                        <div className="font-bold text-on-surface mt-0.5">৳{agencyShare.toLocaleString()} BDT</div>
                        <div className="text-[10px] text-on-surface-variant mt-0.5">Counseling &amp; university filing</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-outline">
                      Select an Authorized Agency for {university.country}
                    </h3>
                    {agencies.length > 0 && (
                      <span className="text-xs text-primary font-medium">
                        {agencies.length} {agencies.length === 1 ? "agency" : "agencies"} available
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
                  ) : agencies.length === 0 ? (
                    <div className="p-6 rounded-2xl border border-outline-variant/30 bg-surface-container-low text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-surface-container mx-auto flex items-center justify-center text-outline">
                        <span className="material-symbols-outlined text-[24px]">support_agent</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface">No local partner agency found</p>
                        <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
                          Currently there are no partner agencies specifically listed for {university.country}. You can proceed with a direct application for free.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSwitchToDirect}
                        className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:shadow transition-all cursor-pointer"
                      >
                        Switch to Direct Application
                      </button>
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
                                ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                                : "border-outline-variant/30 bg-surface-container-low hover:border-outline hover:bg-surface-container"
                            }`}
                          >
                            <div className="mt-1">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isSelected ? "border-primary bg-primary text-white" : "border-outline"
                                }`}
                              >
                                {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                            </div>

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
                    </div>
                  )}
                </div>
              )}

              {/* Body Content Mode 2: Direct Self-Application Details */}
              {applyMode === "direct" && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">person</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-primary">Direct Application Confirmation</h4>
                        <p className="text-xs text-on-surface-variant">
                          Applying independently to {university.name} • 100% Free
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-outline-variant/20 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                        <div>
                          <p className="font-semibold text-on-surface">Direct Admission Channel</p>
                          <p className="text-on-surface-variant">Your application goes straight to university review.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                        <div>
                          <p className="font-semibold text-on-surface">Self-Managed Vault</p>
                          <p className="text-on-surface-variant">Upload transcripts, SOP &amp; certificates yourself.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                        <div>
                          <p className="font-semibold text-on-surface">Zero Intermediary Fees</p>
                          <p className="text-on-surface-variant">No agency fees or commissions will be charged.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                        <div>
                          <p className="font-semibold text-on-surface">Always Flexible</p>
                          <p className="text-on-surface-variant">You can consult an agency anytime later if needed.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* STEP 2: SSLCOMMERZ PAYMENT GATEWAY */
            <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-200">
              {/* Order Summary Banner */}
              <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-outline">Selected Agency</div>
                  <div className="font-bold text-sm text-on-surface">{selectedAgency?.companyName || "Authorized Agency"}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Platform Commission (10%): ৳{platformCommission.toLocaleString()} • Agency Share (90%): ৳{agencyShare.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-outline">Total Payable</div>
                  <div className="text-xl font-extrabold text-primary">৳{serviceFee.toLocaleString()} BDT</div>
                </div>
              </div>

              {/* Payment Channel Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">
                  Choose Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentCategory("mobile")}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      paymentCategory === "mobile"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                        : "border-outline-variant/30 bg-surface-container-low hover:bg-surface-container"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">smartphone</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-on-surface">Mobile Banking</div>
                      <div className="text-[10px] text-on-surface-variant">bKash, Nagad, Rocket, Upay</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentCategory("bank")}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      paymentCategory === "bank"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                        : "border-outline-variant/30 bg-surface-container-low hover:bg-surface-container"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">account_balance</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-on-surface">Internet Banking</div>
                      <div className="text-[10px] text-on-surface-variant">DBBL, BRAC, City, Islami</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Mobile Banking Options */}
              {paymentCategory === "mobile" && (
                <div className="space-y-4 p-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-2">Select Mobile Wallet</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {MOBILE_OPERATORS.map((op) => {
                        const isChosen = mobileMethod === op.id;
                        return (
                          <button
                            key={op.id}
                            type="button"
                            onClick={() => setMobileMethod(op.id)}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isChosen
                                ? `${op.lightBg} ring-2 ring-primary/30 shadow-sm font-bold`
                                : "border-outline-variant/30 bg-surface hover:bg-surface-container text-on-surface-variant"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">{op.icon}</span>
                            <span className="text-xs">{op.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1">
                        {mobileMethod} Account Number
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1">
                        Demo Wallet PIN (Simulated)
                      </label>
                      <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="•••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Internet Banking Options */}
              {paymentCategory === "bank" && (
                <div className="space-y-4 p-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-2">Select Bank</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {BANK_CHANNELS.map((b) => {
                        const isChosen = bankName === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setBankName(b.id)}
                            className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                              isChosen
                                ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-bold"
                                : "border-outline-variant/30 bg-surface hover:bg-surface-container text-on-surface-variant"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">{b.icon}</span>
                            <span className="text-xs">{b.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">
                      Bank Account / Login Reference
                    </label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="Account or Card Number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}

              {/* Security Badge */}
              <div className="flex items-center gap-2 text-[11px] text-outline px-1">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
                <span>SSLCommerz Sandbox Simulator • 10% platform commission retained in escrow until review.</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-outline-variant/20 bg-surface-container-low">
          {step === "select" ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-medium text-sm hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedFromSelect}
                disabled={loading || (applyMode === "agency" && agencies.length > 0 && !selectedAgencyId)}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : applyMode === "agency" && selectedAgency ? (
                  <>
                    Pay ৳{serviceFee.toLocaleString()} &amp; Apply with {selectedAgency.companyName}
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </>
                ) : applyMode === "agency" ? (
                  <>
                    Continue to Payment
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                ) : (
                  <>
                    Proceed with Direct Application (Free)
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep("select")}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-medium text-sm hover:bg-surface-container transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Change Agency
              </button>
              <button
                type="button"
                onClick={handleCompletePayment}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirming Payment...
                  </>
                ) : (
                  <>
                    Confirm &amp; Pay ৳{serviceFee.toLocaleString()} BDT
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
