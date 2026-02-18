export type LoginCardProps = {
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function LoginCard({
  email,
  password,
  error,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginCardProps) {
  return (
    <div className="login-card">
      <div className="login-brand">
        <span className="login-brand-icon" aria-hidden>
          ◈
        </span>
        <span className="login-brand-name">Buddy Loan Business Rule Engine</span>
      </div>
      <h1 className="login-title">Welcome back</h1>
      <p className="login-subtitle">Sign in to continue</p>
      <form onSubmit={onSubmit} className="login-form">
        <div className="login-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="login-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="login-submit" disabled={loading}>
          {loading ? (
            <span className="login-spinner" aria-hidden />
          ) : null}
          <span className="login-submit-text">
            {loading ? "Signing in…" : "Sign in"}
          </span>
        </button>
      </form>
    </div>
  );
}
