import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Calendar, TrendingUp, ClipboardList, Clock, CheckCircle } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { leaveService } from "../../services/leave.service";
import { performanceService } from "../../services/performance.service";

export function EmployeeDashboard() {
  const navigate = useNavigate();
  const [leaveRemaining, setLeaveRemaining] = useState(0);
  const [pendingLeave, setPendingLeave] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [performanceScore, setPerformanceScore] = useState<string>("—");

  useEffect(() => {
    leaveService.myBalances().then((res) => {
      const total = res.data.reduce((sum, b) => sum + (b.remaining ?? 0), 0);
      setLeaveRemaining(Math.round(total));
    }).catch(() => {});

    leaveService.myRequests({ per_page: 50 }).then((res) => {
      setPendingLeave(res.data.filter((r) => r.status === "pending").length);
    }).catch(() => {});

    performanceService.myAssignments().then((res) => {
      setPendingTasks(res.data.filter((a) => a.status !== "submitted" && a.status !== "completed").length);
    }).catch(() => {});

    performanceService.myResults().then((res) => {
      const latest = res.data[0];
      if (latest?.finalScore) {
        setPerformanceScore(`${latest.finalScore.toFixed(1)}/5`);
      }
    }).catch(() => {});
  }, []);

  const myStats = [
    {
      title: "Leave Balance",
      value: `${leaveRemaining} days`,
      subtitle: "Remaining this year",
      icon: Calendar,
      color: "from-[#06B6D4] to-[#06B6D4]",
    },
    {
      title: "Pending Leave",
      value: String(pendingLeave),
      subtitle: "Awaiting approval",
      icon: Clock,
      color: "from-[#F59E0B] to-[#F59E0B]",
    },
    {
      title: "My Tasks",
      value: String(pendingTasks),
      subtitle: "Evaluations to complete",
      icon: ClipboardList,
      color: "from-[#4F46E5] to-[#4338CA]",
    },
    {
      title: "Performance",
      value: performanceScore,
      subtitle: "Latest evaluation score",
      icon: TrendingUp,
      color: "from-[#22C55E] to-[#22C55E]",
    },
  ];

  return (
    <AppLayout title="Dashboard" subtitle="Welcome back!">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {myStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white rounded-xl p-6 border border-[#E5E7EB]">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-[#6B7280] mb-1">{stat.title}</p>
                <p className="text-2xl text-[#111827] mb-1">{stat.value}</p>
                <p className="text-xs text-[#6B7280]">{stat.subtitle}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="text-base text-[#111827] mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/employee/leave")}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:border-[#06B6D4] transition text-left"
              >
                <Calendar className="w-5 h-5 text-[#06B6D4]" />
                <span className="text-sm">Request Leave</span>
              </button>
              <button
                onClick={() => navigate("/employee/performance")}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:border-[#4F46E5] transition text-left"
              >
                <ClipboardList className="w-5 h-5 text-[#4F46E5]" />
                <span className="text-sm">View Evaluations</span>
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="text-base text-[#111827] mb-4">Recent Activity</h3>
            <div className="flex items-center gap-3 text-sm text-[#6B7280]">
              <CheckCircle className="w-5 h-5 text-[#22C55E]" />
              <span>Check notifications for the latest updates</span>
            </div>
            <button
              onClick={() => navigate("/employee/notifications")}
              className="mt-4 text-sm text-[#4F46E5] hover:underline"
            >
              View notifications
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
