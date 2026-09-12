"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AgencySidebar from "@/components/dashboard/AgencySidebar";
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
  }

  useEffect(load, []);
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
<button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors relative">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
</button>
<button className="bg-primary text-on-primary px-6 py-2 rounded-full font-semibold text-body-md hover:opacity-90 transition-opacity">
                Upgrade
            </button>
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
{/* Agency Header Card */}
<section className="ambient-card bg-surface-container-lowest rounded-[32px] p-container-padding flex flex-col md:flex-row items-center gap-10 mb-card-gap relative overflow-hidden">
{/* Decorative Background Element */}
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
{data?.agencyProfile?.isVerified ? (
<span className="px-4 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full font-label-md text-label-md w-fit mx-auto md:mx-0">Verified Agency</span>
) : (
<span className="px-4 py-1 bg-surface-container text-on-surface-variant rounded-full font-label-md text-label-md w-fit mx-auto md:mx-0">Pending Verification</span>
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
<button onClick={() => setEditing((v) => !v)} className="w-full bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-md">
<span className="material-symbols-outlined text-sm">edit</span>
                    {editing ? "Close Editor" : "Edit Profile"}
                </button>
</div>
</section>
{avatarError && <p className="-mt-6 mb-6 text-error text-sm">{avatarError}</p>}

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
<textarea className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 resize-none" rows={5} value={studentStories} onChange={(e) => setStudentStories(e.target.value)} placeholder="Share successful student journeys, outcomes, testimonials, or support experience. This will appear to students on your public profile." />
<p className="text-xs text-on-surface-variant">Students can view this from your agency profile.</p>
</div>
<div className="space-y-2 md:col-span-2">
<label className="text-label-md text-on-surface-variant font-medium">Specialized / Supported Countries</label>
<div className="flex gap-2 flex-wrap mb-2">
{supportedCountries.map((c) => (
  <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary font-medium text-xs rounded-full">
    {c}
    <button
      type="button"
      onClick={() => setSupportedCountries(prev => prev.filter(x => x !== c))}
      className="hover:text-error transition-colors font-bold ml-1 text-sm"
    >
      ×
    </button>
  </span>
))}
</div>
<div className="flex gap-2">
<input
  className="flex-1 bg-surface-container-low border-none rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-primary/20 text-sm"
  placeholder="Add destination country (e.g. United Kingdom, Singapore, Canada)..."
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
<p className="text-xs text-outline">Students will be recommended your agency when applying to universities located in these countries.</p>
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
                    Business Documents
                </button>
<button onClick={() => setActiveTab("certifications")} className={activeTab === "certifications" ? "pb-4 tab-active font-body-lg text-body-lg flex items-center gap-2 transition-all" : "pb-4 text-on-surface-variant hover:text-primary font-body-lg text-body-lg flex items-center gap-2 transition-all"}>
<span className="material-symbols-outlined">workspace_premium</span>
                    Certifications
                </button>
</div>
</div>
{/* Dashboard Grid / Content Area */}
{activeTab === "general" && <div className="grid grid-cols-12 gap-card-gap">
{/* Left Column: Services & Description */}
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
<button className="text-primary font-label-md text-label-md flex items-center gap-1 hover:underline">
                            View All Team (12)
                        </button>
</div>
<div className="flex flex-col gap-4">
<div className="flex items-center gap-6 p-4 bg-background rounded-2xl hover:bg-surface-container-low transition-colors">
<div className="w-16 h-16 rounded-full bg-cover bg-center border-2 border-white shadow-md" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAA-eHBsm49ylKz3FtFaXP6FURoAg6moGZ5KrGZE7hFuHoMA-3-U43siIKQ0bLtkMe2nXl_UnwloP5iWVQetTVWBChYw6qXoK_N3cCBLYZh5PI9aysjtxQ53l5uqQXnUAsVg7oqJ5KWqazgb4rm5qy70A1ywCI3Qgqzs1hn8dQZ2XQ21WEoyws5ArDVw4XyyDS_LZoB7pGZb37Jk6DuVAHUQfJceqk3scSRLMw18u1m4TC2IHcnTnVK')"}}></div>
<div className="flex-1">
<p className="font-body-lg text-body-lg font-bold">Dr. Alistair Cook</p>
<p className="font-body-md text-body-md text-on-surface-variant">Chief Academic Strategist • 15+ Yrs Exp.</p>
</div>
<div className="flex gap-2">
<button className="p-2 text-outline hover:text-primary transition-colors"><span className="material-symbols-outlined">mail</span></button>
<button className="p-2 text-outline hover:text-primary transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
</div>
</div>
<div className="flex items-center gap-6 p-4 bg-background rounded-2xl hover:bg-surface-container-low transition-colors">
<div className="w-16 h-16 rounded-full bg-cover bg-center border-2 border-white shadow-md" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCXnb0ilYNWBgQB-1Tz2cYa3afkrQCSvkwatOSS9SgCIhNIAnLJg_kGlLyEjbCIjDKPPLDxK8pgvZFuzxTAPq-HYUQAJRvQ2v_62dDCtwjkkCG2Y2rHSIMtd7RjaS0He1EL3O0SdHrHbwXmRqcbwX58VeflYnWUD7fqpAFvsJTecEd4R5e0TCNBvduobtKq8-by2VVWCyTwiZr-zLlFfSPxATbmGXNqIjP-DJ73an-6kBcG5-JeLG-z')"}}></div>
<div className="flex-1">
<p className="font-body-lg text-body-lg font-bold">Elena Rodriguez</p>
<p className="font-body-md text-body-md text-on-surface-variant">Senior Visa Specialist • IVCC Certified</p>
</div>
<div className="flex gap-2">
<button className="p-2 text-outline hover:text-primary transition-colors"><span className="material-symbols-outlined">mail</span></button>
<button className="p-2 text-outline hover:text-primary transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
</div>
</div>
</div>
</div>
</div>
{/* Right Column: Business Certifications & Quick Links */}
<div className="col-span-12 lg:col-span-4 space-y-card-gap">
{/* Supported Destinations Card */}
<div className="ambient-card bg-surface-container-lowest rounded-[24px] p-container-padding">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 flex items-center gap-2">
  <span className="material-symbols-outlined text-primary">public</span>
  Study Destinations
</h3>
<p className="text-xs text-on-surface-variant mb-4">Countries where your agency actively places students:</p>
{supportedCountries.length === 0 ? (
  <p className="text-sm text-outline italic">No countries configured yet. Click &quot;Edit Profile&quot; to add your destination countries.</p>
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
{/* Business Profile Strength */}
<div className="ambient-card bg-primary dark:bg-on-tertiary-fixed rounded-[24px] p-container-padding text-on-primary">
<h3 className="font-headline-sm text-headline-sm mb-6">Profile Strength</h3>
<div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
<svg className="w-full h-full transform -rotate-90">
<circle className="text-primary-container opacity-30" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
<circle className="text-secondary-fixed" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset="72.8" strokeWidth="8"></circle>
</svg>
<span className="absolute text-2xl font-bold">85%</span>
</div>
<p className="font-body-md text-body-md text-center text-primary-fixed-dim mb-6">Complete your business documents to reach 100% and get the &apos;Gold Partner&apos; badge.</p>
<button className="w-full bg-surface-container-lowest text-primary py-3 rounded-xl font-bold hover:bg-secondary-fixed transition-colors">
                        Improve Profile
                    </button>
</div>
{/* Certifications Card */}
<div className="ambient-card bg-surface-container-lowest rounded-[24px] p-container-padding">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-8">Certifications</h3>
<div className="space-y-6">
<div className="flex items-start gap-4">
<div className="w-12 h-12 flex-shrink-0 bg-surface-container-high rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
</div>
<div>
<p className="font-body-lg text-body-lg font-bold leading-tight">ICEF Accredited Agency</p>
<p className="text-[12px] text-outline mt-1 uppercase tracking-tighter">Exp: Dec 2025</p>
</div>
</div>
<div className="flex items-start gap-4">
<div className="w-12 h-12 flex-shrink-0 bg-surface-container-high rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>workspace_premium</span>
</div>
<div>
<p className="font-body-lg text-body-lg font-bold leading-tight">British Council Certified</p>
<p className="text-[12px] text-outline mt-1 uppercase tracking-tighter">Verified Partner</p>
</div>
</div>
<div className="flex items-start gap-4">
<div className="w-12 h-12 flex-shrink-0 bg-surface-container-high rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>military_tech</span>
</div>
<div>
<p className="font-body-lg text-body-lg font-bold leading-tight">AIRC Membership</p>
<p className="text-[12px] text-outline mt-1 uppercase tracking-tighter">Active Status</p>
</div>
</div>
</div>
<button className="w-full mt-10 border-2 border-outline-variant/30 text-on-surface-variant py-3 rounded-xl font-semibold hover:border-primary/40 hover:text-primary transition-all">
                        Add New Certificate
                    </button>
</div>
{/* Business Docs Widget */}
<div className="ambient-card bg-surface-container-low rounded-[24px] p-container-padding">
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Quick Documents</h3>
<div className="space-y-3">
<div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-error">picture_as_pdf</span>
<span className="font-body-md text-body-md">Business License.pdf</span>
</div>
<span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">download</span>
</div>
<div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-error">picture_as_pdf</span>
<span className="font-body-md text-body-md">Tax_Compliance.pdf</span>
</div>
<span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">download</span>
</div>
</div>
</div>
</div>
</div>}
{activeTab === "team" && <section className="ambient-card bg-surface-container-lowest rounded-[24px] p-container-padding"><div className="flex justify-between items-center mb-6"><div><h3 className="font-headline-sm text-headline-sm text-on-surface">Team Members</h3><p className="text-body-md text-on-surface-variant mt-1">Manage team roles from Settings.</p></div><Link href="/agency/settings" className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-label-md">Manage Team</Link></div><div className="divide-y divide-outline-variant/20">{team.length === 0 ? <p className="py-10 text-center text-on-surface-variant">No team members have been invited yet.</p> : team.map((member) => <div key={member.id} className="flex items-center justify-between gap-4 py-4"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-primary">{member.fullName.slice(0, 1).toUpperCase()}</div><div><p className="font-semibold text-on-surface">{member.fullName}</p><p className="text-label-md text-on-surface-variant">{member.email}</p></div></div><div className="text-right"><p className="text-label-md font-bold text-primary">{member.role}</p><p className="text-label-md text-on-surface-variant"><span className={`inline-block w-2 h-2 rounded-full mr-1 ${member.status === "active" ? "bg-green-500" : "bg-outline"}`}></span>{member.status === "active" ? "Active" : "Pending invite"}</p></div></div>)}</div></section>}
{activeTab === "documents" && <FilePanel category="business_document" files={agencyFiles.filter((file) => file.category === "business_document")} uploading={uploadingCategory === "business_document"} error={uploadError} message={uploadMessage} onUpload={handleFileUpload} onDelete={removeFile} />}
{activeTab === "certifications" && <FilePanel category="certification" files={agencyFiles.filter((file) => file.category === "certification")} uploading={uploadingCategory === "certification"} error={uploadError} message={uploadMessage} onUpload={handleFileUpload} onDelete={removeFile} />}
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


</>
  );
}

