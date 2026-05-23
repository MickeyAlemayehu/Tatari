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

// ── Template & Question types ──────────────────────────

export interface EvaluationTemplateRecord {
  id: number;
  title: string;
  description?: string;
  status: string;
  weights?: { self: number; peer: number; manager: number };
  questionCount?: number;
  questions?: EvaluationQuestionRecord[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EvaluationQuestionRecord {
  id: number;
  template_id: number;
  text: string;
  type: string;
  evaluationType: string;
  evaluation_type?: string;
  category: string;
  required: boolean;
  sort_order?: number;
  weight?: number;
  options?: { id: number; label: string; value: number }[];
}

export interface QuestionOptionInput {
  label: string;
  value?: number;
}

// ── Service ────────────────────────────────────────────

export const performanceService = {
  // ── Periods ───────────────────────────────
  periods: () => api.get<ListResponse<EvaluationPeriodRecord>>("/evaluation-periods"),

  createPeriod: (payload: {
    name: string;
    start_date: string;
    end_date: string;
    status?: string;
    template_id?: number;
  }) => api.post<EvaluationPeriodRecord>("/evaluation-periods", payload),

  // ── Assignments ───────────────────────────
  myAssignments: () =>
    api.get<ListResponse<EvaluationAssignmentRecord>>("/evaluation-assignments/my"),

  assignments: (params?: { evaluation_period_id?: number }) => {
    const qs = params?.evaluation_period_id
      ? `?evaluation_period_id=${params.evaluation_period_id}`
      : "";
    return api.get<ListResponse<EvaluationAssignmentRecord>>(
      `/evaluation-assignments${qs}`
    );
  },

  assignPeers: (payload: {
    evaluation_period_id: number;
    employee_id: number;
    peer_ids: number[];
  }) => api.post("/evaluation-assignments/assign-peers", payload),

  submitEvaluation: (
    assignmentId: number,
    payload: {
      score?: number;
      rating?: number;
      comments?: string;
      answers?: unknown[];
    }
  ) => api.post(`/evaluation-assignments/${assignmentId}/submit`, payload),

  // ── Results ───────────────────────────────
  results: (params?: { evaluation_period_id?: number }) => {
    const qs = params?.evaluation_period_id
      ? `?evaluation_period_id=${params.evaluation_period_id}`
      : "";
    return api.get<{ data: PerformanceSummaryRecord[] }>(
      `/performance-results${qs}`
    );
  },

  myResults: () =>
    api.get<{ data: PerformanceSummaryRecord[] }>("/performance-results/my"),

  // ── Templates ─────────────────────────────
  templates: () =>
    api.get<ListResponse<EvaluationTemplateRecord>>("/evaluation-templates"),

  createTemplate: (payload: {
    title: string;
    description?: string;
    status?: string;
    weights?: { self: number; peer: number; manager: number };
    questions?: Array<{
      text: string;
      type?: string;
      evaluationType?: string;
      category?: string;
      required?: boolean;
      weight?: number;
      options?: QuestionOptionInput[];
    }>;
  }) => api.post<EvaluationTemplateRecord>("/evaluation-templates", payload),

  getTemplate: (id: number) =>
    api.get<EvaluationTemplateRecord>(`/evaluation-templates/${id}`),

  updateTemplate: (
    id: number,
    payload: Partial<{
      title: string;
      description: string;
      status: string;
      weights: { self: number; peer: number; manager: number };
    }>
  ) =>
    api.patch<EvaluationTemplateRecord>(
      `/evaluation-templates/${id}`,
      payload
    ),

  deleteTemplate: (id: number) => api.delete(`/evaluation-templates/${id}`),

  activateTemplate: (id: number) =>
    api.post<EvaluationTemplateRecord>(
      `/evaluation-templates/${id}/activate`
    ),

  deactivateTemplate: (id: number) =>
    api.post<EvaluationTemplateRecord>(
      `/evaluation-templates/${id}/deactivate`
    ),

  // ── Questions ─────────────────────────────
  questions: (params?: {
    template_id?: number;
    evaluation_type?: string;
  }) => {
    const parts: string[] = [];
    if (params?.template_id) parts.push(`template_id=${params.template_id}`);
    if (params?.evaluation_type)
      parts.push(`evaluation_type=${params.evaluation_type}`);
    const qs = parts.length ? `?${parts.join("&")}` : "";
    return api.get<ListResponse<EvaluationQuestionRecord>>(
      `/evaluation-questions${qs}`
    );
  },

  createQuestion: (payload: {
    template_id: number;
    text: string;
    type?: string;
    evaluationType?: string;
    category?: string;
    required?: boolean;
    weight?: number;
    options?: QuestionOptionInput[];
  }) => api.post<EvaluationQuestionRecord>("/evaluation-questions", payload),

  updateQuestion: (
    id: number,
    payload: Partial<{
      text: string;
      type: string;
      evaluationType: string;
      category: string;
      required: boolean;
      weight: number;
      options: QuestionOptionInput[];
    }>
  ) =>
    api.patch<EvaluationQuestionRecord>(
      `/evaluation-questions/${id}`,
      payload
    ),

  deleteQuestion: (id: number) => api.delete(`/evaluation-questions/${id}`),

  reorderQuestions: (questions: { id: number; sort_order: number }[]) =>
    api.post("/evaluation-questions/reorder", { questions }),

  // ── Employee-facing: questions for an assignment ──
  questionsForAssignment: (assignmentId: number) =>
    api.get<{
      template: {
        id: number;
        title: string;
        weights: Record<string, number>;
      } | null;
      data: EvaluationQuestionRecord[];
    }>(`/evaluation-questions/for-assignment/${assignmentId}`),
};
