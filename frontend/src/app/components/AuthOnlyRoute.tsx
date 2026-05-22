import { Navigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

interface AuthOnlyRouteProps {
  children: React.ReactNode;
}

export function AuthOnlyRoute({ children }: AuthOnlyRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
