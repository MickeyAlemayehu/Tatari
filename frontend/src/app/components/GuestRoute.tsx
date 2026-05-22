import { Navigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { getDefaultDashboard } from "../../lib/portal-access";

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading, employee } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && employee) {
    return <Navigate to={getDefaultDashboard(employee)} replace />;
  }

  return <>{children}</>;
}
