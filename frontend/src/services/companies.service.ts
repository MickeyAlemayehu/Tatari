import { api } from "../lib/api";
import type { Paginated } from "../types/api";

export interface CompanyRecord {
  id: number;
  companyName: string;
  name?: string;
  industry: string;
  size: string;
  country: string;
  city: string;
  website: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  jobTitle: string;
  employeeCount: number;
  requestDate: string;
  status: "pending" | "approved" | "rejected" | "active" | "inactive" | "suspended";
  description: string;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  address?: string | null;
  registeredDate?: string;
  expirationDate?: string;
  metrics?: {
    totalEmployees: number;
    activeEmployees: number;
    departments: number;
    payrollRuns: number;
    lastPayroll?: string | null;
  };
}

export const companiesService = {
  list: (params?: { status?: string; search?: string; per_page?: number; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "all") query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    if (params?.per_page) query.set("per_page", String(params.per_page));
    if (params?.page) query.set("page", String(params.page));
    const qs = query.toString();
    return api.get<Paginated<CompanyRecord>>(`/companies${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => api.get<CompanyRecord>(`/companies/${id}`),

  update: (id: number, payload: Partial<CompanyRecord> & { status?: string }) =>
    api.patch<CompanyRecord>(`/companies/${id}`, payload),
};
