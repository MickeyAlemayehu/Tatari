import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { canAccessPortal, getLoginPath } from "../../lib/portal-access";
import type { Portal } from "../../types/employee";

interface ProtectedRouteProps {
  children: React.ReactNode;
  portal: Portal;
}

export function ProtectedRoute({ children, portal }: ProtectedRouteProps) {
  const { employee, isLoading, isAuthenticated, portal: activePortal } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#6B7280]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !employee) {
    return <Navigate to={getLoginPath(portal)} state={{ from: location }} replace />;
  }

  if (activePortal !== portal || !canAccessPortal(employee, portal)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
