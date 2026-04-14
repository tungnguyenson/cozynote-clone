import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="py-20 text-center" aria-labelledby="hero-heading">
      <div className="max-w-6xl mx-auto px-4">
        <span className="inline-block bg-green-50 text-evernote-green px-3 py-1 rounded-full text-sm mb-6">
          WORKSPACE
        </span>
        <h1
          id="hero-heading"
          className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
        >
          Your notes,
          <br />
          organized and shared
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          A modern note-taking workspace for individuals and teams. Write,
          organize, collaborate, and share — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/register"
            className="bg-evernote-green text-white py-3 px-8 rounded-xl text-lg font-medium hover:bg-green-600 transition"
          >
            Start for free
          </Link>
          <Link
            href="/login"
            className="border border-gray-300 text-gray-700 py-3 px-8 rounded-xl text-lg font-medium hover:bg-gray-50 transition"
          >
            Sign in
          </Link>
        </div>

        {/* Mock app preview */}
        <div className="max-w-5xl mx-auto bg-gray-900 rounded-2xl overflow-hidden shadow-2xl text-left">
          <div className="flex h-72">
            {/* Sidebar mock */}
            <div className="w-52 bg-evernote-sidebar p-4 text-white text-xs flex-shrink-0">
              <div className="font-semibold mb-1">Simplanet Note</div>
              <div className="text-gray-400 text-xs mb-3">WORKSPACE</div>
              <div className="space-y-1 mb-4">
                <div className="px-2 py-1 bg-evernote-hover text-evernote-green rounded">
                  📝 All Notes
                </div>
                <div className="px-2 py-1 text-gray-400">👥 Shared</div>
                <div className="px-2 py-1 text-gray-400">🗑️ Trash</div>
              </div>
              <div className="text-gray-500 text-xs mb-1">NOTEBOOKS</div>
              <div className="space-y-1 mb-4 pl-2">
                <div className="text-gray-300">📓 Work</div>
                <div className="text-gray-300">📓 Personal</div>
              </div>
            </div>
            {/* Note list mock */}
            <div className="w-52 bg-gray-50 border-r border-gray-200 flex-shrink-0">
              {[
                "Q4 Planning",
                "Meeting Notes",
                "Product Roadmap",
                "Ideas",
              ].map((title) => (
                <div
                  key={title}
                  className="p-3 border-b border-gray-200 text-xs"
                >
                  <div className="font-medium text-gray-900 truncate">
                    {title}
                  </div>
                  <div className="text-gray-400 text-xs">Updated just now</div>
                </div>
              ))}
            </div>
            {/* Editor mock */}
            <div className="flex-1 p-6 bg-white">
              <div className="text-lg font-semibold text-gray-900 mb-3">
                Q4 Planning
              </div>
              <div className="text-sm text-gray-500 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
