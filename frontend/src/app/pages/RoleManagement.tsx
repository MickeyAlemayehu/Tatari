import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Shield, Plus, Edit, Trash2, Users, CheckCircle, XCircle, Search, Settings, Lock, Eye } from "lucide-react";
import React from "react";
import { AppLayout } from "../components/AppLayout";

interface Permission {
  id: string;
  name: string;
  category: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  isSystem: boolean;
  permissions: string[];
  color: string;
}

export function RoleManagement() {
  const navigate = useNavigate();
  
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      name: "Super Admin",
      description: "Full system access with all permissions",
      userCount: 2,
      isSystem: true,
      permissions: ["all"],
      color: "bg-[#FEF2F2] text-red-700 border-[#EF4444]/20",
    },
    {
      id: 2,
      name: "HR Manager",
      description: "Manage employees, departments, and HR operations",
      userCount: 5,
      isSystem: true,
      permissions: [
        "employees_view", "employees_create", "employees_edit", "employees_delete",
        "departments_view", "departments_create", "departments_edit", "departments_delete",
        "leave_view", "leave_approve",
        "performance_view", "performance_create",
        "payroll_view",
      ],
      color: "bg-[#EEF2FF] text-indigo-700 border-[#4F46E5]/20",
    },
    {
      id: 3,
      name: "Manager",
      description: "Manage team members and approve requests",
      userCount: 12,
      isSystem: true,
      permissions: [
        "employees_view",
        "leave_view", "leave_approve",
        "performance_view", "performance_create", "performance_evaluate",
      ],
      color: "bg-[#EEF2FF] text-[#4F46E5] border-purple-200",
    },
    {
      id: 4,
      name: "Employee",
      description: "Basic employee access",
      userCount: 145,
      isSystem: true,
      permissions: [
        "profile_view", "profile_edit",
        "leave_view", "leave_request",
        "performance_view",
        "payroll_view_own",
      ],
      color: "bg-blue-100 text-blue-700 border-[#06B6D4]/20",
    },
    {
      id: 5,
      name: "Recruiter",
      description: "Manage job postings and applicants",
      userCount: 8,
      isSystem: false,
      permissions: [
        "jobs_view", "jobs_create", "jobs_edit", "jobs_delete",
        "applicants_view", "applicants_manage",
      ],
      color: "bg-[#DCFCE7] text-[#22C55E] border-green-200",
    },
    {
      id: 6,
      name: "Payroll Admin",
      description: "Process and manage payroll",
      userCount: 3,
      isSystem: false,
      permissions: [
        "employees_view",
        "payroll_view", "payroll_create", "payroll_process", "payroll_approve",
      ],
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // All available permissions
  const permissions: Permission[] = [
    // Employees
    { id: "employees_view", name: "View Employees", category: "Employees" },
    { id: "employees_create", name: "Create Employees", category: "Employees" },
    { id: "employees_edit", name: "Edit Employees", category: "Employees" },
    { id: "employees_delete", name: "Delete Employees", category: "Employees" },
    
    // Departments
    { id: "departments_view", name: "View Departments", category: "Departments" },
    { id: "departments_create", name: "Create Departments", category: "Departments" },
    { id: "departments_edit", name: "Edit Departments", category: "Departments" },
    { id: "departments_delete", name: "Delete Departments", category: "Departments" },
    
    // Leave Management
    { id: "leave_view", name: "View Leave", category: "Leave" },
    { id: "leave_request", name: "Request Leave", category: "Leave" },
    { id: "leave_approve", name: "Approve Leave", category: "Leave" },
    
    // Performance
    { id: "performance_view", name: "View Performance", category: "Performance" },
    { id: "performance_create", name: "Create Evaluations", category: "Performance" },
    { id: "performance_evaluate", name: "Evaluate Performance", category: "Performance" },
    
    // Recruitment
    { id: "jobs_view", name: "View Jobs", category: "Recruitment" },
    { id: "jobs_create", name: "Create Jobs", category: "Recruitment" },
    { id: "jobs_edit", name: "Edit Jobs", category: "Recruitment" },
    { id: "jobs_delete", name: "Delete Jobs", category: "Recruitment" },
    { id: "applicants_view", name: "View Applicants", category: "Recruitment" },
    { id: "applicants_manage", name: "Manage Applicants", category: "Recruitment" },
    
    // Payroll
    { id: "payroll_view", name: "View All Payroll", category: "Payroll" },
    { id: "payroll_view_own", name: "View Own Payslip", category: "Payroll" },
    { id: "payroll_create", name: "Create Payroll", category: "Payroll" },
    { id: "payroll_process", name: "Process Payroll", category: "Payroll" },
    { id: "payroll_approve", name: "Approve Payroll", category: "Payroll" },
    
    // Profile
    { id: "profile_view", name: "View Own Profile", category: "Profile" },
    { id: "profile_edit", name: "Edit Own Profile", category: "Profile" },
  ];

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    const categoryPermissions = acc[permission.category] ?? [];
    categoryPermissions.push(permission);
    acc[permission.category] = categoryPermissions;
    return acc;
  }, {} as Record<string, Permission[]>);

  // Filter roles
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle create role
  const handleCreateRole = () => {
    if (!newRoleName.trim()) {
      alert("Please enter a role name");
      return;
    }

    const newRole: Role = {
      id: roles.length + 1,
      name: newRoleName,
      description: newRoleDescription,
      userCount: 0,
      isSystem: false,
      permissions: selectedPermissions,
      color: "bg-[#F9FAFB] text-[#111827] border-[#E5E7EB]",
    };

    setRoles([...roles, newRole]);
    setShowCreateModal(false);
    setNewRoleName("");
    setNewRoleDescription("");
    setSelectedPermissions([]);
  };

  // Handle delete role
  const handleDeleteRole = () => {
    if (!selectedRole) return;
    
    setRoles(roles.filter(r => r.id !== selectedRole.id));
    setShowDeleteModal(false);
    setSelectedRole(null);
  };

  // Toggle permission
  const togglePermission = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permissionId));
    } else {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    }
  };

  // Check if role has permission
  const hasPermission = (role: Role, permissionId: string) => {
    return role.permissions.includes("all") || role.permissions.includes(permissionId);
  };

  // Handle edit permissions
  const handleEditPermissions = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions.includes("all") ? permissions.map(p => p.id) : role.permissions);
    setShowPermissionsModal(true);
  };

  // Save permissions
  const handleSavePermissions = () => {
    if (!selectedRole) return;

    setRoles(roles.map(r => 
      r.id === selectedRole.id 
        ? { ...r, permissions: selectedPermissions }
        : r
    ));

    setShowPermissionsModal(false);
    setSelectedRole(null);
    setSelectedPermissions([]);
  };

  return (
    <AppLayout
      title="Role Management"
      subtitle={`${roles.length} roles defined`}
      headerActions={
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles..."
              className="pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] w-64"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </button>
        </>
      }
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-xl border border-[#E5E7EB] hover:border-[#4F46E5]/20 transition-all hover:shadow-md"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base text-[#111827] mb-1">{role.name}</h3>
                        {role.isSystem && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 border border-[#06B6D4]/20">
                            <Lock className="w-3 h-3" />
                            System Role
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#6B7280] mb-4">{role.description}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Users className="w-4 h-4" />
                      <span>{role.userCount} user{role.userCount !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <CheckCircle className="w-4 h-4" />
                      <span>{role.permissions.includes("all") ? "All" : role.permissions.length} permissions</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditPermissions(role)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Permissions
                    </button>
                    {!role.isSystem && (
                      <button
                        onClick={() => {
                          setSelectedRole(role);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Permissions Matrix */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <div>
                <h2 className="text-base text-[#111827]">Permissions Matrix</h2>
                <p className="text-sm text-[#6B7280]">View all role permissions at a glance</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="text-left text-xs text-[#6B7280] pb-3 pr-4 sticky left-0 bg-white">Permission</th>
                    {filteredRoles.map((role) => (
                      <th key={role.id} className="text-center text-xs text-[#6B7280] pb-3 px-3 min-w-[100px]">
                        <div className="flex flex-col items-center gap-1">
                          <span>{role.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <React.Fragment key={category}>
                      <tr className="border-b border-gray-100">
                        <td colSpan={filteredRoles.length + 1} className="py-3 sticky left-0 bg-[#F9FAFB]">
                          <span className="text-xs text-[#111827]">{category}</span>
                        </td>
                      </tr>
                      {perms.map((permission) => (
                        <tr key={permission.id} className="border-b border-gray-100 hover:bg-[#F9FAFB]">
                          <td className="py-3 pr-4 text-sm text-[#111827] sticky left-0 bg-white">
                            {permission.name}
                          </td>
                          {filteredRoles.map((role) => (
                            <td key={role.id} className="py-3 px-3 text-center">
                              {hasPermission(role, permission.id) ? (
                                <div className="flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center">
                                  <XCircle className="w-5 h-5 text-gray-300" />
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="text-lg">Create New Role</h3>
                  <p className="text-sm text-indigo-100">Define role details and permissions</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Role Details */}
              <div>
                <label className="block text-sm text-[#111827] mb-2">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  placeholder="e.g., Department Manager"
                />
              </div>

              <div>
                <label className="block text-sm text-[#111827] mb-2">Description</label>
                <textarea
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] resize-none"
                  placeholder="Describe the role's responsibilities..."
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm text-[#111827] mb-3">Permissions</label>
                <div className="space-y-4">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category} className="border border-[#E5E7EB] rounded-lg p-4">
                      <h4 className="text-sm text-[#111827] mb-3">{category}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map((permission) => (
                          <label
                            key={permission.id}
                            className="flex items-center gap-2 p-2 rounded hover:bg-[#F9FAFB] cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(permission.id)}
                              onChange={() => togglePermission(permission.id)}
                              className="w-4 h-4 text-[#4F46E5] rounded focus:ring-2 focus:ring-[#4F46E5]"
                            />
                            <span className="text-sm text-[#111827]">{permission.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] p-6 flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewRoleName("");
                  setNewRoleDescription("");
                  setSelectedPermissions([]);
                }}
                className="flex-1 px-4 py-2.5 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                disabled={!newRoleName.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="text-lg">{selectedRole.name} Permissions</h3>
                  <p className="text-sm text-indigo-100">Manage role permissions</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <div key={category} className="border border-[#E5E7EB] rounded-lg p-4">
                  <h4 className="text-sm text-[#111827] mb-3">{category}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perms.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-[#F9FAFB] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          disabled={selectedRole.isSystem}
                          className="w-4 h-4 text-[#4F46E5] rounded focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-50"
                        />
                        <span className="text-sm text-[#111827]">{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedRole.isSystem && (
              <div className="px-6 pb-4">
                <div className="flex items-start gap-2 p-3 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg">
                  <Lock className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    This is a system role. Permissions cannot be modified to maintain system integrity.
                  </p>
                </div>
              </div>
            )}

            <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] p-6 flex gap-3">
              <button
                onClick={() => {
                  setShowPermissionsModal(false);
                  setSelectedRole(null);
                  setSelectedPermissions([]);
                }}
                className="flex-1 px-4 py-2.5 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                {selectedRole.isSystem ? "Close" : "Cancel"}
              </button>
              {!selectedRole.isSystem && (
                <button
                  onClick={handleSavePermissions}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition"
                >
                  <CheckCircle className="w-5 h-5" />
                  Save Permissions
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Role Modal */}
      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-[#EF4444]" />
              </div>
              <div>
                <h3 className="text-lg text-[#111827]">Delete Role</h3>
                <p className="text-sm text-[#6B7280]">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-[#6B7280] mb-4">
                Are you sure you want to delete the role "{selectedRole.name}"? 
              </p>
              {selectedRole.userCount > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>Warning:</strong> This role is currently assigned to {selectedRole.userCount} user{selectedRole.userCount !== 1 ? "s" : ""}. 
                    They will need to be reassigned to another role.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRole(null);
                }}
                className="flex-1 px-4 py-2.5 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRole}
                className="flex-1 flex items-center justify-center gap-2 bg-[#EF4444] text-white px-4 py-2.5 rounded-lg hover:bg-[#EF4444] transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}