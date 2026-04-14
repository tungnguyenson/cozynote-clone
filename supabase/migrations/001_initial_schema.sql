-- ============================================================
-- 001_initial_schema.sql
-- Run this in Supabase SQL Editor or via supabase db push
-- ============================================================

-- ─── Profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id             uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name           text NOT NULL DEFAULT '',
  workspace_name text NOT NULL DEFAULT 'My Workspace',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, workspace_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'workspace_name', 'My Workspace')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Notebooks ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notebooks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_notebooks" ON public.notebooks
  FOR ALL USING (auth.uid() = user_id);

-- ─── Tags ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tags (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_tags" ON public.tags
  FOR ALL USING (auth.uid() = user_id);

-- ─── Notes ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notebook_id  uuid REFERENCES public.notebooks(id) ON DELETE SET NULL,
  title        text NOT NULL DEFAULT 'Untitled',
  content      text NOT NULL DEFAULT '',
  content_text text NOT NULL DEFAULT '',
  is_pinned    boolean NOT NULL DEFAULT false,
  is_deleted   boolean NOT NULL DEFAULT false,
  deleted_at   timestamptz,
  is_public    boolean NOT NULL DEFAULT false,
  public_slug  text UNIQUE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Full-text search index
CREATE INDEX IF NOT EXISTS notes_fts_idx ON public.notes
  USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content_text, '')));

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Owner has full access
CREATE POLICY "users_own_notes" ON public.notes
  FOR ALL USING (auth.uid() = user_id);

-- Public notes readable by anyone
CREATE POLICY "public_notes_readable" ON public.notes
  FOR SELECT USING (is_public = true AND is_deleted = false);

-- ─── Note Tags ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.note_tags (
  note_id uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  tag_id  uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "note_tags_via_note" ON public.note_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()
    )
  );

-- ─── Shared Notes ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shared_notes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id           uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  shared_by         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email text NOT NULL,
  shared_with       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (note_id, shared_with_email)
);

ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;

-- Owner can manage shares
CREATE POLICY "shared_by_owner" ON public.shared_notes
  FOR ALL USING (auth.uid() = shared_by);

-- Recipient can read their shares
CREATE POLICY "shared_with_recipient_read" ON public.shared_notes
  FOR SELECT USING (auth.uid() = shared_with);

-- Notes shared with current user
CREATE POLICY "shared_notes_recipient_read_notes" ON public.notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shared_notes
      WHERE shared_notes.note_id = notes.id
        AND shared_notes.shared_with = auth.uid()
    )
  );
