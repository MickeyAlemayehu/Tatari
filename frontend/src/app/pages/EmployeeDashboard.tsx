import { useNavigate } from "react-router";
import { Calendar, TrendingUp, ClipboardList, Clock, CheckCircle } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

export function EmployeeDashboard() {
  const navigate = useNavigate();

  //Personal stats - employee focused only
  const myStats = [
    {
      title: "Leave Balance",
      value: "18 days",
      subtitle: "Remaining this year",
      icon: Calendar,
      color: "from-[#06B6D4] to-[#06B6D4]",
    },
    {
      title: "Pending Leave",
      value: "1",
      subtitle: "Awaiting approval",
      icon: Clock,
      color: "from-[#F59E0B] to-[#F59E0B]",
    },
    {
      title: "My Tasks",
      value: "2",
      subtitle: "Evaluations to complete",
      icon: ClipboardList,
      color: "from-[#4F46E5] to-[#4338CA]",
    },
    {
      title: "Performance",
      value: "4.5/5",
      subtitle: "Last evaluation score",
      icon: TrendingUp,
      color: "from-[#22C55E] to-[#22C55E]",
    },
  ];

  const pendingLeaveRequests = [
    {
      id: 1,
      type: "Annual Leave",
      startDate: "Apr 15, 2026",
      endDate: "Apr 19, 2026",
      days: 5,
      status: "pending" as const,
    },
  ];

  const myTasks = [
    {
      id: 1,
      title: "Self Evaluation - Q1 2026",
      dueDate: "Apr 30, 2026",
      priority: "high",
    },
    {
      id: 2,
      title: "Peer Evaluation - Sarah Johnson",
      dueDate: "May 5, 2026",
      priority: "medium",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Leave request submitted",
      date: "2 hours ago",
      icon: Calendar,
    },
    {
      id: 2,
      action: "Payslip available for March 2026",
      date: "1 day ago",
      icon: CheckCircle,
    },
    {
      id: 3,
      action: "Performance review scheduled",
      date: "3 days ago",
      icon: TrendingUp,
    },
  ];

  return (
    <AppLayout title="Dashboard" subtitle="Welcome back, John Doe">
      <div className="p-6">
        {/* Personal Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {myStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-white rounded-xl p-6 border border-[#E5E7EB] hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl text-[#111827] mb-1">{stat.value}</h3>
                <p className="text-sm text-[#6B7280]">{stat.title}</p>
                <p className="text-xs text-[#6B7280] mt-1">{stat.subtitle}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Leave Requests */}
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-[#111827]">My Leave Requests</h3>
                <p className="text-sm text-[#6B7280]">Pending approvals</p>
              </div>
              <button
                onClick={() => navigate("/leave?tab=request")}
                className="text-sm text-[#4F46E5] hover:text-[#4338CA]"
              >
                Request Leave
              </button>
            </div>
            <div className="p-6">
              {pendingLeaveRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingLeaveRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm text-[#111827]">{request.type}</h4>
                        <Badge variant="warning" size="sm">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-sm text-[#6B7280]">
                        {request.startDate} - {request.endDate}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-1">
                        {request.days} {request.days === 1 ? "day" : "days"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6B7280] text-center py-4">
                  No pending leave requests
                </p>
              )}
            </div>
          </div>

          {/* My Tasks */}
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-[#111827]">My Tasks</h3>
              <p className="text-sm text-[#6B7280]">Pending evaluations</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {myTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] hover:border-[#4F46E5] transition cursor-pointer"
                    onClick={() => navigate("/performance")}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm text-[#111827]">{task.title}</h4>
                      <Badge
                        variant={task.priority === "high" ? "danger" : "info"}
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#6B7280]">Due: {task.dueDate}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] lg:col-span-2">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-[#111827]">Recent Activity</h3>
              <p className="text-sm text-[#6B7280]">Your recent actions and updates</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-3 hover:bg-[#F9FAFB] rounded-lg transition"
                    >
                      <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#4F46E5]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[#111827]">{activity.action}</p>
                        <p className="text-xs text-[#6B7280]">{activity.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
