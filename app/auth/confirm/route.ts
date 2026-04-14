import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  WELCOME_NOTE_TITLE,
  WELCOME_NOTE_CONTENT,
  WELCOME_NOTE_CONTENT_TEXT,
} from "@/lib/welcome-note";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "signup" | "recovery" | null;
  const next = searchParams.get("next") ?? (type === "recovery" ? "/reset-password" : "/app");

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      if (type === "signup") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("notes").insert({
            user_id: user.id,
            title: WELCOME_NOTE_TITLE,
            content: WELCOME_NOTE_CONTENT,
            content_text: WELCOME_NOTE_CONTENT_TEXT,
            is_pinned: true,
          });
        }
      }

      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=confirmation_failed", request.url));
}
