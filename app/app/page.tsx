"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/app/Sidebar";
import NoteListPanel from "@/app/components/app/NoteListPanel";
import NoteEditorPanel from "@/app/components/app/NoteEditorPanel";
import { useNoteStore } from "@/hooks/useNoteStore";
import type { AppView, Notebook, Tag } from "@/lib/types";
import { Menu, X } from "lucide-react";

export default function AppPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("My Workspace");
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [view, setView] = useState<AppView>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    notes,
    loading,
    getNote,
    updateNoteOptimistic,
    markSynced,
    markSyncError,
    addNote,
    removeNote,
    refresh,
  } = useNoteStore(view);

  // Verify session on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
    });
  }, [router]);

  // Load profile + sidebar data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [meRes, nbRes, tagRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/notebooks"),
        fetch("/api/tags"),
      ]);
      if (cancelled) return;
      if (meRes.ok) {
        const { profile } = await meRes.json();
        setUserName(profile.name || "");
        setWorkspaceName(profile.workspace_name || "My Workspace");
      }
      if (nbRes.ok) setNotebooks((await nbRes.json()).notebooks);
      if (tagRes.ok) setTags((await tagRes.json()).tags);
    })();
    return () => { cancelled = true; };
  }, []);

  async function createNote() {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled", content: "" }),
    });
    if (res.ok) {
      const { note } = await res.json();
      setView("all");
      addNote(note);
      setSelectedId(note.id);
    }
  }

  function handleNoteDeleted(id: string) {
    if (selectedId === id) setSelectedId(null);
    removeNote(id);
  }

  async function handleRestore(id: string) {
    await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_deleted: false, deleted_at: null }),
    });
    removeNote(id);
  }

  async function handleDeleteForever(id: string) {
    if (!confirm("Permanently delete this note? This cannot be undone.")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (selectedId === id) setSelectedId(null);
    removeNote(id);
  }

  const selectedNote = selectedId ? getNote(selectedId) : null;
  const isTrash = view === "trash";

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        className="md:hidden fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center bg-evernote-green text-white rounded-lg shadow-lg"
      > {sidebarOpen ? <X size={20} /> :
        <Menu size={20} />
        }
      </button>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <Sidebar
          userName={userName}
          workspaceName={workspaceName}
          notebooks={notebooks}
          tags={tags}
          view={view}
          onViewChange={(v) => {
            setView(v);
            setSelectedId(null);
            setSidebarOpen(false);
          }}
          onNewNote={createNote}
          onNotebookCreated={(nb) => setNotebooks((prev) => [...prev, nb])}
          onTagCreated={(tag) => setTags((prev) => [...prev, tag])}
          onImported={refresh}
        />
      </div>

      {/* Note list — hidden on mobile when note is open */}
      <div className={selectedId ? "hidden md:flex" : "flex w-full md:w-auto"}>
        <NoteListPanel
          notes={notes}
          loading={loading}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            setSidebarOpen(false);
          }}
          trashMode={isTrash}
          onRestore={isTrash ? handleRestore : undefined}
          onDeleteForever={isTrash ? handleDeleteForever : undefined}
        />
      </div>

      {/* Editor */}
      <div className={`flex-1 flex min-w-0 ${!selectedId && "hidden md:flex"}`}>
        <NoteEditorPanel
          note={selectedNote}
          notebooks={notebooks}
          tags={tags}
          onBack={() => setSelectedId(null)}
          onNoteChanged={(id, patch) => updateNoteOptimistic(id, patch)}
          onNoteSynced={(id, serverNote) => markSynced(id, serverNote)}
          onNoteSyncError={(id) => markSyncError(id)}
          onDeleteNote={handleNoteDeleted}
        />
      </div>
    </div>
  );
}
