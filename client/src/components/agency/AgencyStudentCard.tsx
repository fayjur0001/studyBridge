"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

interface AgencyStudent {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  nationality: string | null;
  preferredCountries: string[];
}

export default function AgencyStudentCard({ student }: { student: AgencyStudent }) {
  const router = useRouter();
  const [messaging, setMessaging] = useState(false);

  async function handleMessage() {
    setMessaging(true);
    try {
      await api.post("/api/conversations", {
        recipientId: student.userId,
        message: `Hi ${student.fullName.split(" ")[0]}, this is your StudyBridge counselor — happy to help with anything you need.`,
      });
      router.push("/agency/messages");
    } finally {
      setMessaging(false);
    }
  }

  return (
    <div className="glass-card rounded-[24px] p-container-padding flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-2xl shadow-md bg-primary-container flex items-center justify-center overflow-hidden">
            {student.avatarUrl ? (
              <img className="w-full h-full object-cover" alt={student.fullName} src={student.avatarUrl} />
            ) : (
              <span className="font-headline-sm text-primary">{student.fullName?.[0] ?? "S"}</span>
            )}
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">{student.fullName}</h3>
            <p className="text-outline font-label-md text-label-md">{student.email}</p>
          </div>
        </div>
      </div>
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary/60">public</span>
          <span className="text-on-surface-variant font-body-md text-body-md">
            Nationality: {student.nationality || "Not set"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary/60">location_on</span>
          <span className="text-on-surface-variant font-body-md text-body-md">
            {student.preferredCountries?.length
              ? `Interested in: ${student.preferredCountries.join(", ")}`
              : "No preferred countries set yet"}
          </span>
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-outline-variant/20 flex gap-3">
        <Link
          href={`/agency/students/${student.userId}`}
          className="flex-1 text-center bg-primary text-white py-2 rounded-xl font-label-md text-label-md transition-opacity hover:opacity-90"
        >
          View Profile
        </Link>
        <button
          onClick={handleMessage}
          disabled={messaging}
          className="p-2 border border-outline-variant text-outline rounded-xl hover:bg-surface-container transition-colors disabled:opacity-50"
          title="Message this student"
        >
          <span className="material-symbols-outlined">mail</span>
        </button>
      </div>
    </div>
  );
}
