import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Filter, Edit, Trash2, Lock, Unlock, Mail, Shield, ArrowLeft, X, UserCircle, Phone, Calendar, Briefcase, AlertCircle, UserPlus, Users, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { employeesService, type EmployeeRecord } from "../../services/employees.service";
import { permissionsService, type AvailablePermissions } from "../../services/permissions.service";

type StatusFilter = "all" | "active" | "inactive";

export function UserManagement() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<AvailablePermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newPermissionLevel, setNewPermissionLevel] = useState<number>(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesRes, permissionsRes] = await Promise.all([
        employeesService.list({ per_page: 1000 }),
        permissionsService.getAvailablePermissions(),
      ]);
      setEmployees(employeesRes.data);
      setAvailablePermissions(permissionsRes);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.department?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === "all" || employee.status === selectedStatus;
    const matchesLevel = selectedLevel === "all" || String(employee.permission_level) === selectedLevel;

    return matchesSearch && matchesStatus && matchesLevel;
  });

  // Get counts
  const activeCount = employees.filter(e => e.status === "active").length;
  const inactiveCount = employees.filter(e => e.status === "inactive").length;

  // Handle permission level change
  const handleUpdatePermissionLevel = async () => {
    if (!selectedEmployee) return;

    setIsProcessing(true);
    try {
      await permissionsService.updatePermissionLevel(selectedEmployee.id, newPermissionLevel);
      await loadData();
      setShowPermissionModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Failed to update permission level:", error);
      alert("Failed to update permission level");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedEmployee) return;

    setIsProcessing(true);
    try {
      await employeesService.deactivate(selectedEmployee.id);
      await loadData();
      setShowDeleteModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Failed to deactivate employee:", error);
      alert("Failed to deactivate employee");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (employee: EmployeeRecord, newStatus: "active" | "inactive") => {
    try {
      await employeesService.update(employee.id, { status: newStatus });
      await loadData();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge color="green" icon="check-circle">
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge color="gray" icon="clock">
            Inactive
          </Badge>
        );
      default:
        return (
          <Badge color="gray" icon="clock">
            {status}
          </Badge>
        );
    }
  };

  // Get level badge
  const getLevelBadge = (level: number, levelName?: string) => {
    const colors = {
      1: "blue",
      2: "purple",
      3: "red",
    } as const;

    return (
      <Badge color={colors[level as keyof typeof colors] || "gray"} icon="shield">
        Level {level} - {levelName || "Unknown"}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#6B7280]">Loading employees...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">Employee Management</h1>
                <p className="text-sm text-[#6B7280]">{employees.length} total employees</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search employees..."
                  className="pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] w-64"
                />
              </div>
              <button
                onClick={() => navigate("/employees/create")}
                className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                Add Employee
              </button>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-xl p-4 text-white">
              <p className="text-sm text-indigo-100 mb-1">Total Employees</p>
              <p className="text-2xl">{employees.length}</p>
            </div>
            <div className="bg-[#DCFCE7] border border-green-200 rounded-xl p-4">
              <p className="text-sm text-[#22C55E] mb-1">Active</p>
              <p className="text-2xl text-[#22C55E]">{activeCount}</p>
            </div>
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4">
              <p className="text-sm text-[#6B7280] mb-1">Inactive</p>
              <p className="text-2xl text-[#111827]">{inactiveCount}</p>
            </div>
            <div className="bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-xl p-4">
              <p className="text-sm text-[#4F46E5] mb-1">Departments</p>
              <p className="text-2xl text-[#4F46E5]">
                {new Set(employees.filter(e => e.department?.name).map(e => e.department?.name)).size}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-[#6B7280]" />

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#6B7280]">Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
                className="px-3 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Permission Level Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#6B7280]">Level:</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="all">All Levels</option>
                <option value="1">Level 1 - Employee</option>
                <option value="2">Level 2 - HR</option>
                <option value="3">Level 3 - Administrator</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* User Table */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="text-left text-xs text-[#6B7280] px-6 py-4">Employee</th>
                      <th className="text-left text-xs text-[#6B7280] px-6 py-4">Contact</th>
                      <th className="text-left text-xs text-[#6B7280] px-6 py-4">Permission Level</th>
                      <th className="text-left text-xs text-[#6B7280] px-6 py-4">Department</th>
                      <th className="text-left text-xs text-[#6B7280] px-6 py-4">Status</th>
                      <th className="text-right text-xs text-[#6B7280] px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="w-12 h-12 text-gray-300" />
                            <p className="text-sm text-[#6B7280]">No employees found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-[#F9FAFB] transition">
                          {/* Employee */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm text-white font-medium">
                                  {employee.first_name[0]}{employee.last_name[0]}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm text-[#111827]">{employee.first_name} {employee.last_name}</p>
                                <p className="text-xs text-[#6B7280]">{employee.position || "N/A"}</p>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-[#111827]">
                                <Mail className="w-3.5 h-3.5 text-[#6B7280]" />
                                <span>{employee.email}</span>
                              </div>
                              {employee.phone && (
                                <div className="flex items-center gap-2 text-sm text-[#111827]">
                                  <Phone className="w-3.5 h-3.5 text-[#6B7280]" />
                                  <span>{employee.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Permission Level */}
                          <td className="px-6 py-4">
                            {getLevelBadge(employee.permission_level, employee.level_name)}
                          </td>

                          {/* Department */}
                          <td className="px-6 py-4">
                            <span className="text-sm text-[#111827]">{employee.department?.name || "N/A"}</span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            {getStatusBadge(employee.status || "active")}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setNewPermissionLevel(employee.permission_level);
                                  setShowPermissionModal(true);
                                }}
                                className="p-2 text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition"
                                title="Manage Permissions"
                              >
                                <Shield className="w-4 h-4" />
                              </button>
                              {employee.status === "active" ? (
                                <button
                                  onClick={() => handleStatusChange(employee, "inactive")}
                                  className="p-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition"
                                  title="Deactivate Employee"
                                >
                                  <Lock className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStatusChange(employee, "active")}
                                  className="p-2 text-[#22C55E] hover:bg-[#DCFCE7] rounded-lg transition"
                                  title="Activate Employee"
                                >
                                  <Unlock className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition"
                                title="Delete Employee"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Permission Management Modal */}
      {showPermissionModal && selectedEmployee && availablePermissions && (
        <PermissionManagementModal
          employee={selectedEmployee}
          availablePermissions={availablePermissions}
          newPermissionLevel={newPermissionLevel}
          setNewPermissionLevel={setNewPermissionLevel}
          isProcessing={isProcessing}
          onClose={() => {
            setShowPermissionModal(false);
            setSelectedEmployee(null);
          }}
          onUpdate={handleUpdatePermissionLevel}
          onReload={loadData}
        />
      )}

      {/* Delete Employee Modal */}
      {showDeleteModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-[#EF4444]" />
              </div>
              <div>
                <h3 className="text-lg text-[#111827]">Deactivate Employee</h3>
                <p className="text-sm text-[#6B7280]">This action will deactivate the employee</p>
              </div>
            </div>

            <p className="text-sm text-[#6B7280] mb-6">
              Are you sure you want to deactivate <strong>{selectedEmployee.first_name} {selectedEmployee.last_name}</strong>? They will no longer be able to access the system.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedEmployee(null);
                }}
                className="flex-1 px-4 py-2.5 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 bg-[#EF4444] text-white px-4 py-2.5 rounded-lg hover:bg-[#DC2626] transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Deactivate Employee
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

interface PermissionManagementModalProps {
  employee: EmployeeRecord;
  availablePermissions: AvailablePermissions;
  newPermissionLevel: number;
  setNewPermissionLevel: (level: number) => void;
  isProcessing: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onReload: () => void;
}

function PermissionManagementModal({
  employee,
  availablePermissions,
  newPermissionLevel,
  setNewPermissionLevel,
  isProcessing,
  onClose,
  onUpdate,
  onReload,
}: PermissionManagementModalProps) {
  const [activeTab, setActiveTab] = useState<"level" | "grant" | "revoke">("level");
  const [selectedPermission, setSelectedPermission] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleGrantPermission = async () => {
    if (!selectedPermission) return;

    setProcessing(true);
    try {
      await permissionsService.grantPermission(employee.id, selectedPermission);
      await onReload();
      setSelectedPermission("");
    } catch (error) {
      console.error("Failed to grant permission:", error);
      alert("Failed to grant permission");
    } finally {
      setProcessing(false);
    }
  };

  const handleRevokePermission = async () => {
    if (!selectedPermission) return;

    setProcessing(true);
    try {
      await permissionsService.revokePermission(employee.id, selectedPermission);
      await onReload();
      setSelectedPermission("");
    } catch (error) {
      console.error("Failed to revoke permission:", error);
      alert("Failed to revoke permission");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveGranted = async (permission: string) => {
    setProcessing(true);
    try {
      await permissionsService.removeGrantedPermission(employee.id, permission);
      await onReload();
    } catch (error) {
      console.error("Failed to remove granted permission:", error);
      alert("Failed to remove granted permission");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveRevoked = async (permission: string) => {
    setProcessing(true);
    try {
      await permissionsService.removeRevokedPermission(employee.id, permission);
      await onReload();
    } catch (error) {
      console.error("Failed to restore permission:", error);
      alert("Failed to restore permission");
    } finally {
      setProcessing(false);
    }
  };

  const levelPermissions = availablePermissions.levels[newPermissionLevel as 1 | 2 | 3]?.permissions || [];
  const customOverride = employee.custom_override || [];
  const revokedPermissions = employee.revoked_permissions || [];
  const effectivePermissions = employee.effective_permissions || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
        <div className="sticky top-0 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <h3 className="text-lg">Permission Management</h3>
                <p className="text-sm text-indigo-100">{employee.first_name} {employee.last_name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#E5E7EB] px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("level")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === "level"
                  ? "border-[#4F46E5] text-[#4F46E5]"
                  : "border-transparent text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Permission Level
            </button>
            <button
              onClick={() => setActiveTab("grant")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === "grant"
                  ? "border-[#4F46E5] text-[#4F46E5]"
                  : "border-transparent text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Grant Permissions
            </button>
            <button
              onClick={() => setActiveTab("revoke")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === "revoke"
                  ? "border-[#4F46E5] text-[#4F46E5]"
                  : "border-transparent text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Revoke Permissions
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Level Tab */}
          {activeTab === "level" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-[#111827] mb-2">Current Permission Level</label>
                <div className="px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-[#111827]">
                    <Shield className="w-4 h-4 text-[#6B7280]" />
                    Level {employee.permission_level} - {employee.level_name}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#111827] mb-2">
                  New Permission Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={newPermissionLevel}
                  onChange={(e) => setNewPermissionLevel(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value={1}>Level 1 - Employee</option>
                  <option value={2}>Level 2 - HR</option>
                  <option value={3}>Level 3 - Administrator</option>
                </select>
              </div>

              <div className="bg-[#F9FAFB] rounded-lg p-4">
                <p className="text-sm text-[#111827] font-medium mb-2">Permissions for Level {newPermissionLevel}:</p>
                <div className="space-y-1">
                  {levelPermissions.map((perm) => (
                    <div key={perm} className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                      {perm}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Grant Tab */}
          {activeTab === "grant" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-[#111827] mb-2">Grant Additional Permission</label>
                <div className="flex gap-2">
                  <select
                    value={selectedPermission}
                    onChange={(e) => setSelectedPermission(e.target.value)}
                    className="flex-1 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  >
                    <option value="">Select a permission</option>
                    {availablePermissions.permissions
                      .filter((p) => !effectivePermissions.includes(p))
                      .map((perm) => (
                        <option key={perm} value={perm}>
                          {perm}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleGrantPermission}
                    disabled={!selectedPermission || processing}
                    className="px-6 py-3 bg-[#22C55E] text-white rounded-lg hover:bg-[#16A34A] transition disabled:opacity-50"
                  >
                    {processing ? "Granting..." : "Grant"}
                  </button>
                </div>
              </div>

              {customOverride.length > 0 && (
                <div>
                  <p className="text-sm text-[#111827] font-medium mb-2">Currently Granted Permissions:</p>
                  <div className="space-y-2">
                    {customOverride.map((perm) => (
                      <div
                        key={perm}
                        className="flex items-center justify-between px-4 py-3 bg-[#DCFCE7] border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2 text-sm text-[#111827]">
                          <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                          {perm}
                        </div>
                        <button
                          onClick={() => handleRemoveGranted(perm)}
                          disabled={processing}
                          className="p-1 text-[#EF4444] hover:bg-[#FEF2F2] rounded transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Revoke Tab */}
          {activeTab === "revoke" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-[#111827] mb-2">Revoke Permission</label>
                <div className="flex gap-2">
                  <select
                    value={selectedPermission}
                    onChange={(e) => setSelectedPermission(e.target.value)}
                    className="flex-1 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  >
                    <option value="">Select a permission</option>
                    {effectivePermissions
                      .filter((p) => !revokedPermissions.includes(p))
                      .map((perm) => (
                        <option key={perm} value={perm}>
                          {perm}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleRevokePermission}
                    disabled={!selectedPermission || processing}
                    className="px-6 py-3 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition disabled:opacity-50"
                  >
                    {processing ? "Revoking..." : "Revoke"}
                  </button>
                </div>
              </div>

              {revokedPermissions.length > 0 && (
                <div>
                  <p className="text-sm text-[#111827] font-medium mb-2">Currently Revoked Permissions:</p>
                  <div className="space-y-2">
                    {revokedPermissions.map((perm) => (
                      <div
                        key={perm}
                        className="flex items-center justify-between px-4 py-3 bg-[#FEF2F2] border border-[#EF4444]/20 rounded-lg"
                      >
                        <div className="flex items-center gap-2 text-sm text-[#111827]">
                          <XCircle className="w-4 h-4 text-[#EF4444]" />
                          {perm}
                        </div>
                        <button
                          onClick={() => handleRemoveRevoked(perm)}
                          disabled={processing}
                          className="p-1 text-[#22C55E] hover:bg-[#DCFCE7] rounded transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Effective Permissions Summary */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <p className="text-sm text-[#111827] font-medium mb-2">Effective Permissions ({effectivePermissions.length}):</p>
            <div className="grid grid-cols-2 gap-2">
              {effectivePermissions.map((perm) => (
                <div key={perm} className="flex items-center gap-2 text-xs text-[#6B7280] px-3 py-2 bg-[#F9FAFB] rounded">
                  <CheckCircle className="w-3 h-3 text-[#22C55E]" />
                  {perm}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] p-6 flex gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
          >
            Close
          </button>
          {activeTab === "level" && (
            <button
              onClick={onUpdate}
              disabled={newPermissionLevel === employee.permission_level || isProcessing}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Update Level
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}