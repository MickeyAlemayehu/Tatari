/**
 * Dashboard widget permission keys are UI aliases derived from the backend
 * `effective_permissions` returned at login. They are NOT new server-side
 * permissions — every entry maps to one or more real permissions that the
 * backend already enforces on the underlying endpoints.
 */
export type DashboardPermission =
  | "view_employees"
  | "view_leave"
  | "view_recruitment"
  | "view_payroll"
  | "view_performance"
  | "view_my_leave_balance"
  | "view_my_tasks"
  | "view_my_performance"
  | "view_quick_actions";

const VIEW_TO_BACKEND: Record<DashboardPermission, string[]> = {
  view_employees: ["manage_employees"],
  view_leave: ["manage_leave"],
  view_recruitment: ["manage_recruitment"],
  view_payroll: ["manage_payroll"],
  view_performance: ["manage_performance"],
  view_my_leave_balance: ["access_employee_portal"],
  view_my_tasks: ["access_employee_portal"],
  view_my_performance: ["access_employee_portal"],
  view_quick_actions: ["access_employee_portal"],
};

export function isDashboardPermission(key: string): key is DashboardPermission {
  return key in VIEW_TO_BACKEND;
}

export function backendPermissionsFor(view: DashboardPermission): string[] {
  return VIEW_TO_BACKEND[view];
}

/**
 * Strict check against the backend-returned effective_permissions list.
 * Only the view_* dashboard aliases are resolved here, and only because they
 * are pure UI keys (never returned by the API, never displayed in the admin
 * panel). No role-based expansion, no implicit admin grants.
 */
export function hasDashboardPermission(
  effectivePermissions: string[],
  permission: string
): boolean {
  if (isDashboardPermission(permission)) {
    return VIEW_TO_BACKEND[permission].some((p) => effectivePermissions.includes(p));
  }
  return effectivePermissions.includes(permission);
}
