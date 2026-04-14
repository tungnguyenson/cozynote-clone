import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { XMLParser } from "fast-xml-parser";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.name.endsWith(".enex")) {
    return NextResponse.json({ error: "File must be a .enex file" }, { status: 400 });
  }

  const xml = await file.text();

  let parsed: Record<string, unknown>;
  try {
    const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: true });
    parsed = parser.parse(xml);
  } catch {
    return NextResponse.json({ error: "Invalid XML in .enex file" }, { status: 400 });
  }

  const enExport = parsed["en-export"] as Record<string, unknown> | undefined;
  if (!enExport) {
    return NextResponse.json({ error: "Not a valid Evernote export" }, { status: 400 });
  }

  // Normalise: single note vs array of notes
  const rawNotes = enExport["note"];
  const noteArray: unknown[] = Array.isArray(rawNotes)
    ? rawNotes
    : rawNotes
    ? [rawNotes]
    : [];

  if (noteArray.length === 0) {
    return NextResponse.json({ imported: 0, errors: [] });
  }

  const rows = noteArray.map((n) => {
    const note = n as Record<string, unknown>;
    const title = String(note["title"] ?? "Untitled");
    // ENML content is inside <content> — strip XML wrapper tags
    const rawContent = String(note["content"] ?? "");
    const content = rawContent
      .replace(/<\?xml[^>]*\?>/g, "")
      .replace(/<!DOCTYPE[^>]*>/g, "")
      .replace(/<en-note[^>]*>/g, "")
      .replace(/<\/en-note>/g, "")
      .trim();
    const contentText = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    return {
      user_id: user.id,
      title,
      content,
      content_text: contentText,
    };
  });

  const errors: string[] = [];
  let imported = 0;

  // Batch insert in chunks of 50
  for (let i = 0; i < rows.length; i += 50) {
    const chunk = rows.slice(i, i + 50);
    const { error } = await supabase.from("notes").insert(chunk);
    if (error) {
      errors.push(error.message);
    } else {
      imported += chunk.length;
    }
  }

  return NextResponse.json({ imported, errors });
}
