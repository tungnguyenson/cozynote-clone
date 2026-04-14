import AuthCard from "@/app/components/auth/AuthCard";
import RegisterForm from "@/app/components/auth/RegisterForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthCard subtitle="Create your free workspace">
      <RegisterForm initialEmail={email ?? ""} />
    </AuthCard>
  );
}
