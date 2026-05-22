export type Portal = "employee" | "hr" | "admin";

export interface Employee {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  position?: string;
  department_id?: number | null;
  permission_level: number;
  level_name?: string;
  permission_override?: Record<string, boolean> | null;
  custom_override?: string[] | Record<string, boolean> | null;
  revoked_permissions?: string[] | null;
  effective_permissions?: string[];
  portal?: Portal | null | undefined;
  landing_path?: string | undefined;
  status?: string;
  department?: {
    id: number;
    name: string;
  } | null;
}

export interface LoginResponse {
  token_type: string;
  access_token: string;
  employee: Employee;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  permission_level?: number;
  effective_permissions?: string[];
  landing_path?: string;
}

export interface AuthSession {
  token: string;
  employee: Employee;
  portal: Portal;
}
