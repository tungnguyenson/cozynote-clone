import Link from "next/link";

interface AuthCardProps {
  children: React.ReactNode;
  subtitle: string;
  footer?: React.ReactNode;
}

export default function AuthCard({ children, subtitle, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-2xl font-bold text-evernote-green inline-block"
          >
            Simplanet Note
          </Link>
          <p className="text-gray-500 mt-2">{subtitle}</p>
        </div>
        {children}
        <div className="mt-6 text-center text-sm text-gray-600">{footer}</div>
      </div>
    </div>
  );
}
