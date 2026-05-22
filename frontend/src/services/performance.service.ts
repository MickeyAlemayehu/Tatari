import { api } from "../lib/api";
import type { ListResponse } from "../types/api";

export interface EvaluationPeriodRecord {
  id: number;
  title?: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status: string;
  assignmentsCount?: number;
  completed?: number;
  totalEmployees?: number;
  progress?: number;
}

export interface EvaluationAssignmentRecord {
  id: number;
  evaluation_period_id?: number;
  type: string;
  status: string;
  employee?: { id: number; name: string; department?: string; position?: string };
  evaluator?: { id: number; name: string };
  period?: string | { id: number; name: string };
  score?: number | null;
  evaluation?: { score?: number; status?: string };
}

export interface PerformanceSummaryRecord {
  id: number;
  employee_id: number;
  employeeName?: string;
  department?: string;
  position?: string;
  period?: string;
  selfScore: number;
  peerScore: number;
  managerScore: number;
  finalScore: number;
  status: string;
}

export const performanceService = {
  periods: () => api.get<ListResponse<EvaluationPeriodRecord>>("/evaluation-periods"),

  createPeriod: (payload: {
    name: string;
    start_date: string;
    end_date: string;
    status?: string;
  }) => api.post<EvaluationPeriodRecord>("/evaluation-periods", payload),

  myAssignments: () => api.get<ListResponse<EvaluationAssignmentRecord>>("/evaluation-assignments/my"),

  assignments: (params?: { evaluation_period_id?: number }) => {
    const qs = params?.evaluation_period_id
      ? `?evaluation_period_id=${params.evaluation_period_id}`
      : "";
    return api.get<ListResponse<EvaluationAssignmentRecord>>(`/evaluation-assignments${qs}`);
  },

  assignPeers: (payload: {
    evaluation_period_id: number;
    employee_id: number;
    peer_ids: number[];
  }) => api.post("/evaluation-assignments/assign-peers", payload),

  submitEvaluation: (
    assignmentId: number,
    payload: { score?: number; rating?: number; comments?: string; answers?: unknown[] }
  ) => api.post(`/evaluation-assignments/${assignmentId}/submit`, payload),

  results: (params?: { evaluation_period_id?: number }) => {
    const qs = params?.evaluation_period_id
      ? `?evaluation_period_id=${params.evaluation_period_id}`
      : "";
    return api.get<{ data: PerformanceSummaryRecord[] }>(`/performance-results${qs}`);
  },

  myResults: () => api.get<{ data: PerformanceSummaryRecord[] }>("/performance-results/my"),
};
