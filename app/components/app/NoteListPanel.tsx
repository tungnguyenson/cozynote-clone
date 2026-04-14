"use client";

import { useState, useEffect, useCallback } from "react";
import NoteCard from "./NoteCard";
import type { Note, AppView } from "@/lib/types";

interface NoteListPanelProps {
  view: AppView;
  selectedId: string | null;
  onSelect: (id: string) => void;
  refreshKey: number;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function NoteListPanel({
  view,
  selectedId,
  onSelect,
  refreshKey,
}: NoteListPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 300);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();

    if (typeof view === "string") {
      params.set("view", view);
    } else if ("notebook_id" in view) {
      params.set("notebook_id", view.notebook_id);
    } else if ("tag_id" in view) {
      params.set("tag_id", view.tag_id);
    }

    if (debouncedSearch) params.set("q", debouncedSearch);

    const res = await fetch(`/api/notes?${params}`);
    if (res.ok) {
      const data = await res.json();
      setNotes(data.notes);
    }
    setLoading(false);
  }, [view, debouncedSearch, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  async function restore(id: string) {
    await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_deleted: false, deleted_at: null }),
    });
    fetchNotes();
  }

  async function deleteForever(id: string) {
    if (!confirm("Permanently delete this note? This cannot be undone.")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    fetchNotes();
  }

  const isTrash = view === "trash";

  return (
    <div className="hidden md:flex flex-col w-80 border-r border-gray-200 h-full bg-gray-50 flex-shrink-0">
      {/* Search */}
      <div className="p-4 pt-14 md:pt-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evernote-green bg-white"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-sm text-gray-400">Loading…</div>
        ) : notes.length === 0 ? (
          <div className="p-4 text-sm text-gray-400">No notes found</div>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              selected={note.id === selectedId}
              onClick={() => onSelect(note.id)}
              trashMode={isTrash}
              onRestore={() => restore(note.id)}
              onDeleteForever={() => deleteForever(note.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
