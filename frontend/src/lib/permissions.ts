import type { Employee } from "../types/employee";

export type Permission =
  | "access_employee_portal"
  | "access_hr_portal"
  | "access_admin_portal"
  | "manage_employees"
  | "approve_leave"
  | "performance_create"
  | "performance_evaluate"
  | "manage_performance_reviews";

export function hasEmployeePermission(
  employee: Pick<Employee, "effective_permissions"> | null | undefined,
  permission: Permission | string
): boolean {
  return employee?.effective_permissions?.includes(permission) ?? false;
}
