import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") ?? "all";
  const notebookId = searchParams.get("notebook_id");
  const tagId = searchParams.get("tag_id");
  const q = searchParams.get("q");

  if (view === "shared") {
    // Notes shared with this user via shared_notes table
    const { data: shared } = await supabase
      .from("shared_notes")
      .select("note_id")
      .eq("shared_with", user.id);

    const noteIds = (shared ?? []).map((s) => s.note_id);
    if (noteIds.length === 0) return NextResponse.json({ notes: [] });

    const { data: notes } = await supabase
      .from("notes")
      .select("*")
      .in("id", noteIds)
      .eq("is_deleted", false)
      .order("updated_at", { ascending: false });

    return NextResponse.json({ notes: notes ?? [] });
  }

  let query = supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_deleted", view === "trash");

  if (notebookId) query = query.eq("notebook_id", notebookId);

  if (tagId) {
    const { data: tagged } = await supabase
      .from("note_tags")
      .select("note_id")
      .eq("tag_id", tagId);
    const ids = (tagged ?? []).map((t) => t.note_id);
    if (ids.length === 0) return NextResponse.json({ notes: [] });
    query = query.in("id", ids);
  }

  if (q) {
    query = query.textSearch(
      "title,content_text",
      q,
      { type: "plain", config: "english" }
    );
  }

  if (view !== "trash") {
    query = query.order("is_pinned", { ascending: false });
  }
  query = query.order("updated_at", { ascending: false });

  const { data: notes, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ notes: notes ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title: body.title ?? "Untitled",
      content: body.content ?? "",
      content_text: body.content_text ?? "",
      notebook_id: body.notebook_id ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ note }, { status: 201 });
}
