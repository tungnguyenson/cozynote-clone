import Link from "next/link";
import AuthCard from "@/app/components/auth/AuthCard";
import RegisterForm from "@/app/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard
      subtitle="Create your free workspace"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-evernote-green hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
