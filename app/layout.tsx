import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simplanet Note",
  description: "A modern note-taking workspace for individuals and teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
