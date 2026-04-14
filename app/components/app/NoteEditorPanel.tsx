"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Note, NoteWithSync, Notebook, Tag } from "@/lib/types";
import ShareNoteModal from "./ShareNoteModal";

const QuillEditor = dynamic(() => import("./QuillEditor"), { ssr: false });

interface PendingTitle {
  noteId: string;
  value: string;
}

interface PendingContent {
  noteId: string;
  value: string;
  text: string;
}

interface NoteEditorPanelProps {
  note: NoteWithSync | null;
  notebooks: Notebook[];
  tags: Tag[];
  onBack: () => void;
  onNoteChanged: (id: string, patch: Partial<Note>) => void;
  onNoteSynced: (id: string, serverNote: Note) => void;
  onNoteSyncError: (id: string) => void;
  onDeleteNote: (id: string) => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function NoteEditorPanel({
  note,
  notebooks,
  onBack,
  onNoteChanged,
  onNoteSynced,
  onNoteSyncError,
  onDeleteNote,
}: NoteEditorPanelProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notebookId, setNotebookId] = useState<string>("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  // Refs tracking the latest unsaved edit — capture (noteId + value) at keystroke time.
  // These survive note switches, so flush logic always saves to the correct note.
  const pendingTitleRef = useRef<PendingTitle | null>(null);
  const pendingContentRef = useRef<PendingContent | null>(null);

  // What was last successfully sent to the server (per-note, reset on switch)
  const lastSavedTitle = useRef("");
  const lastSavedContent = useRef("");

  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1500);

  const flushSave = useCallback(
    async (noteId: string, body: Record<string, unknown>) => {
      try {
        const res = await fetch(`/api/notes/${noteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Save failed");
        const { note: serverNote } = await res.json();
        onNoteSynced(noteId, serverNote);
      } catch {
        onNoteSyncError(noteId);
      }
    },
    [onNoteSynced, onNoteSyncError]
  );

  // On note switch: flush any unsaved changes for the PREVIOUS note immediately,
  // then load the new note. Because pending refs captured noteId at keystroke time,
  // they always point to the right note even if selectedId has already moved on.
  useEffect(() => {
    const pt = pendingTitleRef.current;
    if (pt && pt.value !== lastSavedTitle.current) {
      onNoteChanged(pt.noteId, { title: pt.value });
      flushSave(pt.noteId, { title: pt.value });
    }
    pendingTitleRef.current = null;

    const pc = pendingContentRef.current;
    if (pc && pc.value !== lastSavedContent.current) {
      onNoteChanged(pc.noteId, { content: pc.value, content_text: pc.text });
      flushSave(pc.noteId, { content: pc.value, content_text: pc.text });
    }
    pendingContentRef.current = null;

    if (!note) {
      setTitle("");
      setContent("");

      setNotebookId("");
      setShareUrl(null);
      setIsPinned(false);
      lastSavedTitle.current = "";
      lastSavedContent.current = "";
      return;
    }

    setTitle(note.title);
    setContent(note.content);
    setNotebookId(note.notebook_id ?? "");
    setIsPinned(note.is_pinned);
    setShareUrl(
      note.is_public && note.public_slug ? `/notes/${note.public_slug}` : null
    );
    lastSavedTitle.current = note.title;
    lastSavedContent.current = note.content;
  }, [note?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Normal debounce save — only fires when the user stays on the same note long enough.
  // Checks that the pending ref still belongs to the current note (not a leftover after
  // a switch that was already flushed above).
  useEffect(() => {
    const pt = pendingTitleRef.current;
    if (!pt || pt.noteId !== note?.id) return;
    if (pt.value === lastSavedTitle.current) return;

    lastSavedTitle.current = pt.value;
    onNoteChanged(pt.noteId, { title: pt.value });
    flushSave(pt.noteId, { title: pt.value });
    pendingTitleRef.current = null;
  }, [debouncedTitle]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const pc = pendingContentRef.current;
    if (!pc || pc.noteId !== note?.id) return;
    if (pc.value === lastSavedContent.current) return;

    lastSavedContent.current = pc.value;
    onNoteChanged(pc.noteId, { content: pc.value, content_text: pc.text });
    flushSave(pc.noteId, { content: pc.value, content_text: pc.text });
    pendingContentRef.current = null;
  }, [debouncedContent]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    if (note?.id) pendingTitleRef.current = { noteId: note.id, value: newTitle };
  }

  function handleContentChange(html: string, text: string) {
    setContent(html);
    if (note?.id)
      pendingContentRef.current = { noteId: note.id, value: html, text };
  }

  async function handleNotebookChange(newNotebookId: string) {
    if (!note) return;
    setNotebookId(newNotebookId);
    const patch = { notebook_id: newNotebookId || null };
    onNoteChanged(note.id, patch);
    flushSave(note.id, patch);
  }

  async function togglePin() {
    if (!note) return;
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    onNoteChanged(note.id, { is_pinned: newPinned });
    flushSave(note.id, { is_pinned: newPinned });
  }

  async function moveToTrash() {
    if (!note) return;
    await flushSave(note.id, {
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    });
    onDeleteNote(note.id);
  }


  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 p-4 text-center">
        Select a note or create a new one
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Mobile back button */}
      <button
        onClick={onBack}
        className="md:hidden p-3 border-b border-gray-200 text-left text-evernote-green"
      >
        ← Back to notes
      </button>

      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 md:p-4 md:pb-4.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        {/* Left: notebook select */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 overflow-x-auto">
          <select
            value={notebookId}
            onChange={(e) => handleNotebookChange(e.target.value)}
            className="border border-gray-200 rounded px-2 py-1 text-sm shrink-0"
          >
            <option value="">No notebook</option>
            {notebooks.map((nb) => (
              <option key={nb.id} value={nb.id}>
                {nb.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
          <button
            onClick={() => setShowShareModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              shareUrl
                ? "bg-evernote-green/10 text-evernote-green hover:bg-evernote-green/20"
                : "hover:bg-gray-100 text-gray-400"
            }`}
            title="Share note"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
              <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
            </svg>
            {shareUrl && <span>Shared</span>}
          </button>
          <button
            onClick={togglePin}
            title={isPinned ? "Unpin" : "Pin"}
            className={`p-2 rounded hover:bg-gray-100 ${isPinned ? "text-evernote-green" : "text-gray-400"
              }`}
          >
            📌
          </button>
          <button
            onClick={moveToTrash}
            className="p-2 rounded hover:bg-gray-100 text-gray-400"
            title="Move to trash"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="p-4 pt-3.5 pb-3.75 border-b border-gray-200">
        <input
          type="text"
          placeholder="Note title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full text-2xl font-bold focus:outline-none"
        />
      </div>

      {/* Quill editor */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <QuillEditor value={content} onChange={handleContentChange} />
      </div>

      {showShareModal && (
        <ShareNoteModal
          noteId={note.id}
          existingSharePath={shareUrl}
          onClose={() => setShowShareModal(false)}
          onShared={(path) => {
            setShareUrl(path);
            onNoteChanged(note.id, { is_public: true });
          }}
          onStopped={() => {
            setShareUrl(null);
            onNoteChanged(note.id, { is_public: false, public_slug: null });
            setShowShareModal(false);
          }}
        />
      )}
    </div>
  );
}
