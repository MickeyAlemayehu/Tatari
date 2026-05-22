import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { performanceService, type PerformanceSummaryRecord } from "../../services/performance.service";
import { ApiError } from "../../lib/api";
import { initials } from "../../lib/utils";
import { AsyncState } from "../components/AsyncState";
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Download,
  Star,
  TrendingUp,
  Award,
  Users,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

interface EmployeeResult {
  id: number;
  name: string;
  position: string;
  department: string;
  avatar: string;
  selfScore: number;
  peerScore: number;
  managerScore: number;
  finalScore: number;
  status: "completed" | "in-progress" | "pending";
}

function mapResult(r: PerformanceSummaryRecord): EmployeeResult {
  const parts = (r.employeeName ?? "").split(" ");
  const first = parts[0] ?? "";
  const last = parts.slice(1).join(" ") || first;
  return {
    id: r.employee_id,
    name: r.employeeName ?? "Unknown",
    position: r.position ?? "—",
    department: r.department ?? "—",
    avatar: initials(first, last),
    selfScore: r.selfScore,
    peerScore: r.peerScore,
    managerScore: r.managerScore,
    finalScore: r.finalScore,
    status: r.status === "completed" ? "completed" : r.status === "in-progress" ? "in-progress" : "pending",
  };
}

export function PerformanceResultsTable() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [employeeResults, setEmployeeResults] = useState<EmployeeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    performanceService
      .results()
      .then((res) => setEmployeeResults(res.data.map(mapResult)))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load results.")
      )
      .finally(() => setLoading(false));
  }, []);

  // Filter results
  const filteredResults = employeeResults.filter((result) => {
    const matchesSearch =
      searchQuery === "" ||
      result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.position.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      filterDepartment === "all" || result.department === filterDepartment;

    const matchesStatus = filterStatus === "all" || result.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Get unique departments
  const departments = Array.from(new Set(employeeResults.map((r) => r.department)));

  // Calculate statistics
  const totalEmployees = employeeResults.length;
  const completedCount = employeeResults.filter((r) => r.status === "completed").length;
  const inProgressCount = employeeResults.filter((r) => r.status === "in-progress").length;
  const pendingCount = employeeResults.filter((r) => r.status === "pending").length;
  const averageScore =
    employeeResults
      .filter((r) => r.finalScore > 0)
      .reduce((sum, r) => sum + r.finalScore, 0) /
    employeeResults.filter((r) => r.finalScore > 0).length;

  // Get score color
  const getScoreColor = (score: number) => {
    if (score === 0) return "text-[#6B7280]";
    if (score >= 4.5) return "text-[#4F46E5]";
    if (score >= 4.0) return "text-[#22C55E]";
    if (score >= 3.5) return "text-blue-600";
    if (score >= 3.0) return "text-[#F59E0B]";
    return "text-[#EF4444]";
  };

  // Get score background
  const getScoreBg = (score: number) => {
    if (score === 0) return "bg-[#F9FAFB]";
    if (score >= 4.5) return "bg-[#EEF2FF]";
    if (score >= 4.0) return "bg-[#DCFCE7]";
    if (score >= 3.5) return "bg-blue-50";
    if (score >= 3.0) return "bg-[#FFFBEB]";
    return "bg-[#FEF2F2]";
  };

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/performance")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">Performance Results</h1>
                <p className="text-sm text-[#6B7280]">
                  Company-wide evaluation results for Q1 2026
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl">
              <Download className="w-5 h-5" />
              <span>Export Results</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280] mb-1">Total Employees</p>
                <p className="text-2xl text-[#111827]">{totalEmployees}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280] mb-1">Completed</p>
                <p className="text-2xl text-[#22C55E]">{completedCount}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280] mb-1">In Progress</p>
                <p className="text-2xl text-blue-600">{inProgressCount}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280] mb-1">Pending</p>
                <p className="text-2xl text-[#F59E0B]">{pendingCount}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280] mb-1">Average Score</p>
                <p className="text-2xl text-[#4F46E5]">{averageScore.toFixed(1)}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm text-[#111827] mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or position..."
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Department Filter */}
                <div>
                  <label className="block text-sm text-[#111827] mb-2">Department</label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm text-[#111827] mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs text-[#6B7280]">Employee</th>
                      <th className="px-6 py-4 text-left text-xs text-[#6B7280]">Department</th>
                      <th className="px-6 py-4 text-center text-xs text-[#6B7280]">
                        Self Score
                      </th>
                      <th className="px-6 py-4 text-center text-xs text-[#6B7280]">
                        Peer Score
                      </th>
                      <th className="px-6 py-4 text-center text-xs text-[#6B7280]">
                        Manager Score
                      </th>
                      <th className="px-6 py-4 text-center text-xs text-[#6B7280]">
                        Final Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-[#6B7280]">Status</th>
                      <th className="px-6 py-4 text-left text-xs text-[#6B7280]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredResults.map((result) => (
                      <tr key={result.id} className="hover:bg-[#F9FAFB] transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-sm">
                              {result.avatar}
                            </div>
                            <div>
                              <p className="text-sm text-[#111827]">{result.name}</p>
                              <p className="text-xs text-[#6B7280]">{result.position}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6B7280]">
                          {result.department}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getScoreBg(
                              result.selfScore
                            )} ${getScoreColor(result.selfScore)}`}
                          >
                            {result.selfScore > 0 ? result.selfScore.toFixed(1) : "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getScoreBg(
                              result.peerScore
                            )} ${getScoreColor(result.peerScore)}`}
                          >
                            {result.peerScore > 0 ? result.peerScore.toFixed(1) : "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getScoreBg(
                              result.managerScore
                            )} ${getScoreColor(result.managerScore)}`}
                          >
                            {result.managerScore > 0 ? result.managerScore.toFixed(1) : "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getScoreBg(
                              result.finalScore
                            )} ${getScoreColor(result.finalScore)}`}
                          >
                            {result.finalScore > 0 ? (
                              <>
                                <Star className="w-3 h-3" />
                                {result.finalScore.toFixed(1)}
                              </>
                            ) : (
                              "-"
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              result.status === "completed"
                                ? "success"
                                : result.status === "in-progress"
                                ? "warning"
                                : "default"
                            }
                            size="sm"
                          >
                            {result.status === "completed"
                              ? "Completed"
                              : result.status === "in-progress"
                              ? "In Progress"
                              : "Pending"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/performance/results/${result.id}`)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-[#E5E7EB]">
                <p className="text-sm text-[#6B7280]">
                  Showing {filteredResults.length} of {totalEmployees} employees
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
