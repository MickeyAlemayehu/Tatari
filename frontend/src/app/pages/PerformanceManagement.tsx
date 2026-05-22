import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { performanceService, type EvaluationPeriodRecord } from "../../services/performance.service";
import { ApiError } from "../../lib/api";
import { formatDate } from "../../lib/utils";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Calendar,
  Users,
  TrendingUp,
  Award,
  BarChart3,
  Clock,
  ClipboardCheck,
  CheckCircle,
  FileText,
  Settings,
  UserPlus,
  List,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../../contexts/AuthContext";

export function PerformanceManagement() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [evaluationPeriods, setEvaluationPeriods] = useState<EvaluationPeriodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    performanceService
      .periods()
      .then((res) => setEvaluationPeriods(res.data))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load evaluation periods.")
      )
      .finally(() => setLoading(false));
  }, []);

  const totalEmployees = evaluationPeriods.reduce(
    (max, p) => Math.max(max, p.totalEmployees ?? 0),
    0
  );
  const totalEvaluations = evaluationPeriods.reduce(
    (sum, p) => sum + (p.totalEmployees ?? 0),
    0
  );
  const completedEvaluations = evaluationPeriods.reduce(
    (sum, p) => sum + (p.completed ?? 0),
    0
  );
  const pendingEvaluations = Math.max(0, totalEvaluations - completedEvaluations);

  // Quick actions
  const quickActions = [
    {
      id: 1,
      title: "Evaluation Builder",
      description: "Create and manage evaluation questions",
      icon: FileText,
      color: "from-[#4F46E5] to-[#4338CA]",
      path: "/performance/builder",
      permission: "performance_create",
    },
    {
      id: 2,
      title: "Assign Evaluators",
      description: "Assign peers and managers to employees",
      icon: UserPlus,
      color: "from-[#22C55E] to-[#22C55E]",
      path: "/performance/assign-peers",
      permission: "performance_create",
    },
    {
      id: 3,
      title: "Performance Results",
      description: "View company-wide evaluation results",
      icon: BarChart3,
      color: "from-[#F59E0B] to-[#F59E0B]",
      path: "/performance/results-table",
      permission: "manage_performance_reviews",
    },
    {
      id: 4,
      title: "Evaluation Structure",
      description: "Manage evaluation types and structure",
      icon: List,
      color: "from-[#06B6D4] to-[#06B6D4]",
      path: "/performance/structure",
      permission: "performance_create",
    },
  ];

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-[#111827]">Performance Management</h1>
              <p className="text-sm text-[#6B7280]">Manage employee performance evaluations company-wide</p>
            </div>
            <button
              className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
              onClick={() => navigate("/performance/results-table")}
            >
              <BarChart3 className="w-5 h-5" />
              <span>View All Results</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-[#EF4444]/20 bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
              {error}
            </div>
          )}
          {loading && (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!loading && (
          <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 border border-[#E5E7EB]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-[#6B7280] mb-1">Total Employees</p>
              <p className="text-3xl text-[#111827]">{totalEmployees}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#E5E7EB]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#06B6D4] to-[#06B6D4] rounded-lg flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-[#6B7280] mb-1">Total Evaluations</p>
              <p className="text-3xl text-[#111827]">{totalEvaluations}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#E5E7EB]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#22C55E] to-[#22C55E] rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-[#6B7280] mb-1">Completed</p>
              <p className="text-3xl text-[#22C55E]">{completedEvaluations}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-[#E5E7EB]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F59E0B] to-[#F59E0B] rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-[#6B7280] mb-1">Pending</p>
              <p className="text-3xl text-[#F59E0B]">{pendingEvaluations}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-sm text-[#111827] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.filter((action) => hasPermission(action.permission)).map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => navigate(action.path)}
                    className="bg-white rounded-xl p-5 border border-[#E5E7EB] hover:border-[#4F46E5] hover:shadow-lg transition text-left"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm text-[#111827] mb-1">{action.title}</h3>
                    <p className="text-xs text-[#6B7280]">{action.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evaluation Periods */}
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#6B7280]" />
                <h2 className="text-sm text-[#111827]">Evaluation Periods</h2>
              </div>
              <button
                onClick={() => navigate("/performance/create")}
                className="text-sm text-[#4F46E5] hover:text-indigo-700 transition"
              >
                New Period
              </button>
            </div>
            <div className="p-6 space-y-4">
              {evaluationPeriods.map((period) => (
                <div
                  key={period.id}
                  className="border border-[#E5E7EB] rounded-lg p-5 hover:border-[#4F46E5]/30 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm text-[#111827]">{period.title ?? period.name}</h3>
                        <Badge
                          variant={
                            period.status === "active"
                              ? "success"
                              : period.status === "upcoming"
                              ? "warning"
                              : "default"
                          }
                          size="sm"
                        >
                          {period.status === "active"
                            ? "Active"
                            : period.status === "upcoming"
                            ? "Upcoming"
                            : "Completed"}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#6B7280] capitalize">{period.status} period</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-xs text-[#6B7280]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(period.startDate)} - {formatDate(period.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{period.completed ?? 0}/{period.totalEmployees ?? 0} completed</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#6B7280]">Progress</span>
                      <span className="text-xs text-[#111827]">{period.progress ?? 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] h-2.5 rounded-full transition-all"
                        style={{ width: `${period.progress ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {period.status === "active" && (
                    <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex gap-2">
                      <button
                        onClick={() => navigate(`/performance/results-table?period=${period.id}`)}
                        className="flex-1 px-4 py-2 bg-[#EEF2FF] text-[#4F46E5] rounded-lg hover:bg-[#4F46E5] hover:text-white transition text-sm"
                      >
                        View Results
                      </button>
                      {hasPermission("performance_create") && (
                        <button
                          onClick={() => navigate("/performance/assign-peers")}
                          className="flex-1 px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition text-sm"
                        >
                          Assign Evaluators
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          </>
          )}
        </main>
      </div>
    </AppLayout>
  );
}
