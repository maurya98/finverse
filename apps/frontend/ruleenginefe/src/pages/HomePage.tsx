import { useNavigate } from "react-router-dom";
import { getUser } from "../features/auth/services/auth";
import { logout } from "../features/auth/services/authApi";

export function HomePage() {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Rule Engine</h1>
        <div className="home-user">
          {user && <span>{user.email}</span>}
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>
      <main className="home-main">
        <p>You are signed in.</p>
        <button type="button" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </button>
      </main>
      <style>{`
        .home-page { width: 100%; min-height: 100vh; display: flex; flex-direction: column; box-sizing: border-box; }
        .home-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }
        .home-header h1 { margin: 0; font-size: 1.25rem; }
        .home-user { display: flex; align-items: center; gap: 1rem; }
        .home-user span { font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); }
        .home-main { flex: 1; padding: 1.5rem; }
        @media (prefers-color-scheme: light) {
          .home-header { border-color: rgba(0, 0, 0, 0.1); }
          .home-user span { color: rgba(0, 0, 0, 0.6); }
        }
      `}</style>
    </div>
  );
}
