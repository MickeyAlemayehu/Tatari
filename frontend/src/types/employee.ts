export type Portal = "employee" | "hr" | "admin";

export interface Employee {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  position?: string;
  department_id?: number | null;
  permission_level: number;
  permission_override?: Record<string, boolean> | null;
  revoked_permissions?: string[] | null;
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
}

export interface AuthSession {
  token: string;
  employee: Employee;
  portal: Portal;
}
