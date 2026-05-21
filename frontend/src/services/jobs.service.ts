import { api } from "../lib/api";
import type { ListResponse, Paginated } from "../types/api";

export interface JobRecord {
  id: number;
  title: string;
  department_id?: number;
  department?: string;
  location?: string;
  type?: string;
  employment_type?: string;
  status?: string;
  applicants?: number;
  postedDate?: string;
  closingDate?: string;
  salary?: string;
  salary_min?: number;
  salary_max?: number;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  positions?: number;
}

export const jobsService = {
  list: (params?: { status?: string; per_page?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.per_page) query.set("per_page", String(params.per_page ?? 50));
    const qs = query.toString();
    return api.get<Paginated<JobRecord>>(`/job-vacancies${qs ? `?${qs}` : ""}`);
  },

  publicList: (params?: { department?: string; type?: string }) => {
    const query = new URLSearchParams();
    if (params?.department) query.set("department", params.department);
    if (params?.type) query.set("type", params.type);
    const qs = query.toString();
    return api.get<ListResponse<JobRecord>>(`/public/jobs${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => api.get<JobRecord>(`/job-vacancies/${id}`),

  publicGet: (id: number) => api.get<JobRecord>(`/public/jobs/${id}`),

  create: (payload: Record<string, unknown>) => api.post<JobRecord>("/job-vacancies", payload),

  update: (id: number, payload: Record<string, unknown>) =>
    api.patch<JobRecord>(`/job-vacancies/${id}`, payload),

  remove: (id: number) => api.delete<{ message: string }>(`/job-vacancies/${id}`),
};
