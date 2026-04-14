export interface Note {
  id: string;
  user_id: string;
  notebook_id: string | null;
  title: string;
  content: string;
  content_text: string;
  is_pinned: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  is_public: boolean;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notebook {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export type AppView =
  | "all"
  | "trash"
  | "shared"
  | { notebook_id: string }
  | { tag_id: string };

export type SyncStatus = "synced" | "pending" | "error";

export interface NoteWithSync extends Note {
  _syncStatus: SyncStatus;
}
