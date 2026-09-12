"use client";

import { useState } from "react";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import MessagingView from "@/components/messaging/MessagingView";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useAuth } from "@/lib/auth-context";

export default function MessagingPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <StudentSidebar />

      <main className="ml-[260px] flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex justify-between items-center w-full px-margin-desktop h-16 sticky top-0 z-40 bg-surface-container-lowest shadow-[0px_2px_4px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full w-96">
              <span className="material-symbols-outlined text-outline">search</span>
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="bg-transparent border-none focus:ring-0 text-body-md font-body-md w-full placeholder:text-outline-variant" placeholder="Search conversations..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-primary">
              {user?.fullName?.[0] ?? "S"}
            </div>
          </div>
        </header>

        <MessagingView searchQuery={searchQuery} />
      </main>
    </>
  );
}
