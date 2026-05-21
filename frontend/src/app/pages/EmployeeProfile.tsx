import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { employeesService } from "../../services/employees.service";
import { leaveService } from "../../services/leave.service";
import { ApiError } from "../../lib/api";
import { initials, formatDate } from "../../lib/utils";
import { AsyncState } from "../components/AsyncState";
import {
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Edit,
  User,
  Award,
  Laptop,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { EmployeeCompensationSection } from "../components/EmployeeCompensationSection";


export function EmployeeProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      employeesService.get(Number(id)),
      leaveService.list({ employee_id: Number(id), per_page: 20 }).catch(() => ({ data: [] })),
    ])
      .then(([emp, leaveRes]) => {
        const leaveHistory = leaveRes.data.map((r) => ({
            id: r.id,
            type: r.leaveType ?? r.type,
            startDate: r.startDate,
            endDate: r.endDate,
            days: r.days,
            status: r.status,
            approvedBy: "—",
          }));
        const mgr = emp.manager as { first_name?: string; last_name?: string } | undefined;
        setEmployee({
          id: emp.id,
          firstName: emp.first_name,
          lastName: emp.last_name,
          email: emp.email,
          phone: "—",
          dateOfBirth: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          department: emp.department?.name ?? "—",
          role: emp.position,
          status: emp.status === "inactive" ? "inactive" : "active",
          joinDate: emp.created_at,
          avatar: initials(emp.first_name, emp.last_name),
          employeeId: `EMP-${String(emp.id).padStart(3, "0")}`,
          reportingManager: mgr ? `${mgr.first_name} ${mgr.last_name}` : "—",
          leaveHistory,
          performance: {
            selfEvaluation: 0,
            peerEvaluation: 0,
            managerEvaluation: 0,
            finalScore: 0,
            lastReviewDate: new Date().toISOString(),
          },
          equipment: [],
        });
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load employee.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || error || !employee) {
    return (
      <AppLayout title="Employee Profile" subtitle="View employee details">
        <AsyncState loading={loading} error={error} empty={!employee && !loading && !error} />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Employee Profile" subtitle="View employee details">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <button
                onClick={() => navigate("/hr/dashboard")}
                className="hover:text-[#4F46E5] transition"
              >
                Dashboard
              </button>
              <span>/</span>
              <button
                onClick={() => navigate("/employees")}
                className="hover:text-[#4F46E5] transition"
              >
                Employees
              </button>
              <span>/</span>
              <span className="text-[#111827]">
                {String(employee.firstName)} {String(employee.lastName)}
              </span>
            </div>
          </div>

          {/* Profile Header Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">
                  {employee.avatar}
                </div>

                {/* Basic Info */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl text-[#111827]">
                      {String(employee.firstName)} {String(employee.lastName)}
                    </h2>
                    <Badge variant={employee.status === "active" ? "success" : "warning"}>
                      {employee.status === "active" ? "Active" : "On Leave"}
                    </Badge>
                  </div>
                  <p className="text-[#6B7280] mb-4">
                    {employee.role} • {employee.department}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Mail className="w-4 h-4" />
                      {employee.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Phone className="w-4 h-4" />
                      {employee.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(employee.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/employees/${employee.id}/edit`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-[#111827]">Personal Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Employee ID</p>
                  <p className="text-sm text-[#111827]">{employee.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Date of Birth</p>
                  <p className="text-sm text-[#111827]">
                    {employee.dateOfBirth
                      ? new Date(String(employee.dateOfBirth)).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Address</p>
                  <p className="text-sm text-[#111827]">
                    {employee.address}, {employee.city}, {employee.state} {employee.zipCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-[#111827]">Employment Details</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Department</p>
                  <p className="text-sm text-[#111827]">{employee.department}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Position</p>
                  <p className="text-sm text-[#111827]">{employee.role}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Reporting Manager</p>
                  <p className="text-sm text-[#111827]">{employee.reportingManager}</p>
                </div>
              </div>
            </div>

            {/* Leave History */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#4F46E5]" />
                  <h3 className="text-[#111827]">Leave History</h3>
                </div>
                <button
                  onClick={() => navigate("/leave")}
                  className="text-sm text-[#4F46E5] hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {employee.leaveHistory.map((leave: any) => (
                  <div
                    key={leave.id}
                    className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-[#111827]">{leave.type}</p>
                      <Badge
                        variant={
                          leave.status === "approved"
                            ? "success"
                            : leave.status === "rejected"
                            ? "danger"
                            : "warning"
                        }
                        size="sm"
                      >
                        {leave.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      {new Date(leave.startDate).toLocaleDateString()} -{" "}
                      {new Date(leave.endDate).toLocaleDateString()} ({leave.days} days)
                    </p>
                    {leave.approvedBy && (
                      <p className="text-xs text-[#6B7280] mt-1">Approved by {leave.approvedBy}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Evaluation */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-[#4F46E5]" />
                  <h3 className="text-[#111827]">Performance Evaluation</h3>
                </div>
                <button
                  onClick={() => navigate("/performance")}
                  className="text-sm text-[#4F46E5] hover:underline"
                >
                  View Details
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#6B7280]">Self Evaluation</p>
                    <p className="text-sm text-[#111827]">{employee.performance.selfEvaluation}/5.0</p>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] h-2 rounded-full"
                      style={{
                        width: `${(employee.performance.selfEvaluation / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#6B7280]">Peer Evaluation</p>
                    <p className="text-sm text-[#111827]">{employee.performance.peerEvaluation}/5.0</p>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#06B6D4] to-[#06B6D4] h-2 rounded-full"
                      style={{
                        width: `${(employee.performance.peerEvaluation / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#6B7280]">Manager Evaluation</p>
                    <p className="text-sm text-[#111827]">
                      {employee.performance.managerEvaluation}/5.0
                    </p>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#22C55E] to-[#22C55E] h-2 rounded-full"
                      style={{
                        width: `${(employee.performance.managerEvaluation / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#111827]">Final Score</p>
                    <p className="text-lg text-[#4F46E5]">{employee.performance.finalScore}/5.0</p>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Last reviewed:{" "}
                    {new Date(employee.performance.lastReviewDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {id && <EmployeeCompensationSection employeeId={Number(id)} />}

            {/* Assigned Equipment */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Laptop className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-[#111827]">Assigned Equipment</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {employee.equipment.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-lg flex items-center justify-center">
                        <Laptop className="w-5 h-5 text-white" />
                      </div>
                      <Badge variant="success" size="sm">
                        Active
                      </Badge>
                    </div>
                    <h4 className="text-sm text-[#111827] mb-1">{item.name}</h4>
                    <p className="text-xs text-[#6B7280] mb-2">{item.category}</p>
                    <p className="text-xs text-[#6B7280] font-mono">{item.serialNumber}</p>
                    <p className="text-xs text-[#6B7280] mt-2">
                      Assigned: {new Date(item.assignedDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
