import { useState } from "react";
import { useNavigate } from "react-router";
import { Calendar, TrendingUp, AlertCircle, History, Plus, Download } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

interface LeaveHistory {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "pending" | "approved" | "rejected";
  appliedDate: string;
}

interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
  color: string;
}

export function LeaveBalance() {
  const navigate = useNavigate();

  // Overall leave summary
  const totalLeave = 30;
  const usedLeave = 12;
  const remainingLeave = 18;

  // Leave balances by type
  const leaveBalances: LeaveBalance[] = [
    {
      type: "Annual Leave",
      total: 20,
      used: 8,
      remaining: 12,
      color: "from-[#06B6D4] to-[#06B6D4]",
    },
    {
      type: "Sick Leave",
      total: 10,
      used: 3,
      remaining: 7,
      color: "from-[#EF4444] to-[#EF4444]",
    },
    {
      type: "Personal Leave",
      total: 5,
      used: 1,
      remaining: 4,
      color: "from-[#4F46E5] to-[#4338CA]",
    },
    {
      type: "Maternity/Paternity",
      total: 90,
      used: 0,
      remaining: 90,
      color: "from-[#F59E0B] to-[#F59E0B]",
    },
  ];

  // Recent leave history
  const leaveHistory: LeaveHistory[] = [
    {
      id: 1,
      type: "Annual Leave",
      startDate: "2026-04-15",
      endDate: "2026-04-19",
      days: 5,
      status: "approved",
      appliedDate: "2026-03-10",
    },
    {
      id: 2,
      type: "Sick Leave",
      startDate: "2026-03-25",
      endDate: "2026-03-26",
      days: 2,
      status: "approved",
      appliedDate: "2026-03-24",
    },
    {
      id: 3,
      type: "Personal Leave",
      startDate: "2026-04-01",
      endDate: "2026-04-03",
      days: 3,
      status: "pending",
      appliedDate: "2026-03-20",
    },
    {
      id: 4,
      type: "Annual Leave",
      startDate: "2026-03-15",
      endDate: "2026-03-16",
      days: 2,
      status: "approved",
      appliedDate: "2026-03-05",
    },
    {
      id: 5,
      type: "Sick Leave",
      startDate: "2026-02-20",
      endDate: "2026-02-20",
      days: 1,
      status: "approved",
      appliedDate: "2026-02-19",
    },
    {
      id: 6,
      type: "Annual Leave",
      startDate: "2026-02-10",
      endDate: "2026-02-11",
      days: 2,
      status: "approved",
      appliedDate: "2026-01-28",
    },
    {
      id: 7,
      type: "Annual Leave",
      startDate: "2026-01-15",
      endDate: "2026-01-17",
      days: 3,
      status: "approved",
      appliedDate: "2026-01-05",
    },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const calculatePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-[#111827]">Leave Balance</h1>
              <p className="text-sm text-[#6B7280]">Track your leave allocation and usage</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/leave/history")}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                <Calendar className="w-5 h-5" />
                <span>View All History</span>
              </button>
              <button
                onClick={() => navigate("/leave/request")}
                className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>New Request</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
          <div className="bg-white rounded-xl border border-[#E5E7EB] mb-6">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-sm text-[#111827]">Leave Balance by Type</h2>
              <p className="text-xs text-[#6B7280] mt-1">Breakdown of leave allocation</p>
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

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-[#6B7280] mb-1">Total</p>
                        <p className="text-lg text-[#111827]">{balance.total}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280] mb-1">Used</p>
                        <p className="text-lg text-[#F59E0B]">{balance.used}</p>
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

          {/* Leave History Table */}
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 className="text-sm text-[#111827]">Recent Leave History</h2>
                <p className="text-xs text-[#6B7280] mt-1">Your most recent leave requests</p>
              </div>
              <button
                onClick={() => {
                  // Export functionality
                  console.log("Exporting leave history...");
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B7280] hover:bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg transition"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
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
                      Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                      Applied On
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {leaveHistory.map((leave) => (
                    <tr key={leave.id} className="hover:bg-[#F9FAFB] transition">
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#111827]">{leave.type}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">
                        {formatDate(leave.startDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">
                        {formatDate(leave.endDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 bg-[#F9FAFB] text-[#111827] rounded-full text-sm">
                          {leave.days}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">
                        {formatDate(leave.appliedDate)}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E5E7EB]">
              <button
                onClick={() => navigate("/leave/history")}
                className="text-sm text-[#4F46E5] hover:text-indigo-700"
              >
                View all leave history →
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg p-4">
            <p className="text-sm text-[#06B6D4]">
              <strong>Note:</strong> Leave balances are updated in real-time. Unused annual leave
              days may be carried forward to the next year based on company policy (maximum 5 days).
            </p>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}