import { api } from "../lib/api";
import type { ListResponse } from "../types/api";

export interface DepartmentRecord {
  id: number;
  company_id: number;
  name: string;
  description: string | null;
  manager: string | null;
  employeeCount: number;
  created_at?: string;
  updated_at?: string;
}

export const departmentsService = {
  list: () => api.get<ListResponse<DepartmentRecord>>("/departments"),

  get: (id: number) => api.get<DepartmentRecord>(`/departments/${id}`),

  create: (payload: { name: string; description?: string }) =>
    api.post<DepartmentRecord>("/departments", payload),

  update: (id: number, payload: { name?: string; description?: string }) =>
    api.patch<DepartmentRecord>(`/departments/${id}`, payload),

  remove: (id: number) => api.delete<{ message: string }>(`/departments/${id}`),
};
