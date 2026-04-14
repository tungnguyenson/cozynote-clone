import Link from "next/link";
import AuthCard from "@/app/components/auth/AuthCard";
import LoginForm from "@/app/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard
      subtitle="Sign in to your workspace"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-evernote-green hover:underline">
            Start for free
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
