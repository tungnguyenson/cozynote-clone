import Link from "next/link";

export default function HeroSection() {
  return (
    <>
      <section className="pt-20 pb-10 text-center" aria-labelledby="hero-heading">
        <div className="max-w-6xl mx-auto px-4">
          <span className="inline-block bg-green-50 text-evernote-green px-3 py-1 rounded-full text-sm mb-6">
            Free to start · No credit card required
          </span>
          <h1
            id="hero-heading"
            className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
          >
            Your notes,
            <br />
            <span className="text-evernote-green">organized and shared</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            A modern note-taking workspace for individuals and teams. Write,
            organize, collaborate, and share — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-evernote-green text-white py-3 px-8 rounded-xl text-lg font-medium hover:bg-green-600 transition"
            >
              Start for Free
            </Link>
            <Link
              href="/login"
              className="text-gray-600 py-3 px-8 text-lg font-medium hover:text-gray-900 transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Mock app preview — matches original structure exactly */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
          {/* Window chrome */}
          <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-4 text-gray-400 text-sm">Simplanet Note</span>
          </div>
          <div className="flex h-64 md:h-80">
            {/* Sidebar */}
            <div className="w-48 bg-gray-800 p-4 hidden md:block">
              <div className="text-gray-400 text-xs mb-3">WORKSPACE</div>
              <div className="text-gray-300 text-sm py-1.5 px-2 rounded hover:bg-gray-700 cursor-pointer">📝 All Notes</div>
              <div className="text-gray-300 text-sm py-1.5 px-2 rounded hover:bg-gray-700 cursor-pointer">👥 Shared</div>
              <div className="text-gray-300 text-sm py-1.5 px-2 rounded hover:bg-gray-700 cursor-pointer">🗑️ Trash</div>
              <div className="text-gray-500 text-xs mt-4 mb-2">NOTEBOOKS</div>
              <div className="text-gray-400 text-sm py-1 px-2">📓 Work</div>
              <div className="text-gray-400 text-sm py-1 px-2">📓 Personal</div>
            </div>
            {/* Note list */}
            <div
              className="w-56 border-l border-gray-700 p-3 hidden sm:block"
              style={{ background: "rgb(26, 26, 46)" }}
            >
              <div className="p-2 rounded mb-1 cursor-pointer bg-green-900/40 border-l-2 border-evernote-green">
                <div className="text-gray-200 text-sm font-medium">Q4 Planning</div>
                <div className="text-gray-500 text-xs mt-0.5">Updated just now</div>
              </div>
              <div className="p-2 rounded mb-1 cursor-pointer hover:bg-gray-700/30">
                <div className="text-gray-200 text-sm font-medium">Meeting Notes</div>
                <div className="text-gray-500 text-xs mt-0.5">Updated just now</div>
              </div>
              <div className="p-2 rounded mb-1 cursor-pointer hover:bg-gray-700/30">
                <div className="text-gray-200 text-sm font-medium">Product Roadmap</div>
                <div className="text-gray-500 text-xs mt-0.5">Updated just now</div>
              </div>
              <div className="p-2 rounded mb-1 cursor-pointer hover:bg-gray-700/30">
                <div className="text-gray-200 text-sm font-medium">Ideas</div>
                <div className="text-gray-500 text-xs mt-0.5">Updated just now</div>
              </div>
            </div>
            {/* Editor */}
            <div className="flex-1 bg-white p-6">
              <div className="text-2xl font-bold text-gray-800 mb-3">Q4 Planning</div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-4/5" />
                <div className="h-3 bg-gray-100 rounded w-3/5 mt-4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
