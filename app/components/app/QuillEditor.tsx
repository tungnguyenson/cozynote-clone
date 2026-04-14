"use client";

import { useEffect, useRef } from "react";
import type Quill from "quill";

interface QuillEditorProps {
  value: string;
  onChange: (html: string, text: string) => void;
}

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  ["link", "image"],
  ["clean"],
];

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Track whether the update is coming from outside (prop change)
  const externalUpdateRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    let destroyed = false;

    // Dynamic import to avoid SSR
    import("quill").then(({ default: QuillClass }) => {
      if (destroyed) return;

      import("quill/dist/quill.snow.css");

      const quill = new QuillClass(containerRef.current!, {
        theme: "snow",
        modules: { toolbar: TOOLBAR },
      });

      quillRef.current = quill;

      // Set initial content
      if (value) {
        externalUpdateRef.current = true;
        quill.root.innerHTML = value;
        externalUpdateRef.current = false;
      }

      quill.on("text-change", () => {
        if (externalUpdateRef.current) return;
        onChangeRef.current(quill.root.innerHTML, quill.getText());
      });
    });

    return () => {
      destroyed = true;
      quillRef.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync value changes from outside (note switching)
  useEffect(() => {
    if (!quillRef.current) return;
    const current = quillRef.current.root.innerHTML;
    if (current !== value) {
      externalUpdateRef.current = true;
      quillRef.current.root.innerHTML = value ?? "";
      externalUpdateRef.current = false;
    }
  }, [value]);

  return <div ref={containerRef} className="flex-1 min-h-0 h-full border-none text-xl" />;
}
