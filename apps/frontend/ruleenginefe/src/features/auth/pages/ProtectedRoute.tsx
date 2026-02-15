import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../services/auth";

type Props = { children: React.ReactNode };

/**
 * Renders children if authenticated, otherwise redirects to /login with return URL.
 */
export function ProtectedRoute({ children }: Props) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
