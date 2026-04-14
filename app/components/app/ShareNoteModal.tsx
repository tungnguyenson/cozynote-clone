"use client";

import { useEffect, useRef, useState } from "react";

interface ShareNoteModalProps {
  noteId: string;
  /** Pre-populated when the note is already public, e.g. "/shared/abc12345" */
  existingSharePath: string | null;
  onClose: () => void;
  onStopped: () => void;
  onShared: (path: string) => void;
}

export default function ShareNoteModal({
  noteId,
  existingSharePath,
  onClose,
  onStopped,
  onShared,
}: ShareNoteModalProps) {
  const [sharePath, setSharePath] = useState<string | null>(existingSharePath);
  const [loading, setLoading] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate the link on open when not yet shared
  useEffect(() => {
    if (existingSharePath) return;

    setLoading(true);
    fetch(`/api/notes/${noteId}/share`, { method: "POST" })
      .then((r) => r.json())
      .then(({ url }) => {
        setSharePath(url);
        onShared(url);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fullUrl =
    typeof window !== "undefined" && sharePath
      ? window.location.origin + sharePath
      : "";

  function handleCopy() {
    if (!fullUrl) return;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleStopSharing() {
    setStopping(true);
    await fetch(`/api/notes/${noteId}/share`, { method: "DELETE" });
    setStopping(false);
    onStopped();
  }

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Share Note</h2>
        <p className="text-sm text-gray-500 mb-4">
          Anyone with this link can view this note:
        </p>

        <div className="flex gap-2 mb-5">
          <input
            ref={inputRef}
            readOnly
            value={loading ? "Generating link…" : fullUrl}
            onClick={() => inputRef.current?.select()}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:outline-none truncate"
          />
          <button
            onClick={handleCopy}
            disabled={loading || !fullUrl}
            className="shrink-0 bg-evernote-green hover:bg-evernote-green/90 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleStopSharing}
            disabled={stopping || loading}
            className="text-sm text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors"
          >
            {stopping ? "Stopping…" : "Stop sharing"}
          </button>
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
