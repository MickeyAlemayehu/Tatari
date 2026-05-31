import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { employeesService, type EmployeeRecord } from "../../services/employees.service";
import { departmentsService, type DepartmentRecord } from "../../services/departments.service";
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
  Save,
  X,
  User,
  Award,
  Laptop,
  CheckCircle,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { EmployeeCompensationSection } from "../components/EmployeeCompensationSection";

interface EmployeeLeaveHistoryView {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  approvedBy: string;
}

interface EmployeePerformanceView {
  selfEvaluation: number;
  peerEvaluation: number;
  managerEvaluation: number;
  finalScore: number;
  lastReviewDate: string;
}

interface EmployeeEquipmentView {
  id: number;
  name: string;
  category: string;
  serialNumber: string;
  assignedDate: string;
}

interface EditableProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  position: string;
  departmentId: string;
  status: "active" | "inactive";
}

interface EmployeeProfileView extends EditableProfile {
  id: number;
  department: string;
  joinDate: string;
  avatar: string;
  employeeId: string;
  reportingManager: string;
  leaveHistory: EmployeeLeaveHistoryView[];
  performance: EmployeePerformanceView;
  equipment: EmployeeEquipmentView[];
  deactivatedAt?: string | null;
}

function toFormDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function buildView(
  emp: EmployeeRecord,
  leaveHistory: EmployeeLeaveHistoryView[]
): EmployeeProfileView {
  const mgr = emp.manager ?? null;
  return {
    id: emp.id,
    firstName: emp.first_name,
    lastName: emp.last_name,
    email: emp.email,
    phone: emp.phone ?? "",
    dateOfBirth: toFormDate(emp.date_of_birth),
    address: emp.address ?? "",
    city: emp.city ?? "",
    state: emp.state ?? "",
    zipCode: emp.zip_code ?? "",
    position: emp.position,
    departmentId: emp.department?.id ? String(emp.department.id) : "",
    status: emp.status === "inactive" ? "inactive" : "active",
    department: emp.department?.name ?? "—",
    joinDate: emp.created_at ?? "",
    avatar: initials(emp.first_name, emp.last_name),
    employeeId: `EMP-${String(emp.id).padStart(3, "0")}`,
    reportingManager:
      mgr && mgr.first_name ? `${mgr.first_name} ${mgr.last_name ?? ""}`.trim() : "—",
    leaveHistory,
    performance: {
      selfEvaluation: 0,
      peerEvaluation: 0,
      managerEvaluation: 0,
      finalScore: 0,
      lastReviewDate: new Date().toISOString(),
    },
    equipment: [],
    deactivatedAt: emp.deactivated_at ?? null,
  };
}

