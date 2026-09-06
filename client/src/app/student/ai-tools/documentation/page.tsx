"use client";

import Link from "next/link";
import StudentSidebar from "@/components/dashboard/StudentSidebar";

const tools = [
  { icon: "travel_explore", title: "Global University Matcher", status: "Available", description: "Uses the countries and fields saved in your student profile to rank programs. Keep those preferences current for better matches.", action: "Open University Matcher", href: "/student/ai-recommendations" },
  { icon: "edit_note", title: "Personal Statement Reviewer", status: "Coming soon", description: "Will provide structured feedback on clarity, narrative and tone. It does not replace an admissions advisor or guarantee admission." },
  { icon: "record_voice_over", title: "Interview Simulator", status: "Coming soon", description: "Will offer practice interviews and feedback for university and visa interview preparation." },
  { icon: "analytics", title: "Visa Probability", status: "Coming soon", description: "Will require verified, current visa-outcome data before it can provide estimates. Never rely on a prediction for a visa decision." },
];

export default function AIToolsDocumentationPage() {
  return (
    <>
      <StudentSidebar />
      <main className="ml-[260px] min-h-screen bg-surface p-margin-desktop">
        <Link href="/student/ai-tools" className="inline-flex items-center gap-2 text-primary font-bold text-body-md hover:underline mb-8">
          <span className="material-symbols-outlined">arrow_back</span> Back to AI Tools
        </Link>
        <header className="max-w-4xl mb-10">
          <p className="text-primary font-bold text-label-md uppercase tracking-wider mb-3">StudyBridge guide</p>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-3">AI Tools Documentation</h1>
          <p className="font-body-lg text-on-surface-variant">What each StudyBridge tool does, what data it uses, and its current availability.</p>
        </header>
        <section className="max-w-4xl grid gap-5">
          {tools.map((tool) => (
            <article key={tool.title} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/25 flex gap-5">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">{tool.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="font-headline-sm text-on-surface">{tool.title}</h2>
                  <span className={`px-2.5 py-1 rounded-full text-label-md font-bold ${tool.status === "Available" ? "bg-green-100 text-green-800" : "bg-surface-container-high text-on-surface-variant"}`}>{tool.status}</span>
                </div>
                <p className="font-body-md text-on-surface-variant leading-relaxed">{tool.description}</p>
                {tool.href && <Link href={tool.href} className="inline-flex mt-4 text-primary font-bold text-body-md hover:underline">{tool.action} <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span></Link>}
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
