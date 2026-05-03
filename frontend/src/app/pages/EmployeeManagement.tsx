import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  MoreVertical,
  X,
  Upload,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "on-leave" | "inactive";
  avatar: string;
  joinDate: string;
}

export function EmployeeManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

  const employees: Employee[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      department: "Engineering",
      role: "Senior Developer",
      status: "active",
      avatar: "SJ",
      joinDate: "Jan 15, 2023",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@company.com",
      department: "Product",
      role: "Product Manager",
      status: "active",
      avatar: "MC",
      joinDate: "Mar 20, 2023",
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily.davis@company.com",
      department: "Design",
      role: "UX Designer",
      status: "on-leave",
      avatar: "ED",
      joinDate: "Feb 10, 2023",
    },
    {
      id: 4,
      name: "James Wilson",
      email: "james.wilson@company.com",
      department: "Human Resources",
      role: "HR Manager",
      status: "active",
      avatar: "JW",
      joinDate: "Dec 05, 2022",
    },
    {
      id: 5,
      name: "Lisa Anderson",
      email: "lisa.anderson@company.com",
      department: "Marketing",
      role: "Marketing Lead",
      status: "active",
      avatar: "LA",
      joinDate: "Apr 18, 2023",
    },
    {
      id: 6,
      name: "David Martinez",
      email: "david.martinez@company.com",
      department: "Engineering",
      role: "Backend Developer",
      status: "active",
      avatar: "DM",
      joinDate: "May 22, 2023",
    },
    {
      id: 7,
      name: "Jessica Lee",
      email: "jessica.lee@company.com",
      department: "Sales",
      role: "Sales Manager",
      status: "active",
      avatar: "JL",
      joinDate: "Jun 30, 2023",
    },
    {
      id: 8,
      name: "Robert Brown",
      email: "robert.brown@company.com",
      department: "Engineering",
      role: "Frontend Developer",
      status: "inactive",
      avatar: "RB",
      joinDate: "Aug 12, 2022",
    },
    {
      id: 9,
      name: "Amanda White",
      email: "amanda.white@company.com",
      department: "Finance",
      role: "Financial Analyst",
      status: "active",
      avatar: "AW",
      joinDate: "Sep 05, 2023",
    },
    {
      id: 10,
      name: "Christopher Taylor",
      email: "christopher.taylor@company.com",
      department: "Product",
      role: "Product Designer",
      status: "active",
      avatar: "CT",
      joinDate: "Oct 15, 2023",
    },
  ];

  const departments = ["All Departments", "Engineering", "Product", "Design", "Human Resources", "Marketing", "Sales", "Finance"];
  const statuses = ["All Statuses", "Active", "On Leave", "Inactive"];

  // Filter employees
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      filterDepartment === "all" ||
      employee.department.toLowerCase() === filterDepartment.toLowerCase();

    const matchesStatus =
      filterStatus === "all" ||
      employee.status.toLowerCase() === filterStatus.toLowerCase().replace(" ", "-");

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      console.log(`Deleting employee ${id}`);
      // In a real app, this would call an API
    }
  };

  const getStatusVariant = (status: string): "success" | "warning" | "danger" => {
    switch (status) {
      case "active":
        return "success";
      case "on-leave":
        return "warning";
      case "inactive":
        return "danger";
      default:
        return "success";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "active":
        return "Active";
      case "on-leave":
        return "On Leave";
      case "inactive":
        return "Inactive";
      default:
        return status;
    }
  };

  return (
    <AppLayout
      title="Employee Management"
      subtitle="Manage your team members and their information"
      userRole="hr"
      headerActions={
        <>
          <button
            onClick={() => navigate("/employees/import")}
            className="flex items-center gap-2 border border-[#E5E7EB] text-[#111827] px-4 py-2.5 rounded-lg hover:bg-[#F9FAFB] transition"
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Bulk Import</span>
          </button>
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
            onClick={() => navigate("/employees/new")}
          >
            <Plus className="w-5 h-5" />
            <span>Add Employee</span>
          </button>
        </>
      }
    >
      <div className="p-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB]">
          {/* Filters & Search */}
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                  <input
                    type="text"
                    placeholder="Search by name, email, department, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#6B7280]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Department Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowDepartmentFilter(!showDepartmentFilter);
                    setShowStatusFilter(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition text-sm min-w-[180px] justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-[#111827]">
                      {filterDepartment === "all" ? "All Departments" : filterDepartment}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                </button>

                {showDepartmentFilter && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10 overflow-hidden">
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => {
                          setFilterDepartment(dept === "All Departments" ? "all" : dept);
                          setShowDepartmentFilter(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#111827] hover:bg-[#F9FAFB] transition"
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowStatusFilter(!showStatusFilter);
                    setShowDepartmentFilter(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition text-sm min-w-[160px] justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#6B7280]" />
                    <span className="text-[#111827]">
                      {filterStatus === "all" ? "All Statuses" : filterStatus}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                </button>

                {showStatusFilter && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10 overflow-hidden">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status === "All Statuses" ? "all" : status);
                          setShowStatusFilter(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#111827] hover:bg-[#F9FAFB] transition"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-[#6B7280]">
                Showing <span className="text-[#111827]">{filteredEmployees.length}</span> of{" "}
                <span className="text-[#111827]">{employees.length}</span> employees
              </p>
              {(searchQuery || filterDepartment !== "all" || filterStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterDepartment("all");
                    setFilterStatus("all");
                  }}
                  className="text-sm text-[#4F46E5] hover:text-indigo-700 transition"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs text-[#6B7280] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-[#F9FAFB] transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                            {employee.avatar}
                          </div>
                          <div>
                            <p className="text-sm text-[#111827]">{employee.name}</p>
                            <p className="text-xs text-[#6B7280]">{employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">{employee.role}</td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(employee.status)} size="sm">
                          {getStatusLabel(employee.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">
                        {employee.joinDate}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/employees/${employee.id}`)}
                            className="p-2 text-[#6B7280] hover:bg-[#EEF2FF] hover:text-[#4F46E5] rounded-lg transition"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/employees/${employee.id}`)}
                            className="p-2 text-[#6B7280] hover:bg-[#ECFEFF] hover:text-blue-600 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(employee.id, employee.name)}
                            className="p-2 text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#EF4444] rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-12 h-12 text-gray-300" />
                        <p className="text-[#111827]">No employees found</p>
                        <p className="text-sm text-[#6B7280]">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredEmployees.length > 0 && (
            <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <button className="px-3 py-1.5 text-sm bg-[#EEF2FF]0 text-white rounded-lg">
                  1
                </button>
                <button className="px-3 py-1.5 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition">
                  2
                </button>
                <button className="px-3 py-1.5 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition">
                  3
                </button>
                <button className="px-3 py-1.5 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition">
                  Next
                </button>
              </div>
              <p className="text-sm text-[#6B7280]">
                Page <span className="text-[#111827]">1</span> of{" "}
                <span className="text-[#111827]">3</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}