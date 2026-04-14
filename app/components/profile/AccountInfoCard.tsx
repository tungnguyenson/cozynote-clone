"use client";

import { useState } from "react";

interface AccountInfoCardProps {
  email: string;
  initialName: string;
}

export default function AccountInfoCard({ email, initialName }: AccountInfoCardProps) {
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setStatus(res.ok ? "Profile updated." : "Failed to update.");
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Account Info</h2>
      <p className="text-gray-600 mb-4 text-sm">
        Email: <span className="font-medium text-gray-900">{email}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-evernote-green"
          />
        </div>
        {status && (
          <p className={`text-sm ${status.includes("Failed") ? "text-red-600" : "text-evernote-green"}`}>
            {status}
          </p>
        )}
        <button
          type="submit"
          className="bg-evernote-green text-white py-2 px-4 rounded hover:bg-green-600 transition text-sm font-medium"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}
