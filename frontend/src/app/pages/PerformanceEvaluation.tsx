import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  TrendingUp,
  Award,
  BarChart3,
  Clock,
  ClipboardCheck,
  AlertCircle,
  CheckCircle,
  Bell,
  ChevronRight,
  Star,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

interface EvaluationPeriod {
  id: number;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  status: "active" | "upcoming" | "completed";
  progress: number;
  totalEmployees: number;
  completed: number;
}

interface AssignedTask {
  id: number;
  employee: {
    name: string;
    position: string;
    avatar: string;
  };
  evaluationType: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
}

interface Notification {
  id: number;
  type: "reminder" | "deadline" | "completed" | "new";
  message: string;
  timestamp: string;
  read: boolean;
}

export function PerformanceEvaluation() {
  const navigate = useNavigate();

  // Active evaluation periods
  const evaluationPeriods: EvaluationPeriod[] = [
    {
      id: 1,
      title: "Q1 2026 Performance Review",
      type: "Quarterly Review",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
      status: "active",
      progress: 65,
      totalEmployees: 45,
      completed: 29,
    },
    {
      id: 2,
      title: "Mid-Year Review 2026",
      type: "Semi-Annual Review",
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      status: "upcoming",
      progress: 0,
      totalEmployees: 48,
      completed: 0,
    },
    {
      id: 3,
      title: "Annual Performance Review 2025",
      type: "Annual Review",
      startDate: "2025-12-01",
      endDate: "2025-12-31",
      status: "completed",
      progress: 100,
      totalEmployees: 42,
      completed: 42,
    },
  ];

  // Assigned evaluation tasks
  const assignedTasks: AssignedTask[] = [
    {
      id: 1,
      employee: {
        name: "Sarah Johnson",
        position: "Marketing Specialist",
        avatar: "SJ",
      },
      evaluationType: "Quarterly Review",
      dueDate: "2026-03-25",
      status: "pending",
      priority: "high",
    },
    {
      id: 2,
      employee: {
        name: "Michael Chen",
        position: "Senior Developer",
        avatar: "MC",
      },
      evaluationType: "Quarterly Review",
      dueDate: "2026-03-26",
      status: "in-progress",
      priority: "high",
    },
    {
      id: 3,
      employee: {
        name: "Emily Davis",
        position: "Product Designer",
        avatar: "ED",
      },
      evaluationType: "Quarterly Review",
      dueDate: "2026-03-27",
      status: "pending",
      priority: "medium",
    },
    {
      id: 4,
      employee: {
        name: "James Wilson",
        position: "Sales Manager",
        avatar: "JW",
      },
      evaluationType: "Quarterly Review",
      dueDate: "2026-03-28",
      status: "completed",
      priority: "medium",
    },
    {
      id: 5,
      employee: {
        name: "Lisa Anderson",
        position: "HR Coordinator",
        avatar: "LA",
      },
      evaluationType: "Quarterly Review",
      dueDate: "2026-03-29",
      status: "pending",
      priority: "low",
    },
  ];

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "deadline",
      message: "Sarah Johnson's quarterly review is due in 4 days",
      timestamp: "2026-03-21 09:00",
      read: false,
    },
    {
      id: 2,
      type: "reminder",
      message: "3 pending evaluations require your attention",
      timestamp: "2026-03-21 08:30",
      read: false,
    },
    {
      id: 3,
      type: "completed",
      message: "James Wilson's evaluation has been submitted",
      timestamp: "2026-03-20 16:45",
      read: false,
    },
    {
      id: 4,
      type: "new",
      message: "New evaluation period Q2 2026 has been created",
      timestamp: "2026-03-20 14:20",
      read: true,
    },
    {
      id: 5,
      type: "reminder",
      message: "Q1 2026 evaluation period ends in 10 days",
      timestamp: "2026-03-19 10:00",
      read: true,
    },
  ]);

  // Statistics
  const totalPending = assignedTasks.filter(t => t.status === "pending").length;
  const totalInProgress = assignedTasks.filter(t => t.status === "in-progress").length;
  const totalCompleted = assignedTasks.filter(t => t.status === "completed").length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deadline":
        return <AlertCircle className="w-5 h-5 text-[#EF4444]" />;
      case "reminder":
        return <Clock className="w-5 h-5 text-[#F59E0B]" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-[#22C55E]" />;
      case "new":
        return <Bell className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-[#6B7280]" />;
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

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-[#111827]">Performance Evaluation</h1>
              <p className="text-sm text-[#6B7280]">Manage employee performance reviews and evaluations</p>
            </div>
            <button
              className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
              onClick={() => navigate("/performance/create")}
            >
              <ClipboardCheck className="w-5 h-5" />
              <span>Start Evaluation</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#FFFBEB] rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B7280]">Pending</p>
                  <p className="text-2xl text-[#111827]">{totalPending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-[#6B7280]">In Progress</p>
                  <p className="text-2xl text-[#111827]">{totalInProgress}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B7280]">Completed</p>
                  <p className="text-2xl text-[#111827]">{totalCompleted}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#FEF2F2] rounded-lg flex items-center justify-center relative">
                  <Bell className="w-5 h-5 text-[#EF4444]" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] rounded-full text-white text-xs flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-[#6B7280]">Notifications</p>
                  <p className="text-2xl text-[#111827]">{unreadNotifications}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Evaluation Periods and Tasks */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Evaluation Periods */}
              <div className="bg-white rounded-xl border border-[#E5E7EB]">
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#6B7280]" />
                    <h2 className="text-sm text-[#111827]">Evaluation Periods</h2>
                  </div>
                  <button className="text-sm text-[#4F46E5] hover:text-indigo-700">
                    View All
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {evaluationPeriods.map((period) => (
                    <div
                      key={period.id}
                      className="border border-[#E5E7EB] rounded-lg p-4 hover:border-[#4F46E5]/30 hover:shadow-sm transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm text-[#111827]">{period.title}</h3>
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
                          <p className="text-xs text-[#6B7280]">{period.type}</p>
                        </div>
                        <button className="p-1.5 text-[#6B7280] hover:text-[#6B7280] hover:bg-[#F9FAFB] rounded transition">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 mb-3 text-xs text-[#6B7280]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(period.startDate)} - {formatDate(period.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{period.completed}/{period.totalEmployees} completed</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[#6B7280]">Progress</span>
                          <span className="text-xs text-[#111827]">{period.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] h-2 rounded-full transition-all"
                            style={{ width: `${period.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Tasks */}
              <div className="bg-white rounded-xl border border-[#E5E7EB]">
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-[#6B7280]" />
                    <h2 className="text-sm text-[#111827]">Assigned Evaluations</h2>
                  </div>
                  <button className="text-sm text-[#4F46E5] hover:text-indigo-700">
                    View All
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {assignedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="px-6 py-4 hover:bg-[#F9FAFB] transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                            {task.employee.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#111827] mb-0.5">
                              {task.employee.name}
                            </p>
                            <p className="text-xs text-[#6B7280] mb-2">
                              {task.employee.position}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-[#6B7280]">{task.evaluationType}</span>
                              <span className="text-xs text-[#6B7280]">•</span>
                              <span className="text-xs text-[#6B7280]">Due {formatDate(task.dueDate)}</span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
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
                          <button className="p-1.5 text-[#6B7280] hover:text-[#6B7280] hover:bg-[#F9FAFB] rounded transition">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Notifications */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#E5E7EB]">
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#6B7280]" />
                    <h2 className="text-sm text-[#111827]">Notifications</h2>
                    {unreadNotifications > 0 && (
                      <span className="w-5 h-5 bg-[#EF4444] rounded-full text-white text-xs flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-6 py-4 hover:bg-[#F9FAFB] transition cursor-pointer ${
                        !notification.read ? "bg-[#ECFEFF]" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#111827] mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-xl p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-6 h-6" />
                  <h3 className="text-sm">Performance Insights</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-90">Average Rating</span>
                    <span className="text-lg">4.2/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-90">On-time Completion</span>
                    <span className="text-lg">87%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-90">Team Satisfaction</span>
                    <span className="text-lg">92%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}