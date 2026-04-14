"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Note, NoteWithSync, SyncStatus, AppView } from "@/lib/types";

function buildParams(view: AppView): URLSearchParams {
  const params = new URLSearchParams();
  if (typeof view === "string") {
    params.set("view", view);
  } else if ("notebook_id" in view) {
    params.set("notebook_id", view.notebook_id);
  } else if ("tag_id" in view) {
    params.set("tag_id", view.tag_id);
  }
  return params;
}

function sortNotes(notes: NoteWithSync[]): NoteWithSync[] {
  return [...notes].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

export interface NoteStore {
  notes: NoteWithSync[];
  loading: boolean;
  getNote: (id: string) => NoteWithSync | null;
  updateNoteOptimistic: (id: string, patch: Partial<Note>) => void;
  markSynced: (id: string, serverNote: Note) => void;
  markSyncError: (id: string) => void;
  addNote: (note: Note) => void;
  removeNote: (id: string) => void;
  refresh: () => void;
}

// Stable serialisation used as useEffect dependency to avoid object-identity issues
function viewKey(view: AppView): string {
  if (typeof view === "string") return view;
  if ("notebook_id" in view) return `notebook:${view.notebook_id}`;
  return `tag:${(view as { tag_id: string }).tag_id}`;
}

export function useNoteStore(view: AppView): NoteStore {
  const [notes, setNotes] = useState<NoteWithSync[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  // Track in-flight fetch so we can ignore stale results when view changes fast
  const fetchIdRef = useRef(0);

  const key = viewKey(view);

  useEffect(() => {
    const fetchId = ++fetchIdRef.current;
    setLoading(true);

    const params = buildParams(view);
    fetch(`/api/notes?${params}`)
      .then((r) => r.json())
      .then(({ notes: raw }: { notes: Note[] }) => {
        if (fetchId !== fetchIdRef.current) return; // stale, discard
        setNotes(
          sortNotes(raw.map((n) => ({ ...n, _syncStatus: "synced" as SyncStatus })))
        );
        setLoading(false);
      })
      .catch(() => {
        if (fetchId !== fetchIdRef.current) return;
        setLoading(false);
      });
  }, [key, refreshCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => setRefreshCount((c) => c + 1), []);

  const getNote = useCallback(
    (id: string) => notes.find((n) => n.id === id) ?? null,
    [notes]
  );

  const updateNoteOptimistic = useCallback(
    (id: string, patch: Partial<Note>) => {
      setNotes((prev) =>
        sortNotes(
          prev.map((n) =>
            n.id === id
              ? {
                  ...n,
                  ...patch,
                  updated_at: new Date().toISOString(),
                  _syncStatus: "pending" as SyncStatus,
                }
              : n
          )
        )
      );
    },
    []
  );

  const markSynced = useCallback((id: string, serverNote: Note) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...serverNote, _syncStatus: "synced" as SyncStatus } : n
      )
    );
  }, []);

  const markSyncError = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, _syncStatus: "error" as SyncStatus } : n
      )
    );
  }, []);

  const addNote = useCallback((note: Note) => {
    setNotes((prev) =>
      sortNotes([{ ...note, _syncStatus: "synced" as SyncStatus }, ...prev])
    );
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    notes,
    loading,
    getNote,
    updateNoteOptimistic,
    markSynced,
    markSyncError,
    addNote,
    removeNote,
    refresh,
  };
}
