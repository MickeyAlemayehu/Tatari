import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  Clock,
  Award,
  Briefcase,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Detect role from URL path
  const currentRole = location.pathname.startsWith("/employee/")
    ? "employee"
    : location.pathname.startsWith("/admin")
    ? "admin"
    : "hr";

  const stats = [
    {
      title: "Total Employees",
      value: "248",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "indigo",
    },
    {
      title: "Present Today",
      value: "231",
      change: "93%",
      trend: "neutral",
      icon: UserCheck,
      color: "green",
    },
    {
      title: "On Leave",
      value: "12",
      change: "-8%",
      trend: "down",
      icon: Calendar,
      color: "amber",
    },
    {
      title: "New Hires",
      value: "8",
      change: "+4",
      trend: "up",
      icon: TrendingUp,
      color: "purple",
    },
  ];

  const recentEmployees = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Senior Developer",
      department: "Engineering",
      status: "active",
      avatar: "SJ",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Product Manager",
      department: "Product",
      status: "active",
      avatar: "MC",
    },
    {
      id: 3,
      name: "Emily Davis",
      role: "UX Designer",
      department: "Design",
      status: "on-leave",
      avatar: "ED",
    },
    {
      id: 4,
      name: "James Wilson",
      role: "HR Manager",
      department: "Human Resources",
      status: "active",
      avatar: "JW",
    },
    {
      id: 5,
      name: "Lisa Anderson",
      role: "Marketing Lead",
      department: "Marketing",
      status: "active",
      avatar: "LA",
    },
  ];

  const upcomingLeaves = [
    {
      id: 1,
      employee: "John Doe",
      type: "Annual Leave",
      dates: "Mar 25 - Mar 29",
      status: "approved",
    },
    {
      id: 2,
      employee: "Jane Smith",
      type: "Sick Leave",
      dates: "Mar 22",
      status: "pending",
    },
    {
      id: 3,
      employee: "Robert Brown",
      type: "Personal Leave",
      dates: "Mar 28 - Mar 30",
      status: "approved",
    },
  ];

  const getUserName = () => {
    // In a real app, this would come from authentication
    return currentRole === "employee"
      ? "John Doe"
      : currentRole === "admin"
      ? "Admin"
      : "HR Manager";
  };

  return (
    <AppLayout title="Dashboard" subtitle={`Welcome back, ${getUserName()}`}>
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorClasses = {
              indigo: "bg-[#EEF2FF] text-[#4F46E5]",
              green: "bg-[#DCFCE7] text-[#22C55E]",
              amber: "bg-[#FFFBEB] text-[#F59E0B]",
              purple: "bg-[#EEF2FF] text-[#4F46E5]",
            };

            return (
              <div
                key={stat.title}
                className="bg-white rounded-xl p-6 border border-[#E5E7EB] hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-sm ${
                      stat.trend === "up"
                        ? "text-[#22C55E]"
                        : stat.trend === "down"
                        ? "text-[#EF4444]"
                        : "text-[#6B7280]"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl mb-1 text-[#111827]">{stat.value}</h3>
                <p className="text-sm text-[#6B7280]">{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Employees Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB]">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-[#111827]">Recent Employees</h3>
              <p className="text-sm text-[#6B7280]">Latest employee records</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-[#F9FAFB] transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-sm">
                            {employee.avatar}
                          </div>
                          <div>
                            <p className="text-sm text-[#111827]">{employee.name}</p>
                            <p className="text-xs text-[#6B7280]">{employee.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={employee.status === "active" ? "success" : "warning"}
                          size="sm"
                        >
                          {employee.status === "active" ? "Active" : "On Leave"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-sm text-[#4F46E5] hover:text-indigo-700 transition">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Leaves */}
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-[#111827]">Upcoming Leaves</h3>
              <p className="text-sm text-[#6B7280]">Pending & approved requests</p>
            </div>
            <div className="p-6 space-y-4">
              {upcomingLeaves.map((leave) => (
                <div key={leave.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-[#111827]">{leave.employee}</p>
                      <p className="text-xs text-[#6B7280]">{leave.type}</p>
                    </div>
                    <Badge
                      variant={leave.status === "approved" ? "success" : "warning"}
                      size="sm"
                    >
                      {leave.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <Clock className="w-3 h-3" />
                    {leave.dates}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-[#E5E7EB]">
              <button className="w-full text-sm text-[#4F46E5] hover:text-indigo-700 transition">
                View All Requests
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}