import Link from "next/link";

export default function LandingNav() {
  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur z-50 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-evernote-green">
          Simplanet Note
        </span>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-gray-600 hover:text-gray-900 text-sm transition"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="bg-evernote-green text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition"
          >
            Get started free
          </Link>
        </nav>
      </div>
    </header>
  );
}
