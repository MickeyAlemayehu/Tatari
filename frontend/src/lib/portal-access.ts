import type { Employee, Portal } from "../types/employee";
import { hasEmployeePermission } from "./permissions";

export function employeeHasPermission(employee: Employee, permission: string): boolean {
  return hasEmployeePermission(employee, permission);
}

export function canAccessPortal(employee: Employee, portal: Portal): boolean {
  switch (portal) {
    case "admin":
      return employeeHasPermission(employee, "access_admin_portal");
    case "hr":
      return employeeHasPermission(employee, "access_hr_portal");
    case "employee":
      return employeeHasPermission(employee, "access_employee_portal");
    default:
      return false;
  }
}

export function getDefaultDashboard(employee: Employee): string {
  if (employee.landing_path) {
    return employee.landing_path;
  }

  if (employee.portal === "admin") return "/admin/dashboard";
  if (employee.portal === "hr") return "/hr/dashboard";
  return "/employee/dashboard";
}

export function getLoginPath(): string {
  return "/login";
}
