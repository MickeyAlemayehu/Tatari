import { api } from "../lib/api";
import { Paginated } from "../types/api";

export interface AuditLogRecord {
  id: number;
  user: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  status: "success" | "failed" | "warning";
  ipAddress: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogFilters {
  search?: string;
  module?: string;
  status?: string;
  user?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}

export const auditService = {
  list: (filters: AuditLogFilters) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append("search", filters.search);
    if (filters.module && filters.module !== "all") params.append("module", filters.module);
    if (filters.status && filters.status !== "all") params.append("status", filters.status);
    if (filters.user && filters.user !== "all") params.append("user", filters.user);
    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.per_page) params.append("per_page", filters.per_page.toString());

    const queryString = params.toString();
    return api.get<Paginated<AuditLogRecord>>(`/audit-logs${queryString ? `?${queryString}` : ""}`);
  },
  
  modules: () => {
    return api.get<string[]>("/audit-logs/modules");
  },
};
