import { api } from "../lib/api";
import type { Employee } from "../types/employee";
import type { Paginated } from "../types/api";

export interface EmployeeRecord extends Employee {
  position: string;
  department?: { id: number; name: string } | null;
  created_at?: string;
}

export const employeesService = {
  list: (params?: { per_page?: number; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.per_page) query.set("per_page", String(params.per_page));
    if (params?.page) query.set("page", String(params.page));
    const qs = query.toString();
    return api.get<Paginated<EmployeeRecord>>(`/employees${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => api.get<EmployeeRecord>(`/employees/${id}`),

  create: (payload: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    position: string;
    department_id?: number;
    permission_level: number;
    status?: string;
  }) => api.post<EmployeeRecord>("/employees", payload),

  update: (id: number, payload: Partial<EmployeeRecord> & { password?: string }) =>
    api.patch<EmployeeRecord>(`/employees/${id}`, payload),

  deactivate: (id: number) => api.post<{ message: string }>(`/employees/${id}/deactivate`),
};
