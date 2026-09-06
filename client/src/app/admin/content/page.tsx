"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { api } from "@/lib/api";

interface ContentBlock {
  key: string;
  title: string | null;
  body: string | null;
  updatedAt: string;
}

const BLOCK_DEFS = [
  { key: "page_about_us", label: "About Us", icon: "info", hint: "Our mission, history, and executive team profile page." },
  { key: "page_study_destinations", label: "Study Destinations", icon: "public", hint: "Dynamic directory of countries and university hubs." },
  { key: "page_community_forum", label: "Community Forum", icon: "forum", hint: "Moderation hub and general community guidelines." },
  { key: "seo_meta", label: "Homepage SEO", icon: "search", hint: "Meta title and description used for search engines." },
];

export default function AdminContentPage() {
  const [blocks, setBlocks] = useState<Record<string, ContentBlock>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    api.get<{ data: ContentBlock[] }>("/api/admin/content").then((res) => {
      setBlocks(Object.fromEntries(res.data.map((b) => [b.key, b])));
    });
  }

  useEffect(load, []);

  function openEdit(key: string) {
    setEditingKey(key);
    setTitle(blocks[key]?.title ?? "");
    setBody(blocks[key]?.body ?? "");
  }

  async function handleSave() {
    if (!editingKey) return;
    setSaving(true);
    try {
      await api.put("/api/admin/content", { key: editingKey, title, body });
      setEditingKey(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
<AdminSidebar />

<header className="flex justify-between items-center h-16 px-8 ml-[260px] w-[calc(100%-260px)] fixed top-0 bg-surface z-40 border-b border-outline-variant shadow-sm">
<h2 className="font-headline-sm text-headline-sm font-semibold text-primary">Content Management</h2>
</header>

<main className="ml-[260px] pt-24 px-8 pb-8 min-h-screen bg-surface-container-low">
<div className="max-w-4xl mx-auto space-y-6">

<div className="bg-white rounded-[24px] p-8 ambient-shadow border border-outline-variant/30">
<h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2 mb-6">
<span className="material-symbols-outlined">view_quilt</span>
Site Content Blocks
</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{BLOCK_DEFS.map((def) => {
  const block = blocks[def.key];
  return (
<div key={def.key} className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20 hover:border-primary-container transition-all group">
<div className="flex justify-between mb-4">
<div className="w-10 h-10 bg-primary-container/20 rounded-lg flex items-center justify-center text-primary">
<span className="material-symbols-outlined">{def.icon}</span>
</div>
<button onClick={() => openEdit(def.key)} className="p-2 bg-white rounded-full shadow-sm">
<span className="material-symbols-outlined text-primary text-[20px]">edit</span>
</button>
</div>
<h4 className="font-headline-sm text-[16px] mb-1">{block?.title || def.label}</h4>
<p className="text-on-surface-variant font-label-md line-clamp-2">{block?.body || def.hint}</p>
<div className="mt-4 pt-4 border-t border-outline-variant/20">
<span className="text-[10px] text-on-surface-variant">
{block ? `Last edit: ${new Date(block.updatedAt).toLocaleDateString()}` : "Not yet customized"}
</span>
</div>
</div>
  );
})}
</div>
</div>

{editingKey && (
<div className="bg-white rounded-[24px] p-8 ambient-shadow border border-outline-variant/30">
<h3 className="font-headline-sm text-headline-sm text-primary mb-6">
Editing: {BLOCK_DEFS.find((b) => b.key === editingKey)?.label}
</h3>
<div className="space-y-4">
<div>
<label className="block font-label-md text-on-surface-variant mb-2">Title</label>
<input className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4" value={title} onChange={(e) => setTitle(e.target.value)} />
</div>
<div>
<label className="block font-label-md text-on-surface-variant mb-2">Content</label>
<textarea className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 resize-none" rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
</div>
<div className="flex gap-3">
<button onClick={handleSave} disabled={saving} className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold disabled:opacity-50">
{saving ? "Saving..." : "Save"}
</button>
<button onClick={() => setEditingKey(null)} className="px-6 py-2.5 text-on-surface-variant font-bold">Cancel</button>
</div>
</div>
</div>
)}

</div>
</main>
    </>
  );
}
