import type { LeaveRequestRecord } from "../services/leave.service";

export interface LeaveHistoryItem {
  id: number;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedDate: string;
}

export interface PendingLeaveRequest {
  id: number;
  employee: {
    name: string;
    position: string;
    department: string;
    avatar: string;
  };
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  appliedDate: string;
  status: "pending";
}

export interface EmployeeLeaveHistoryItem {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "pending" | "approved" | "rejected";
  appliedDate: string;
}

function avatarFromName(name: string): string {
  const parts = name.split(" ");
  return parts.length >= 2
    ? `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export function mapHistoryItem(r: LeaveRequestRecord): LeaveHistoryItem {
  return {
    id: r.id,
    employee: r.employee?.name ?? "Unknown",
    type: r.type ?? r.leaveType ?? "Leave",
    startDate: r.startDate,
    endDate: r.endDate,
    days: r.days,
    reason: r.reason ?? "",
    status: r.status as LeaveHistoryItem["status"],
    appliedDate: r.appliedDate ?? "",
  };
}

export function mapPendingItem(r: LeaveRequestRecord): PendingLeaveRequest {
  const name = r.employee?.name ?? "Unknown";
  return {
    id: r.id,
    employee: {
      name,
      position: r.employee?.position ?? "—",
      department: r.employee?.department ?? "—",
      avatar: avatarFromName(name),
    },
    type: r.type ?? r.leaveType ?? "Leave",
    startDate: r.startDate,
    endDate: r.endDate,
    days: r.days,
    reason: r.reason ?? "",
    appliedDate: r.appliedDate ?? "",
    status: "pending",
  };
}

export function mapMyHistoryItem(r: LeaveRequestRecord): EmployeeLeaveHistoryItem {
  return {
    id: r.id,
    type: r.type ?? r.leaveType ?? "Leave",
    startDate: r.startDate,
    endDate: r.endDate,
    days: r.days,
    status: r.status as EmployeeLeaveHistoryItem["status"],
    appliedDate: r.appliedDate ?? "",
  };
}
