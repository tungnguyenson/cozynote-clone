import type { Note } from "@/lib/types";

interface NoteCardProps {
  note: Note;
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
      className={`p-4 border-b border-gray-200 cursor-pointer transition ${
        selected ? "bg-white border-l-2 border-l-evernote-green" : "hover:bg-gray-100"
      }`}
    >
      <div className="flex items-start gap-1 mb-1">
        {note.is_pinned && <span className="text-xs mt-0.5">📌</span>}
        <p className="text-sm font-semibold text-gray-900 truncate flex-1">
          {note.title || "Untitled"}
        </p>
      </div>
      <p className="text-xs text-gray-400 line-clamp-2 mb-1">
        {note.content_text || "No content"}
      </p>
      <p className="text-xs text-gray-400">{formatDate(note.updated_at)}</p>

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
