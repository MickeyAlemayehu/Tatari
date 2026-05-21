import type { ReactNode } from "react";
import { AuthOnlyRoute } from "../app/components/AuthOnlyRoute";
import { ProtectedRoute } from "../app/components/ProtectedRoute";
import type { Portal } from "../types/employee";

function guard(portal: Portal, element: ReactNode) {
  return <ProtectedRoute portal={portal}>{element}</ProtectedRoute>;
}

export const employee = (element: ReactNode) => guard("employee", element);
export const hr = (element: ReactNode) => guard("hr", element);
export const admin = (element: ReactNode) => guard("admin", element);
export const authenticated = (element: ReactNode) => (
  <AuthOnlyRoute>{element}</AuthOnlyRoute>
);
