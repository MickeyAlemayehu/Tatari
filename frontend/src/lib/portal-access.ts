import type { Employee, Portal } from "../types/employee";

function hasPermission(employee: Employee, permission: string): boolean {
  const revoked = employee.revoked_permissions ?? [];
  if (revoked.includes(permission)) {
    return false;
  }

  const overrides = employee.permission_override ?? {};
  if (permission in overrides) {
    return Boolean(overrides[permission]);
  }

  return false;
}

export function canAccessPortal(employee: Employee, portal: Portal): boolean {
  switch (portal) {
    case "employee":
      return (
        employee.permission_level < 6 &&
        !hasPermission(employee, "manage_employees") &&
        !hasPermission(employee, "manage_payroll")
      );
    case "hr":
      return (
        employee.permission_level >= 4 ||
        hasPermission(employee, "manage_employees") ||
        hasPermission(employee, "manage_payroll") ||
        hasPermission(employee, "approve_leave")
      );
    case "admin":
      return employee.permission_level >= 10;
    default:
      return false;
  }
}

export function getDefaultDashboard(portal: Portal): string {
  switch (portal) {
    case "employee":
      return "/employee/dashboard";
    case "hr":
      return "/hr/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

export function getLoginPath(portal: Portal): string {
  switch (portal) {
    case "employee":
      return "/employee/login";
    case "hr":
      return "/hr/login";
    case "admin":
      return "/admin/login";
    default:
      return "/";
  }
}
