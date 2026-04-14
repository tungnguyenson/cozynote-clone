const features = [
  {
    icon: "📝",
    title: "Rich Text Editor",
    desc: "Write with a powerful editor supporting headings, lists, code blocks, images, and more.",
  },
  {
    icon: "📓",
    title: "Notebooks & Tags",
    desc: "Organize notes into notebooks and tag them for lightning-fast retrieval.",
  },
  {
    icon: "🔍",
    title: "Full-Text Search",
    desc: "Find any note instantly with full-text search across titles and content.",
  },
  {
    icon: "👥",
    title: "Collaboration",
    desc: "Share notes with teammates and collaborate in real time.",
  },
  {
    icon: "🌐",
    title: "Public Sharing",
    desc: "Publish notes publicly with a shareable link — no account required to view.",
  },
  {
    icon: "📥",
    title: "Evernote Import",
    desc: "Import your existing notes from Evernote with a single .enex file upload.",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Everything you need
        </h2>
        <p className="text-gray-500 text-center mb-12 text-lg">
          Built for people who take notes seriously. Simple enough for personal
          use, powerful enough for teams.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="p-6 border border-gray-200 rounded-xl bg-white">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
