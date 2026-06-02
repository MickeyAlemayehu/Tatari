import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { getDefaultDashboard, getLoginPath } from "../../lib/portal-access";

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission: string;
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { employee, isLoading, isAuthenticated, hasPermission } = useAuth();
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
    return <Navigate to={getLoginPath()} state={{ from: location }} replace />;
  }

  if (employee.must_change_password && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (!hasPermission(permission)) {
    if (location.key === "default") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
          <div className="max-w-md rounded-lg border border-[#E5E7EB] bg-white p-6 text-center shadow-sm">
            <h1 className="text-lg text-[#111827]">Access denied</h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              You do not have permission to view this page.
            </p>
          </div>
        </div>
      );
    }

    return <Navigate to={getDefaultDashboard(employee)} replace />;
  }

  return <>{children}</>;
}
