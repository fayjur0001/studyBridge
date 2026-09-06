"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface ConversationSummary {
  id: string;
  subject: string | null;
  participants: { userId: string; fullName: string; role: string; avatarUrl: string | null }[];
  lastMessage: { id: string; body: string; senderId: string; createdAt: string } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export default function MessagingView() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function loadConversations() {
    api
      .get<{ data: ConversationSummary[] }>("/api/conversations")
      .then((res) => {
        setConversations(res.data);
        setSelectedId((current) => current ?? res.data[0]?.id ?? null);
      })
      .catch(() => {});
  }

  useEffect(loadConversations, []);

  useEffect(() => {
    if (!selectedId) return;
    api
      .get<{ data: Message[] }>(`/api/conversations/${selectedId}/messages`)
      .then((res) => setMessages(res.data))
      .catch(() => {});
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!draft.trim() || !selectedId) return;
    setSending(true);
    try {
      await api.post(`/api/conversations/${selectedId}/messages`, { body: draft });
      setDraft("");
      const res = await api.get<{ data: Message[] }>(`/api/conversations/${selectedId}/messages`);
      setMessages(res.data);
      loadConversations();
    } finally {
      setSending(false);
    }
  }

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex-1 flex overflow-hidden">
      <section className="w-[380px] bg-white border-r border-surface-container flex flex-col">
        <div className="p-6">
          <h2 className="font-headline-sm text-headline-sm text-primary">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {conversations.length === 0 && (
            <p className="px-6 text-on-surface-variant font-body-md">No conversations yet.</p>
          )}
          {conversations.map((c) => {
            const other = c.participants[0];
            return (
              <div
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`px-6 py-4 cursor-pointer border-l-4 ${c.id === selectedId ? "bg-primary-container/5 border-primary" : "border-transparent hover:bg-surface-container-low"}`}
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center font-bold text-primary flex-shrink-0">
                    {other?.fullName?.[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-on-surface truncate">{other?.fullName ?? "Unknown"}</p>
                      {c.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-bold">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-label-md text-on-surface-variant truncate">{c.lastMessage?.body ?? "No messages yet"}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex-1 flex flex-col bg-surface-container-lowest">
        {!selected && (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant font-body-md">
            Select a conversation to view messages.
          </div>
        )}
        {selected && (
          <>
            <div className="px-8 py-4 border-b border-outline-variant/20 bg-white flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-primary">
                {selected.participants[0]?.fullName?.[0] ?? "?"}
              </div>
              <p className="font-bold text-on-surface">{selected.participants[0]?.fullName ?? "Unknown"}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {messages.map((m) => {
                const mine = m.senderId === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[60%] px-4 py-2.5 rounded-2xl ${mine ? "bg-primary text-on-primary" : "bg-white border border-outline-variant/20 text-on-surface"}`}>
                      <p className="text-body-md">{m.body}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="p-6 bg-white border-t border-outline-variant/20 flex items-center gap-3">
              <input
                className="flex-1 bg-surface-container-low border-none rounded-full py-3 px-5 focus:ring-2 focus:ring-primary/20"
                placeholder="Type a message..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={sending || !draft.trim()}
                className="bg-primary text-on-primary p-3 rounded-full hover:opacity-90 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
