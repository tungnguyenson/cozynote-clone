"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Note } from "@/lib/types";

const QuillEditor = dynamic(() => import("./QuillEditor"), { ssr: false });

interface NoteEditorPanelProps {
  noteId: string | null;
  onBack: () => void;
  onNoteUpdated: () => void;
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
  noteId,
  onBack,
  onNoteUpdated,
  onDeleteNote,
}: NoteEditorPanelProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentText, setContentText] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1500);
  const saveInProgress = useRef(false);
  const lastSavedTitle = useRef("");
  const lastSavedContent = useRef("");

  // Load note when noteId changes
  useEffect(() => {
    if (!noteId) { setNote(null); return; }
    fetch(`/api/notes/${noteId}`)
      .then((r) => r.json())
      .then(({ note: n }) => {
        setNote(n);
        setTitle(n.title);
        setContent(n.content);
        setContentText(n.content_text);
        lastSavedTitle.current = n.title;
        lastSavedContent.current = n.content;
        setShareUrl(n.is_public && n.public_slug ? `/notes/${n.public_slug}` : null);
      });
  }, [noteId]);

  const save = useCallback(
    async (updates: Record<string, unknown>) => {
      if (!noteId || saveInProgress.current) return;
      saveInProgress.current = true;
      await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      saveInProgress.current = false;
      onNoteUpdated();
    },
    [noteId, onNoteUpdated]
  );

  // Auto-save title
  useEffect(() => {
    if (!noteId || debouncedTitle === lastSavedTitle.current) return;
    lastSavedTitle.current = debouncedTitle;
    save({ title: debouncedTitle });
  }, [debouncedTitle, noteId, save]);

  // Auto-save content
  useEffect(() => {
    if (!noteId || debouncedContent === lastSavedContent.current) return;
    lastSavedContent.current = debouncedContent;
    save({ content: debouncedContent, content_text: contentText });
  }, [debouncedContent, noteId, save, contentText]);

  async function togglePin() {
    if (!note) return;
    await save({ is_pinned: !note.is_pinned });
    setNote({ ...note, is_pinned: !note.is_pinned });
  }

  async function moveToTrash() {
    if (!noteId) return;
    await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_deleted: true, deleted_at: new Date().toISOString() }),
    });
    onDeleteNote(noteId);
  }

  async function toggleShare() {
    if (!noteId) return;
    setSharing(true);
    if (shareUrl) {
      await fetch(`/api/notes/${noteId}/share`, { method: "DELETE" });
      setShareUrl(null);
    } else {
      const res = await fetch(`/api/notes/${noteId}/share`, { method: "POST" });
      if (res.ok) {
        const { url } = await res.json();
        setShareUrl(url);
      }
    }
    setSharing(false);
  }

  if (!noteId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Select a note or create a new one
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* Mobile back button */}
      <button
        onClick={onBack}
        className="md:hidden p-3 border-b border-gray-200 text-left text-evernote-green text-sm"
      >
        ← Back to notes
      </button>

      {/* Toolbar row */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <button
          onClick={togglePin}
          title={note.is_pinned ? "Unpin" : "Pin"}
          className={`text-sm px-2 py-1 rounded hover:bg-gray-200 transition ${
            note.is_pinned ? "text-evernote-green" : "text-gray-400"
          }`}
        >
          📌
        </button>
        <button
          onClick={toggleShare}
          disabled={sharing}
          className="text-sm px-2 py-1 rounded hover:bg-gray-200 transition text-gray-500"
        >
          🔗 {shareUrl ? "Unshare" : "Share"}
        </button>
        {shareUrl && (
          <button
            onClick={() => navigator.clipboard.writeText(window.location.origin + shareUrl)}
            className="text-xs text-evernote-green underline truncate max-w-xs"
          >
            {window.location.origin + shareUrl}
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={moveToTrash}
          className="text-sm px-2 py-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
        >
          🗑️
        </button>
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="px-4 py-3 text-lg font-semibold text-gray-900 border-b border-gray-200 focus:outline-none focus:border-evernote-green flex-shrink-0"
      />

      {/* Quill editor */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <QuillEditor
          value={content}
          onChange={(html, text) => {
            setContent(html);
            setContentText(text);
          }}
        />
      </div>
    </div>
  );
}
