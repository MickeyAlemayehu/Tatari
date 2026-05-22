import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Users, Calendar, Briefcase, TrendingUp, Eye } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { employeesService } from "../../services/employees.service";
import { leaveService } from "../../services/leave.service";
import { jobsService } from "../../services/jobs.service";
import { performanceService } from "../../services/performance.service";
import { initials, formatDate } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";

export function HRDashboard() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [pendingLeave, setPendingLeave] = useState(0);
  const [activeJobs, setActiveJobs] = useState(0);
  const [activePeriods, setActivePeriods] = useState(0);
  const [recentEmployees, setRecentEmployees] = useState<
    { id: number; name: string; role: string; department: string; joinDate: string; status: "active" | "inactive"; avatar: string }[]
  >([]);

  useEffect(() => {
    if (hasPermission("manage_employees")) {
      employeesService.list({ per_page: 5 }).then((res) => {
      setTotalEmployees(res.total);
      setRecentEmployees(
        res.data.map((e) => ({
          id: e.id,
          name: `${e.first_name} ${e.last_name}`,
          role: e.position ?? "—",
          department: e.department?.name ?? "—",
          joinDate: formatDate(e.created_at),
          status: e.status === "inactive" ? "inactive" : "active",
          avatar: initials(e.first_name, e.last_name),
        }))
      );
      }).catch(() => {});

      jobsService.list({ status: "open", per_page: 100 }).then((res) => setActiveJobs(res.data.length)).catch(() => {});
    }

    if (hasPermission("approve_leave")) {
      leaveService.summary().then((s) => setPendingLeave(s.pendingLeaveRequests)).catch(() => {});
    }

    if (hasPermission("performance_create")) {
      performanceService.periods().then((res) => {
        setActivePeriods(res.data.filter((p) => p.status === "active").length);
      }).catch(() => {});
    }
  }, [hasPermission]);

  const stats = [
    {
      title: "Total Employees",
      value: String(totalEmployees),
      subtitle: "Active workforce",
      icon: Users,
      color: "from-[#4F46E5] to-[#4338CA]",
      permission: "manage_employees",
    },
    {
      title: "Pending Leave Requests",
      value: String(pendingLeave),
      subtitle: "Awaiting approval",
      icon: Calendar,
      color: "from-[#F59E0B] to-[#F59E0B]",
      permission: "approve_leave",
    },
    {
      title: "Active Job Vacancies",
      value: String(activeJobs),
      subtitle: "Currently hiring",
      icon: Briefcase,
      color: "from-[#06B6D4] to-[#06B6D4]",
      permission: "manage_employees",
    },
    {
      title: "Active Evaluations",
      value: String(activePeriods),
      subtitle: "Open periods",
      icon: TrendingUp,
      color: "from-[#22C55E] to-[#22C55E]",
      permission: "performance_create",
    },
  ];

  return (
    <AppLayout title="HR Dashboard" subtitle="Overview of HR operations">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.filter((stat) => hasPermission(stat.permission)).map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white rounded-xl p-6 border border-[#E5E7EB]">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-[#6B7280] mb-1">{stat.title}</p>
                <p className="text-3xl text-[#111827]">{stat.value}</p>
                <p className="text-xs text-[#6B7280] mt-1">{stat.subtitle}</p>
              </div>
            );
          })}
        </div>

        {hasPermission("manage_employees") && (
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="text-sm text-[#111827]">Recent Employees</h2>
            <button
              onClick={() => navigate("/employees")}
              className="text-sm text-[#4F46E5] hover:underline"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {recentEmployees.map((emp) => (
              <div key={emp.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#F9FAFB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#EEF2FF] rounded-full flex items-center justify-center text-sm text-[#4F46E5]">
                    {emp.avatar}
                  </div>
                  <div>
                    <p className="text-sm text-[#111827]">{emp.name}</p>
                    <p className="text-xs text-[#6B7280]">
                      {emp.role} · {emp.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={emp.status === "active" ? "success" : "danger"} size="sm">
                    {emp.status}
                  </Badge>
                  <button
                    onClick={() => navigate(`/employees/${emp.id}`)}
                    className="p-2 text-[#6B7280] hover:text-[#4F46E5]"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {recentEmployees.length === 0 && (
              <p className="p-8 text-center text-sm text-[#6B7280]">No employees found.</p>
            )}
          </div>
        </div>
        )}
      </div>
    </AppLayout>
  );
}