function FilePanel({ category, files, uploading, error, message, onUpload, onDelete }: { category: AgencyFile["category"]; files: AgencyFile[]; uploading: boolean; error: string; message: string; onUpload: (event: React.ChangeEvent<HTMLInputElement>, category: AgencyFile["category"]) => void; onDelete: (id: string) => void }) {
  const certification = category === "certification";
  return <section className="ambient-card bg-surface-container-lowest rounded-[24px] p-container-padding">
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-7"><div><span className="material-symbols-outlined text-primary text-4xl">{certification ? "workspace_premium" : "business_center"}</span><h3 className="font-headline-sm text-headline-sm text-on-surface mt-3">{certification ? "Certifications" : "Business Documents"}</h3><p className="text-body-md text-on-surface-variant mt-2">{certification ? "Upload credentials that students can view on your agency profile." : "Upload your licence, registration, tax, or other business records. These remain private."}</p></div><label className="h-fit cursor-pointer bg-primary text-on-primary px-5 py-3 rounded-xl font-bold inline-flex gap-2 items-center"><span className="material-symbols-outlined text-sm">upload_file</span>{uploading ? "Uploading..." : "Upload file"}<input className="hidden" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" disabled={uploading} onChange={(event) => onUpload(event, category)} /></label></div>
    {error && <p className="mb-4 text-error text-sm">{error}</p>}
    {message && <p className="mb-4 text-primary text-sm font-medium">{message}</p>}
    <div className="space-y-3">{files.length === 0 ? <p className="py-8 text-center text-on-surface-variant">No {certification ? "certificates" : "business documents"} uploaded yet.</p> : files.map((file) => <div key={file.id} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-surface-container-low"><div className="min-w-0 flex items-center gap-3"><span className="material-symbols-outlined text-primary">{file.fileName.toLowerCase().endsWith("pdf") ? "picture_as_pdf" : "description"}</span><div className="min-w-0"><p className="font-bold text-on-surface truncate">{file.title}</p><p className="text-sm text-on-surface-variant truncate">{file.fileName}</p></div></div><div className="flex gap-2">{certification && <a href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/agency/files/${file.id}/file`} target="_blank" rel="noreferrer" className="p-2 text-primary" title="View file"><span className="material-symbols-outlined">visibility</span></a>}<button onClick={() => onDelete(file.id)} className="p-2 text-error" title="Delete file"><span className="material-symbols-outlined">delete</span></button></div></div>)}</div>
  </section>;
}
