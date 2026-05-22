import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { payrollService, type PayrollPeriodGroup } from "../../services/payroll.service";
import { AsyncState } from "../components/AsyncState";
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  Eye,
  Send,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";

type PayrollPeriod = PayrollPeriodGroup & {
  startDate: string;
  endDate: string;
  payDate: string;
  status: "draft" | "processing" | "approved" | "paid";
};

export function PayrollDashboard() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<"all" | PayrollPeriod["status"]>("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPayrollThisMonth, setTotalPayrollThisMonth] = useState(0);
  const [averagePayroll, setAveragePayroll] = useState(0);

  useEffect(() => {
    void (async () => {
      try {
        const [listRes, summaryRes] = await Promise.all([
          payrollService.list(),
          payrollService.summary(),
        ]);
        setPayrollPeriods(
          listRes.data.map((p) => ({
            ...p,
            startDate: p.startDate ?? "",
            endDate: p.endDate ?? "",
            payDate: p.payDate ?? "",
            status: (p.status === "approved" ? "approved" : p.status === "draft" ? "draft" : "processing") as PayrollPeriod["status"],
          }))
        );
        setTotalEmployees(summaryRes.totalEmployees);
        setTotalPayrollThisMonth(summaryRes.totalPayrollThisMonth);
        setAveragePayroll(summaryRes.averagePayroll);
      } catch {
        setLoadError("Failed to load payroll data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredPeriods = payrollPeriods.filter(
    (period) => filterStatus === "all" || period.status === filterStatus
  );

  const currentPeriod = payrollPeriods.find((p) => p.status === "processing" || p.status === "draft");
  const avgPayroll = averagePayroll;

  // Status badge styling
  const getStatusBadge = (status: PayrollPeriod["status"]) => {
    const styles = {
      draft: "bg-[#F9FAFB] text-[#111827] border-[#E5E7EB]",
      processing: "bg-blue-100 text-blue-700 border-[#06B6D4]/20",
      approved: "bg-[#EEF2FF] text-[#4F46E5] border-purple-200",
      paid: "bg-[#DCFCE7] text-[#22C55E] border-green-200",
    };

    const labels = {
      draft: "Draft",
      processing: "Processing",
      approved: "Approved",
      paid: "Paid",
    };

    const icons = {
      draft: <FileText className="w-3.5 h-3.5" />,
      processing: <Clock className="w-3.5 h-3.5" />,
      approved: <CheckCircle className="w-3.5 h-3.5" />,
      paid: <CheckCircle className="w-3.5 h-3.5" />,
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${styles[status]}`}>
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Count by status
  const statusCounts = {
    all: payrollPeriods.length,
    draft: payrollPeriods.filter(p => p.status === "draft").length,
    processing: payrollPeriods.filter(p => p.status === "processing").length,
    approved: payrollPeriods.filter(p => p.status === "approved").length,
    paid: payrollPeriods.filter(p => p.status === "paid").length,
  };

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl text-[#111827]">Payroll Management</h1>
              <p className="text-sm text-[#6B7280]">Manage payroll periods and payments</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Report</span>
              </button>
              <button
                onClick={() => navigate("/payroll/generate")}
                className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">New Payroll Period</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <AsyncState loading={loading} error={loadError} empty={!loading && payrollPeriods.length === 0} emptyMessage="No payroll periods yet.">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Employees */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#6B7280]">Total Employees</span>
                  <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#4F46E5]" />
                  </div>
                </div>
                <div className="text-3xl text-[#111827] mb-1">{totalEmployees}</div>
                <p className="text-xs text-[#6B7280]">Active on payroll</p>
              </div>

              {/* Current Period */}
              <div className="bg-white rounded-xl border border-[#4F46E5]/20 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#4F46E5]">Current Period</span>
                  <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#4F46E5]" />
                  </div>
                </div>
                <div className="text-3xl text-[#111827] mb-1">
                  {currentPeriod ? formatCurrency(currentPeriod.netPay) : "$0"}
                </div>
                <p className="text-xs text-[#4F46E5]">
                  {currentPeriod ? `${currentPeriod.employeeCount} employees` : "No active period"}
                </p>
              </div>

              {/* This Month */}
              <div className="bg-white rounded-xl border border-green-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#22C55E]">This Month</span>
                  <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[#22C55E]" />
                  </div>
                </div>
                <div className="text-3xl text-[#22C55E] mb-1">
                  {formatCurrency(totalPayrollThisMonth)}
                </div>
                <p className="text-xs text-[#22C55E]">Total payroll</p>
              </div>

              {/* Average Payroll */}
              <div className="bg-white rounded-xl border border-purple-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#4F46E5]">Avg. Payroll</span>
                  <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#4F46E5]" />
                  </div>
                </div>
                <div className="text-3xl text-purple-900 mb-1">
                  {formatCurrency(avgPayroll)}
                </div>
                <p className="text-xs text-[#4F46E5]">Per period</p>
              </div>
            </div>

            {/* Current Period Alert */}
            {currentPeriod && (
              <div className="bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-[#06B6D4] mb-1">
                      <span className="font-medium">{currentPeriod.name}</span> is currently being processed
                    </p>
                    <p className="text-xs text-blue-700">
                      Pay date: {formatDate(currentPeriod.payDate)} • {currentPeriod.employeeCount} employees • Total: {formatCurrency(currentPeriod.netPay)}
                    </p>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-[#6B7280] mr-2">Filter by status:</span>
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    filterStatus === "all"
                      ? "bg-indigo-600 text-white"
                      : "bg-[#F9FAFB] text-[#111827] hover:bg-gray-200"
                  }`}
                >
                  All ({statusCounts.all})
                </button>
                <button
                  onClick={() => setFilterStatus("processing")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    filterStatus === "processing"
                      ? "bg-blue-600 text-white"
                      : "bg-[#F9FAFB] text-[#111827] hover:bg-gray-200"
                  }`}
                >
                  Processing ({statusCounts.processing})
                </button>
                <button
                  onClick={() => setFilterStatus("approved")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    filterStatus === "approved"
                      ? "bg-purple-600 text-white"
                      : "bg-[#F9FAFB] text-[#111827] hover:bg-gray-200"
                  }`}
                >
                  Approved ({statusCounts.approved})
                </button>
                <button
                  onClick={() => setFilterStatus("paid")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    filterStatus === "paid"
                      ? "bg-green-600 text-white"
                      : "bg-[#F9FAFB] text-[#111827] hover:bg-gray-200"
                  }`}
                >
                  Paid ({statusCounts.paid})
                </button>
              </div>
            </div>

            {/* Payroll Periods */}
            <div className="bg-white rounded-xl border border-[#E5E7EB]">
              <div className="px-6 py-4 border-b border-[#E5E7EB]">
                <h2 className="text-sm text-[#111827]">Payroll Periods</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredPeriods.length === 0 ? (
                  <div className="p-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-[#6B7280]">No payroll periods found</p>
                  </div>
                ) : (
                  filteredPeriods.map((period) => (
                    <div
                      key={period.id}
                      className="p-6 hover:bg-[#F9FAFB] transition cursor-pointer"
                      onClick={() => navigate(`/payroll/${period.id}/review`)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Left: Period Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base text-[#111827]">{period.name}</h3>
                            {getStatusBadge(period.status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-[#6B7280]" />
                              {formatDate(period.startDate)} - {formatDate(period.endDate)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="w-4 h-4 text-[#6B7280]" />
                              Pay date: {formatDate(period.payDate)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-[#6B7280]" />
                              {period.employeeCount} employees
                            </div>
                          </div>
                        </div>

                        {/* Right: Financial Summary */}
                        <div className="flex flex-wrap lg:flex-nowrap items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs text-[#6B7280] mb-1">Gross Pay</p>
                            <p className="text-base text-[#111827]">{formatCurrency(period.totalAmount)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[#6B7280] mb-1">Deductions</p>
                            <p className="text-base text-[#EF4444]">-{formatCurrency(period.deductions)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[#6B7280] mb-1">Net Pay</p>
                            <p className="text-lg text-[#22C55E]">{formatCurrency(period.netPay)}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("View period:", period.id);
                              }}
                              className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Download report:", period.id);
                              }}
                              className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
                              title="Download Report"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {period.status === "approved" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("Process payment:", period.id);
                                }}
                                className="p-2 text-[#22C55E] hover:bg-[#DCFCE7] rounded-lg transition"
                                title="Process Payment"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button className="bg-white rounded-xl border border-[#E5E7EB] p-6 hover:border-[#4F46E5]/20 hover:shadow-md transition text-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-[#4F46E5]" />
                  </div>
                  <div>
                    <h3 className="text-sm text-[#111827] mb-1">Generate Payslips</h3>
                    <p className="text-xs text-[#6B7280]">Create payslips for current period</p>
                  </div>
                </div>
              </button>

              <button className="bg-white rounded-xl border border-[#E5E7EB] p-6 hover:border-[#4F46E5]/20 hover:shadow-md transition text-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-[#4F46E5]" />
                  </div>
                  <div>
                    <h3 className="text-sm text-[#111827] mb-1">View Analytics</h3>
                    <p className="text-xs text-[#6B7280]">Payroll trends and insights</p>
                  </div>
                </div>
              </button>

              <button className="bg-white rounded-xl border border-[#E5E7EB] p-6 hover:border-[#4F46E5]/20 hover:shadow-md transition text-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#DCFCE7] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Download className="w-6 h-6 text-[#22C55E]" />
                  </div>
                  <div>
                    <h3 className="text-sm text-[#111827] mb-1">Tax Reports</h3>
                    <p className="text-xs text-[#6B7280]">Download tax documentation</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          </AsyncState>
        </main>
      </div>
    </AppLayout>
  );
}