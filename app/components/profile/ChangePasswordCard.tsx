"use client";

import { useState } from "react";

export default function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    if (res.ok) {
      setStatus("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      const { error } = await res.json();
      setStatus(error ?? "Failed to change password.");
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-evernote-green"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-evernote-green"
          />
        </div>
        {status && (
          <p className={`text-sm ${status.includes("Failed") || status.includes("error") ? "text-red-600" : "text-evernote-green"}`}>
            {status}
          </p>
        )}
        <button
          type="submit"
          className="bg-evernote-green text-white py-2 px-4 rounded hover:bg-green-600 transition text-sm font-medium"
        >
          Change Password
        </button>
      </form>
    </div>
  );
}
