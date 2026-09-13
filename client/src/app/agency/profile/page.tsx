"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AgencySidebar from "@/components/dashboard/AgencySidebar";
import AgencyNotificationBell from "@/components/agency/AgencyNotificationBell";
import { useAuth } from "@/lib/auth-context";
import { api, API_BASE_URL } from "@/lib/api";

interface AgencyProfileData {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  agencyProfile: {
    companyName: string;
    licenseNumber: string | null;
    website: string | null;
    address: string | null;
    description: string | null;
    studentStories: string | null;
    supportedCountries?: string[] | null;
    isVerified: boolean;
  } | null;
}

interface VerificationInfo {
  isVerified: boolean;
  companyName: string;
  feeAmount: number;
  currency: string;
  latestRequest: {
    id: string;
    status: "pending_payment" | "paid" | "under_review" | "approved" | "rejected" | "documents_requested";
    feeAmount: string;
    currency: string;
    transactionId: string;
    paymentStatus: string;
    adminNotes: string | null;
    serviceFeeDeducted: string | null;
    refundAmount: string | null;
    refundStatus: string | null;
    createdAt: string;
  } | null;
}

type ProfileTab = "general" | "team" | "documents" | "certifications";
interface TeamMember { id: string; fullName: string; email: string; role: string; status: "pending" | "active"; }
interface AgencyFile { id: string; category: "business_document" | "certification"; title: string; fileName: string; expiresAt: string | null; createdAt: string; }

