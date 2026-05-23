import { api, apiRequest } from "../lib/api";
import type { Paginated } from "../types/api";

export type ApplicantStatus =
  | "new"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "hired"
  | "interview_scheduled";

export interface ApplicantRecord {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  jobId?: number;
  department?: string;
  appliedDate?: string;
  status: ApplicantStatus | string;
  rating?: number;
  location?: string;
  experience?: string;
  coverLetter?: string;
  interviewAt?: string | null;
}

export const applicantsService = {
  list: (params?: { status?: string; vacancy_id?: number; per_page?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.vacancy_id) query.set("vacancy_id", String(params.vacancy_id));
    if (params?.per_page) query.set("per_page", String(params.per_page ?? 50));
    const qs = query.toString();
    return api.get<Paginated<ApplicantRecord>>(`/applicants${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => api.get<ApplicantRecord>(`/applicants/${id}`),

  update: (
    id: number,
    payload: {
      status?: ApplicantStatus;
      rating?: number;
      rejection_reason?: string;
      interview_at?: string | null;
    }
  ) => api.patch<ApplicantRecord>(`/applicants/${id}`, payload),

  apply: (jobId: number, body: FormData) =>
    apiRequest<ApplicantRecord>(`/public/jobs/${jobId}/apply`, {
      method: "POST",
      body,
      auth: false,
    }),
};
