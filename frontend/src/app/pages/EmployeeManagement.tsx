import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  Upload,
  X,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { AsyncState } from "../components/AsyncState";
import { employeesService, type EmployeeRecord } from "../../services/employees.service";
import { departmentsService } from "../../services/departments.service";
import { ApiError } from "../../lib/api";
import { formatDate, initials } from "../../lib/utils";

interface EmployeeRow {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive";
  avatar: string;
  joinDate: string;
}

function mapEmployee(e: EmployeeRecord): EmployeeRow {
  return {
    id: e.id,
    name: `${e.first_name} ${e.last_name}`,
    email: e.email,
    department: e.department?.name ?? "—",
    role: e.position ?? "—",
    status: e.status === "inactive" ? "inactive" : "active",
    avatar: initials(e.first_name, e.last_name),
    joinDate: formatDate(e.created_at),
  };
}

export function EmployeeManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [departmentNames, setDepartmentNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, deptRes] = await Promise.all([
        employeesService.list({ per_page: 100 }),
        departmentsService.list(),
      ]);
      setEmployees(empRes.data.map(mapEmployee));
      setDepartmentNames(deptRes.data.map((d) => d.name));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const departments = ["All Departments", ...departmentNames];
  const statuses = ["All Statuses", "Active", "Inactive"];

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
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
        employee.status === filterStatus.toLowerCase();

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, searchQuery, filterDepartment, filterStatus]);

  const handleDeactivate = async (id: number, name: string) => {
    if (!confirm(`Deactivate ${name}?`)) return;
    try {
      await employeesService.deactivate(id);
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to deactivate employee.");
    }
  };

  const getStatusVariant = (status: string): "success" | "warning" | "danger" => {
    return status === "active" ? "success" : "danger";
  };

  return (
    <AppLayout
      title="Employee Management"
      subtitle="Manage your team members and their information"
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
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex flex-col md:flex-row gap-4">
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowDepartmentFilter(!showDepartmentFilter);
                    setShowStatusFilter(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm min-w-[180px] justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#6B7280]" />
                    <span>{filterDepartment === "all" ? "All Departments" : filterDepartment}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                </button>
                {showDepartmentFilter && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10">
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => {
                          setFilterDepartment(dept === "All Departments" ? "all" : dept);
                          setShowDepartmentFilter(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#F9FAFB]"
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowStatusFilter(!showStatusFilter);
                    setShowDepartmentFilter(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm min-w-[160px] justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#6B7280]" />
                    <span>{filterStatus === "all" ? "All Statuses" : filterStatus}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                </button>
                {showStatusFilter && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status === "All Statuses" ? "all" : status);
                          setShowStatusFilter(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#F9FAFB]"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="mt-4 text-sm text-[#6B7280]">
              Showing {filteredEmployees.length} of {employees.length} employees
            </p>
          </div>

          <AsyncState loading={loading} error={error} empty={!loading && filteredEmployees.length === 0}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase">Join Date</th>
                    <th className="px-6 py-3 text-right text-xs text-[#6B7280] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-[#F9FAFB]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-sm">
                            {employee.avatar}
                          </div>
                          <div>
                            <p className="text-sm text-[#111827]">{employee.name}</p>
                            <p className="text-xs text-[#6B7280]">{employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">{employee.department}</td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">{employee.role}</td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(employee.status)} size="sm">
                          {employee.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">{employee.joinDate}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/employees/${employee.id}`)}
                            className="p-2 text-[#6B7280] hover:bg-[#EEF2FF] hover:text-[#4F46E5] rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/employees/${employee.id}`)}
                            className="p-2 text-[#6B7280] hover:bg-[#ECFEFF] hover:text-blue-600 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {employee.status === "active" && (
                            <button
                              onClick={() => handleDeactivate(employee.id, employee.name)}
                              className="p-2 text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#EF4444] rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AsyncState>
        </div>
      </div>
    </AppLayout>
  );
}
