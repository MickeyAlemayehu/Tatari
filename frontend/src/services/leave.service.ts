import { api } from "../lib/api";
import type { Paginated } from "../types/api";

export interface LeaveTypeRecord {
  id: number;
  name: string;
  maxDaysPerYear: number;
}

export interface LeaveRequestRecord {
  id: number;
  employee_id: number;
  leave_type_id: number;
  type?: string;
  leaveType?: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string | null;
  status: string;
  appliedDate?: string;
  approvedDate?: string;
  rejectionReason?: string | null;
  employee?: {
    id: number;
    name: string;
    department?: string;
    position?: string;
    avatar?: string;
  } | null;
}

export interface LeaveBalanceRecord {
  id: number;
  type?: string;
  total: number;
  used: number;
  pending: number;
  remaining: number;
}

export const leaveService = {
  types: () => api.get<{ data: LeaveTypeRecord[] }>("/leave-types"),

  myRequests: (params?: { per_page?: number }) => {
    const qs = params?.per_page ? `?per_page=${params.per_page}` : "";
    return api.get<Paginated<LeaveRequestRecord>>(`/leave-requests/my${qs}`);
  },

  list: (params?: { status?: string; per_page?: number; employee_id?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.per_page) query.set("per_page", String(params.per_page));
    if (params?.employee_id) query.set("employee_id", String(params.employee_id));
    const qs = query.toString();
    return api.get<Paginated<LeaveRequestRecord>>(`/leave-requests${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => api.get<LeaveRequestRecord>(`/leave-requests/${id}`),

  create: (payload: {
    leave_type_id?: number;
    type?: string;
    start_date: string;
    end_date: string;
    is_half_day?: boolean;
    reason?: string;
  }) => api.post<LeaveRequestRecord>("/leave-requests", payload),

  approve: (id: number) => api.post<LeaveRequestRecord>(`/leave-requests/${id}/approve`),

  reject: (id: number, rejection_reason: string) =>
    api.post<LeaveRequestRecord>(`/leave-requests/${id}/reject`, { rejection_reason }),

  cancel: (id: number) => api.post<LeaveRequestRecord>(`/leave-requests/${id}/cancel`),

  myBalances: () => api.get<{ data: LeaveBalanceRecord[] }>("/leave-balances/my"),

  summary: () =>
    api.get<{
      totalLeaveRequests: number;
      pendingLeaveRequests: number;
      approvedLeaveRequests: number;
      rejectedLeaveRequests: number;
      totalEmployees: number;
    }>("/leave-summary"),
};
