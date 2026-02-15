import { Navigate } from "react-router-dom";
import { LoginBackground } from "../components/LoginBackground";
import { LoginCard } from "../components/LoginCard";
import { useLoginForm } from "../hooks/useLoginForm";
import { isAuthenticated } from "../services/auth";
import "./LoginPage.css";

export function LoginPage() {
  const form = useLoginForm();

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="login-page">
      <LoginBackground />
      <LoginCard
        email={form.email}
        password={form.password}
        error={form.error}
        loading={form.loading}
        onEmailChange={form.setEmail}
        onPasswordChange={form.setPassword}
        onSubmit={form.handleSubmit}
      />
    </div>
  );
}
