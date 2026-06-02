import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Calendar,
  TrendingUp,
  AlertCircle,
  Plus,
  Send,
  CheckCircle,
  X,
  Clock,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { leaveService, type LeaveBalanceRecord, type LeaveRequestRecord } from "../../services/leave.service";
import { balanceColor } from "../../lib/utils";
import { ApiError } from "../../lib/api";
import { useActionSound } from "../hooks/useActionSound";

type TabType = "requests" | "new-request" | "balance";

interface LeaveRequest {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  appliedDate: string;
}

function mapRequest(r: LeaveRequestRecord): LeaveRequest {
  return {
    id: r.id,
    type: r.type ?? r.leaveType ?? "Leave",
    startDate: r.startDate,
    endDate: r.endDate,
    days: r.days,
    reason: r.reason ?? "",
    status: r.status as LeaveRequest["status"],
    appliedDate: r.appliedDate ?? "",
  };
}

interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  pending: number;
  remaining: number;
  color: string;
}

export function EmployeeLeaveManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || "requests");

  // Update active tab when URL changes
  useEffect(() => {
    const tab = searchParams.get("tab") as TabType | null;
    if (tab && ["requests", "new-request", "balance"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [myLeaveRequests, setMyLeaveRequests] = useState<LeaveRequest[]>([]);

  const loadData = async () => {
    try {
      const [reqRes, balRes] = await Promise.all([
        leaveService.myRequests({ per_page: 50 }),
        leaveService.myBalances(),
      ]);
      setMyLeaveRequests(reqRes.data.map(mapRequest));
      setLeaveBalances(
        balRes.data.map((b: LeaveBalanceRecord, i: number) => ({
          type: b.type ?? "Leave",
          total: b.total,
          used: b.used,
          pending: b.pending,
          remaining: b.remaining,
          color: balanceColor(i),
        }))
      );
    } catch {
      /* keep empty */
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const totalLeave = leaveBalances.reduce((s, b) => s + b.total, 0);
  const usedLeave = leaveBalances.reduce((s, b) => s + b.used, 0);
  const pendingLeave = leaveBalances.reduce((s, b) => s + b.pending, 0);
  const remainingLeave = leaveBalances.reduce((s, b) => s + b.remaining, 0);

  const calculatePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const tabs = [
    { id: "requests" as TabType, label: "My Leave Requests", icon: Calendar },
    { id: "new-request" as TabType, label: "Request Leave", icon: Plus },
    { id: "balance" as TabType, label: "Leave Balance", icon: TrendingUp },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-[#111827]">My Leave Management</h1>
              <p className="text-sm text-[#6B7280]">
                Manage your leave requests and view your balance
              </p>
            </div>
            <button
              onClick={() => handleTabChange("new-request")}
              className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Request Leave</span>
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-[#E5E7EB] px-6 flex-shrink-0">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                    activeTab === tab.id
                      ? "border-[#4F46E5] text-[#4F46E5]"
                      : "border-transparent text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
          {activeTab === "requests" && (
            <MyLeaveRequestsTab
              requests={myLeaveRequests}
              formatDate={formatDate}
            />
          )}
          {activeTab === "new-request" && (
            <RequestLeaveTab
              onSuccess={(newRequest) => {
                setMyLeaveRequests((prev) => [newRequest, ...prev]);
                void loadData();
                handleTabChange("requests");
              }}
            />
          )}
          {activeTab === "balance" && (
            <LeaveBalanceTab
              totalLeave={totalLeave}
              usedLeave={usedLeave}
              pendingLeave={pendingLeave}
              remainingLeave={remainingLeave}
              leaveBalances={leaveBalances}
              calculatePercentage={calculatePercentage}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

// My Leave Requests Tab
function MyLeaveRequestsTab({
  requests,
  formatDate,
}: {
  requests: LeaveRequest[];
  formatDate: (dateStr: string) => string;
}) {
  const totalRequests = requests.length;
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  return (
    <div className="p-6 space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
          <p className="text-sm text-[#6B7280] mb-1">Total Requests</p>
          <p className="text-2xl text-[#111827]">{totalRequests}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
          <p className="text-sm text-[#6B7280] mb-1">Pending</p>
          <p className="text-2xl text-[#F59E0B]">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
          <p className="text-sm text-[#6B7280] mb-1">Approved</p>
          <p className="text-2xl text-[#22C55E]">{approvedCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
          <p className="text-sm text-[#6B7280] mb-1">Rejected</p>
          <p className="text-2xl text-[#EF4444]">{rejectedCount}</p>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB]">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm text-[#111827]">My Leave History</h2>
          <p className="text-xs text-[#6B7280] mt-1">All your leave requests</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                  Days Applied
                </th>
                <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-[#6B7280]">
                      <Calendar className="w-12 h-12 mb-3" />
                      <p className="text-sm text-[#6B7280]">No leave requests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-[#F9FAFB] transition">
                    <td className="px-6 py-4 text-sm text-[#111827]">
                      {request.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">
                      {formatDate(request.startDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">
                      {formatDate(request.endDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 bg-[#F9FAFB] text-[#111827] rounded-full text-sm">
                        {request.days}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          request.status === "approved"
                            ? "success"
                            : request.status === "rejected"
                            ? "danger"
                            : "warning"
                        }
                        size="sm"
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-[#E5E7EB]">
          <p className="text-sm text-[#6B7280]">
            Showing {requests.length} request{requests.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

// Request Leave Tab
function RequestLeaveTab({
  onSuccess,
}: {
  onSuccess: (request: LeaveRequest) => void;
}) {
  const { playSendSound } = useActionSound();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [leaveTypes, setLeaveTypes] = useState<{ id: number; name: string; maxDaysPerYear: number }[]>([]);

  useEffect(() => {
    leaveService.types().then((res) => setLeaveTypes(res.data.map((t) => ({ id: t.id, name: t.name, maxDaysPerYear: t.maxDaysPerYear }))));
  }, []);

  // Check if selected leave type requires full allocation (e.g. Maternity/Paternity)
  const selectedTypeRecord = leaveTypes.find((t) => t.name === leaveType);
  const isFixedDuration =
    !!selectedTypeRecord &&
    (selectedTypeRecord.name.toLowerCase().includes("maternity") ||
      selectedTypeRecord.name.toLowerCase().includes("paternity"));
  const fixedDays = isFixedDuration ? selectedTypeRecord.maxDaysPerYear : 0;

  // Auto-set end date when start date changes for fixed-duration leave
  useEffect(() => {
    if (isFixedDuration && startDate && fixedDays > 0) {
      const start = new Date(startDate);
      start.setDate(start.getDate() + fixedDays - 1);
      setEndDate(start.toISOString().split("T")[0] || "");
    }
  }, [isFixedDuration, startDate, fixedDays]);

  const validateForm = () => {
    const newErrors = {
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
    };
    let isValid = true;

    if (!leaveType) {
      newErrors.leaveType = "Please select a leave type";
      isValid = false;
    }
    if (!startDate) {
      newErrors.startDate = "Start date is required";
      isValid = false;
    }
    if (!endDate) {
      newErrors.endDate = "End date is required";
      isValid = false;
    } else if (startDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = "End date must be after start date";
      isValid = false;
    }
    if (!reason.trim()) {
      newErrors.reason = "Reason is required";
      isValid = false;
    } else if (reason.trim().length < 10) {
      newErrors.reason = "Reason must be at least 10 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const calculateDays = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const created = await leaveService.create({
        type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason,
      });
      const newRequest = mapRequest(created);
      playSendSound();
      setShowSuccess(true);
      setTimeout(() => onSuccess(newRequest), 1500);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to submit leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: "" });
    }
    switch (field) {
      case "leaveType":
        setLeaveType(value);
        // Reset dates when switching leave type
        setStartDate("");
        setEndDate("");
        break;
      case "startDate":
        setStartDate(value);
        break;
      case "endDate":
        if (!isFixedDuration) setEndDate(value);
        break;
      case "reason":
        setReason(value);
        break;
    }
  };

  const days = calculateDays();

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {showSuccess && (
          <div className="mb-6 p-4 bg-[#DCFCE7] border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm text-[#22C55E] mb-1">Success!</h3>
              <p className="text-sm text-[#22C55E]">
                Your leave request has been submitted successfully. Redirecting...
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h2 className="text-sm text-[#111827] mb-6">Request Leave</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Leave Type */}
            <div>
              <label htmlFor="leaveType" className="block text-sm text-[#111827] mb-2">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                id="leaveType"
                value={leaveType}
                onChange={(e) => handleFieldChange("leaveType", e.target.value)}
                className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.leaveType
                    ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                    : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                }`}
              >
                <option value="">Select leave type</option>
                <option value="">Select leave type</option>
                {leaveTypes.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.leaveType && (
                <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{errors.leaveType}</p>
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm text-[#111827] mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="startDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={(e) => handleFieldChange("startDate", e.target.value)}
                  className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.startDate
                      ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                      : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                  }`}
                />
                {errors.startDate && (
                  <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{errors.startDate}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm text-[#111827] mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="endDate"
                  type="date"
                  min={startDate || new Date().toISOString().split('T')[0]}
                  value={endDate}
                  onChange={(e) => handleFieldChange("endDate", e.target.value)}
                  disabled={isFixedDuration}
                  className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.endDate
                      ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                      : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                  } ${isFixedDuration ? "opacity-60 cursor-not-allowed" : ""}`}
                />
                {errors.endDate && (
                  <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{errors.endDate}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Duration Display */}
            {days > 0 && (
              <div className="p-4 bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#4F46E5]" />
                </div>
                <div>
                  <p className="text-sm text-[#111827]">
                    <strong>Duration:</strong> {days} {days === 1 ? "day" : "days"}
                  </p>
                </div>
              </div>
            )}

            {/* Fixed-duration leave notice */}
            {isFixedDuration && (
              <div className="p-4 bg-[#FEF3C7] border border-[#F59E0B]/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#92400E]">
                  <strong>Maternity/Paternity leave</strong> must be taken for the full {fixedDays} days.
                  The end date is automatically calculated based on your start date.
                </p>
              </div>
            )}

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm text-[#111827] mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => handleFieldChange("reason", e.target.value)}
                placeholder="Please provide a brief reason for your leave request"
                rows={4}
                className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                  errors.reason
                    ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                    : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                }`}
              />
              {errors.reason && (
                <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{errors.reason}</p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => {
                  setLeaveType("");
                  setStartDate("");
                  setEndDate("");
                  setReason("");
                  setErrors({ leaveType: "", startDate: "", endDate: "", reason: "" });
                }}
                className="px-6 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
                disabled={isSubmitting}
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                <span>{isSubmitting ? "Submitting..." : "Submit Request"}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 p-4 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg">
          <p className="text-sm text-[#06B6D4]">
            <strong>Note:</strong> Your leave request will be sent to your manager for
            approval. You will receive a notification once your request has been reviewed.
          </p>
        </div>
      </div>
    </div>
  );
}

// Leave Balance Tab
function LeaveBalanceTab({
  totalLeave,
  usedLeave,
  pendingLeave,
  remainingLeave,
  leaveBalances,
  calculatePercentage,
}: {
  totalLeave: number;
  usedLeave: number;
  pendingLeave: number;
  remainingLeave: number;
  leaveBalances: LeaveBalance[];
  calculatePercentage: (used: number, total: number) => number;
}) {
  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Leave */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-[#6B7280]">Annual Quota</span>
          </div>
          <p className="text-sm text-[#6B7280] mb-1">Total Leave</p>
          <p className="text-3xl text-[#111827] mb-2">{totalLeave}</p>
          <p className="text-xs text-[#6B7280]">days per year</p>
        </div>

        {/* Used Leave */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F59E0B] to-[#F59E0B] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-[#6B7280]">
              {calculatePercentage(usedLeave, totalLeave)}% Used
            </span>
          </div>
          <p className="text-sm text-[#6B7280] mb-1">Used Leave</p>
          <p className="text-3xl text-[#111827] mb-2">{usedLeave}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#F59E0B] to-[#F59E0B] h-2 rounded-full transition-all"
              style={{ width: `${calculatePercentage(usedLeave, totalLeave)}%` }}
            />
          </div>
        </div>

        {/* Pending Leave */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-[#6B7280]">
              {calculatePercentage(pendingLeave, totalLeave)}% Pending
            </span>
          </div>
          <p className="text-sm text-[#6B7280] mb-1">Pending Leave</p>
          <p className="text-3xl text-[#111827] mb-2">{pendingLeave}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] h-2 rounded-full transition-all"
              style={{ width: `${calculatePercentage(pendingLeave, totalLeave)}%` }}
            />
          </div>
        </div>

        {/* Remaining Leave */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#22C55E] to-[#22C55E] rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-[#6B7280]">
              {calculatePercentage(remainingLeave, totalLeave)}% Left
            </span>
          </div>
          <p className="text-sm text-[#6B7280] mb-1">Remaining Leave</p>
          <p className="text-3xl text-[#111827] mb-2">{remainingLeave}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#22C55E] to-[#22C55E] h-2 rounded-full transition-all"
              style={{ width: `${calculatePercentage(remainingLeave, totalLeave)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Leave Balance by Type */}
      <div className="bg-white rounded-xl border border-[#E5E7EB]">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm text-[#111827]">Leave Balance by Type</h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Breakdown of your leave allocation
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaveBalances.map((balance, index) => (
              <div
                key={index}
                className="border border-[#E5E7EB] rounded-lg p-4 hover:border-[#E5E7EB] transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm text-[#111827]">{balance.type}</h3>
                  <span className="text-xs text-[#6B7280]">
                    {calculatePercentage(balance.used, balance.total)}% used
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Total</p>
                    <p className="text-lg text-[#111827]">{balance.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Used</p>
                    <p className="text-lg text-[#F59E0B]">{balance.used}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Pending</p>
                    <p className="text-lg text-[#3B82F6]">{balance.pending}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Left</p>
                    <p className="text-lg text-[#22C55E]">{balance.remaining}</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${balance.color} h-2 rounded-full transition-all`}
                    style={{
                      width: `${calculatePercentage(balance.used, balance.total)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg p-4">
        <p className="text-sm text-[#06B6D4]">
          <strong>Note:</strong> Leave balances are updated in real-time. Unused annual
          leave days may be carried forward to the next year based on company policy
          (maximum 5 days).
        </p>
      </div>
    </div>
  );
}
