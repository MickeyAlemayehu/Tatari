import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Download,
  Printer,
  Calendar,
  User,
  Building,
  DollarSign,
  FileText,
  Hash,
  CheckCircle,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { AsyncState } from "../components/AsyncState";
import { payrollService, type PayrollRecord } from "../../services/payroll.service";
import { ApiError } from "../../lib/api";
import { formatDate } from "../../lib/utils";

export function Payslip() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [payslip, setPayslip] = useState<PayrollRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    payrollService
      .payslip(Number(id))
      .then(setPayslip)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load payslip.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  if (loading || error || !payslip) {
    return (
      <AppLayout title="Payslip" subtitle="View your payment details">
        <AsyncState loading={loading} error={error} empty={!loading && !error && !payslip} />
      </AppLayout>
    );
  }

  const allowances = payslip.allowances ?? { housing: 0, transport: 0, meal: 0 };
  const deductions = payslip.deductions ?? { tax: 0, insurance: 0, pension: 0, other: 0 };
  const totalAllowances = (allowances.housing ?? 0) + (allowances.transport ?? 0) + (allowances.meal ?? 0);
  const totalDeductions =
    payslip.totalDeductions ??
    (deductions.tax ?? 0) + (deductions.insurance ?? 0) + (deductions.pension ?? 0) + (deductions.other ?? 0);
  const grossPay = payslip.grossPay ?? payslip.baseSalary ?? 0;
  const netPay = payslip.netPay ?? payslip.net_salary ?? 0;

  const earningsBreakdown = [
    { label: "Base Salary", amount: payslip.baseSalary ?? 0 },
    { label: "Housing Allowance", amount: allowances.housing ?? 0 },
    { label: "Transport Allowance", amount: allowances.transport ?? 0 },
    { label: "Meal Allowance", amount: allowances.meal ?? 0 },
    { label: "Performance Bonus", amount: payslip.bonuses ?? 0 },
  ].filter((e) => e.amount > 0);

  const deductionsBreakdown = [
    { label: "Income Tax", amount: deductions.tax ?? 0 },
    { label: "Health Insurance", amount: deductions.insurance ?? 0 },
    { label: "Pension", amount: deductions.pension ?? 0 },
    { label: "Other", amount: deductions.other ?? 0 },
  ].filter((d) => d.amount > 0);

  return (
    <AppLayout title="Payslip" subtitle={payslip.payPeriod ?? "Payment details"}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsPrinting(true);
                window.print();
                setIsPrinting(false);
              }}
              disabled={isPrinting}
              className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={() => {
                setIsDownloading(true);
                setTimeout(() => setIsDownloading(false), 500);
              }}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Downloading..." : "Download"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8">
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-[#E5E7EB]">
            <div>
              <h1 className="text-2xl text-[#111827] mb-1">Payslip</h1>
              <p className="text-sm text-[#6B7280]">{payslip.company ?? "Tatari HRMS"}</p>
            </div>
            <div className="text-right text-sm text-[#6B7280]">
              <p>Pay period: {payslip.payPeriod}</p>
              <p>Pay date: {formatDate(payslip.payDate)}</p>
              <p className="flex items-center justify-end gap-1 mt-1">
                <Hash className="w-3 h-3" />
                PAY-{payslip.id}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-[#4F46E5] mt-0.5" />
              <div>
                <p className="text-sm text-[#6B7280]">Employee</p>
                <p className="text-[#111827]">{payslip.employeeName}</p>
                <p className="text-sm text-[#6B7280]">{payslip.position}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-[#4F46E5] mt-0.5" />
              <div>
                <p className="text-sm text-[#6B7280]">Department</p>
                <p className="text-[#111827]">{payslip.department ?? "—"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-[#111827] mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#22C55E]" />
                Earnings
              </h3>
              <div className="space-y-2">
                {earningsBreakdown.map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">{item.label}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total Earnings</span>
                  <span className="text-[#22C55E]">{formatCurrency(grossPay)}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#111827] mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#EF4444]" />
                Deductions
              </h3>
              <div className="space-y-2">
                {deductionsBreakdown.map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">{item.label}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total Deductions</span>
                  <span className="text-[#EF4444]">{formatCurrency(totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-[#EEF2FF] rounded-lg flex items-center justify-between">
            <span className="text-lg text-[#111827] flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#22C55E]" />
              Net Pay
            </span>
            <span className="text-2xl text-[#4F46E5]">{formatCurrency(netPay)}</span>
          </div>

          <div className="mt-6 flex gap-6 text-sm text-[#6B7280]">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Working days: {payslip.workingDays ?? "—"}
            </span>
            <span>Leave days: {payslip.leaveDays ?? 0}</span>
            <span>Method: {payslip.paymentMethod ?? "Bank Transfer"}</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