export default function AgencyProfilePage() {
  const { user } = useAuth();
  const [data, setData] = useState<AgencyProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [studentStories, setStudentStories] = useState("");
  const [supportedCountries, setSupportedCountries] = useState<string[]>([]);
  const [countryInput, setCountryInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("general");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [agencyFiles, setAgencyFiles] = useState<AgencyFile[]>([]);
  const [uploadingCategory, setUploadingCategory] = useState<AgencyFile["category"] | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // Verification & SSLCommerz Payment states
  const [verificationInfo, setVerificationInfo] = useState<VerificationInfo | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [payStep, setPayStep] = useState<"details" | "processing" | "success">("details");
  const [paymentBanner, setPaymentBanner] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // SSLCommerz payment channels and account input states
  const [paymentCategory, setPaymentCategory] = useState<"mobile" | "card" | "bank">("mobile");
  const [mobileProvider, setMobileProvider] = useState<"bKash" | "Nagad" | "Rocket" | "Upay">("bKash");
  const [cardProvider, setCardProvider] = useState<"Visa Card" | "Mastercard" | "AMEX">("Visa Card");
  const [bankProvider, setBankProvider] = useState<
    "City Touch (City Bank)" | "Islami Bank" | "BRAC Bank" | "Dutch-Bangla Bank (DBBL)" | "Eastern Bank (EBL)"
  >("City Touch (City Bank)");

  const [mfsNumber, setMfsNumber] = useState("01712345678");
  const [mfsPin, setMfsPin] = useState("1234");

  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardHolder, setCardHolder] = useState("Agency Finance Officer");
  const [cardExpiry, setCardExpiry] = useState("12/26");
  const [cardCvv, setCardCvv] = useState("789");

  const [bankAccount, setBankAccount] = useState("1502448899001");
  const [bankBranch, setBankBranch] = useState("Dhaka Main Branch");
  const [bankPassword, setBankPassword] = useState("123456");

  function load() {
    api.get<AgencyProfileData>("/api/agency/me").then((res) => {
      setData(res);
      setAvatarUrl(res.avatarUrl ? `${API_BASE_URL}/api/agency/${res.id}/avatar?v=${encodeURIComponent(res.avatarUrl)}` : "");
      setCompanyName(res.agencyProfile?.companyName ?? "");
      setWebsite(res.agencyProfile?.website ?? "");
      setAddress(res.agencyProfile?.address ?? "");
      setDescription(res.agencyProfile?.description ?? "");
      setStudentStories(res.agencyProfile?.studentStories ?? "");
      setSupportedCountries(res.agencyProfile?.supportedCountries ?? []);
    });
    loadVerification();
  }

  function loadVerification() {
    api
      .get<VerificationInfo>("/api/agency/verification/status")
      .then((res) => setVerificationInfo(res))
      .catch(() => {});
  }

  useEffect(load, []);

  // Listen for payment callback query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const payment = params.get("payment");
      const tran_id = params.get("tran_id");

      if (payment === "success") {
        setPaymentBanner({
          type: "success",
          message: `🎉 Payment confirmed via SSLCommerz (TrxID: ${tran_id || ""})! Your verification application is under review.`,
        });
        loadVerification();
      } else if (payment === "failed") {
        setPaymentBanner({
          type: "error",
          message: "Payment transaction failed or was declined. Please try again.",
        });
      } else if (payment === "cancelled") {
        setPaymentBanner({
          type: "info",
          message: "Payment was cancelled.",
        });
      }

      if (params.get("ssl_demo") === "1") {
        setShowVerifyModal(true);
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === "team") api.get<{ data: TeamMember[] }>("/api/agency/team").then((result) => setTeam(result.data)).catch(() => {});
    if (activeTab === "documents" || activeTab === "certifications") loadFiles();
  }, [activeTab]);

  function loadFiles() { api.get<{ data: AgencyFile[] }>("/api/agency/files").then((result) => setAgencyFiles(result.data)).catch(() => {}); }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>, category: AgencyFile["category"]) {
    const file = event.target.files?.[0];
    if (!file) return;
    const title = file.name.replace(/\.[^.]+$/, "");
    setUploadingCategory(category); setUploadError(""); setUploadMessage("");
    try {
      const form = new FormData(); form.append("file", file); form.append("category", category); form.append("title", title.trim());
      await api.post("/api/agency/files", form);
      await loadFiles();
      setUploadMessage(`${file.name} uploaded successfully.`);
    } catch (error) { setUploadError(error instanceof Error ? error.message : "Upload failed."); }
    finally { setUploadingCategory(null); event.target.value = ""; }
  }

  async function removeFile(id: string) { if (!window.confirm("Remove this file?")) return; await api.delete(`/api/agency/files/${id}`); loadFiles(); }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setAvatarError("Please choose a JPG, PNG, or WEBP image."); event.target.value = ""; return; }
    setUploadingAvatar(true); setAvatarError("");
    try {
      const form = new FormData(); form.append("avatar", file);
      const result = await api.post<{ avatarUrl: string }>("/api/agency/me/avatar", form);
      setAvatarUrl(`${API_BASE_URL}${result.avatarUrl}?v=${Date.now()}`);
      load();
    } catch (error) { setAvatarError(error instanceof Error ? error.message : "Couldn't upload profile photo."); }
    finally { setUploadingAvatar(false); event.target.value = ""; }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch("/api/agency/me", { agency: { companyName, website, address, description, studentStories, supportedCountries } });
      setEditing(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  // Payment handlers
  async function handleApplySSLCommerzGateway() {
    if (!agreeToPolicy) return;
    setProcessingPayment(true);
    try {
      const res = await api.post<{ url: string; tran_id: string; isSimulated: boolean }>("/api/agency/verification/apply");
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      alert(err?.message || "Failed to initiate SSLCommerz session.");
      setProcessingPayment(false);
    }
  }

  async function handleCompletePayment() {
    if (!agreeToPolicy) return;
    setProcessingPayment(true);
    setPayStep("processing");

    let method = "";
    let accountNumber = "";
    let cardHolderName = "";
    let bankName = "";

    if (paymentCategory === "mobile") {
      const cleanNum = mfsNumber.trim().replace(/\s/g, "");
      if (cleanNum.length !== 11 || !cleanNum.startsWith("01")) {
        alert(`Please enter a valid 11-digit ${mobileProvider} mobile account number starting with 01 (e.g. 017XXXXXXXX).`);
        setProcessingPayment(false);
        setPayStep("details");
        return;
      }
      method = mobileProvider;
      accountNumber = cleanNum;
    } else if (paymentCategory === "card") {
      const cleanCard = cardNumber.trim().replace(/\s/g, "");
      if (cleanCard.length < 15) {
        alert("Please enter a valid 16-digit card number.");
        setProcessingPayment(false);
        setPayStep("details");
        return;
      }
      method = cardProvider;
      accountNumber = cleanCard;
      cardHolderName = cardHolder.trim();
    } else {
      if (!bankAccount.trim()) {
        alert("Please enter your bank account number or user ID.");
        setProcessingPayment(false);
        setPayStep("details");
        return;
      }
      method = bankProvider;
      accountNumber = bankAccount.trim();
      bankName = bankBranch.trim();
    }

    try {
      const applyRes = await api.post<{ tran_id: string }>("/api/agency/verification/apply");
      await api.post("/api/agency/verification/demo-pay", {
        tran_id: applyRes.tran_id,
        method,
        accountNumber,
        cardHolderName: cardHolderName || undefined,
        bankName: bankName || undefined,
      });

      setPayStep("success");
      setTimeout(() => {
        setShowVerifyModal(false);
        setPayStep("details");
        setPaymentBanner({
          type: "success",
          message: `🎉 Payment of ৳5,000 confirmed via ${method} (${accountNumber})! Your verification application is now under review.`,
        });
        loadVerification();
      }, 1200);
    } catch (err: any) {
      alert(err?.message || "Payment simulation failed.");
      setPayStep("details");
    } finally {
      setProcessingPayment(false);
    }
  }

  const isVerified = verificationInfo?.isVerified ?? data?.agencyProfile?.isVerified ?? false;
  const latestReq = verificationInfo?.latestRequest;

  return (
    <>
      <AgencySidebar />

      {/* TopNavBar */}
      <header className="sticky top-0 w-full z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center px-gutter py-4 h-20 ml-[260px] w-[calc(100%-260px)]">
        <div className="flex items-center gap-8">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-primary/20 transition-all text-body-md font-body-md" placeholder="Search resources..." type="text"/>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-body-lg text-body-lg" href="/universities">Directory</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-body-lg text-body-lg" href="/about">Resources</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-body-lg text-body-lg" href="/contact">Help</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <AgencyNotificationBell />
          {!isVerified && (
            <button
              onClick={() => {
                setAgreeToPolicy(false);
                setShowVerifyModal(true);
              }}
              className="bg-primary text-on-primary px-5 py-2 rounded-full font-semibold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">verified</span>
              Get Verified Badge
            </button>
          )}
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-white shadow-sm" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC517Ef8OnwbH2GJ3rv9LVMZaCX-mU-cTt3XEcO_TW3wllWHwZvpN5g5xtCuEkzcG4zF294egirjHFUSSD6L6Usu1PeqXs98MEY9wuMaEdxCEdpmnaQjUfKw3lr5jPLc3B_IuE6Lk3XDbZLUeBl3Z5JylT5IkkxAz9KSff37DMSyE-dL9eGGu_ZOLo9DMA6JxMIqvHSzYuyrtwZ0dc5nDrTuI6ysinq9m3jufuXOEi2F5x5FwSRa8_H')"}}></div>
            <div className="hidden lg:block text-left">
              <p className="font-label-md text-label-md font-bold leading-none">{user?.fullName ?? "..."}</p>
              <p className="text-[10px] text-outline uppercase tracking-wider">Agency Admin</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-[260px] p-margin-desktop max-w-[1440px]">
        {/* Payment / Notification Toast Banner */}
        {paymentBanner && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-medium ${
              paymentBanner.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                : paymentBanner.type === "error"
                ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                : "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">
                {paymentBanner.type === "success" ? "check_circle" : paymentBanner.type === "error" ? "error" : "info"}
              </span>
              <span>{paymentBanner.message}</span>
            </div>
            <button
              onClick={() => setPaymentBanner(null)}
              className="text-current opacity-70 hover:opacity-100 p-1"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Agency Header Card */}
        <section className="ambient-card bg-surface-container-lowest rounded-[32px] p-container-padding flex flex-col md:flex-row items-center gap-10 mb-card-gap relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="w-40 h-40 rounded-[24px] bg-surface-container-low flex items-center justify-center overflow-hidden border-4 border-white shadow-lg group">
              {avatarUrl ? <img className="w-full h-full object-cover" alt={`${data?.agencyProfile?.companyName ?? "Agency"} logo`} src={avatarUrl} /> : <span className="material-symbols-outlined text-primary text-6xl">business</span>}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingAvatar} onChange={handleAvatarUpload} />
              </label>
            </div>
            <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
              <span className="material-symbols-outlined text-sm">edit</span>
              <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingAvatar} onChange={handleAvatarUpload} />
            </label>
            {uploadingAvatar && <p className="absolute -bottom-8 left-0 text-xs text-primary whitespace-nowrap">Uploading photo…</p>}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h2 className="font-headline-lg text-headline-lg text-primary">{data?.agencyProfile?.companyName ?? "..."}</h2>
              {isVerified ? (
                <span className="px-4 py-1.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-xs flex items-center gap-1.5 w-fit mx-auto md:mx-0 shadow-sm">
                  <span className="material-symbols-outlined text-base">verified</span>
                  Verified Partner Agency
                </span>
              ) : latestReq?.status === "under_review" ? (
                <span className="px-4 py-1 bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-full font-bold text-xs w-fit mx-auto md:mx-0">
                  ⏳ Verification Under Review
                </span>
              ) : latestReq?.status === "documents_requested" ? (
                <span className="px-4 py-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full font-bold text-xs w-fit mx-auto md:mx-0">
                  ⚠️ Action Required (Docs Requested)
                </span>
              ) : latestReq?.status === "rejected" ? (
                <span className="px-4 py-1 bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-full font-bold text-xs w-fit mx-auto md:mx-0">
                  Declined &amp; Refunded (95%)
                </span>
              ) : (
                <span className="px-4 py-1 bg-surface-container text-on-surface-variant rounded-full font-label-md text-label-md w-fit mx-auto md:mx-0">
                  Pending Verification
                </span>
              )}
            </div>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-6">
              {data?.agencyProfile?.description || "Add a description of your agency's services from Edit Profile."}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {data?.agencyProfile?.address && (
                <span className="px-4 py-1.5 bg-surface-container-low text-on-surface-variant rounded-lg font-label-md text-label-md border border-outline-variant/30 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">location_on</span> {data.agencyProfile.address}
                </span>
              )}
              {data?.agencyProfile?.website && (
                <span className="px-4 py-1.5 bg-surface-container-low text-on-surface-variant rounded-lg font-label-md text-label-md border border-outline-variant/30 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">public</span> {data.agencyProfile.website}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            {!isVerified && (
              <button
                onClick={() => {
                  setAgreeToPolicy(false);
                  setShowVerifyModal(true);
                }}
                className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-95 shadow-md active:scale-95 transition-all text-sm"
              >
                <span className="material-symbols-outlined text-lg">verified</span>
                Apply for Verified Badge
              </button>
            )}
            <button
              onClick={() => setEditing((v) => !v)}
              className="w-full bg-surface-container-high text-on-surface px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-all active:scale-95 text-sm"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              {editing ? "Close Editor" : "Edit Profile"}
            </button>
          </div>
        </section>

        {avatarError && <p className="-mt-6 mb-6 text-error text-sm">{avatarError}</p>}

        {/* Verification Status Feedback Banners */}
        {latestReq?.status === "documents_requested" && (
          <div className="mb-card-gap p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-on-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">assignment_late</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-amber-700 dark:text-amber-300 font-bold">
                  Action Required: Additional Verification Documents Requested
                </h3>
                <p className="text-sm mt-1 text-on-surface">
                  Admin feedback: <strong className="text-amber-800 dark:text-amber-200">&quot;{latestReq.adminNotes}&quot;</strong>
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Please upload the requested credentials under the Business Documents tab to continue your verification review.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("documents")}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-base">upload_file</span>
              Upload Documents Now
            </button>
          </div>
        )}

        {latestReq?.status === "under_review" && (
          <div className="mb-card-gap p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-on-surface flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">hourglass_top</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-blue-700 dark:text-blue-300 font-bold">
                Verification Application Under Review
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Your payment of ৳{Number(latestReq.feeAmount || 5000).toLocaleString()} BDT has been confirmed via SSLCommerz (TrxID: <span className="font-mono text-primary font-bold">{latestReq.transactionId}</span>). Platform compliance reviewers are checking your documents.
              </p>
            </div>
          </div>
        )}

        {latestReq?.status === "rejected" && (
          <div className="mb-card-gap p-6 rounded-3xl bg-rose-500/10 border border-rose-500/25 text-on-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">cancel</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-rose-700 dark:text-rose-300 font-bold">
                  Verification Application Declined
                </h3>
                <p className="text-xs text-on-surface mt-1">
                  Reason: <strong>{latestReq.adminNotes || "Documents did not satisfy platform verification criteria."}</strong>
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  In accordance with policy, <strong>95% (৳{latestReq.refundAmount || "4,750"})</strong> was refunded to your originating payment account (5% service charge retained: ৳{latestReq.serviceFeeDeducted || "250"}).
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setAgreeToPolicy(false);
                setShowVerifyModal(true);
              }}
              className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              Re-apply for Verification
            </button>
          </div>
        )}

        {editing && (
          <section className="ambient-card bg-surface-container-lowest rounded-[24px] p-container-padding mb-card-gap space-y-4">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Edit Agency Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-label-md text-on-surface-variant">Company Name</label>
                <input className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-label-md text-on-surface-variant">Website</label>
                <input className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-label-md text-on-surface-variant">Address</label>
                <input className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-label-md text-on-surface-variant">About Agency</label>
                <textarea className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 resize-none" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-label-md text-on-surface-variant">Student Stories</label>
                <textarea className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 resize-none" rows={5} value={studentStories} onChange={(e) => setStudentStories(e.target.value)} placeholder="Share successful student journeys, outcomes, testimonials, or support experience." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-label-md text-on-surface-variant font-medium">Specialized / Supported Countries</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {supportedCountries.map((c) => (
                    <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary font-medium text-xs rounded-full">
                      {c}
                      <button type="button" onClick={() => setSupportedCountries(prev => prev.filter(x => x !== c))} className="hover:text-error transition-colors font-bold ml-1 text-sm">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-surface-container-low border-none rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-primary/20 text-sm"
                    placeholder="Add destination country (e.g. United Kingdom, Canada)..."
                    value={countryInput}
                    onChange={(e) => setCountryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = countryInput.trim();
                        if (val && !supportedCountries.includes(val)) {
                          setSupportedCountries(prev => [...prev, val]);
                          setCountryInput("");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = countryInput.trim();
                      if (val && !supportedCountries.includes(val)) {
                        setSupportedCountries(prev => [...prev, val]);
                        setCountryInput("");
                      }
                    }}
                    className="px-4 py-2 bg-surface-container-high rounded-xl text-sm font-semibold hover:bg-primary hover:text-on-primary transition-colors"
                  >
                    Add Country
                  </button>
                </div>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="bg-primary text-on-primary px-8 py-2.5 rounded-xl font-bold disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </section>
        )}

        {/* Tab Interface */}
        <div className="mb-card-gap">
          <div className="flex gap-10 border-b border-outline-variant/30 px-4">
            <button onClick={() => setActiveTab("general")} className={activeTab === "general" ? "pb-4 tab-active font-body-lg text-body-lg flex items-center gap-2 transition-all" : "pb-4 text-on-surface-variant hover:text-primary font-body-lg text-body-lg flex items-center gap-2 transition-all"}>
              <span className="material-symbols-outlined">info</span>
              General Info
            </button>
            <button onClick={() => setActiveTab("team")} className={activeTab === "team" ? "pb-4 tab-active font-body-lg text-body-lg flex items-center gap-2 transition-all" : "pb-4 text-on-surface-variant hover:text-primary font-body-lg text-body-lg flex items-center gap-2 transition-all"}>
              <span className="material-symbols-outlined">group</span>
              Team Members
            </button>
            <button onClick={() => setActiveTab("documents")} className={activeTab === "documents" ? "pb-4 tab-active font-body-lg text-body-lg flex items-center gap-2 transition-all" : "pb-4 text-on-surface-variant hover:text-primary font-body-lg text-body-lg flex items-center gap-2 transition-all"}>
              <span className="material-symbols-outlined">description</span>
              Business Documents ({agencyFiles.filter(f => f.category === "business_document").length})
            </button>
            <button onClick={() => setActiveTab("certifications")} className={activeTab === "certifications" ? "pb-4 tab-active font-body-lg text-body-lg flex items-center gap-2 transition-all" : "pb-4 text-on-surface-variant hover:text-primary font-body-lg text-body-lg flex items-center gap-2 transition-all"}>
              <span className="material-symbols-outlined">workspace_premium</span>
              Certifications ({agencyFiles.filter(f => f.category === "certification").length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "general" && (
          <div className="grid grid-cols-12 gap-card-gap">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-8 space-y-card-gap">
              {/* Services Card */}
              <div className="ambient-card bg-surface-container-lowest rounded-[24px] p-container-padding">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Offered Services</h3>
                  <Link href="/agency/programs" className="text-primary font-label-md text-label-md flex items-center gap-1 hover:underline">
                    <span className="material-symbols-outlined text-sm">add</span> Manage Services
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20 hover:border-primary/30 transition-colors group">
                    <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">school</span>
                    </div>
                    <h4 className="font-body-lg text-body-lg font-bold mb-2">Admissions Coaching</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">Personalized guidance for university applications and essay editing.</p>
                  </div>
                  <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20 hover:border-primary/30 transition-colors group">
                    <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <h4 className="font-body-lg text-body-lg font-bold mb-2">Scholarship Assistance</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">Identification and application support for merit-based financial aid.</p>
                  </div>
                  <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20 hover:border-primary/30 transition-colors group">
                    <div className="w-12 h-12 bg-tertiary-fixed text-on-tertiary-fixed rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">airplane_ticket</span>
                    </div>
                    <h4 className="font-body-lg text-body-lg font-bold mb-2">Visa &amp; Immigration</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">End-to-end processing for student visas and residency permits.</p>
                  </div>
                  <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20 hover:border-primary/30 transition-colors group">
                    <div className="w-12 h-12 bg-on-secondary-fixed-variant/10 text-on-secondary-fixed-variant rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">language</span>
                    </div>
                    <h4 className="font-body-lg text-body-lg font-bold mb-2">Test Preparation</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">Intensive IELTS, TOEFL, GRE, and GMAT preparation courses.</p>
                  </div>
                </div>
              </div>

              {/* Team Preview Card */}
              <div className="ambient-card bg-surface-container-lowest rounded-[24px] p-container-padding">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Key Team Members</h3>
                  <button onClick={() => setActiveTab("team")} className="text-primary font-label-md text-label-md flex items-center gap-1 hover:underline">
                    Manage Team ({team.length})
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-6 p-4 bg-background rounded-2xl hover:bg-surface-container-low transition-colors">
                    <div className="w-16 h-16 rounded-full bg-cover bg-center border-2 border-white shadow-md" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAA-eHBsm49ylKz3FtFaXP6FURoAg6moGZ5KrGZE7hFuHoMA-3-U43siIKQ0bLtkMe2nXl_UnwloP5iWVQetTVWBChYw6qXoK_N3cCBLYZh5PI9aysjtxQ53l5uqQXnUAsVg7oqJ5KWqazgb4rm5qy70A1ywCI3Qgqzs1hn8dQZ2XQ21WEoyws5ArDVw4XyyDS_LZoB7pGZb37Jk6DuVAHUQfJceqk3scSRLMw18u1m4TC2IHcnTnVK')"}}></div>
                    <div className="flex-1">
                      <p className="font-body-lg text-body-lg font-bold">Dr. Alistair Cook</p>
                      <p className="font-body-md text-body-md text-on-surface-variant">Chief Academic Strategist • 15+ Yrs Exp.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Verified Partner Widget & Destinations */}
            <div className="col-span-12 lg:col-span-4 space-y-card-gap">
              {/* StudyBridge Verified Badge & Trust Widget */}
              <div className="ambient-card rounded-[24px] p-container-padding border overflow-hidden relative shadow-sm bg-gradient-to-br from-primary/10 via-surface-container-lowest to-surface-container-low border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isVerified ? "bg-emerald-500/20 text-emerald-600" : "bg-primary/20 text-primary"}`}>
                    <span className="material-symbols-outlined text-2xl">verified</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-on-surface font-bold">
                      {isVerified ? "Verified Partner Active" : "Get Verified Partner Badge"}
                    </h3>
                    <p className="text-xs text-on-surface-variant">Official Trust &amp; Accreditation</p>
                  </div>
                </div>

                {isVerified ? (
                  <div className="space-y-3 text-xs text-on-surface-variant">
                    <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                      ✓ Your agency is officially verified with the verified seal displayed in student search.
                    </p>
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200">
                      <strong>Benefits Active:</strong> Priority ranking, verified badge on student portals, and direct student leads.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5 text-xs text-on-surface-variant">
                    <p>
                      Apply for the official StudyBridge Verified Seal. Boost prospective student trust and receive priority placement in university listings.
                    </p>
                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-1">
                      <div className="flex justify-between font-medium text-on-surface">
                        <span>Verification Fee:</span>
                        <strong className="text-primary font-bold">৳5,000 BDT</strong>
                      </div>
                      <p className="text-[11px] text-outline">Processed securely via SSLCommerz (Cards/MFS)</p>
                    </div>

                    <button
                      onClick={() => {
                        setAgreeToPolicy(false);
                        setShowVerifyModal(true);
                      }}
                      className="w-full bg-primary hover:opacity-95 text-on-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-base">verified</span>
                      Apply for Verified Badge
                    </button>
                  </div>
                )}
              </div>

              {/* Supported Destinations Card */}
              <div className="ambient-card bg-surface-container-lowest rounded-[24px] p-container-padding">
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">public</span>
                  Study Destinations
                </h3>
                <p className="text-xs text-on-surface-variant mb-4">Countries where your agency actively places students:</p>
                {supportedCountries.length === 0 ? (
                  <p className="text-sm text-outline italic">No countries configured yet. Click &quot;Edit Profile&quot; to add destination countries.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {supportedCountries.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container/20 text-secondary border border-secondary/20 font-medium text-xs rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Business Certifications Widget */}
              <div className="ambient-card bg-surface-container-lowest rounded-[24px] p-container-padding">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Credentials</h3>
                  <button onClick={() => setActiveTab("certifications")} className="text-primary text-xs font-bold hover:underline">
                    View All ({agencyFiles.length})
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  {agencyFiles.slice(0, 3).map((f) => (
                    <div key={f.id} className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-on-surface">{f.title}</span>
                      <span className="text-[10px] text-outline capitalize">{f.category.replace("_", " ")}</span>
                    </div>
                  ))}
                  {agencyFiles.length === 0 && (
                    <p className="text-on-surface-variant italic">No credentials uploaded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "team" && (
          <section className="ambient-card bg-surface-container-lowest rounded-[24px] p-container-padding">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Team Members</h3>
                <p className="text-body-md text-on-surface-variant mt-1">Manage team roles from Settings.</p>
              </div>
              <Link href="/agency/settings" className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-label-md">Manage Team</Link>
            </div>
            <div className="divide-y divide-outline-variant/20">
              {team.length === 0 ? (
                <p className="py-10 text-center text-on-surface-variant">No team members have been invited yet.</p>
              ) : (
                team.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-primary">{member.fullName.slice(0, 1).toUpperCase()}</div>
                      <div>
                        <p className="font-semibold text-on-surface">{member.fullName}</p>
                        <p className="text-label-md text-on-surface-variant">{member.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-label-md font-bold text-primary">{member.role}</p>
                      <p className="text-label-md text-on-surface-variant">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${member.status === "active" ? "bg-green-500" : "bg-outline"}`}></span>
                        {member.status === "active" ? "Active" : "Pending invite"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "documents" && (
          <FilePanel
            category="business_document"
            files={agencyFiles.filter((file) => file.category === "business_document")}
            uploading={uploadingCategory === "business_document"}
            error={uploadError}
            message={uploadMessage}
            onUpload={handleFileUpload}
            onDelete={removeFile}
          />
        )}

        {activeTab === "certifications" && (
          <FilePanel
            category="certification"
            files={agencyFiles.filter((file) => file.category === "certification")}
            uploading={uploadingCategory === "certification"}
            error={uploadError}
            message={uploadMessage}
            onUpload={handleFileUpload}
            onDelete={removeFile}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest dark:bg-on-tertiary-fixed border-t border-outline-variant/30 dark:border-outline/20 px-margin-desktop py-gutter ml-[260px] w-[calc(100%-260px)] flex flex-col md:flex-row justify-between items-center mt-20">
        <div>
          <span className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed">StudyBridge</span>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline-variant mt-2">© 2024 StudyBridge Global Education. All rights reserved.</p>
        </div>
        <div className="flex gap-8 mt-6 md:mt-0">
          <Link className="font-label-md text-label-md text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>
          <Link className="font-label-md text-label-md text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors" href="/terms">Terms of Service</Link>
          <Link className="font-label-md text-label-md text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors" href="/contact">Contact Support</Link>
        </div>
      </footer>

      {/* Modal: SSLCommerz Interactive Checkout (Mobile Banking, Cards, Net Banking) */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-surface-container-lowest dark:bg-[#1b1c20] p-7 border border-outline-variant/20 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">lock</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline-sm text-on-surface font-bold">SSLCommerz Secure Checkout</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      Sandbox Demo
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">Merchant: StudyBridge Global Education</p>
                </div>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Fee summary card */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex justify-between items-center text-sm">
              <div>
                <p className="font-bold text-on-surface">Verified Partner Badge Fee</p>
                <p className="text-xs text-on-surface-variant">One-time compliance verification &amp; seal issuance</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-primary font-mono">৳5,000</p>
                <p className="text-[10px] font-bold text-outline">BDT (Bangladeshi Taka)</p>
              </div>
            </div>

            {/* Step 1: Select Payment Method Category */}
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                1. Select Payment Method Category:
              </p>
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setPaymentCategory("mobile")}
                  className={`py-2.5 px-2 rounded-xl font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentCategory === "mobile"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">phone_iphone</span>
                  <span>Mobile Banking</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentCategory("bank")}
                  className={`py-2.5 px-2 rounded-xl font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentCategory === "bank"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">account_balance</span>
                  <span>Internet Banking</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentCategory("card")}
                  className={`py-2.5 px-2 rounded-xl font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentCategory === "card"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">credit_card</span>
                  <span>Cards</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Mobile Banking (bKash, Nagad, Rocket, Upay) */}
            {paymentCategory === "mobile" && (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                    2. Select Mobile Banking Service:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: "bKash" as const, color: "pink", icon: "payments", tag: "bKash Ltd" },
                      { id: "Nagad" as const, color: "orange", icon: "account_balance_wallet", tag: "Post Office MFS" },
                      { id: "Rocket" as const, color: "purple", icon: "send_to_mobile", tag: "DBBL MFS" },
                      { id: "Upay" as const, color: "amber", icon: "mobile_friendly", tag: "UCB MFS" },
                    ].map((prov) => {
                      const isSelected = mobileProvider === prov.id;
                      return (
                        <button
                          key={prov.id}
                          type="button"
                          onClick={() => setMobileProvider(prov.id)}
                          className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? prov.id === "bKash"
                                ? "border-pink-500 bg-pink-500/10 text-pink-700 dark:text-pink-300 shadow-md ring-2 ring-pink-500/20"
                                : prov.id === "Nagad"
                                ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300 shadow-md ring-2 ring-orange-500/20"
                                : prov.id === "Rocket"
                                ? "border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 shadow-md ring-2 ring-purple-500/20"
                                : "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-md ring-2 ring-amber-500/20"
                              : "border-outline-variant/30 bg-surface-container-low text-on-surface hover:border-outline-variant"
                          }`}
                        >
                          <span className="material-symbols-outlined text-2xl">{prov.icon}</span>
                          <span className="font-bold text-xs">{prov.id}</span>
                          <span className="text-[9px] opacity-75 font-medium">{prov.tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Banking Input Form */}
                <div className="space-y-3 p-4 rounded-2xl bg-surface-container-low border-2 border-primary/20 shadow-sm">
                  <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">pin</span>
                      3. Enter {mobileProvider} Account Number &amp; PIN/OTP:
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                      {mobileProvider} Gateway
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                      <span>{mobileProvider} Mobile Number:</span>
                      <span className="text-[10px] text-outline">11 digits (e.g. 017xxxxxxxx)</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">
                        phone_iphone
                      </span>
                      <input
                        type="tel"
                        value={mfsNumber}
                        onChange={(e) => setMfsNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        maxLength={11}
                        className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant/30 py-2.5 pl-10 pr-4 text-sm text-on-surface font-mono font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                      <span>{mobileProvider} Demo PIN / OTP:</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Demo: 1234</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">
                        password
                      </span>
                      <input
                        type="password"
                        value={mfsPin}
                        onChange={(e) => setMfsPin(e.target.value)}
                        placeholder="Enter Demo PIN or OTP (e.g. 1234)"
                        maxLength={6}
                        className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant/30 py-2.5 pl-10 pr-4 text-sm text-on-surface font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-outline">
                    A test SSLCommerz transaction handshake will be issued for {mobileProvider} ({mfsNumber || "017XXXXXXXX"}).
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: Internet Banking */}
            {paymentCategory === "bank" && (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                    2. Select Internet Banking Bank:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: "City Touch (City Bank)" as const, short: "CityTouch", sub: "The City Bank" },
                      { id: "Islami Bank" as const, short: "IBBL", sub: "iBanking / CellFin" },
                      { id: "BRAC Bank" as const, short: "BRAC Bank", sub: "Astha NetBanking" },
                      { id: "Dutch-Bangla Bank (DBBL)" as const, short: "DBBL Nexus", sub: "Nexus Gateway" },
                      { id: "Eastern Bank (EBL)" as const, short: "EBL SKYBANKING", sub: "Eastern Bank Ltd" },
                    ].map((bank) => {
                      const isSelected = bankProvider === bank.id;
                      return (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setBankProvider(bank.id)}
                          className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary shadow-md ring-2 ring-primary/20"
                              : "border-outline-variant/30 bg-surface-container-low text-on-surface hover:border-outline-variant"
                          }`}
                        >
                          <span className="material-symbols-outlined text-2xl">account_balance</span>
                          <span className="font-bold text-xs text-center">{bank.short}</span>
                          <span className="text-[9px] opacity-75">{bank.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bank Credentials Form */}
                <div className="space-y-3 p-4 rounded-2xl bg-surface-container-low border-2 border-primary/20 shadow-sm">
                  <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">badge</span>
                      3. Enter {bankProvider} Credentials:
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                      Bank Gateway
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface">Bank Account Number / User ID:</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">
                        account_box
                      </span>
                      <input
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="e.g. 1502448899001 or NetBanking User ID"
                        className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant/30 py-2.5 pl-10 pr-4 text-sm text-on-surface font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface">Branch Name / Location:</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">
                        location_city
                      </span>
                      <input
                        type="text"
                        value={bankBranch}
                        onChange={(e) => setBankBranch(e.target.value)}
                        placeholder="e.g. Principal Branch, Dhaka"
                        className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant/30 py-2.5 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                      <span>Internet Banking Password / Demo Security Code:</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Demo: 123456</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">
                        key
                      </span>
                      <input
                        type="password"
                        value={bankPassword}
                        onChange={(e) => setBankPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant/30 py-2.5 pl-10 pr-4 text-sm text-on-surface font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Cards (Debit / Credit) */}
            {paymentCategory === "card" && (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                    2. Select Card Scheme:
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(["Visa Card", "Mastercard", "AMEX"] as const).map((card) => {
                      const isSelected = cardProvider === card;
                      return (
                        <button
                          key={card}
                          type="button"
                          onClick={() => setCardProvider(card)}
                          className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary shadow-md ring-2 ring-primary/20"
                              : "border-outline-variant/30 bg-surface-container-low text-on-surface hover:border-outline-variant"
                          }`}
                        >
                          <span className="material-symbols-outlined text-2xl">credit_card</span>
                          <span className="font-bold text-xs">{card}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Card Inputs Form */}
                <div className="space-y-3 p-4 rounded-2xl bg-surface-container-low border-2 border-primary/20 shadow-sm">
                  <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">credit_card</span>
                      3. Enter {cardProvider} Details:
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                      Card Gateway
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface">Card Number:</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4111 2222 3333 4444"
                      maxLength={19}
                      className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant/30 py-2.5 px-4 text-sm text-on-surface font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface">Cardholder Name:</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name on card"
                      className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant/30 py-2.5 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface">Expiry (MM/YY):</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant/30 py-2.5 px-4 text-sm text-on-surface font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface">CVV / CVC:</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="***"
                        maxLength={4}
                        className="w-full rounded-xl bg-surface-container-lowest border border-outline-variant/30 py-2.5 px-4 text-sm text-on-surface font-mono focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* REQUIRED TRANSPARENT DISCLAIMER / NOTICE */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold">
                <span className="material-symbols-outlined text-base">warning</span>
                <span>Important Verification Policy &amp; Refund Terms</span>
              </div>
              <p className="text-on-surface leading-relaxed">
                Please ensure all submitted business documents and credentials are authentic and appropriate. 
                <strong> If your submitted documents are not appropriate, your verification request can be declined and ৳4,750 (95%) will be returned to this originating payment account after deducting a 5% service charge (৳250).</strong>
              </p>
              <p className="text-[11px] text-on-surface-variant">
                Originating account for refund:{" "}
                <strong className="text-primary font-mono">
                  {paymentCategory === "mobile"
                    ? `${mobileProvider} (${mfsNumber || "017xxxxxxxx"})`
                    : paymentCategory === "card"
                    ? `${cardProvider} (${cardNumber ? cardNumber.slice(-4) : "****"})`
                    : `${bankProvider} (${bankAccount || "Account"})`}
                </strong>
              </p>
            </div>

            {/* Checkbox Agreement */}
            <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={agreeToPolicy}
                onChange={(e) => setAgreeToPolicy(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20"
              />
              <span className="text-xs text-on-surface">
                I accept the terms: if my documents are not appropriate, my request may be declined with a <strong>5% service charge deduction</strong> and 95% refund back to this payment account.
              </span>
            </label>

            {/* Submit & Payment Actions */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCompletePayment}
                disabled={
                  !agreeToPolicy ||
                  processingPayment ||
                  (paymentCategory === "mobile" && !mfsNumber.trim()) ||
                  (paymentCategory === "card" && !cardNumber.trim()) ||
                  (paymentCategory === "bank" && !bankAccount.trim())
                }
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-on-primary py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  {payStep === "processing" ? "sync" : "verified_user"}
                </span>
                {payStep === "processing"
                  ? "Contacting SSLCommerz Gateway..."
                  : payStep === "success"
                  ? "Payment Approved!"
                  : `Confirm & Pay ৳5,000 via ${
                      paymentCategory === "mobile"
                        ? mobileProvider
                        : paymentCategory === "card"
                        ? cardProvider
                        : bankProvider
                    }`}
              </button>

              <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
                <button
                  type="button"
                  onClick={handleApplySSLCommerzGateway}
                  disabled={!agreeToPolicy || processingPayment}
                  className="hover:underline text-primary text-[11px] disabled:opacity-50 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                  Open in External SSLCommerz Hosted Page
                </button>

                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="text-[11px] hover:text-on-surface"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilePanel({
  category,
  files,
  uploading,
  error,
  message,
  onUpload,
  onDelete,
}: {
  category: AgencyFile["category"];
  files: AgencyFile[];
  uploading: boolean;
  error: string;
  message: string;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>, category: AgencyFile["category"]) => void;
  onDelete: (id: string) => void;
}) {
  const certification = category === "certification";
  return (
    <section className="ambient-card bg-surface-container-lowest rounded-[24px] p-container-padding">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-7">
        <div>
          <span className="material-symbols-outlined text-primary text-4xl">
            {certification ? "workspace_premium" : "business_center"}
          </span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mt-3">
            {certification ? "Certifications" : "Business Documents"}
          </h3>
          <p className="text-body-md text-on-surface-variant mt-2">
            {certification
              ? "Upload credentials that students can view on your agency profile."
              : "Upload your license, registration, tax, or other business records for administrator review."}
          </p>
        </div>
        <label className="h-fit cursor-pointer bg-primary text-on-primary px-5 py-3 rounded-xl font-bold inline-flex gap-2 items-center text-xs">
          <span className="material-symbols-outlined text-sm">upload_file</span>
          {uploading ? "Uploading..." : "Upload file"}
          <input
            className="hidden"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            disabled={uploading}
            onChange={(event) => onUpload(event, category)}
          />
        </label>
      </div>
      {error && <p className="mb-4 text-error text-sm">{error}</p>}
      {message && <p className="mb-4 text-primary text-sm font-medium">{message}</p>}
      <div className="space-y-3">
        {files.length === 0 ? (
          <p className="py-8 text-center text-on-surface-variant text-xs">
            No {certification ? "certificates" : "business documents"} uploaded yet.
          </p>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-3 p-4 rounded-xl bg-surface-container-low"
            >
              <div className="min-w-0 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  {file.fileName.toLowerCase().endsWith("pdf") ? "picture_as_pdf" : "description"}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-on-surface truncate text-sm">{file.title}</p>
                  <p className="text-xs text-on-surface-variant truncate">{file.fileName}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`${API_BASE_URL}/api/agency/files/${file.id}/file`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-primary hover:bg-surface-container-high rounded-lg"
                  title="View file"
                >
                  <span className="material-symbols-outlined">visibility</span>
                </a>
                <button
                  onClick={() => onDelete(file.id)}
                  className="p-2 text-error hover:bg-surface-container-high rounded-lg"
                  title="Delete file"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
