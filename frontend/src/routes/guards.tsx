import type { ReactNode } from "react";
import { ProtectedRoute } from "../app/components/ProtectedRoute";

function guard(permission: string, element: ReactNode) {
  return <ProtectedRoute permission={permission}>{element}</ProtectedRoute>;
}

export const employee = (element: ReactNode) => guard("access_employee_portal", element);
export const hr = (element: ReactNode) => guard("access_hr_portal", element);
export const admin = (element: ReactNode) => guard("access_admin_portal", element);
export const permitted = (permission: string, element: ReactNode) => guard(permission, element);
export const authenticated = (element: ReactNode) => guard("access_employee_portal", element);
