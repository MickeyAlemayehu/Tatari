import { api } from "../lib/api";
import type { ListResponse } from "../types/api";

export interface PayrollPeriodGroup {
  id: number | null;
  year?: number;
  month?: number;
  name: string;
  status: string;
  employeeCount: number;
  totalAmount: number;
  deductions: number;
  netPay: number;
  startDate?: string;
  endDate?: string;
  payDate?: string;
  employees?: PayrollRecord[];
}

export interface PayrollRecord {
  id: number;
  employee_id?: number;
  employeeId?: string;
  employeeName?: string;
  year: number;
  month: number;
  status: string;
  baseSalary?: number;
  grossPay?: number;
  net_salary?: number;
  netPay?: number;
  totalDeductions?: number;
  allowances?: { housing?: number; transport?: number; meal?: number };
  bonuses?: number;
  deductions?: { tax?: number; insurance?: number; pension?: number; other?: number };
  employee?: {
    id: number;
    name: string;
    department?: string;
    position?: string;
  };
  payPeriod?: string;
  payDate?: string;
  paymentMethod?: string;
  workingDays?: number;
  leaveDays?: number;
  company?: string;
}

export const payrollService = {
  list: () => api.get<{ data: PayrollPeriodGroup[] }>("/payroll"),

  summary: () =>
    api.get<{
      totalEmployees: number;
      currentPeriodNetPay: number;
      currentPeriodEmployees: number;
      totalPayrollThisMonth: number;
      averagePayroll: number;
    }>("/payroll/summary"),

  get: (id: number) => api.get<PayrollRecord>(`/payroll/${id}`),

  period: (year: number, month: number) =>
    api.get<PayrollPeriodGroup>(`/payroll/period?year=${year}&month=${month}`),

  generate: (payload: {
    year: number;
    month: number;
    include_bonuses?: boolean;
    include_allowances?: boolean;
    auto_deductions?: boolean;
    unpaid_days?: number;
  }) => api.post<{ data: PayrollRecord[] }>("/payroll/generate", payload),

  approve: (id: number) => api.post<PayrollRecord>(`/payroll/${id}/approve`),

  reject: (id: number, reason?: string) =>
    api.post<PayrollRecord>(`/payroll/${id}/reject`, { reason, remarks: reason }),

  myPayslips: () => api.get<{ data: PayrollRecord[] }>("/payroll/my-payslips"),

  payslip: (id: number) => api.get<PayrollRecord>(`/payroll/payslips/${id}`),
};
