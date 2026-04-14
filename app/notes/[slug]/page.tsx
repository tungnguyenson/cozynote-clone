import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicNotePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: note } = await supabase
    .from("notes")
    .select("title, content")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .eq("is_deleted", false)
    .single();

  if (!note) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <span className="text-lg font-bold text-evernote-green">Simplanet Note</span>
      </header>
      <main className="max-w-3xl mx-auto py-10 px-6 bg-white mt-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{note.title}</h1>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      </main>
    </div>
  );
}
