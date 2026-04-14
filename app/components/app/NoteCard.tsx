import type { NoteWithSync } from "@/lib/types";

interface NoteCardProps {
  note: NoteWithSync;
  selected: boolean;
  onClick: () => void;
  trashMode?: boolean;
  onRestore?: () => void;
  onDeleteForever?: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SyncIndicator({ status }: { status: NoteWithSync["_syncStatus"] }) {
  if (status === "synced") return null;
  if (status === "pending") {
    return (
      <span
        className="inline-block w-3 h-3 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin"
        title="Saving…"
      />
    );
  }
  return (
    <span className="text-amber-500 text-xs" title="Sync failed — will retry">
      ⚠
    </span>
  );
}

export default function NoteCard({
  note,
  selected,
  onClick,
  trashMode,
  onRestore,
  onDeleteForever,
}: NoteCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
        selected ? "bg-green-50 border-l-4 border-l-evernote-green" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        {note.is_pinned && <span>📌</span>}
        <h3 className="font-medium truncate flex-1">
          {note.title || "Untitled"}
        </h3>
      </div>
      <p className="text-sm text-gray-500 truncate mt-1">
        {note.content_text || "No content"}
      </p>
      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
        <span>{formatDate(note.updated_at)}</span>
        <SyncIndicator status={note._syncStatus} />
      </div>

      {trashMode && (
        <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onRestore}
            className="text-xs text-evernote-green hover:underline"
          >
            Restore
          </button>
          <button
            onClick={onDeleteForever}
            className="text-xs text-red-500 hover:underline"
          >
            Delete forever
          </button>
        </div>
      )}
    </div>
  );
}
