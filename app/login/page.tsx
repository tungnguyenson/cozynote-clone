import AuthCard from "@/app/components/auth/AuthCard";
import LoginForm from "@/app/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthCard subtitle="Sign in to your workspace">
      <LoginForm initialEmail={email ?? ""} />
    </AuthCard>
  );
}