export function EmployeeProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState<EmployeeProfileView | null>(null);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<EditableProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      employeesService.get(Number(id)),
      leaveService
        .list({ employee_id: Number(id), per_page: 20 })
        .catch(() => ({ data: [] as Array<{ id: number; leaveType?: string; type?: string; startDate: string; endDate: string; days: number; status: string }> })),
      departmentsService.list().catch(() => ({ data: [] as DepartmentRecord[] })),
    ])
      .then(([emp, leaveRes, deptRes]) => {
        if (cancelled) return;
        const leaveHistory: EmployeeLeaveHistoryView[] = leaveRes.data.map((r) => ({
          id: r.id,
          type: r.leaveType ?? r.type ?? "Leave",
          startDate: r.startDate,
          endDate: r.endDate,
          days: r.days,
          status: r.status,
          approvedBy: "—",
        }));
        setEmployee(buildView(emp, leaveHistory));
        setDepartments(deptRes.data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Failed to load employee.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const startEdit = () => {
    if (!employee) return;
    setDraft({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      dateOfBirth: employee.dateOfBirth,
      address: employee.address,
      city: employee.city,
      state: employee.state,
      zipCode: employee.zipCode,
      position: employee.position,
      departmentId: employee.departmentId,
      status: employee.status,
    });
    setFieldErrors({});
    setSaveError(null);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft(null);
    setFieldErrors({});
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!employee || !draft) return;
    setSaving(true);
    setSaveError(null);
    setFieldErrors({});
    try {
      const updated = await employeesService.update(employee.id, {
        first_name: draft.firstName.trim(),
        last_name: draft.lastName.trim(),
        email: draft.email.trim(),
        position: draft.position.trim(),
        department_id: draft.departmentId ? Number(draft.departmentId) : null,
        status: draft.status,
        phone: draft.phone.trim() || null,
        date_of_birth: draft.dateOfBirth || null,
        address: draft.address.trim() || null,
        city: draft.city.trim() || null,
        state: draft.state.trim() || null,
        zip_code: draft.zipCode.trim() || null,
      });
      setEmployee(buildView(updated, employee.leaveHistory));
      setIsEditing(false);
      setDraft(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setSaveError(err.message);
        if (err.errors) setFieldErrors(err.errors);
      } else {
        setSaveError("Failed to update employee.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || error || !employee) {
    return (
      <AppLayout title="Employee Profile" subtitle="View employee details">
        <AsyncState loading={loading} error={error} empty={!employee && !loading && !error} />
      </AppLayout>
    );
  }

  const fieldError = (key: string): string | null => fieldErrors[key]?.[0] ?? null;

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
                {employee.firstName} {employee.lastName}
              </span>
            </div>
          </div>

          {saveSuccess && (
            <div className="mb-4 p-4 bg-[#DCFCE7] border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#22C55E]">Employee profile updated successfully.</p>
            </div>
          )}

          {saveError && (
            <div className="mb-4 p-4 bg-[#FEF2F2] border border-[#EF4444]/20 rounded-lg text-sm text-[#EF4444]">
              {saveError}
            </div>
          )}

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
                      {employee.firstName} {employee.lastName}
                    </h2>
                    <Badge variant={employee.status === "active" ? "success" : "warning"}>
                      {employee.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {employee.status === "inactive" && employee.deactivatedAt && (
                    <div className="mb-3 p-2 bg-[#FEF2F2] border border-[#EF4444]/20 rounded-lg flex items-center gap-2">
                      <X className="w-4 h-4 text-[#EF4444]" />
                      <span className="text-sm text-[#EF4444]">
                        Not working anymore • Fired on {formatDate(employee.deactivatedAt)}
                      </span>
                    </div>
                  )}
                  <p className="text-[#6B7280] mb-4">
                    {employee.position} • {employee.department}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Mail className="w-4 h-4" />
                      {employee.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Phone className="w-4 h-4" />
                      {employee.phone || "—"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Calendar className="w-4 h-4" />
                      Joined {formatDate(employee.joinDate)}
                    </div>
                  </div>
                </div>
              </div>

              {!isEditing ? (
                <button
                  onClick={startEdit}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-[#111827]">Personal Information</h3>
              </div>

              {isEditing && draft ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#6B7280] mb-1">First Name</label>
                      <input
                        type="text"
                        value={draft.firstName}
                        onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
                        className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                      />
                      {fieldError("first_name") && (
                        <p className="mt-1 text-xs text-[#EF4444]">{fieldError("first_name")}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-[#6B7280] mb-1">Last Name</label>
                      <input
                        type="text"
                        value={draft.lastName}
                        onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
                        className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                      />
                      {fieldError("last_name") && (
                        <p className="mt-1 text-xs text-[#EF4444]">{fieldError("last_name")}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Email</label>
                    <input
                      type="email"
                      value={draft.email}
                      onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                    />
                    {fieldError("email") && (
                      <p className="mt-1 text-xs text-[#EF4444]">{fieldError("email")}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Phone</label>
                    <input
                      type="tel"
                      value={draft.phone}
                      onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                    />
                    {fieldError("phone") && (
                      <p className="mt-1 text-xs text-[#EF4444]">{fieldError("phone")}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={draft.dateOfBirth}
                      onChange={(e) => setDraft({ ...draft, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                    />
                    {fieldError("date_of_birth") && (
                      <p className="mt-1 text-xs text-[#EF4444]">{fieldError("date_of_birth")}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Address</label>
                    <input
                      type="text"
                      value={draft.address}
                      onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-[#6B7280] mb-1">City</label>
                      <input
                        type="text"
                        value={draft.city}
                        onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                        className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#6B7280] mb-1">State</label>
                      <input
                        type="text"
                        value={draft.state}
                        onChange={(e) => setDraft({ ...draft, state: e.target.value })}
                        className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#6B7280] mb-1">ZIP Code</label>
                      <input
                        type="text"
                        value={draft.zipCode}
                        onChange={(e) => setDraft({ ...draft, zipCode: e.target.value })}
                        className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Employee ID</p>
                    <p className="text-sm text-[#111827]">{employee.employeeId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Phone</p>
                    <p className="text-sm text-[#111827]">{employee.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Date of Birth</p>
                    <p className="text-sm text-[#111827]">
                      {employee.dateOfBirth
                        ? new Date(employee.dateOfBirth).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Address</p>
                    <p className="text-sm text-[#111827]">
                      {[employee.address, employee.city, employee.state, employee.zipCode]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Employment Details */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-[#111827]">Employment Details</h3>
              </div>

              {isEditing && draft ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Department</label>
                    <select
                      value={draft.departmentId}
                      onChange={(e) => setDraft({ ...draft, departmentId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                    >
                      <option value="">Unassigned</option>
                      {departments.map((d) => (
                        <option key={d.id} value={String(d.id)}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    {fieldError("department_id") && (
                      <p className="mt-1 text-xs text-[#EF4444]">{fieldError("department_id")}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Position</label>
                    <input
                      type="text"
                      value={draft.position}
                      onChange={(e) => setDraft({ ...draft, position: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                    />
                    {fieldError("position") && (
                      <p className="mt-1 text-xs text-[#EF4444]">{fieldError("position")}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Status</label>
                    <select
                      value={draft.status}
                      onChange={(e) =>
                        setDraft({ ...draft, status: e.target.value as "active" | "inactive" })
                      }
                      className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Reporting Manager</p>
                    <p className="text-sm text-[#111827]">{employee.reportingManager}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Department</p>
                    <p className="text-sm text-[#111827]">{employee.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Position</p>
                    <p className="text-sm text-[#111827]">{employee.position}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Reporting Manager</p>
                    <p className="text-sm text-[#111827]">{employee.reportingManager}</p>
                  </div>
                </div>
              )}
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
                {employee.leaveHistory.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">No leave history.</p>
                ) : (
                  employee.leaveHistory.map((leave) => (
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
                  ))
                )}
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
              {employee.equipment.length === 0 ? (
                <p className="text-sm text-[#6B7280]">No equipment assigned.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {employee.equipment.map((item) => (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
