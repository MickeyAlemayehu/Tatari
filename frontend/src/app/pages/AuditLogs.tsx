import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, Filter, Eye, Calendar, User, Activity, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { auditService, AuditLogRecord } from "../../services/audit.service";
import { toast } from "sonner";

export function AuditLogs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [modules, setModules] = useState<string[]>([]);

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, searchQuery, filterModule, filterStatus, filterUser, dateRange]);

  const fetchModules = async () => {
    try {
      const response = await auditService.modules();
      setModules(response);
    } catch (error) {
      console.error("Failed to fetch modules:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await auditService.list({
        search: searchQuery || undefined,
        module: filterModule !== "all" ? filterModule : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        user: filterUser !== "all" ? filterUser : undefined,
        from: dateRange.start || undefined,
        to: dateRange.end || undefined,
        page: currentPage,
        per_page: itemsPerPage,
      });

      setLogs(response.data || []);
      setTotalItems(response.total || 0);
      setTotalPages(response.last_page || 1);
    } catch (error) {
      toast.error("Failed to load audit logs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  // Mocking users filter since we don't have a specific users endpoint yet
  // We can just rely on manual input or leave it if backend handles it
  
  return (
    <AppLayout title="Audit Logs" subtitle="Track all system activities and changes">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <button
                onClick={() => navigate("/dashboard")}
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
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Module Filter */}
                  <div>
                    <label className="block text-sm text-[#6B7280] mb-2">Module</label>
                    <select
                      value={filterModule}
                      onChange={(e) => {
                        setFilterModule(e.target.value);
                        setCurrentPage(1);
                      }}
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

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm text-[#6B7280] mb-2">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1);
                      }}
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
                        onChange={(e) => {
                          setDateRange({ ...dateRange, start: e.target.value });
                          setCurrentPage(1);
                        }}
                        className="flex-1 px-3 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                      />
                      <span className="text-[#6B7280]">-</span>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => {
                          setDateRange({ ...dateRange, end: e.target.value });
                          setCurrentPage(1);
                        }}
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
            <div className="overflow-x-auto min-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-[#6B7280]">
                  <Activity className="w-12 h-12 mb-4 text-[#D1D5DB]" />
                  <p className="text-lg font-medium text-[#111827]">No audit logs found</p>
                  <p>Adjust your filters or try a different search term.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs text-[#6B7280]">User</th>
                      <th className="px-6 py-4 text-left text-xs text-[#6B7280]">Action</th>
                      <th className="px-6 py-4 text-left text-xs text-[#6B7280]">Module</th>
                      <th className="px-6 py-4 text-left text-xs text-[#6B7280]">Date & Time</th>
                      <th className="px-6 py-4 text-left text-xs text-[#6B7280]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F9FAFB] transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-xs shrink-0">
                              {log.user ? log.user[0].toUpperCase() : 'S'}
                            </div>
                            <div>
                              <p className="text-sm text-[#111827] truncate max-w-[150px]">{log.user}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-[#111827]">{log.action}</p>
                          <p className="text-xs text-[#6B7280] line-clamp-1" title={log.details}>{log.details}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#EEF2FF] text-[#4F46E5] rounded-lg text-xs">
                            {log.module}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-[#111827] whitespace-nowrap">{log.timestamp}</p>
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
                              <span className="capitalize">{log.status}</span>
                            </span>
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && logs.length > 0 && (
              <div className="px-6 py-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-[#6B7280]">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems} entries
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="hidden sm:flex items-center gap-2">
                    {/* Simplified pagination for a clean look */}
                    <span className="text-sm text-[#6B7280]">
                      Page <span className="font-medium text-[#111827]">{currentPage}</span> of <span className="font-medium text-[#111827]">{totalPages}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
