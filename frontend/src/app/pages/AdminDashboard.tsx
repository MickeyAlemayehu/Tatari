import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Shield, Users, Search, CheckCircle, XCircle, Lock, Unlock, Mail, Phone, Plus, ArrowLeft } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { employeesService, type EmployeeRecord } from "../../services/employees.service";
import { permissionsService, type AvailablePermissions } from "../../services/permissions.service";

export function AdminDashboard() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<AvailablePermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

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

  const reloadEmployees = async (): Promise<EmployeeRecord[]> => {
    const employeesRes = await employeesService.list({ per_page: 1000 });
    setEmployees(employeesRes.data);
    return employeesRes.data;
  };

  const handleSelectEmployee = (employee: EmployeeRecord) => {
    setSelectedEmployee(employee);
  };

  const handleUpdatePermissionLevel = async (newLevel: number) => {
    if (!selectedEmployee) return;

    try {
      const result = await permissionsService.updatePermissionLevel(selectedEmployee.id, newLevel);
      const updatedEmployees = await reloadEmployees();
      // Use the response data merged with the full employee record
      const fullEmployee = updatedEmployees.find(e => e.id === selectedEmployee.id);
      if (fullEmployee) setSelectedEmployee(fullEmployee);
    } catch (error) {
      console.error("Failed to update permission level:", error);
      alert("Failed to update permission level");
    }
  };

  const handleGrantPermission = async (permission: string) => {
    if (!selectedEmployee) return;

    try {
      await permissionsService.grantPermission(selectedEmployee.id, permission);
      const updatedEmployees = await reloadEmployees();
      const fullEmployee = updatedEmployees.find(e => e.id === selectedEmployee.id);
      if (fullEmployee) setSelectedEmployee(fullEmployee);
    } catch (error) {
      console.error("Failed to grant permission:", error);
      alert("Failed to grant permission");
    }
  };

  const handleRevokePermission = async (permission: string) => {
    if (!selectedEmployee) return;

    try {
      await permissionsService.revokePermission(selectedEmployee.id, permission);
      const updatedEmployees = await reloadEmployees();
      const fullEmployee = updatedEmployees.find(e => e.id === selectedEmployee.id);
      if (fullEmployee) setSelectedEmployee(fullEmployee);
    } catch (error) {
      console.error("Failed to revoke permission:", error);
      alert("Failed to revoke permission");
    }
  };

  const handleRemoveGranted = async (permission: string) => {
    if (!selectedEmployee) return;

    try {
      await permissionsService.removeGrantedPermission(selectedEmployee.id, permission);
      const updatedEmployees = await reloadEmployees();
      const fullEmployee = updatedEmployees.find(e => e.id === selectedEmployee.id);
      if (fullEmployee) setSelectedEmployee(fullEmployee);
    } catch (error) {
      console.error("Failed to remove granted permission:", error);
      alert("Failed to remove granted permission");
    }
  };

  const handleRemoveRevoked = async (permission: string) => {
    if (!selectedEmployee) return;

    try {
      await permissionsService.removeRevokedPermission(selectedEmployee.id, permission);
      const updatedEmployees = await reloadEmployees();
      const fullEmployee = updatedEmployees.find(e => e.id === selectedEmployee.id);
      if (fullEmployee) setSelectedEmployee(fullEmployee);
    } catch (error) {
      console.error("Failed to restore permission:", error);
      alert("Failed to restore permission");
    }
  };

  const handleStatusChange = async (employee: EmployeeRecord, newStatus: "active" | "inactive") => {
    try {
      await employeesService.update(employee.id, { status: newStatus });
      const updatedEmployees = await reloadEmployees();
      if (selectedEmployee?.id === employee.id) {
        const fullEmployee = updatedEmployees.find(e => e.id === employee.id);
        if (fullEmployee) setSelectedEmployee(fullEmployee);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.department?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel = selectedLevel === "all" || String(employee.permission_level) === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  const levelNames: Record<number, string> = {
    1: "Employee",
    2: "HR",
    3: "Administrator",
  };

  const getLevelBadge = (level: number, levelName?: string) => {
    const colors = {
      1: "blue",
      2: "purple",
      3: "red",
    } as const;

    const displayName = levelName || levelNames[level] || "Unknown";

    return (
      <Badge color={colors[level as keyof typeof colors] || "gray"} icon={<Shield className="w-3 h-3" />}>
        Level {level} - {displayName}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge color="green" icon="check-circle">Active</Badge>;
      case "inactive":
        return <Badge color="gray" icon="clock">Inactive</Badge>;
      default:
        return <Badge color="gray" icon="clock">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#6B7280]">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-screen overflow-hidden">
        {/* Left Panel - Employee List */}
        <div className="w-1/3 border-r border-[#E5E7EB] flex flex-col bg-white">
          {/* Header */}
          <div className="p-6 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">Admin Panel</h1>
                <p className="text-sm text-[#6B7280]">Employee & Permission Management</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employees..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              <option value="all">All Levels</option>
              <option value="1">Level 1 - Employee</option>
              <option value="2">Level 2 - HR</option>
              <option value="3">Level 3 - Administrator</option>
            </select>
          </div>

          {/* Employee List */}
          <div className="flex-1 overflow-y-auto">
            {filteredEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Users className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-[#6B7280]">No employees found</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {filteredEmployees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => handleSelectEmployee(employee)}
                    className={`w-full p-4 text-left hover:bg-[#F9FAFB] transition ${
                      selectedEmployee?.id === employee.id ? "bg-[#EEF2FF] border-l-4 border-[#4F46E5]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm text-white font-medium">
                          {employee.first_name[0]}{employee.last_name[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#111827] font-medium truncate">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-xs text-[#6B7280] truncate">{employee.position || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getLevelBadge(employee.permission_level, employee.level_name)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stats Footer */}
          <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-[#6B7280]">Total</p>
                <p className="text-lg font-semibold text-[#111827]">{employees.length}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Active</p>
                <p className="text-lg font-semibold text-[#22C55E]">
                  {employees.filter(e => e.status === "active").length}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Inactive</p>
                <p className="text-lg font-semibold text-[#6B7280]">
                  {employees.filter(e => e.status === "inactive").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Employee Details & Permissions */}
        <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
          {!selectedEmployee ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <Shield className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg text-[#111827] mb-2">Select an Employee</h3>
              <p className="text-sm text-[#6B7280]">Choose an employee from the list to manage their permissions</p>
            </div>
          ) : (
            <EmployeePermissionPanel
              employee={selectedEmployee}
              availablePermissions={availablePermissions}
              onUpdateLevel={handleUpdatePermissionLevel}
              onGrantPermission={handleGrantPermission}
              onRevokePermission={handleRevokePermission}
              onRemoveGranted={handleRemoveGranted}
              onRemoveRevoked={handleRemoveRevoked}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

interface EmployeePermissionPanelProps {
  employee: EmployeeRecord;
  availablePermissions: AvailablePermissions | null;
  onUpdateLevel: (level: number) => Promise<void>;
  onGrantPermission: (permission: string) => Promise<void>;
  onRevokePermission: (permission: string) => Promise<void>;
  onRemoveGranted: (permission: string) => Promise<void>;
  onRemoveRevoked: (permission: string) => Promise<void>;
  onStatusChange: (employee: EmployeeRecord, status: "active" | "inactive") => Promise<void>;
}

function EmployeePermissionPanel({
  employee,
  availablePermissions,
  onUpdateLevel,
  onGrantPermission,
  onRevokePermission,
  onRemoveGranted,
  onRemoveRevoked,
  onStatusChange,
}: EmployeePermissionPanelProps) {
  const [grantPermission, setGrantPermission] = useState("");
  const [revokePermission, setRevokePermission] = useState("");
  const [processing, setProcessing] = useState(false);
  const [newLevel, setNewLevel] = useState(employee.permission_level);

  // Reset level selector when switching employees
  useEffect(() => {
    setNewLevel(employee.permission_level);
    setGrantPermission("");
    setRevokePermission("");
  }, [employee.id, employee.permission_level]);

  // Normalize custom_override to always be a string array
  const normalizeOverrides = (override: string[] | Record<string, boolean> | null | undefined): string[] => {
    if (!override) return [];
    if (Array.isArray(override)) return override;
    // Handle {permission: true} format
    return Object.entries(override).filter(([, v]) => v === true).map(([k]) => k);
  };

  const customOverride = normalizeOverrides(employee.custom_override);
  const revokedPermissions = employee.revoked_permissions || [];
  const effectivePermissions = employee.effective_permissions || [];

  const handleUpdateLevel = async () => {
    if (newLevel === employee.permission_level) return;
    setProcessing(true);
    try {
      await onUpdateLevel(newLevel);
    } finally {
      setProcessing(false);
    }
  };

  const handleGrant = async () => {
    if (!grantPermission) return;
    setProcessing(true);
    try {
      await onGrantPermission(grantPermission);
      setGrantPermission("");
    } finally {
      setProcessing(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokePermission) return;
    setProcessing(true);
    try {
      await onRevokePermission(revokePermission);
      setRevokePermission("");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Employee Header */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center">
              <span className="text-xl text-white font-medium">
                {employee.first_name[0]}{employee.last_name[0]}
              </span>
            </div>
            <div>
              <h2 className="text-xl text-[#111827] font-semibold">
                {employee.first_name} {employee.last_name}
              </h2>
              <p className="text-sm text-[#6B7280]">{employee.position || "N/A"}</p>
            </div>
          </div>
          <button
            onClick={() => onStatusChange(employee, employee.status === "active" ? "inactive" : "active")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              employee.status === "active"
                ? "bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2]"
                : "bg-[#DCFCE7] text-[#22C55E] hover:bg-[#BBF7D0]"
            }`}
          >
            {employee.status === "active" ? (
              <>
                <Lock className="w-4 h-4" />
                Deactivate
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                Activate
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Mail className="w-4 h-4" />
            {employee.email}
          </div>
          {employee.phone && (
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <Phone className="w-4 h-4" />
              {employee.phone}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Users className="w-4 h-4" />
            {employee.department?.name || "No Department"}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Shield className="w-4 h-4" />
            Level {employee.permission_level} - {employee.level_name || (employee.permission_level === 1 ? "Employee" : employee.permission_level === 2 ? "HR" : "Administrator")}
          </div>
        </div>
      </div>

      {/* Permission Level */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <h3 className="text-base text-[#111827] font-semibold mb-4">Permission Level</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#6B7280] mb-2">Change Permission Level</label>
            <div className="flex gap-2">
              <select
                value={newLevel}
                onChange={(e) => setNewLevel(Number(e.target.value))}
                className="flex-1 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value={1}>Level 1 - Employee</option>
                <option value={2}>Level 2 - HR</option>
                <option value={3}>Level 3 - Administrator</option>
              </select>
              <button
                onClick={handleUpdateLevel}
                disabled={newLevel === employee.permission_level || processing}
                className="px-6 py-3 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition disabled:opacity-50"
              >
                {processing ? "Updating..." : "Update"}
              </button>
            </div>
          </div>

          {availablePermissions && (
            <div className="p-4 bg-[#F9FAFB] rounded-lg">
              <p className="text-sm text-[#111827] font-medium mb-2">
                Level {newLevel} Base Permissions:
              </p>
              <div className="space-y-1">
                {availablePermissions.levels[newLevel as 1 | 2 | 3]?.permissions.map((perm) => (
                  <div key={perm} className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                    {perm}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grant Permissions */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <h3 className="text-base text-[#111827] font-semibold mb-4">Grant Additional Permissions</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={grantPermission}
              onChange={(e) => setGrantPermission(e.target.value)}
              className="flex-1 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              <option value="">Select a permission to grant</option>
              {availablePermissions?.permissions
                .filter((p) => !effectivePermissions.includes(p))
                .map((perm) => (
                  <option key={perm} value={perm}>
                    {perm}
                  </option>
                ))}
            </select>
            <button
              onClick={handleGrant}
              disabled={!grantPermission || processing}
              className="px-6 py-3 bg-[#22C55E] text-white rounded-lg hover:bg-[#16A34A] transition disabled:opacity-50"
            >
              {processing ? "Granting..." : "Grant"}
            </button>
          </div>

          {customOverride.length > 0 && (
            <div>
              <p className="text-sm text-[#111827] font-medium mb-2">Currently Granted:</p>
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
                      onClick={() => onRemoveGranted(perm)}
                      disabled={processing}
                      className="p-1 text-[#EF4444] hover:bg-[#FEF2F2] rounded transition"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Revoke Permissions */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <h3 className="text-base text-[#111827] font-semibold mb-4">Revoke Permissions</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={revokePermission}
              onChange={(e) => setRevokePermission(e.target.value)}
              className="flex-1 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              <option value="">Select a permission to revoke</option>
              {effectivePermissions
                .filter((p) => !revokedPermissions.includes(p))
                .map((perm) => (
                  <option key={perm} value={perm}>
                    {perm}
                  </option>
                ))}
            </select>
            <button
              onClick={handleRevoke}
              disabled={!revokePermission || processing}
              className="px-6 py-3 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition disabled:opacity-50"
            >
              {processing ? "Revoking..." : "Revoke"}
            </button>
          </div>

          {revokedPermissions.length > 0 && (
            <div>
              <p className="text-sm text-[#111827] font-medium mb-2">Currently Revoked:</p>
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
                      onClick={() => onRemoveRevoked(perm)}
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
      </div>

      {/* Effective Permissions Summary */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <h3 className="text-base text-[#111827] font-semibold mb-4">
          Effective Permissions ({effectivePermissions.length})
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {effectivePermissions.map((perm) => (
            <div key={perm} className="flex items-center gap-2 text-sm text-[#6B7280] px-3 py-2 bg-[#F9FAFB] rounded">
              <CheckCircle className="w-3 h-3 text-[#22C55E]" />
              {perm}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
