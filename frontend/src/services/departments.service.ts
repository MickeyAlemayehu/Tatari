import { api } from "../lib/api";
import type { ListResponse } from "../types/api";

export interface DepartmentRecord {
  id: number;
  company_id: number;
  name: string;
  description: string | null;
  manager_id: number | null;
  manager: string | null;
  employeeCount: number;
  created_at?: string;
  updated_at?: string;
}

export interface MyDepartmentResponse {
  id: number;
  name: string;
  description: string | null;
  employeeCount: number;
  manager: {
    id: number;
    name: string;
    position: string | null;
    email: string | null;
  } | null;
  team: Array<{
    id: number;
    first_name: string;
    last_name: string;
    position: string | null;
    email: string | null;
  }>;
}

export const departmentsService = {
  list: () => api.get<ListResponse<DepartmentRecord>>("/departments"),

  get: (id: number) => api.get<DepartmentRecord>(`/departments/${id}`),

  create: (payload: { name: string; description?: string; manager_id?: number | null }) =>
    api.post<DepartmentRecord>("/departments", payload),

  update: (
    id: number,
    payload: { name: string; description: string; manager_id?: number | null }
  ) => api.patch<DepartmentRecord>(`/departments/${id}`, payload),

  remove: (id: number) => api.delete<{ message: string }>(`/departments/${id}`),

  mine: () => api.get<MyDepartmentResponse>("/me/department"),
};
