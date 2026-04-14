"use client";

import { useEffect, useState } from "react";
import NoteCard from "./NoteCard";
import type { NoteWithSync } from "@/lib/types";

interface NoteListPanelProps {
  notes: NoteWithSync[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  trashMode?: boolean;
  onRestore?: (id: string) => void;
  onDeleteForever?: (id: string) => void;
}

function NoteCardSkeleton() {
  return (
    <div className="p-4 border-b border-gray-200 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-full mt-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mt-3" />
    </div>
  );
}

export default function NoteListPanel({
  notes,
  loading,
  selectedId,
  onSelect,
  trashMode,
  onRestore,
  onDeleteForever,
}: NoteListPanelProps) {
  const [search, setSearch] = useState("");
  const [skeletonCount, setSkeletonCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("noteListCount");
    if (stored) setSkeletonCount(Number(stored));
  }, []);

  useEffect(() => {
    if (!loading && notes.length > 0) {
      localStorage.setItem("noteListCount", String(notes.length));
      setSkeletonCount(notes.length);
    }
  }, [loading, notes.length]);

  const filtered =
    search.trim() === ""
      ? notes
      : notes.filter(
          (n) =>
            n.title.toLowerCase().includes(search.toLowerCase()) ||
            n.content_text.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <div className="hidden md:flex flex-col w-full md:w-80 border-r border-gray-200">
      <div className="w-full flex flex-col h-full bg-gray-50">
        {/* Search */}
        <div className="p-4 pt-14 md:pt-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-evernote-green"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto relative">
          {loading && notes.length === 0 ? (
            Array.from({ length: skeletonCount }).map((_, i) => (
              <NoteCardSkeleton key={i} />
            ))
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-gray-400">No notes found</div>
          ) : (
            <>
              {loading && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-evernote-green/30 overflow-hidden">
                  <div className="h-full w-1/3 bg-evernote-green animate-slide" />
                </div>
              )}
              {filtered.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  selected={note.id === selectedId}
                  onClick={() => onSelect(note.id)}
                  trashMode={trashMode}
                  onRestore={onRestore ? () => onRestore(note.id) : undefined}
                  onDeleteForever={
                    onDeleteForever
                      ? () => onDeleteForever(note.id)
                      : undefined
                  }
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
