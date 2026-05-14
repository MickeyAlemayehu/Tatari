import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Filter, Edit, Trash2, Lock, Unlock, Mail, Shield, ArrowLeft, X, UserCircle, Phone, Calendar, Briefcase, AlertCircle, UserPlus, Users } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: "active" | "inactive" | "suspended";
  joinDate: string;
  lastLogin: string;
  avatar?: string;
}

type StatusFilter = "all" | "active" | "inactive" | "suspended";

export function UserManagement() {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      phone: "+1 (555) 123-4567",
      role: "HR Manager",
      department: "Human Resources",
      status: "active",
      joinDate: "2024-01-15",
      lastLogin: "2026-03-21 10:30 AM",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@company.com",
      phone: "+1 (555) 234-5678",
      role: "Manager",
      department: "Engineering",
      status: "active",
      joinDate: "2023-06-20",
      lastLogin: "2026-03-21 09:15 AM",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@company.com",
      phone: "+1 (555) 345-6789",
      role: "Employee",
      department: "Marketing",
      status: "active",
      joinDate: "2024-03-10",
      lastLogin: "2026-03-20 04:45 PM",
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.kim@company.com",
      phone: "+1 (555) 456-7890",
      role: "Payroll Admin",
      department: "Finance",
      status: "active",
      joinDate: "2023-11-05",
      lastLogin: "2026-03-21 08:00 AM",
    },
    {
      id: 5,
      name: "Jessica Williams",
      email: "jessica.williams@company.com",
      phone: "+1 (555) 567-8901",
      role: "Recruiter",
      department: "Human Resources",
      status: "active",
      joinDate: "2024-02-28",
      lastLogin: "2026-03-20 02:30 PM",
    },
    {
      id: 6,
      name: "Robert Brown",
      email: "robert.brown@company.com",
      phone: "+1 (555) 678-9012",
      role: "Employee",
      department: "Sales",
      status: "inactive",
      joinDate: "2023-08-12",
      lastLogin: "2026-02-15 11:20 AM",
    },
    {
      id: 7,
      name: "Amanda Taylor",
      email: "amanda.taylor@company.com",
      phone: "+1 (555) 789-0123",
      role: "Manager",
      department: "Marketing",
      status: "active",
      joinDate: "2023-04-18",
      lastLogin: "2026-03-21 11:00 AM",
    },
    {
      id: 8,
      name: "James Wilson",
      email: "james.wilson@company.com",
      phone: "+1 (555) 890-1234",
      role: "Employee",
      department: "Engineering",
      status: "suspended",
      joinDate: "2024-05-22",
      lastLogin: "2026-03-10 03:15 PM",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newUserRole, setNewUserRole] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Available roles
  const availableRoles = [
    "Super Admin",
    "HR Manager",
    "Manager",
    "Employee",
    "Recruiter",
    "Payroll Admin",
  ];

  // New user form
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
  });

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Get counts
  const activeCount = users.filter(u => u.status === "active").length;
  const inactiveCount = users.filter(u => u.status === "inactive").length;
  const suspendedCount = users.filter(u => u.status === "suspended").length;

  // Handle assign role
  const handleAssignRole = () => {
    if (!selectedUser || !newUserRole) {
      alert("Please select a role");
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, role: newUserRole } : u
      ));
      setIsProcessing(false);
      setShowAssignRoleModal(false);
      setSelectedUser(null);
      setNewUserRole("");
    }, 1000);
  };

  // Handle create user
  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      alert("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      const user: User = {
        id: users.length + 1,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        department: newUser.department,
        status: "active",
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: "Never",
      };

      setUsers([...users, user]);
      setIsProcessing(false);
      setShowCreateUserModal(false);
      setNewUser({
        name: "",
        email: "",
        phone: "",
        role: "",
        department: "",
      });
    }, 1000);
  };

  // Handle delete user
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  // Handle status change
  const handleStatusChange = (user: User, newStatus: "active" | "inactive" | "suspended") => {
    setUsers(users.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
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
      case "suspended":
        return (
          <Badge color="red" icon="x-circle">
            Suspended
          </Badge>
        );
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (dateStr === "Never") return "Never";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

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
                <h1 className="text-xl text-[#111827]">User Management</h1>
                <p className="text-sm text-[#6B7280]">{users.length} total users</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] w-64"
                />
              </div>
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-xl p-4 text-white">
              <p className="text-sm text-indigo-100 mb-1">Total Users</p>
              <p className="text-2xl">{users.length}</p>
            </div>
            <div className="bg-[#DCFCE7] border border-green-200 rounded-xl p-4">
              <p className="text-sm text-[#22C55E] mb-1">Active</p>
              <p className="text-2xl text-[#22C55E]">{activeCount}</p>
            </div>
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4">
              <p className="text-sm text-[#6B7280] mb-1">Inactive</p>
              <p className="text-2xl text-[#111827]">{inactiveCount}</p>
            </div>
            <div className="bg-[#FEF2F2] border border-[#EF4444]/20 rounded-xl p-4">
              <p className="text-sm text-[#EF4444] mb-1">Suspended</p>
              <p className="text-2xl text-[#EF4444]">{suspendedCount}</p>
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
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#6B7280]">Role:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-1.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="all">All Roles</option>
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
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
                      <th className="text-left text-xs text-[#6B7280] px-6 py-4">User</th>
                      <th className="text-left text-xs text-[#6B7280] px-6 py-4">Contact</th>
                      <th className="text-left text-xs text-[#6B7280] px-6 py-4">Role</th>
                      <th className="text-left text-xs text-[#6B7280] px-6 py-4">Department</th>
                      <th className="text-left text-xs text-[#6B7280] px-6 py-4">Status</th>
                      <th className="text-left text-xs text-[#6B7280] px-6 py-4">Last Login</th>
                      <th className="text-right text-xs text-[#6B7280] px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="w-12 h-12 text-gray-300" />
                            <p className="text-sm text-[#6B7280]">No users found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-[#F9FAFB] transition">
                          {/* User */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm text-white font-medium">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm text-[#111827]">{user.name}</p>
                                <p className="text-xs text-[#6B7280]">Joined {formatDate(user.joinDate)}</p>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-[#111827]">
                                <Mail className="w-3.5 h-3.5 text-[#6B7280]" />
                                <span>{user.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-[#111827]">
                                <Phone className="w-3.5 h-3.5 text-[#6B7280]" />
                                <span>{user.phone}</span>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-[#4F46E5]" />
                              <span className="text-sm text-[#111827]">{user.role}</span>
                            </div>
                          </td>

                          {/* Department */}
                          <td className="px-6 py-4">
                            <span className="text-sm text-[#111827]">{user.department}</span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            {getStatusBadge(user.status)}
                          </td>

                          {/* Last Login */}
                          <td className="px-6 py-4">
                            <span className="text-sm text-[#6B7280]">{user.lastLogin}</span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewUserRole(user.role);
                                  setShowAssignRoleModal(true);
                                }}
                                className="p-2 text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition"
                                title="Assign Role"
                              >
                                <Shield className="w-4 h-4" />
                              </button>
                              {user.status === "active" ? (
                                <button
                                  onClick={() => handleStatusChange(user, "suspended")}
                                  className="p-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition"
                                  title="Suspend User"
                                >
                                  <Lock className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStatusChange(user, "active")}
                                  className="p-2 text-[#22C55E] hover:bg-[#DCFCE7] rounded-lg transition"
                                  title="Activate User"
                                >
                                  <Unlock className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition"
                                title="Delete User"
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

      {/* Assign Role Modal */}
      {showAssignRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#4F46E5]" />
              </div>
              <div>
                <h3 className="text-lg text-[#111827]">Assign Role</h3>
                <p className="text-sm text-[#6B7280]">Change user role and permissions</p>
              </div>
            </div>

            {/* User Info */}
            <div className="mb-6 p-4 bg-[#F9FAFB] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center">
                  <span className="text-sm text-white font-medium">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-[#111827]">{selectedUser.name}</p>
                  <p className="text-xs text-[#6B7280]">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            {/* Current Role */}
            <div className="mb-4">
              <label className="block text-sm text-[#111827] mb-2">Current Role</label>
              <div className="px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
                <div className="flex items-center gap-2 text-sm text-[#111827]">
                  <Shield className="w-4 h-4 text-[#6B7280]" />
                  {selectedUser.role}
                </div>
              </div>
            </div>

            {/* New Role */}
            <div className="mb-6">
              <label className="block text-sm text-[#111827] mb-2">
                New Role <span className="text-red-500">*</span>
              </label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="">Select a role</option>
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAssignRoleModal(false);
                  setSelectedUser(null);
                  setNewUserRole("");
                }}
                className="flex-1 px-4 py-2.5 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRole}
                disabled={!newUserRole || newUserRole === selectedUser.role || isProcessing}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Assign Role
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="text-lg">Add New User</h3>
                  <p className="text-sm text-indigo-100">Create a new user account</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#111827] mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm text-[#111827] mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  placeholder="john.doe@company.com"
                />
              </div>

              <div>
                <label className="block text-sm text-[#111827] mb-2">Phone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm text-[#111827] mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="">Select a role</option>
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#111827] mb-2">Department</label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  placeholder="Engineering"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] p-6 flex gap-3">
              <button
                onClick={() => {
                  setShowCreateUserModal(false);
                  setNewUser({
                    name: "",
                    email: "",
                    phone: "",
                    role: "",
                    department: "",
                  });
                }}
                className="flex-1 px-4 py-2.5 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={!newUser.name || !newUser.email || !newUser.role || isProcessing}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-[#EF4444]" />
              </div>
              <div>
                <h3 className="text-lg text-[#111827]">Delete User</h3>
                <p className="text-sm text-[#6B7280]">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-[#6B7280] mb-6">
              Are you sure you want to delete <strong>{selectedUser.name}</strong>? All associated data will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2.5 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 flex items-center justify-center gap-2 bg-[#EF4444] text-white px-4 py-2.5 rounded-lg hover:bg-[#EF4444] transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}