import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

function generateSlug() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get existing note
  const { data: note } = await supabase
    .from("notes")
    .select("id, is_public, public_slug")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const slug = note.public_slug ?? generateSlug();

  const { data: updated, error } = await supabase
    .from("notes")
    .update({ is_public: true, public_slug: slug })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("public_slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ url: `/shared/${updated.public_slug}` });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("notes")
    .update({ is_public: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
