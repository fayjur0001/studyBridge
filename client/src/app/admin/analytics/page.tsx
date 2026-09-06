"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AgencySidebar from "@/components/dashboard/AgencySidebar";
import AgencyStudentCard from "@/components/agency/AgencyStudentCard";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import AgencyNotificationBell from "@/components/agency/AgencyNotificationBell";

interface AgencyStudent {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  nationality: string | null;
  preferredCountries: string[];
}

export default function AgencyStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<AgencyStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  function loadStudents() {
    setLoading(true);
    api
      .get<{ data: AgencyStudent[] }>("/api/agency/students")
      .then((res) => setStudents(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(loadStudents, []);

  useEffect(() => {
    api
      .get<{ agencyProfile: { isVerified: boolean } | null }>("/api/agency/me")
      .then((res) => setIsVerified(res.agencyProfile?.isVerified ?? false))
      .catch(() => setIsVerified(null));
  }, []);

  async function handleLinkStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!linkEmail.trim()) return;
    setLinking(true);
    setLinkError(null);
    try {
      await api.post("/api/agency/students/link", { email: linkEmail });
      setLinkEmail("");
      loadStudents();
    } catch (err) {
      setLinkError(err instanceof ApiError ? err.message : "Couldn't link this student.");
    } finally {
      setLinking(false);
    }
  }

  return (
    <>
<AgencySidebar />


{/* Main Content Wrapper */}
<main className="ml-[260px] min-h-screen flex flex-col relative bg-background text-on-background">
{/* TopNavBar */}
<header className="sticky top-0 w-full z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center px-gutter py-4 h-20 border-b border-outline-variant/20">
<div className="flex items-center gap-8 flex-1">
<div className="relative w-full max-w-md">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
<input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 font-body-md text-body-md placeholder:text-outline-variant" placeholder="Search by student name or email..." type="search"/>
</div>
<div className="hidden md:flex gap-6">
<Link className="text-on-surface-variant hover:text-primary transition-colors font-body-lg text-body-lg" href="/universities">Directory</Link>
<Link className="text-on-surface-variant hover:text-primary transition-colors font-body-lg text-body-lg" href="/about">Resources</Link>
<Link className="text-on-surface-variant hover:text-primary transition-colors font-body-lg text-body-lg" href="/contact">Help</Link>
</div>
</div>
<div className="flex items-center gap-4">
<AgencyNotificationBell />
<div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
<div className="text-right">
<p className="font-label-md text-label-md text-on-surface">{user?.fullName ?? "..."}</p>
<p className="text-[10px] text-outline uppercase tracking-wider font-bold">Agency Partner</p>
</div>
<div className="w-10 h-10 rounded-full border-2 border-primary-fixed ring-2 ring-background bg-primary-container flex items-center justify-center font-bold text-primary">
{user?.fullName?.[0] ?? "A"}
</div>
</div>
</div>
</header>
{/* Dashboard Content */}
<section className="p-margin-desktop flex-1">
{/* Page Header & Stats */}
<div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<h2 className="font-headline-lg text-headline-lg text-primary mb-2">My Students</h2>
<p className="text-on-surface-variant font-body-lg text-body-lg">Tracking {students.length} student{students.length === 1 ? "" : "s"} linked to your agency.</p>
</div>
</div>

{/* Link a student */}
{isVerified === false && (
  <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl px-6 py-4 flex items-center gap-3 mb-6">
    <span className="material-symbols-outlined">lock_clock</span>
    <p className="font-body-md text-body-md">
      Your agency is awaiting admin verification. You&apos;ll be able to link students once an admin approves your profile.
    </p>
  </div>
)}
<form onSubmit={handleLinkStudent} className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/20 mb-8 flex flex-wrap items-center gap-4">
<div className="flex items-center gap-2 text-outline px-2">
<span className="material-symbols-outlined" data-icon="person_add">person_add</span>
<span className="font-label-md text-label-md">Link a student by email:</span>
</div>
<input
  type="email"
  value={linkEmail}
  onChange={(e) => setLinkEmail(e.target.value)}
  placeholder="student@example.com"
  disabled={isVerified === false}
  className="flex-1 min-w-[220px] bg-surface-container-low border-none rounded-xl py-2 px-4 font-body-md text-body-md focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
/>
<button type="submit" disabled={linking || isVerified === false} className="bg-primary text-white px-6 py-2 rounded-xl font-label-md text-label-md hover:opacity-90 disabled:opacity-50">
  {linking ? "Linking..." : "Link Student"}
</button>
{linkError && <p className="text-error font-label-md w-full">{linkError}</p>}
</form>

{/* Student Cards Grid */}
{!loading && students.length === 0 && (
  <p className="text-on-surface-variant font-body-md">No students linked yet — use the form above to link one by email.</p>
)}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-card-gap">
{students.filter((student) => `${student.fullName} ${student.email}`.toLowerCase().includes(searchQuery.toLowerCase())).map((student) => (
  <AgencyStudentCard key={student.userId} student={student} />
))}
</div>
{!loading && students.length > 0 && students.every((student) => !`${student.fullName} ${student.email}`.toLowerCase().includes(searchQuery.toLowerCase())) && <p className="text-on-surface-variant font-body-md mt-6">No linked students match your search.</p>}
</section>
</main>


</>
  );
}