import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ClipboardCheck,
  Award,
  User,
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { performanceService, type EvaluationAssignmentRecord, type PerformanceSummaryRecord } from "../../services/performance.service";
import { ApiError } from "../../lib/api";

type TabType = "tasks" | "results";

interface EvaluationTask {
  id: number;
  type: "self" | "peer" | "manager";
  targetName: string;
  targetPosition: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
}

export function EmployeePerformance() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || "tasks");

  // Update active tab when URL changes
  useEffect(() => {
    const tab = searchParams.get("tab") as TabType | null;
    if (tab && ["tasks", "results"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [myTasks, setMyTasks] = useState<EvaluationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    performanceService
      .myAssignments()
      .then((res) => {
        const tasks: EvaluationTask[] = res.data.map((a: EvaluationAssignmentRecord) => ({
          id: a.id,
          type: (a.type as EvaluationTask["type"]) ?? "self",
          targetName: a.employee?.name ?? "Employee",
          targetPosition: a.employee?.position ?? "—",
          dueDate: typeof a.period === "object" ? a.period?.name ?? "—" : (a.period ?? "—"),
          status:
            a.status === "submitted" || a.status === "completed"
              ? "completed"
              : a.status === "draft"
              ? "in-progress"
              : "pending",
          priority: "medium" as const,
        }));
        setMyTasks(tasks);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load evaluation tasks.")
      )
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: "tasks" as TabType, label: "My Tasks", icon: ClipboardCheck },
    { id: "results" as TabType, label: "My Results", icon: Award },
  ];

  // Statistics
  const totalTasks = myTasks.length;
  const pendingTasks = myTasks.filter((t) => t.status === "pending").length;
  const inProgressTasks = myTasks.filter((t) => t.status === "in-progress").length;
  const completedTasks = myTasks.filter((t) => t.status === "completed").length;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex-shrink-0">
          {error && (
            <p className="mb-2 text-sm text-[#EF4444]">{error}</p>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-[#111827]">My Performance</h1>
              <p className="text-sm text-[#6B7280]">
                Complete evaluations and view your performance results
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
                <span className="text-sm text-[#6B7280]">
                  {completedTasks}/{totalTasks} Tasks Completed
                </span>
              </div>
            </div>
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
          {activeTab === "tasks" && (
            <MyTasksTab
              tasks={myTasks}
              totalTasks={totalTasks}
              pendingTasks={pendingTasks}
              inProgressTasks={inProgressTasks}
              completedTasks={completedTasks}
            />
          )}
          {activeTab === "results" && <MyResultsTab />}
        </div>
      </div>
    </AppLayout>
  );
}

// My Tasks Tab
function MyTasksTab({
  tasks,
  totalTasks,
  pendingTasks,
  inProgressTasks,
  completedTasks,
}: {
  tasks: EvaluationTask[];
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}) {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "self":
        return <User className="w-5 h-5" />;
      case "peer":
        return <Users className="w-5 h-5" />;
      case "manager":
        return <Briefcase className="w-5 h-5" />;
      default:
        return <ClipboardCheck className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "self":
        return "bg-blue-100 text-blue-600";
      case "peer":
        return "bg-[#DCFCE7] text-[#22C55E]";
      case "manager":
        return "bg-[#EEF2FF] text-[#4F46E5]";
      default:
        return "bg-[#F9FAFB] text-[#6B7280]";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "self":
        return "Self Evaluation";
      case "peer":
        return "Peer Evaluation";
      case "manager":
        return "Manager Evaluation";
      default:
        return "Evaluation";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-[#EF4444] bg-[#FEF2F2]";
      case "medium":
        return "text-[#F59E0B] bg-[#FFFBEB]";
      case "low":
        return "text-blue-600 bg-[#ECFEFF]";
      default:
        return "text-[#6B7280] bg-[#F9FAFB]";
    }
  };

  const getActionButton = (task: EvaluationTask) => {
    if (task.status === "completed") {
      return (
        <div className="flex items-center gap-2 text-sm text-[#22C55E]">
          <CheckCircle className="w-4 h-4" />
          Completed
        </div>
      );
    }

    if (task.status === "in-progress") {
      return (
        <button
          onClick={() => navigate(`/employee/evaluation/${task.type}/${task.id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-indigo-700 transition text-sm"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      );
    }

    return (
      <button
        onClick={() => navigate(`/employee/evaluation/${task.type}/${task.id}`)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg text-sm"
      >
        Start Evaluation
        <ChevronRight className="w-4 h-4" />
      </button>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
          <p className="text-sm text-[#6B7280] mb-1">Total Tasks</p>
          <p className="text-2xl text-[#111827]">{totalTasks}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
          <p className="text-sm text-[#6B7280] mb-1">Pending</p>
          <p className="text-2xl text-[#F59E0B]">{pendingTasks}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
          <p className="text-sm text-[#6B7280] mb-1">In Progress</p>
          <p className="text-2xl text-blue-600">{inProgressTasks}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
          <p className="text-sm text-[#6B7280] mb-1">Completed</p>
          <p className="text-2xl text-[#22C55E]">{completedTasks}</p>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl border border-[#E5E7EB]">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm text-[#111827]">Assigned Evaluations</h2>
          <p className="text-xs text-[#6B7280] mt-1">
            Complete your evaluations before the due date
          </p>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {tasks.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#6B7280]">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No evaluation tasks assigned</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="px-6 py-5 hover:bg-[#F9FAFB] transition">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(
                      task.type
                    )}`}
                  >
                    {getTypeIcon(task.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm text-[#111827] mb-1">
                          {getTypeLabel(task.type)}
                        </h3>
                        <p className="text-xs text-[#6B7280]">
                          {task.type === "self" ? (
                            "Evaluate your own performance"
                          ) : (
                            <>
                              Evaluate: <strong>{task.targetName}</strong> •{" "}
                              {task.targetPosition}
                            </>
                          )}
                        </p>
                      </div>
                      <Badge
                        variant={
                          task.status === "completed"
                            ? "success"
                            : task.status === "in-progress"
                            ? "warning"
                            : "default"
                        }
                        size="sm"
                      >
                        {task.status === "completed"
                          ? "Completed"
                          : task.status === "in-progress"
                          ? "In Progress"
                          : "Pending"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                        <Clock className="w-3.5 h-3.5" />
                        Due: {formatDate(task.dueDate)}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority} priority
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      {getActionButton(task)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg">
        <p className="text-sm text-[#06B6D4]">
          <strong>Note:</strong> Complete all assigned evaluations before the due date.
          Your performance review will be finalized once all evaluations are submitted.
        </p>
      </div>
    </div>
  );
}

// My Results Tab
function MyResultsTab() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myResult, setMyResult] = useState<PerformanceSummaryRecord | null>(null);

  useEffect(() => {
    performanceService
      .myResults()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          // The endpoint returns results sorted by latest calculated_at
          setMyResult(res.data[0]);
        }
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load performance results.")
      )
      .finally(() => setLoading(false));
  }, []);

  const getRatingLabel = (score: number) => {
    if (score >= 4.5) return "Exceptional";
    if (score >= 4.0) return "Exceeds Expectations";
    if (score >= 3.5) return "Meets Expectations";
    if (score >= 3.0) return "Needs Improvement";
    return "Unsatisfactory";
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-[#FEF2F2] border border-[#EF4444]/20 rounded-lg text-[#EF4444]">
          {error}
        </div>
      </div>
    );
  }

  if (!myResult) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
          <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-base text-[#111827] mb-2">No Performance Results</h3>
          <p className="text-sm text-[#6B7280]">
            You do not have any finalized performance results at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Final Score Card */}
      <div className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] rounded-xl p-8 text-white">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-sm opacity-75 mb-2">My Performance Score - {myResult.period || "Current"}</h2>
          <div className="text-6xl mb-3">{myResult.finalScore.toFixed(1)}</div>
          <div className="text-lg opacity-90">{getRatingLabel(myResult.finalScore)}</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Self Score */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm text-[#111827]">Self Evaluation</h3>
              <p className="text-xs text-[#6B7280]">Your assessment</p>
            </div>
          </div>
          <div className="text-3xl text-[#111827] mb-2">{myResult.selfScore.toFixed(1)}</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(myResult.selfScore / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Peer Score */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <h3 className="text-sm text-[#111827]">Peer Average</h3>
              <p className="text-xs text-[#6B7280]">Peer reviews</p>
            </div>
          </div>
          <div className="text-3xl text-[#111827] mb-2">{myResult.peerScore.toFixed(1)}</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#22C55E] h-2 rounded-full transition-all"
              style={{ width: `${(myResult.peerScore / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Manager Score */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div>
              <h3 className="text-sm text-[#111827]">Manager Evaluation</h3>
              <p className="text-xs text-[#6B7280]">Direct supervisor</p>
            </div>
          </div>
          <div className="text-3xl text-[#111827] mb-2">{myResult.managerScore.toFixed(1)}</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#4F46E5] h-2 rounded-full transition-all"
              style={{ width: `${(myResult.managerScore / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Feedback Summary */}
      {myResult.feedback && myResult.feedback.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h2 className="text-sm text-[#111827] mb-4">Feedback Summary</h2>
          <div className="space-y-4">
            {myResult.feedback.map((item, index) => (
              <div key={index} className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                <h3 className="text-sm text-[#111827] mb-2">{item.from}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{item.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
