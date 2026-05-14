import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Calendar,
  TrendingUp,
  AlertCircle,
  History,
  Plus,
  Eye,
  Search,
  Filter,
  Send,
  CheckCircle,
  Check,
  X,
  CalendarRange,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

type TabType = "overview" | "request" | "history" | "approvals" | "calendar";

interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
  color: string;
}

interface LeaveHistoryItem {
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

interface PendingLeaveRequest {
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
  status: "pending" | "approved" | "rejected";
}

export function LeaveManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || "overview");

  // Update active tab when URL changes
  useEffect(() => {
    const tab = searchParams.get("tab") as TabType | null;
    if (tab && ["overview", "request", "history", "approvals", "calendar"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Overview data - Company-wide statistics
  const totalEmployees = 248;
  const totalLeaveRequests = 127;
  const pendingLeaveRequests = 15;
  const approvedLeaveRequests = 98;
  const rejectedLeaveRequests = 14;

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
    { id: "overview" as TabType, label: "Overview", icon: TrendingUp },
    { id: "request" as TabType, label: "Request Leave", icon: Plus },
    { id: "history" as TabType, label: "Leave History", icon: History },
    { id: "approvals" as TabType, label: "Approvals", icon: CheckCircle },
    { id: "calendar" as TabType, label: "Calendar", icon: CalendarRange },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-[#111827]">Leave Management</h1>
              <p className="text-sm text-[#6B7280]">
                Manage leave requests, balances, and approvals
              </p>
            </div>
            <button
              onClick={() => handleTabChange("request")}
              className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>New Request</span>
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
          {activeTab === "overview" && <OverviewTab
            totalEmployees={totalEmployees}
            totalLeaveRequests={totalLeaveRequests}
            pendingLeaveRequests={pendingLeaveRequests}
            approvedLeaveRequests={approvedLeaveRequests}
            rejectedLeaveRequests={rejectedLeaveRequests}
            formatDate={formatDate}
          />}
          {activeTab === "request" && <RequestLeaveTab />}
          {activeTab === "history" && <LeaveHistoryTab formatDate={formatDate} />}
          {activeTab === "approvals" && <ApprovalsTab formatDate={formatDate} />}
          {activeTab === "calendar" && <CalendarTab formatDate={formatDate} />}
        </div>
      </div>
    </AppLayout>
  );
}

// Overview Tab Component
function OverviewTab({
  totalEmployees,
  totalLeaveRequests,
  pendingLeaveRequests,
  approvedLeaveRequests,
  rejectedLeaveRequests,
  formatDate,
}: {
  totalEmployees: number;
  totalLeaveRequests: number;
  pendingLeaveRequests: number;
  approvedLeaveRequests: number;
  rejectedLeaveRequests: number;
  formatDate: (dateStr: string) => string;
}) {
  const navigate = useNavigate();

  const recentLeaveRequests: LeaveHistoryItem[] = [
    {
      id: 1,
      employee: "John Doe",
      type: "Annual Leave",
      startDate: "2026-05-15",
      endDate: "2026-05-19",
      days: 5,
      status: "pending",
      appliedDate: "2026-04-20",
      reason: "Family vacation",
    },
    {
      id: 2,
      employee: "Jane Smith",
      type: "Sick Leave",
      startDate: "2026-05-10",
      endDate: "2026-05-12",
      days: 3,
      status: "pending",
      appliedDate: "2026-05-08",
      reason: "Medical appointment",
    },
    {
      id: 3,
      employee: "Robert Brown",
      type: "Annual Leave",
      startDate: "2026-05-20",
      endDate: "2026-05-24",
      days: 5,
      status: "pending",
      appliedDate: "2026-04-25",
      reason: "Personal travel",
    },
    {
      id: 4,
      employee: "Sarah Johnson",
      type: "Annual Leave",
      startDate: "2026-04-15",
      endDate: "2026-04-19",
      days: 5,
      status: "approved",
      appliedDate: "2026-03-10",
      reason: "Family vacation",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Requests */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-[#6B7280] mb-1">Total Leave Requests</p>
          <p className="text-3xl text-[#111827]">{totalLeaveRequests}</p>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F59E0B] to-[#F59E0B] rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-[#6B7280] mb-1">Pending Requests</p>
          <p className="text-3xl text-[#F59E0B]">{pendingLeaveRequests}</p>
        </div>

        {/* Approved Requests */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#22C55E] to-[#22C55E] rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-[#6B7280] mb-1">Approved Requests</p>
          <p className="text-3xl text-[#22C55E]">{approvedLeaveRequests}</p>
        </div>

        {/* Rejected Requests */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#EF4444] to-[#EF4444] rounded-lg flex items-center justify-center">
              <X className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-[#6B7280] mb-1">Rejected Requests</p>
          <p className="text-3xl text-[#EF4444]">{rejectedLeaveRequests}</p>
        </div>
      </div>

      {/* Recent Leave Requests */}
      <div className="bg-white rounded-xl border border-[#E5E7EB]">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm text-[#111827]">Recent Leave Requests</h2>
          <p className="text-xs text-[#6B7280] mt-1">Latest leave requests from employees</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentLeaveRequests.map((leave) => (
                <tr key={leave.id} className="hover:bg-[#F9FAFB] transition">
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#111827]">{leave.employee}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{leave.type}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">
                    {formatDate(leave.startDate)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 bg-[#F9FAFB] text-[#111827] rounded-full text-sm">
                      {leave.days}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        leave.status === "approved"
                          ? "success"
                          : leave.status === "rejected"
                          ? "danger"
                          : "warning"
                      }
                      size="sm"
                    >
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/leave/${leave.id}`)}
                      className="text-sm text-[#4F46E5] hover:text-indigo-700 transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg p-4">
        <p className="text-sm text-[#06B6D4]">
          <strong>Note:</strong> This dashboard shows company-wide leave statistics. Use the tabs above to view detailed history, approve requests, or view the leave calendar.
        </p>
      </div>
    </div>
  );
}

// Request Leave Tab Component
function RequestLeaveTab() {
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
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
    }, 3000);
  };

  const handleFieldChange = (field: string, value: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: "" });
    }
    switch (field) {
      case "leaveType":
        setLeaveType(value);
        break;
      case "startDate":
        setStartDate(value);
        break;
      case "endDate":
        setEndDate(value);
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
                Your leave request has been submitted successfully.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
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
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
                <option value="unpaid">Unpaid Leave</option>
                <option value="other">Other</option>
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
                  value={endDate}
                  onChange={(e) => handleFieldChange("endDate", e.target.value)}
                  className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.endDate
                      ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                      : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                  }`}
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
            <strong>Note:</strong> Your leave request will be sent to your manager for approval.
            You will receive a notification once your request has been reviewed.
          </p>
        </div>
      </div>
    </div>
  );
}

// Leave History Tab Component
function LeaveHistoryTab({ formatDate }: { formatDate: (dateStr: string) => string }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const leaveRequests: LeaveHistoryItem[] = [
    {
      id: 1,
      employee: "John Doe",
      type: "Annual Leave",
      startDate: "2026-05-15",
      endDate: "2026-05-19",
      days: 5,
      reason: "Family vacation to Hawaii",
      status: "pending",
      appliedDate: "2026-04-20",
    },
    {
      id: 2,
      employee: "Jane Smith",
      type: "Sick Leave",
      startDate: "2026-05-10",
      endDate: "2026-05-12",
      days: 3,
      reason: "Medical appointment and recovery",
      status: "pending",
      appliedDate: "2026-05-08",
    },
    {
      id: 3,
      employee: "Robert Brown",
      type: "Annual Leave",
      startDate: "2026-05-20",
      endDate: "2026-05-24",
      days: 5,
      reason: "Personal travel",
      status: "pending",
      appliedDate: "2026-04-25",
    },
    {
      id: 4,
      employee: "Sarah Johnson",
      type: "Annual Leave",
      startDate: "2026-04-15",
      endDate: "2026-04-19",
      days: 5,
      reason: "Family vacation to the beach",
      status: "approved",
      appliedDate: "2026-03-10",
    },
    {
      id: 5,
      employee: "Michael Chen",
      type: "Sick Leave",
      startDate: "2026-03-25",
      endDate: "2026-03-26",
      days: 2,
      reason: "Medical appointment",
      status: "approved",
      appliedDate: "2026-03-24",
    },
    {
      id: 6,
      employee: "Emily Davis",
      type: "Personal Leave",
      startDate: "2026-04-01",
      endDate: "2026-04-03",
      days: 3,
      reason: "Personal matters",
      status: "approved",
      appliedDate: "2026-03-20",
    },
    {
      id: 7,
      employee: "David Martinez",
      type: "Annual Leave",
      startDate: "2026-03-15",
      endDate: "2026-03-16",
      days: 2,
      reason: "Short break",
      status: "approved",
      appliedDate: "2026-03-05",
    },
    {
      id: 8,
      employee: "Lisa Anderson",
      type: "Sick Leave",
      startDate: "2026-02-20",
      endDate: "2026-02-20",
      days: 1,
      reason: "Flu symptoms",
      status: "approved",
      appliedDate: "2026-02-19",
    },
    {
      id: 9,
      employee: "James Wilson",
      type: "Annual Leave",
      startDate: "2026-02-10",
      endDate: "2026-02-14",
      days: 5,
      reason: "Winter vacation",
      status: "rejected",
      appliedDate: "2026-01-15",
    },
    {
      id: 10,
      employee: "Emma Thompson",
      type: "Personal Leave",
      startDate: "2026-01-25",
      endDate: "2026-01-26",
      days: 2,
      reason: "Family matters",
      status: "rejected",
      appliedDate: "2026-01-10",
    },
  ];

  const filteredRequests = leaveRequests.filter((request) => {
    const matchesSearch =
      request.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRequests = leaveRequests.length;
  const pendingCount = leaveRequests.filter((r) => r.status === "pending").length;
  const approvedCount = leaveRequests.filter((r) => r.status === "approved").length;
  const rejectedCount = leaveRequests.filter((r) => r.status === "rejected").length;

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

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB]">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2 text-[#111827]">
            <Filter className="w-5 h-5" />
            <h3 className="text-sm">Filters</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm text-[#111827] mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by type..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm text-[#111827] mb-2">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm text-[#111827] mb-2">
                Leave Type
              </label>
              <select
                id="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
              >
                <option value="all">All Types</option>
                <option value="Annual Leave">Annual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Personal Leave">Personal Leave</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                  Employee Name
                </th>
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
                <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-[#6B7280]">
                      <Calendar className="w-12 h-12 mb-3" />
                      <p className="text-sm text-[#6B7280]">No leave requests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-[#F9FAFB] transition">
                    <td className="px-6 py-4 text-sm text-[#111827]">{request.employee}</td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">{request.type}</td>
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
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/leave/${request.id}`)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        {request.status === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                alert(`Approved leave request for ${request.employee}`);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#22C55E] hover:bg-[#DCFCE7] rounded-lg transition"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                alert(`Rejected leave request for ${request.employee}`);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-[#E5E7EB]">
          <p className="text-sm text-[#6B7280]">
            Showing <span className="text-[#111827]">{filteredRequests.length}</span> of{" "}
            <span className="text-[#111827]">{totalRequests}</span> requests
          </p>
        </div>
      </div>
    </div>
  );
}

// Approvals Tab Component
function ApprovalsTab({ formatDate }: { formatDate: (dateStr: string) => string }) {
  const [selectedRequest, setSelectedRequest] = useState<PendingLeaveRequest | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [actionStatus, setActionStatus] = useState<{
    show: boolean;
    type: "approve" | "reject";
    message: string;
  } | null>(null);

  const [pendingRequests, setPendingRequests] = useState<PendingLeaveRequest[]>([
    {
      id: 1,
      employee: {
        name: "Emily Davis",
        position: "Marketing Specialist",
        department: "Marketing",
        avatar: "ED",
      },
      type: "Annual Leave",
      startDate: "2026-04-01",
      endDate: "2026-04-03",
      days: 3,
      reason: "Personal matters to attend to. Planning a short trip with family.",
      appliedDate: "2026-03-20",
      status: "pending",
    },
    {
      id: 2,
      employee: {
        name: "David Martinez",
        position: "Senior Developer",
        department: "Engineering",
        avatar: "DM",
      },
      type: "Annual Leave",
      startDate: "2026-05-10",
      endDate: "2026-05-17",
      days: 8,
      reason: "International travel and vacation.",
      appliedDate: "2026-03-15",
      status: "pending",
    },
  ]);

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setPendingRequests((prev) => prev.filter((req) => req.id !== selectedRequest.id));
    setActionStatus({
      show: true,
      type: "approve",
      message: `Leave request for ${selectedRequest.employee.name} has been approved`,
    });
    setTimeout(() => {
      setSelectedRequest(null);
      setActionStatus(null);
    }, 2000);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectReason.trim()) {
      setRejectError("Please provide a reason for rejection");
      return;
    }
    if (rejectReason.trim().length < 10) {
      setRejectError("Reason must be at least 10 characters");
      return;
    }
    setPendingRequests((prev) => prev.filter((req) => req.id !== selectedRequest.id));
    setActionStatus({
      show: true,
      type: "reject",
      message: `Leave request for ${selectedRequest.employee.name} has been rejected`,
    });
    setTimeout(() => {
      setSelectedRequest(null);
      setShowRejectInput(false);
      setRejectReason("");
      setRejectError("");
      setActionStatus(null);
    }, 2000);
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Request List */}
      <div className="w-full lg:w-96 border-r border-[#E5E7EB] bg-white overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm text-[#6B7280] mb-3 px-2">PENDING REQUESTS</h2>
          {pendingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#6B7280]">
              <CheckCircle className="w-12 h-12 mb-3" />
              <p className="text-sm text-[#6B7280]">All caught up!</p>
              <p className="text-xs text-[#6B7280]">No pending requests to review</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowRejectInput(false);
                    setRejectReason("");
                    setRejectError("");
                  }}
                  className={`w-full p-4 rounded-lg border transition text-left ${
                    selectedRequest?.id === request.id
                      ? "border-[#4F46E5] bg-[#EEF2FF]"
                      : "border-[#E5E7EB] hover:border-[#E5E7EB] hover:bg-[#F9FAFB]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                      {request.employee.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#111827] mb-0.5">{request.employee.name}</p>
                      <p className="text-xs text-[#6B7280] mb-2">{request.employee.position}</p>
                      <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {request.days} {request.days === 1 ? "day" : "days"}
                        </span>
                        <span>•</span>
                        <span>{request.type}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Request Details */}
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
        {actionStatus?.show ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  actionStatus.type === "approve" ? "bg-[#DCFCE7]" : "bg-[#FEF2F2]"
                }`}
              >
                {actionStatus.type === "approve" ? (
                  <Check className="w-8 h-8 text-[#22C55E]" />
                ) : (
                  <X className="w-8 h-8 text-[#EF4444]" />
                )}
              </div>
              <h3 className="text-lg text-[#111827] mb-2">
                {actionStatus.type === "approve" ? "Approved!" : "Rejected"}
              </h3>
              <p className="text-sm text-[#6B7280]">{actionStatus.message}</p>
            </div>
          </div>
        ) : selectedRequest ? (
          <div className="p-6 space-y-6">
            {/* Employee Info */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                  {selectedRequest.employee.avatar}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg text-[#111827] mb-1">{selectedRequest.employee.name}</h2>
                  <p className="text-sm text-[#6B7280] mb-1">{selectedRequest.employee.position}</p>
                  <p className="text-sm text-[#6B7280]">{selectedRequest.employee.department}</p>
                </div>
                <Badge variant="warning" size="sm">
                  Pending Review
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5E7EB]">
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Leave Type</p>
                  <p className="text-sm text-[#111827]">{selectedRequest.type}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Applied On</p>
                  <p className="text-sm text-[#111827]">{formatDate(selectedRequest.appliedDate)}</p>
                </div>
              </div>
            </div>

            {/* Leave Details */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h3 className="text-sm text-[#111827] mb-4">Leave Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg">
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-[#4F46E5]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#4F46E5] mb-1">Duration</p>
                    <p className="text-lg text-[#111827]">
                      {selectedRequest.days} {selectedRequest.days === 1 ? "day" : "days"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-2">Start Date</p>
                    <p className="text-sm text-[#111827]">{formatDate(selectedRequest.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-2">End Date</p>
                    <p className="text-sm text-[#111827]">{formatDate(selectedRequest.endDate)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-2">Reason for Leave</p>
                  <p className="text-sm text-[#111827] leading-relaxed">{selectedRequest.reason}</p>
                </div>
              </div>
            </div>

            {/* Rejection Input */}
            {showRejectInput && (
              <div className="bg-white rounded-xl border border-[#EF4444]/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-[#EF4444]" />
                  <h3 className="text-sm text-[#111827]">Reason for Rejection</h3>
                </div>
                <div className="mb-4">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => {
                      setRejectReason(e.target.value);
                      setRejectError("");
                    }}
                    placeholder="Please provide a detailed reason for rejecting this leave request..."
                    rows={4}
                    className={`w-full px-4 py-3 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                      rejectError
                        ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                        : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                    }`}
                  />
                  {rejectError && (
                    <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{rejectError}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReject}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#EF4444] text-white px-4 py-2.5 rounded-lg hover:bg-[#EF4444] transition"
                  >
                    <X className="w-5 h-5" />
                    <span>Confirm Rejection</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectInput(false);
                      setRejectReason("");
                      setRejectError("");
                    }}
                    className="px-4 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!showRejectInput && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <h3 className="text-sm text-[#111827] mb-4">Decision</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleApprove}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#22C55E] to-[#22C55E] text-white px-4 py-3 rounded-lg hover:from-[#22C55E] hover:to-[#22C55E] transition shadow-lg hover:shadow-xl"
                  >
                    <Check className="w-5 h-5" />
                    <span>Approve Request</span>
                  </button>
                  <button
                    onClick={() => setShowRejectInput(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-red-500 text-[#EF4444] px-4 py-3 rounded-lg hover:bg-[#FEF2F2] transition"
                  >
                    <X className="w-5 h-5" />
                    <span>Reject Request</span>
                  </button>
                </div>
              </div>
            )}

            <div className="bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg p-4">
              <p className="text-sm text-[#06B6D4]">
                <strong>Note:</strong> The employee will be notified via email once you approve or
                reject their leave request.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center text-[#6B7280]">
              <Calendar className="w-16 h-16 mx-auto mb-4" />
              <p className="text-sm text-[#6B7280]">Select a request to review</p>
              <p className="text-xs text-[#6B7280]">
                Choose a pending request from the list to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Calendar Tab Component
function CalendarTab({ formatDate }: { formatDate: (dateStr: string) => string }) {
  const currentMonth = "May 2026";

  const leaveEvents = [
    { date: "2026-05-10", employee: "Jane Smith", type: "Sick Leave", days: 3, department: "Marketing" },
    { date: "2026-05-15", employee: "John Doe", type: "Annual Leave", days: 5, department: "Engineering" },
    { date: "2026-05-20", employee: "Robert Brown", type: "Annual Leave", days: 5, department: "Sales" },
    { date: "2026-05-05", employee: "Michael Chen", type: "Personal Leave", days: 2, department: "Product" },
    { date: "2026-05-25", employee: "Emily Davis", type: "Annual Leave", days: 3, department: "Design" },
    { date: "2026-05-12", employee: "David Martinez", type: "Sick Leave", days: 1, department: "Engineering" },
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg text-[#111827]">{currentMonth}</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition">
              <span>&larr;</span>
            </button>
            <button className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition">
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-6 flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#EEF2FF] border border-[#4F46E5]/30 rounded"></div>
            <span className="text-[#6B7280]">Annual Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#FEF2F2] border border-[#EF4444]/30 rounded"></div>
            <span className="text-[#6B7280]">Sick Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#FFFBEB] border border-[#F59E0B]/30 rounded"></div>
            <span className="text-[#6B7280]">Personal Leave</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs text-[#6B7280] p-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 35 }, (_, i) => {
            const dayNum = i - 2;
            const isValidDay = dayNum > 0 && dayNum <= 31;
            const hasLeave = leaveEvents.some((event) => {
              const eventDay = new Date(event.date).getDate();
              return eventDay === dayNum;
            });
            return (
              <div
                key={i}
                className={`aspect-square p-2 border rounded-lg ${
                  isValidDay
                    ? hasLeave
                      ? "border-[#4F46E5] bg-[#EEF2FF]"
                      : "border-[#E5E7EB] hover:border-[#4F46E5]/30 hover:bg-[#F9FAFB] cursor-pointer"
                    : "border-transparent"
                }`}
              >
                {isValidDay && (
                  <div className={`text-sm ${hasLeave ? "text-[#4F46E5]" : "text-[#111827]"}`}>
                    {dayNum}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Upcoming Leave */}
        <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
          <h3 className="text-sm text-[#111827] mb-4">Upcoming Employee Leaves</h3>
          <div className="space-y-3">
            {leaveEvents.map((event, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] hover:border-[#4F46E5] transition cursor-pointer"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#111827]">{event.employee}</p>
                  <p className="text-xs text-[#6B7280]">
                    {event.department} • {event.type}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#6B7280]">{formatDate(event.date)}</p>
                  <p className="text-xs text-[#6B7280]">
                    {event.days} {event.days === 1 ? "day" : "days"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Note */}
        <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">
              Sync with external calendars (Google Calendar, Outlook)
            </p>
            <button className="px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition text-sm">
              Export Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
