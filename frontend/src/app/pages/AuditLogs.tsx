import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Filter, Eye, Calendar, User, Activity, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

interface AuditLog {
  id: number;
  user: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  status: "success" | "failed" | "warning";
  ipAddress: string;
}

export function AuditLogs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock audit logs data
  const [logs] = useState<AuditLog[]>([
    {
      id: 1,
      user: "John Admin",
      action: "Updated employee record",
      module: "Employee Management",
      details: "Modified salary for EMP-001",
      timestamp: "2026-05-01 14:32:15",
      status: "success",
      ipAddress: "192.168.1.100",
    },
    {
      id: 2,
      user: "Sarah HR",
      action: "Approved leave request",
      module: "Leave Management",
      details: "Approved 5 days leave for John Doe",
      timestamp: "2026-05-01 13:45:22",
      status: "success",
      ipAddress: "192.168.1.105",
    },
    {
      id: 3,
      user: "Mike Manager",
      action: "Generated payroll",
      module: "Payroll",
      details: "Generated payroll for March 2026",
      timestamp: "2026-05-01 12:15:08",
      status: "success",
      ipAddress: "192.168.1.110",
    },
    {
      id: 4,
      user: "John Admin",
      action: "Failed login attempt",
      module: "Authentication",
      details: "Incorrect password",
      timestamp: "2026-05-01 11:20:45",
      status: "failed",
      ipAddress: "192.168.1.100",
    },
    {
      id: 5,
      user: "Sarah HR",
      action: "Created new employee",
      module: "Employee Management",
      details: "Added employee EMP-125",
      timestamp: "2026-05-01 10:30:12",
      status: "success",
      ipAddress: "192.168.1.105",
    },
    {
      id: 6,
      user: "System",
      action: "Backup completed",
      module: "System",
      details: "Daily backup successful",
      timestamp: "2026-05-01 02:00:00",
      status: "success",
      ipAddress: "127.0.0.1",
    },
    {
      id: 7,
      user: "Mike Manager",
      action: "Updated performance review",
      module: "Performance",
      details: "Completed Q1 2026 review for EMP-045",
      timestamp: "2026-04-30 16:45:30",
      status: "success",
      ipAddress: "192.168.1.110",
    },
    {
      id: 8,
      user: "System",
      action: "Email notification failed",
      module: "Notifications",
      details: "SMTP connection timeout",
      timestamp: "2026-04-30 15:20:18",
      status: "failed",
      ipAddress: "127.0.0.1",
    },
    {
      id: 9,
      user: "Sarah HR",
      action: "Rejected leave request",
      module: "Leave Management",
      details: "Insufficient leave balance for EMP-089",
      timestamp: "2026-04-30 14:10:05",
      status: "warning",
      ipAddress: "192.168.1.105",
    },
    {
      id: 10,
      user: "John Admin",
      action: "Modified system settings",
      module: "System",
      details: "Changed session timeout to 30 minutes",
      timestamp: "2026-04-30 11:55:42",
      status: "success",
      ipAddress: "192.168.1.100",
    },
    {
      id: 11,
      user: "Mike Manager",
      action: "Approved payroll",
      module: "Payroll",
      details: "Approved March 2026 payroll batch",
      timestamp: "2026-04-30 10:20:33",
      status: "success",
      ipAddress: "192.168.1.110",
    },
    {
      id: 12,
      user: "Sarah HR",
      action: "Imported employee data",
      module: "Employee Management",
      details: "Bulk import of 25 employees",
      timestamp: "2026-04-29 16:30:20",
      status: "success",
      ipAddress: "192.168.1.105",
    },
  ]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModule = filterModule === "all" || log.module === filterModule;
    const matchesStatus = filterStatus === "all" || log.status === filterStatus;
    const matchesUser = filterUser === "all" || log.user === filterUser;

    return matchesSearch && matchesModule && matchesStatus && matchesUser;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique modules and users for filters
  const modules = Array.from(new Set(logs.map((log) => log.module)));
  const users = Array.from(new Set(logs.map((log) => log.user)));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "warning":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <AppLayout title="Audit Logs" subtitle="Track all system activities and changes">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="hover:text-[#4F46E5] transition"
              >
                Dashboard
              </button>
              <span>/</span>
              <span className="text-[#111827]">Audit Logs</span>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Module Filter */}
                  <div>
                    <label className="block text-sm text-[#6B7280] mb-2">Module</label>
                    <select
                      value={filterModule}
                      onChange={(e) => setFilterModule(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    >
                      <option value="all">All Modules</option>
                      {modules.map((module) => (
                        <option key={module} value={module}>
                          {module}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* User Filter */}
                  <div>
                    <label className="block text-sm text-[#6B7280] mb-2">User</label>
                    <select
                      value={filterUser}
                      onChange={(e) => setFilterUser(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    >
                      <option value="all">All Users</option>
                      {users.map((user) => (
                        <option key={user} value={user}>
                          {user}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm text-[#6B7280] mb-2">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    >
                      <option value="all">All Status</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                      <option value="warning">Warning</option>
                    </select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm text-[#6B7280] mb-2">Date Range</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#6B7280]" />
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="flex-1 px-3 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs text-[#6B7280]">User</th>
                    <th className="px-6 py-4 text-left text-xs text-[#6B7280]">Action</th>
                    <th className="px-6 py-4 text-left text-xs text-[#6B7280]">Module</th>
                    <th className="px-6 py-4 text-left text-xs text-[#6B7280]">Date & Time</th>
                    <th className="px-6 py-4 text-left text-xs text-[#6B7280]">Status</th>
                    <th className="px-6 py-4 text-left text-xs text-[#6B7280]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F9FAFB] transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-xs">
                            {log.user[0]}
                          </div>
                          <div>
                            <p className="text-sm text-[#111827]">{log.user}</p>
                            <p className="text-xs text-[#6B7280]">{log.ipAddress}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#111827]">{log.action}</p>
                        <p className="text-xs text-[#6B7280]">{log.details}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#EEF2FF] text-[#4F46E5] rounded-lg text-xs">
                          {log.module}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#111827]">{log.timestamp}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            log.status === "success"
                              ? "success"
                              : log.status === "failed"
                              ? "danger"
                              : "warning"
                          }
                          size="sm"
                        >
                          <span className="flex items-center gap-1">
                            {getStatusIcon(log.status)}
                            {log.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition">
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
              <p className="text-sm text-[#6B7280]">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of{" "}
                {filteredLogs.length} entries
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentPage === page
                        ? "bg-[#4F46E5] text-white"
                        : "border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
