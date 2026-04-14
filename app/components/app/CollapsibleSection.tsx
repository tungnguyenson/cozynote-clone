"use client";

import { useState } from "react";

interface CollapsibleSectionProps {
  label: string;
  children: React.ReactNode;
}

export default function CollapsibleSection({ label, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-2 text-gray-400 text-sm flex justify-between items-center hover:text-white transition"
      >
        <span>{label}</span>
        <span className="text-xs">{open ? "▼" : "▶"}</span>
      </button>
      {open && children}
    </div>
  );
}
