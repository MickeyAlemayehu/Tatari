import { api } from "../lib/api";
import type { ListResponse } from "../types/api";

export interface CompensationRecord {
  id: number;
  employee_id: number;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  totalAllowances: number;
  grossMonthly: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: string;
  employee?: {
    id: number;
    name: string;
    department?: string;
    position?: string;
  };
}

export type CompensationInput = {
  employee_id: number;
  basic_salary: number;
  housing_allowance?: number;
  transport_allowance?: number;
  other_allowances?: number;
  currency: string;
  effective_from: string;
  effective_to?: string | null;
  status?: string;
};

export const compensationsService = {
  list: (params?: { employee_id?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.employee_id) query.set("employee_id", String(params.employee_id));
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return api.get<ListResponse<CompensationRecord>>(`/compensations${qs ? `?${qs}` : ""}`);
  },

  forEmployee: (employeeId: number) =>
    api.get<ListResponse<CompensationRecord>>(`/employees/${employeeId}/compensations`),

  get: (id: number) => api.get<CompensationRecord>(`/compensations/${id}`),

  create: (payload: CompensationInput) =>
    api.post<CompensationRecord>("/compensations", payload),

  update: (id: number, payload: Partial<CompensationInput>) =>
    api.patch<CompensationRecord>(`/compensations/${id}`, payload),

  remove: (id: number) => api.delete<{ message: string }>(`/compensations/${id}`),
};
