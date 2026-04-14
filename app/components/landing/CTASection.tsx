import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 text-center bg-evernote-green">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to get organized?
        </h2>
        <p className="text-green-100 text-lg mb-10">
          Join thousands of people who use Simplanet Note every day.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="bg-white text-evernote-green py-3 px-8 rounded-xl text-lg font-medium hover:bg-green-50 transition"
          >
            Create your free account
          </Link>
        </div>
      </div>
    </section>
  );
}
