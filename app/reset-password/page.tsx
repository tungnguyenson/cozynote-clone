import AuthCard from "@/app/components/auth/AuthCard";
import ResetPasswordForm from "@/app/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthCard subtitle="Set a new password">
      <ResetPasswordForm />
    </AuthCard>
  );
}
