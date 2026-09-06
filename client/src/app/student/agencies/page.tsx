"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import { api } from "@/lib/api";

interface Agency { userId: string; companyName: string; website: string | null; address: string | null; description: string | null; isVerified: boolean; }

export default function StudentAgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [query, setQuery] = useState("");
  useEffect(() => { api.get<{ data: Agency[] }>("/api/agency/directory", { auth: false }).then((res) => setAgencies(res.data)).catch(() => {}); }, []);
  const visible = agencies.filter((agency) => `${agency.companyName} ${agency.address ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  return <><StudentSidebar /><main className="md:ml-[260px] min-h-screen bg-background p-6 md:p-10"><div className="max-w-6xl mx-auto"><Link href="/student/dashboard" className="text-primary font-semibold text-sm">← Dashboard</Link><div className="flex flex-col md:flex-row gap-5 md:items-end justify-between mt-5 mb-8"><div><h1 className="font-headline-lg text-primary">Find an agency</h1><p className="text-on-surface-variant mt-2">Compare education agencies, their details and uploaded certifications.</p></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or location" className="bg-surface-container-low rounded-xl px-4 py-3 border-none" /></div><div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{visible.map((agency) => <article key={agency.userId} className="ambient-card bg-surface-container-lowest rounded-3xl p-6 flex flex-col"><div className="flex items-start justify-between gap-3"><div className="w-12 h-12 bg-primary-container text-primary rounded-xl flex items-center justify-center"><span className="material-symbols-outlined">business</span></div>{agency.isVerified && <span className="text-xs font-bold bg-secondary-fixed text-primary px-3 py-1 rounded-full">Verified</span>}</div><h2 className="font-headline-sm text-on-surface mt-5">{agency.companyName}</h2><p className="text-sm text-on-surface-variant mt-2 line-clamp-3 flex-1">{agency.description || "Education consultancy profile"}</p>{agency.address && <p className="text-sm text-on-surface-variant mt-4 flex gap-1"><span className="material-symbols-outlined text-base">location_on</span>{agency.address}</p>}<Link href={`/student/agencies/${agency.userId}`} className="mt-6 bg-primary text-on-primary text-center rounded-xl py-3 font-bold">View profile</Link></article>)}</div>{visible.length === 0 && <p className="text-on-surface-variant py-14 text-center">No agencies found.</p>}</div></main></>;
}
