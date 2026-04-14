"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type View = "login" | "forgot-password";

interface LoginFormProps {
  initialEmail?: string;
}

export default function LoginForm({ initialEmail = "" }: LoginFormProps) {
  const router = useRouter();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/app");
    router.refresh();
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setMessage("Check your email for a password reset link.");
  }

  if (view === "forgot-password") {
    return (
      <>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
              {message}
            </p>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-evernote-green"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-evernote-green text-white py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50 font-medium"
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          <button
            type="button"
            onClick={() => { setView("login"); setError(""); setMessage(""); }}
            className="font-medium text-evernote-green hover:underline"
          >
            Back to Sign In
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-evernote-green"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-evernote-green"
        />
        <div className="text-right">
          <button
            type="button"
            onClick={() => { setView("forgot-password"); setError(""); }}
            className="text-sm text-evernote-green hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-evernote-green text-white py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50 font-medium"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href={`/register${emailParam}`}
          className="font-medium text-evernote-green hover:underline"
        >
          Start for free
        </Link>
      </div>
    </>
  );
}
