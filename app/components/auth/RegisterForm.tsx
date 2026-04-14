"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface RegisterFormProps {
  initialEmail?: string;
}

export default function RegisterForm({ initialEmail = "" }: RegisterFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/confirm`,
        data: {
          name,
          workspace_name: workspaceName || `${name}'s Workspace`,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
        )}
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-evernote-green"
        />
        <input
          type="email"
          placeholder="Work email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-evernote-green"
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-evernote-green"
        />
        <input
          type="text"
          placeholder="Workspace name (optional)"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-evernote-green"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-evernote-green text-white py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50 font-medium"
        >
          {loading ? "Creating account…" : "Create Free Account"}
        </button>
        <p className="text-xs text-gray-500 text-center">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href={`/login${emailParam}`}
          className="font-medium text-evernote-green hover:underline"
        >
          Sign in
        </Link>
      </div>
    </>
  );
}
