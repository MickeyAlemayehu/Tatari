import { useNavigate } from "react-router";
import { Users, Calendar, Briefcase, TrendingUp, Eye, CheckCircle, Clock } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

export function HRDashboard() {
  const navigate = useNavigate();

  // HR-focused statistics
  const stats = [
    {
      title: "Total Employees",
      value: "248",
      subtitle: "+12 this month",
      icon: Users,
      color: "from-[#4F46E5] to-[#4338CA]",
    },
    {
      title: "Pending Leave Requests",
      value: "15",
      subtitle: "Awaiting approval",
      icon: Calendar,
      color: "from-[#F59E0B] to-[#F59E0B]",
    },
    {
      title: "Active Job Vacancies",
      value: "8",
      subtitle: "Currently hiring",
      icon: Briefcase,
      color: "from-[#06B6D4] to-[#06B6D4]",
    },
    {
      title: "Performance Reviews",
      value: "42",
      subtitle: "Due this month",
      icon: TrendingUp,
      color: "from-[#22C55E] to-[#22C55E]",
    },
  ];

  // Recent employees
  const recentEmployees = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Senior Developer",
      department: "Engineering",
      joinDate: "2026-04-15",
      status: "active" as const,
      avatar: "SJ",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Product Manager",
      department: "Product",
      joinDate: "2026-04-10",
      status: "active" as const,
      avatar: "MC",
    },
    {
      id: 3,
      name: "Emily Davis",
      role: "UX Designer",
      department: "Design",
      joinDate: "2026-04-05",
      status: "active" as const,
      avatar: "ED",
    },
    {
      id: 4,
      name: "James Wilson",
      role: "Marketing Specialist",
      department: "Marketing",
      joinDate: "2026-03-28",
      status: "active" as const,
      avatar: "JW",
    },
  ];

  // Recent leave requests
  const recentLeaveRequests = [
    {
      id: "1",
      employeeName: "John Doe",
      employeeId: "EMP-001",
      leaveType: "Annual Leave",
      startDate: "May 15, 2026",
      endDate: "May 19, 2026",
      days: 5,
      status: "pending" as const,
    },
    {
      id: "2",
      employeeName: "Jane Smith",
      employeeId: "EMP-045",
      leaveType: "Sick Leave",
      startDate: "May 10, 2026",
      endDate: "May 12, 2026",
      days: 3,
      status: "pending" as const,
    },
    {
      id: "3",
      employeeName: "Robert Brown",
      employeeId: "EMP-089",
      leaveType: "Annual Leave",
      startDate: "May 20, 2026",
      endDate: "May 24, 2026",
      days: 5,
      status: "pending" as const,
    },
  ];

  return (
    <AppLayout title="HR Dashboard" subtitle="Welcome back to HR Portal">
      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-white rounded-xl p-6 border border-[#E5E7EB] hover:shadow-lg transition cursor-pointer"
                onClick={() => {
                  if (stat.title === "Total Employees") navigate("/employees");
                  if (stat.title === "Pending Leave Requests") navigate("/leave");
                  if (stat.title === "Active Job Vacancies") navigate("/jobs");
                  if (stat.title === "Performance Reviews") navigate("/performance");
                }}
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
          {/* Recent Employees */}
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-[#111827]">Recent Employees</h3>
                <p className="text-sm text-[#6B7280]">Recently joined team members</p>
              </div>
              <button
                onClick={() => navigate("/employees")}
                className="text-sm text-[#4F46E5] hover:text-[#4338CA]"
              >
                View All
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-sm">
                        {employee.avatar}
                      </div>
                      <div>
                        <h4 className="text-sm text-[#111827]">{employee.name}</h4>
                        <p className="text-xs text-[#6B7280]">
                          {employee.role} • {employee.department}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/employees/${employee.id}`)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Leave Requests */}
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-[#111827]">Pending Leave Requests</h3>
                <p className="text-sm text-[#6B7280]">Requests awaiting approval</p>
              </div>
              <button
                onClick={() => navigate("/leave")}
                className="text-sm text-[#4F46E5] hover:text-[#4338CA]"
              >
                View All
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentLeaveRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 bg-[#F9FAFB] rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm text-[#111827]">{request.employeeName}</h4>
                        <p className="text-xs text-[#6B7280]">{request.employeeId}</p>
                      </div>
                      <Badge variant="warning" size="sm">
                        Pending
                      </Badge>
                    </div>
                    <p className="text-sm text-[#6B7280] mb-2">{request.leaveType}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#6B7280]">
                        {request.startDate} - {request.endDate} ({request.days} days)
                      </p>
                      <button
                        onClick={() => navigate(`/leave/${request.id}`)}
                        className="text-xs text-[#4F46E5] hover:underline"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] lg:col-span-2">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-[#111827]">Quick Actions</h3>
              <p className="text-sm text-[#6B7280]">Common HR tasks</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate("/employees/new")}
                  className="flex items-center gap-3 p-4 bg-[#EEF2FF] rounded-lg hover:bg-[#E0E7FF] transition"
                >
                  <Users className="w-5 h-5 text-[#4F46E5]" />
                  <span className="text-sm text-[#4F46E5]">Add New Employee</span>
                </button>

                <button
                  onClick={() => navigate("/leave")}
                  className="flex items-center gap-3 p-4 bg-[#FEF3C7] rounded-lg hover:bg-[#FDE68A] transition"
                >
                  <CheckCircle className="w-5 h-5 text-[#F59E0B]" />
                  <span className="text-sm text-[#F59E0B]">Approve Leaves</span>
                </button>

                <button
                  onClick={() => navigate("/jobs/new")}
                  className="flex items-center gap-3 p-4 bg-[#DCFCE7] rounded-lg hover:bg-[#BBF7D0] transition"
                >
                  <Briefcase className="w-5 h-5 text-[#22C55E]" />
                  <span className="text-sm text-[#22C55E]">Post Job Vacancy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
