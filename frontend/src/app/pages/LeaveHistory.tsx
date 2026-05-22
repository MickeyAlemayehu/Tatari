import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Calendar, Filter, Download, Eye, Search } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { leaveService } from "../../services/leave.service";
import { mapHistoryItem, type LeaveHistoryItem } from "../../lib/leave-mappers";
import { ApiError } from "../../lib/api";
import { AsyncState } from "../components/AsyncState";

export function LeaveHistory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<LeaveHistoryItem | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    leaveService
      .list({ per_page: 200 })
      .then((res) => setLeaveRequests(res.data.map(mapHistoryItem)))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load leave history.")
      )
      .finally(() => setLoading(false));
  }, []);

  // Filter logic
  const filteredRequests = leaveRequests.filter((request) => {
    const matchesSearch =
      request.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Statistics
  const totalRequests = leaveRequests.length;
  const pendingCount = leaveRequests.filter((r) => r.status === "pending").length;
  const approvedCount = leaveRequests.filter((r) => r.status === "approved").length;
  const rejectedCount = leaveRequests.filter((r) => r.status === "rejected").length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-[#111827]">Leave History</h1>
              <p className="text-sm text-[#6B7280]">View and manage all leave requests</p>
            </div>
            <button
              onClick={() => navigate("/employee/leave?tab=requests")}
              className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
            >
              <Download className="w-5 h-5" />
              <span>New Request</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <AsyncState loading={loading} error={error} empty={!loading && leaveRequests.length === 0} emptyMessage="No leave requests found.">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

          {/* Filters and Search */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] mb-6">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2 text-[#111827]">
                <Filter className="w-5 h-5" />
                <h3 className="text-sm">Filters</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
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
                      placeholder="Search by employee or type..."
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Status Filter */}
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

                {/* Type Filter */}
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
                    <option value="Maternity Leave">Maternity Leave</option>
                    <option value="Paternity Leave">Paternity Leave</option>
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
                      Employee
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
                      Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                      Applied On
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs text-[#6B7280] uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-[#6B7280]">
                          <Calendar className="w-12 h-12 mb-3" />
                          <p className="text-sm text-[#6B7280]">No leave requests found</p>
                          <p className="text-xs text-[#6B7280]">Try adjusting your filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-[#F9FAFB] transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                              {request.employee
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <p className="text-sm text-[#111827]">{request.employee}</p>
                            </div>
                          </div>
                        </td>
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
                        <td className="px-6 py-4 text-sm text-[#6B7280]">
                          {formatDate(request.appliedDate)}
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
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="p-2 text-[#6B7280] hover:bg-[#EEF2FF] hover:text-[#4F46E5] rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E5E7EB]">
              <p className="text-sm text-[#6B7280]">
                Showing <span className="text-[#111827]">{filteredRequests.length}</span> of{" "}
                <span className="text-[#111827]">{totalRequests}</span> requests
              </p>
            </div>
          </div>
          </AsyncState>
        </main>
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-lg text-[#111827]">Leave Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 text-[#6B7280] hover:text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              <div>
                <p className="text-sm text-[#6B7280] mb-1">Employee</p>
                <p className="text-sm text-[#111827]">{selectedRequest.employee}</p>
              </div>

              <div>
                <p className="text-sm text-[#6B7280] mb-1">Leave Type</p>
                <p className="text-sm text-[#111827]">{selectedRequest.type}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#6B7280] mb-1">Start Date</p>
                  <p className="text-sm text-[#111827]">{formatDate(selectedRequest.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6B7280] mb-1">End Date</p>
                  <p className="text-sm text-[#111827]">{formatDate(selectedRequest.endDate)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-[#6B7280] mb-1">Duration</p>
                <p className="text-sm text-[#111827]">
                  {selectedRequest.days} {selectedRequest.days === 1 ? "day" : "days"}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#6B7280] mb-1">Reason</p>
                <p className="text-sm text-[#111827]">{selectedRequest.reason}</p>
              </div>

              <div>
                <p className="text-sm text-[#6B7280] mb-1">Applied On</p>
                <p className="text-sm text-[#111827]">{formatDate(selectedRequest.appliedDate)}</p>
              </div>

              <div>
                <p className="text-sm text-[#6B7280] mb-1">Status</p>
                <Badge
                  variant={
                    selectedRequest.status === "approved"
                      ? "success"
                      : selectedRequest.status === "rejected"
                      ? "danger"
                      : "warning"
                  }
                  size="sm"
                >
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-6 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
