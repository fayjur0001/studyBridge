"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { University, Program } from "@/lib/types";
import { universityImage } from "@/lib/university-images";

interface UniversityDetail extends University {
  programs: Program[];
}

export default function UniversityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();
  const [university, setUniversity] = useState<UniversityDetail | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [appliedProgramIds, setAppliedProgramIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get<UniversityDetail>(`/api/universities/${id}`, { auth: false }).then(setUniversity);
  }, [id]);

  async function handleSave() {
    setSaveError(null);
    try {
      await api.post("/api/saved-items", { itemType: "university", itemId: id });
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof ApiError ? "Please log in as a student to save universities." : "Couldn't save right now.");
    }
  }

  async function handleApply(programId: string) {
    setApplyError(null);

    if (!user) {
      setApplyError("Please log in as a student to apply.");
      return;
    }
    if (user.role !== "student") {
      setApplyError("Only student accounts can submit applications.");
      return;
    }

    setApplyingId(programId);
    try {
      const application = await api.post<{ id: string }>("/api/applications", { programId });
      setAppliedProgramIds((prev) => new Set(prev).add(programId));
      router.push(`/student/applications/${application.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setAppliedProgramIds((prev) => new Set(prev).add(programId));
        setApplyError("You already have an active application for this program.");
      } else if (err instanceof ApiError) {
        setApplyError(err.message);
      } else {
        setApplyError("Couldn't start the application right now.");
      }
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <>
<PublicNavbar variant="glass" current="Universities" />

<section className="relative w-full h-[600px] bg-primary overflow-hidden">
<div className="absolute inset-0 z-0">
<div className="w-full h-full bg-cover bg-center opacity-70" style={{backgroundImage: `url('${universityImage(university?.name ?? "", university?.coverImageUrl, university?.logoUrl)}')`}}></div>
<div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-60"></div>
</div>
<div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-end px-margin-desktop pb-16">
<div className="inline-flex items-center gap-2 px-3 py-1 bg-on-primary/10 backdrop-blur-md rounded-full border border-on-primary/20 mb-6 w-fit">
<span className="material-symbols-outlined text-on-primary text-[18px]">verified</span>
<span className="text-on-primary font-label-md text-label-md uppercase tracking-wider">Partner Institution</span>
</div>
<h1 className="font-display-lg text-display-lg text-on-primary mb-2">{university?.name ?? "Loading..."}</h1>
<div className="flex items-center gap-4 text-on-primary/90 font-body-lg text-body-lg mb-10">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-[20px]">location_on</span>
<span>{[university?.city, university?.country].filter(Boolean).join(", ")}</span>
</div>
</div>

<div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
<div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-on-primary">
<p className="text-on-primary/70 font-label-md text-label-md uppercase mb-1">World Rank</p>
<p className="font-headline-lg text-headline-lg">{university?.ranking ? `#${university.ranking}` : "—"}</p>
</div>
<div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-on-primary">
<p className="text-on-primary/70 font-label-md text-label-md uppercase mb-1">Programs</p>
<p className="font-headline-lg text-headline-lg">{university?.programs.length ?? 0}</p>
</div>
<div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-on-primary">
<p className="text-on-primary/70 font-label-md text-label-md uppercase mb-1">Region</p>
<p className="font-headline-lg text-headline-lg">{university?.region ?? "—"}</p>
</div>
</div>
</div>
</section>

<main className="max-w-7xl mx-auto px-margin-desktop py-12 flex flex-col lg:flex-row gap-gutter">

<div className="flex-1 space-y-12">

<section className="ambient-card rounded-3xl p-8" id="about">
<h2 className="font-headline-lg text-headline-lg text-primary mb-6">About the University</h2>
<div className="space-y-4 text-on-surface-variant font-body-lg text-body-lg leading-relaxed">
<p>{university?.description || "A detailed description for this university hasn't been added yet."}</p>
</div>
</section>

{(university?.admissionRequirements || university?.applicationStartDate || university?.applicationDeadline) && <section className="ambient-card rounded-3xl p-8"><h2 className="font-headline-lg text-primary mb-6">Admissions information</h2><div className="grid md:grid-cols-2 gap-5">{university?.admissionRequirements && <div><h3 className="font-bold text-on-surface mb-2">Requirements</h3><p className="whitespace-pre-wrap text-on-surface-variant">{university.admissionRequirements}</p></div>}<div className="rounded-2xl bg-surface-container-low p-5 space-y-3"><p className="text-on-surface-variant">Application opens: <b className="text-on-surface">{university?.applicationStartDate ? new Date(university.applicationStartDate).toLocaleDateString() : "Contact university"}</b></p><p className="text-on-surface-variant">Application deadline: <b className="text-on-surface">{university?.applicationDeadline ? new Date(university.applicationDeadline).toLocaleDateString() : "Contact university"}</b></p></div></div></section>}

{university?.galleryImageUrls?.length ? <section className="space-y-6"><h2 className="font-headline-lg text-primary">Campus gallery</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-card-gap">{university.galleryImageUrls.map((image, index) => <img key={image} src={image.startsWith("/") ? `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}${image}` : image} alt={`${university.name} campus ${index + 1}`} className="w-full aspect-[4/3] object-cover rounded-3xl" />)}</div></section> : null}

<section id="programs">
<div className="flex justify-between items-end mb-8">
<div>
<h2 className="font-headline-lg text-headline-lg text-primary">Available Programs</h2>
<p className="text-on-surface-variant mt-2">{university?.programs.length ?? 0} programs offered at this university.</p>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-card-gap">
{university && university.programs.length === 0 && (
  <p className="text-on-surface-variant font-body-md md:col-span-2">No programs have been added for this university yet.</p>
)}
{university?.programs.map((p) => (
<div key={p.id} className="ambient-card rounded-3xl p-8">
<span className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-label-md rounded-full uppercase tracking-tighter">{p.degreeLevel}</span>
<h3 className="font-headline-md text-headline-md text-primary mt-4 mb-2">{p.name}</h3>
<p className="text-on-surface-variant">{p.field || p.description || "More details coming soon."}</p>
<div className="mt-6 flex gap-2 flex-wrap">
{p.durationMonths && <span className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant text-sm">{p.durationMonths} months</span>}
{p.tuitionFeeUsd && <span className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant text-sm">${Number(p.tuitionFeeUsd).toLocaleString()}/yr</span>}
</div>
<button
  onClick={() => handleApply(p.id)}
  disabled={applyingId === p.id || appliedProgramIds.has(p.id)}
  className="mt-6 w-full py-3 bg-primary text-on-primary rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-60"
>
{appliedProgramIds.has(p.id) ? "Application Started" : applyingId === p.id ? "Starting Application..." : "Apply Now"}
</button>
</div>
))}
</div>
{applyError && <p className="text-error font-label-md text-label-md mt-4">{applyError}</p>}
</section>

<section className="space-y-8" id="campus">
<h2 className="font-headline-lg text-headline-lg text-primary">Campus Life</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-card-gap">
<div className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer">
<div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAbsCrqs2pkQf3SbExPlKiuR914pNtWq12rlur7RMl9GdO4iBxXl_ELo-SPCPSzEqcp9a0I_uHsWaJn8TDm7nJa-2p_stSmdK-wZ8QT4u_PfS_jhv-6RZOks0L5rvS-Eyy2C9wdtpvG2WmzrE3lBOTrzUdj85qwOeKLCiBuox6MswEjTZyy7kCh8G9Psu7lHfdMwgv93lK4xgEPyiOJWlKSu04E19YEtNjdzRRl6Czvq8q2XeG-hSHI')"}}></div>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
<div className="absolute bottom-6 left-6 right-6">
<p className="text-white font-headline-sm text-headline-sm">Libraries &amp; Study</p>
<p className="text-white/70 text-sm mt-1">24/7 access to 100+ libraries</p>
</div>
</div>
<div className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer">
<div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDXYD6fW5cnUFVHZ0Bf3P6r3YF6aLEQ8hRXYBYyhdxh2gwuNE9DT8u8OTOhVI8CTJFPCys9V63Tw2c8HAOMZSdFTvBDyM_UKBak60gQrwt751CT-a0L39LXE9EBJ8WV4tmPKQRHoeLn1LS1Rxrqv69MD3Y-GqRIgSCDuTEaU2PyylSyjz1joFfjSGv7KDp-K5nfm-g0crME5qlUUQBSKa9nSNgYAA3UjVEJyPz3R4pNq5Z44CNGTU7u')"}}></div>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
<div className="absolute bottom-6 left-6 right-6">
<p className="text-white font-headline-sm text-headline-sm">Social Spaces</p>
<p className="text-white/70 text-sm mt-1">Junior Common Rooms (JCR)</p>
</div>
</div>
<div className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer">
<div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD0IVN5NG6tEByQ-xzNe4Q5yXYMp90fcSPlt3qeIdwrq-WalVIa7evXTMYCjNnRZuccxAPNuhHa0oGvSUFEYuVzb-wdMBCf7L5JMK8Ee1M0YtXAtM_q0MiTMGzjjMMExw35bqCwIx1NkGGDDm5EaXRHQtBuHXjRrTt8gd9f2nzk-m0hDrO1pEjUxav6l8lzL7Bi6KcLiXpl_DTY60jfiSg03NpbEj55I9kRTeLmv2aghjgPnaRGxYXz')"}}></div>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
<div className="absolute bottom-6 left-6 right-6">
<p className="text-white font-headline-sm text-headline-sm">Sports &amp; Clubs</p>
<p className="text-white/70 text-sm mt-1">Over 400 student-led societies</p>
</div>
</div>
</div>
</section>

<section className="ambient-card rounded-3xl p-8 border-l-4 border-primary" id="admission">
<h2 className="font-headline-lg text-headline-lg text-primary mb-8 flex items-center gap-3">
<span className="material-symbols-outlined text-[32px]">assignment_turned_in</span>
                    Admission Requirements
                </h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div>
<h4 className="font-bold text-primary mb-4 flex items-center gap-2">
<span className="material-symbols-outlined">school</span> Academic Standards
                        </h4>
<ul className="space-y-4">
<li className="flex items-start gap-3">
<span className="material-symbols-outlined text-secondary mt-0.5">check_circle</span>
<div>
<p className="font-semibold text-on-surface">GPA Requirement</p>
<p className="text-on-surface-variant text-sm">Minimum 3.8/4.0 or A*AA at A-Level</p>
</div>
</li>
<li className="flex items-start gap-3">
<span className="material-symbols-outlined text-secondary mt-0.5">check_circle</span>
<div>
<p className="font-semibold text-on-surface">English Proficiency</p>
<p className="text-on-surface-variant text-sm">IELTS 7.5+ or TOEFL 110+</p>
</div>
</li>
</ul>
</div>
<div>
<h4 className="font-bold text-primary mb-4 flex items-center gap-2">
<span className="material-symbols-outlined">description</span> Documents Needed
                        </h4>
<div className="flex flex-wrap gap-2">
<span className="px-3 py-1.5 bg-surface-container rounded-lg text-sm text-on-surface-variant">Personal Statement</span>
<span className="px-3 py-1.5 bg-surface-container rounded-lg text-sm text-on-surface-variant">2 Letters of Recommendation</span>
<span className="px-3 py-1.5 bg-surface-container rounded-lg text-sm text-on-surface-variant">Transcripts</span>
<span className="px-3 py-1.5 bg-surface-container rounded-lg text-sm text-on-surface-variant">Portfolio (Arts)</span>
</div>
</div>
</div>
<div className="mt-8 p-4 bg-primary-container/10 rounded-xl border border-primary-container/20">
<p className="text-sm text-primary flex items-center gap-2">
<span className="material-symbols-outlined">info</span>
                        Application deadlines vary by program — check with the university after starting your application.
                    </p>
</div>
</section>
</div>

<aside className="w-full lg:w-[360px] space-y-6">
<div className="sticky top-28 space-y-6">

<div className="ambient-card rounded-3xl p-8 border border-primary/10">
<h3 className="font-headline-md text-headline-md text-primary mb-2">Interested in {university?.name ?? "this university"}?</h3>
<p className="text-on-surface-variant mb-6">Save it to your list, then start an application from your dashboard once you&apos;re signed in.</p>
<button
  onClick={handleSave}
  disabled={saved}
  className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
>
{saved ? "Saved to Your List" : "Save University"}
<span className="material-symbols-outlined">{saved ? "check" : "bookmark_add"}</span>
</button>
{saveError && <p className="text-error font-label-md text-label-md mt-3">{saveError}</p>}
</div>

</div>
</aside>
</main>

<PublicFooter />
    </>
  );
}
