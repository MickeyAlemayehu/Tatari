import { Navigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { getDefaultDashboard } from "../../lib/portal-access";
import type { Portal } from "../../types/employee";

interface GuestRouteProps {
  children: React.ReactNode;
  portal: Portal;
}

export function GuestRoute({ children, portal }: GuestRouteProps) {
  const { isAuthenticated, isLoading, portal: activePortal } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && activePortal === portal) {
    return <Navigate to={getDefaultDashboard(portal)} replace />;
  }

  return <>{children}</>;
}
