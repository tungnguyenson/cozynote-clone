import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  // Password change
  if (body.new_password) {
    const { error } = await supabase.auth.updateUser({
      password: body.new_password,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  // Name update
  if ("name" in body) {
    const { error } = await supabase
      .from("profiles")
      .update({ name: body.name, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}
