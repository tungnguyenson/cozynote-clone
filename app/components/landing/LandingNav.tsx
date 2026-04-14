import Link from "next/link";
import Image from "next/image";

export default function LandingNav() {
  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur z-50 border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo_128px.png" alt="Simplanet Note" width={48} height={48} className="inline-block mr-1 ml-2" />
          <span className="text-xl font-bold text-evernote-green hidden sm:inline-block">
            Simplanet Note
          </span>
        </Link>
        <nav className="flex items-center gap-4 px-4 py-4 ">
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
