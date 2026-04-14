import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountInfoCard from "@/app/components/profile/AccountInfoCard";
import ChangePasswordCard from "@/app/components/profile/ChangePasswordCard";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, workspace_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-evernote-sidebar text-white px-4 py-4 shrink-0">
        <Link
          href="/app"
          className="text-gray-300 hover:text-white text-sm"
        >
          ← Back to Notes
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-xl mx-auto w-full py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
        <AccountInfoCard
          email={user.email ?? ""}
          initialName={profile?.name ?? ""}
        />
        <ChangePasswordCard />
      </main>
    </div>
  );
}
