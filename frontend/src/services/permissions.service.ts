import { api } from "../lib/api";

export interface PermissionLevel {
  name: string;
  permissions: string[];
}

export interface AvailablePermissions {
  permissions: string[];
  levels: {
    1: PermissionLevel;
    2: PermissionLevel;
    3: PermissionLevel;
  };
}

export interface EmployeePermissionData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  permission_level: number;
  level_name?: string;
  custom_override?: string[];
  revoked_permissions?: string[];
  effective_permissions: string[];
}

export const permissionsService = {
  getAvailablePermissions: () =>
    api.get<AvailablePermissions>("/permissions/available"),

  updatePermissionLevel: (employeeId: number, permissionLevel: number) =>
    api.patch<{ message: string; employee: EmployeePermissionData }>(
      `/employees/${employeeId}/permission-level`,
      { permission_level: permissionLevel }
    ),

  grantPermission: (employeeId: number, permission: string) =>
    api.post<{ message: string; employee: EmployeePermissionData }>(
      `/employees/${employeeId}/permissions/grant`,
      { permission }
    ),

  revokePermission: (employeeId: number, permission: string) =>
    api.post<{ message: string; employee: EmployeePermissionData }>(
      `/employees/${employeeId}/permissions/revoke`,
      { permission }
    ),

  removeGrantedPermission: (employeeId: number, permission: string) =>
    api.delete<{ message: string; employee: EmployeePermissionData }>(
      `/employees/${employeeId}/permissions/granted/${encodeURIComponent(permission)}`
    ),

  removeRevokedPermission: (employeeId: number, permission: string) =>
    api.delete<{ message: string; employee: EmployeePermissionData }>(
      `/employees/${employeeId}/permissions/revoked/${encodeURIComponent(permission)}`
    ),
};
