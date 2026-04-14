"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import CollapsibleSection from "./CollapsibleSection";
import type { AppView, Notebook, Tag } from "@/lib/types";

interface SidebarProps {
  userName: string;
  workspaceName: string;
  notebooks: Notebook[];
  tags: Tag[];
  view: AppView;
  onViewChange: (v: AppView) => void;
  onNewNote: () => void;
  onNotebookCreated: (nb: Notebook) => void;
  onTagCreated: (tag: Tag) => void;
  onImported: () => void;
}

function navItemClass(active: boolean) {
  return (
    "px-4 py-2 cursor-pointer transition text-sm " +
    (active
      ? "bg-evernote-hover text-evernote-green"
      : "hover:bg-evernote-hover text-gray-300")
  );
}

export default function Sidebar({
  userName,
  workspaceName,
  notebooks,
  tags,
  view,
  onViewChange,
  onNewNote,
  onNotebookCreated,
  onTagCreated,
  onImported,
}: SidebarProps) {
  const router = useRouter();
  const nbInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function createNotebook(e: React.FormEvent) {
    e.preventDefault();
    const name = nbInputRef.current?.value.trim();
    if (!name) return;
    const res = await fetch("/api/notebooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const { notebook } = await res.json();
      onNotebookCreated(notebook);
      if (nbInputRef.current) nbInputRef.current.value = "";
    }
  }

  async function createTag(e: React.FormEvent) {
    e.preventDefault();
    const name = tagInputRef.current?.value.trim();
    if (!name) return;
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const { tag } = await res.json();
      onTagCreated(tag);
      if (tagInputRef.current) tagInputRef.current.value = "";
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/import", { method: "POST", body: fd });
    if (res.ok) onImported();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const isView = (v: AppView) => JSON.stringify(view) === JSON.stringify(v);

  return (
    <div className="w-64 bg-evernote-sidebar text-white flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => router.push("/profile")}
            className="font-semibold hover:text-evernote-green truncate text-left"
          >
            {userName || "User"}
          </button>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-white flex-shrink-0 ml-2"
          >
            Logout
          </button>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400 truncate">{workspaceName}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-600 text-gray-300 flex-shrink-0">
            FREE
          </span>
        </div>
        <button
          onClick={onNewNote}
          className="w-full bg-evernote-green text-white py-2 rounded hover:bg-green-600 transition text-sm font-medium"
        >
          + New Note
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto">
        <div
          onClick={() => onViewChange("all")}
          className={navItemClass(isView("all"))}
        >
          📝 All Notes
        </div>
        <div
          onClick={() => onViewChange("shared")}
          className={navItemClass(isView("shared"))}
        >
          👥 Shared with me
        </div>
        <div
          onClick={() => onViewChange("trash")}
          className={navItemClass(isView("trash"))}
        >
          🗑️ Trash
        </div>

        {/* Notebooks */}
        <CollapsibleSection label="NOTEBOOKS">
          {notebooks.map((nb) => (
            <div
              key={nb.id}
              onClick={() => onViewChange({ notebook_id: nb.id })}
              className={navItemClass(isView({ notebook_id: nb.id })) + " pl-6"}
            >
              📓 {nb.name}
            </div>
          ))}
          <form onSubmit={createNotebook} className="px-4 py-2 flex gap-2">
            <input
              ref={nbInputRef}
              placeholder="New notebook"
              className="flex-1 bg-evernote-dark text-white px-2 py-1 rounded text-xs focus:outline-none"
            />
            <button type="submit" className="text-evernote-green font-bold">
              +
            </button>
          </form>
        </CollapsibleSection>

        {/* Tags */}
        <CollapsibleSection label="TAGS">
          {tags.map((tag) => (
            <div
              key={tag.id}
              onClick={() => onViewChange({ tag_id: tag.id })}
              className={navItemClass(isView({ tag_id: tag.id })) + " pl-6"}
            >
              🏷️ {tag.name}
            </div>
          ))}
          <form onSubmit={createTag} className="px-4 py-2 flex gap-2">
            <input
              ref={tagInputRef}
              placeholder="New tag"
              className="flex-1 bg-evernote-dark text-white px-2 py-1 rounded text-xs focus:outline-none"
            />
            <button type="submit" className="text-evernote-green font-bold">
              +
            </button>
          </form>
        </CollapsibleSection>

        {/* Import */}
        <div className="mt-4 px-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".enex"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-evernote-hover rounded text-sm"
          >
            📥 Import from Evernote
          </button>
        </div>
      </nav>
    </div>
  );
}
