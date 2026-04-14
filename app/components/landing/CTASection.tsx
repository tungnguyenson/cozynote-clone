import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 text-center">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to get organized?
        </h2>
        <p className="text-gray-500 text-lg mb-10">
          Join thousands of people who use Simplanet Note every day.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="bg-evernote-green text-white py-3 px-8 rounded-xl text-lg font-medium hover:bg-green-600 transition"
          >
            Create your free account
          </Link>
          <Link
            href="/register"
            className="border border-gray-300 text-gray-700 py-3 px-8 rounded-xl text-lg font-medium hover:bg-gray-50 transition"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </section>
  );
}
