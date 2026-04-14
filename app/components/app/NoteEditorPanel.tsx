"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Note, Notebook, Tag } from "@/lib/types";

const QuillEditor = dynamic(() => import("./QuillEditor"), { ssr: false });

interface NoteEditorPanelProps {
  noteId: string | null;
  notebooks: Notebook[];
  tags: Tag[];
  onBack: () => void;
  onNoteUpdated: () => void;
  onDeleteNote: (id: string) => void;
  onTitleChange?: (id: string, title: string) => void;
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
  notebooks,
  onBack,
  onNoteUpdated,
  onDeleteNote,
  onTitleChange,
}: NoteEditorPanelProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentText, setContentText] = useState("");
  const [notebookId, setNotebookId] = useState<string>("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1500);
  const saveInProgress = useRef(false);
  const lastSavedTitle = useRef("");
  const lastSavedContent = useRef("");

  useEffect(() => {
    if (!noteId) { setNote(null); return; }
    fetch(`/api/notes/${noteId}`)
      .then((r) => r.json())
      .then(({ note: n }) => {
        setNote(n);
        setTitle(n.title);
        setContent(n.content);
        setContentText(n.content_text);
        setNotebookId(n.notebook_id ?? "");
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

  useEffect(() => {
    if (!noteId || debouncedTitle === lastSavedTitle.current) return;
    lastSavedTitle.current = debouncedTitle;
    save({ title: debouncedTitle });
  }, [debouncedTitle, noteId, save]);

  useEffect(() => {
    if (!noteId || debouncedContent === lastSavedContent.current) return;
    lastSavedContent.current = debouncedContent;
    save({ content: debouncedContent, content_text: contentText });
  }, [debouncedContent, noteId, save, contentText]);

  async function handleNotebookChange(newNotebookId: string) {
    setNotebookId(newNotebookId);
    await save({ notebook_id: newNotebookId || null });
  }

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
      <div className="flex-1 flex items-center justify-center text-gray-400 p-4 text-center">
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
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Mobile back button */}
      <button
        onClick={onBack}
        className="md:hidden p-3 border-b border-gray-200 text-left text-evernote-green"
      >
        ← Back to notes
      </button>

      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 md:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          {/* Left: notebook select + share URL */}
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
            <div className="flex gap-1 flex-wrap">
              {shareUrl && (
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(window.location.origin + shareUrl)
                  }
                  className="text-xs text-evernote-green underline truncate max-w-xs"
                >
                  {window.location.origin + shareUrl}
                </button>
              )}
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-1 md:gap-2 flex-wrap">
            <button
              className="p-2 rounded hover:bg-gray-100 text-gray-400"
              title="Manage collaborators"
            >
              👥
            </button>
            <button
              onClick={toggleShare}
              disabled={sharing}
              className="p-2 rounded hover:bg-gray-100 text-gray-400"
              title={shareUrl ? "Unshare note" : "Share note"}
            >
              🔗
            </button>
            <button
              onClick={togglePin}
              title={note.is_pinned ? "Unpin" : "Pin"}
              className={`p-2 rounded hover:bg-gray-100 ${
                note.is_pinned ? "text-evernote-green" : "text-gray-400"
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
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Note title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (noteId) onTitleChange?.(noteId, e.target.value);
            }}
            className="w-full text-2xl font-bold focus:outline-none"
          />
        </div>

        {/* Quill editor */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
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
