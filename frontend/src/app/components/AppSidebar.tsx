import { useNavigate, useLocation } from "react-router";
import {
  Home,
  Users,
  Briefcase,
  UserPlus,
  Upload,
  Calendar,
  FileText,
  TrendingUp,
  DollarSign,
  Receipt,
  Bell,
  User,
  ChevronDown,
  ChevronRight,
  LogOut,
  Shield,
  Settings,
  Building2,
  ClipboardList,
  Laptop,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

interface NavigationItem {
  name: string;
  icon: any;
  path: string;
  permission: string;
  children?: NavigationItem[];
}

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, hasPermission } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "leave-management",
    "performance",
  ]);

  // Detect role from URL path
  const currentRole = location.pathname.startsWith("/employee/")
    ? "employee"
    : location.pathname.startsWith("/admin")
    ? "admin"
    : "hr";

  const isActive = (path: string) => {
    if (path.includes("/dashboard")) {
      return location.pathname.includes("/dashboard");
    }
    return location.pathname.startsWith(path) || location.pathname.includes(path);
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((s) => s !== sectionName)
        : [...prev, sectionName]
    );
  };

  const isSectionActive = (item: NavigationItem) => {
    if (item.children) {
      return item.children.some((child) => isActive(child.path));
    }
    return isActive(item.path);
  };

  // EMPLOYEE NAVIGATION
  const employeeNavigation: NavigationItem[] = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/employee/dashboard",
      permission: "access_employee_portal",
    },
    {
      name: "My Profile",
      icon: User,
      path: "/employee/profile",
      permission: "access_employee_portal",
    },
    {
      name: "My Department",
      icon: Briefcase,
      path: "/employee/department",
      permission: "access_employee_portal",
    },
    {
      name: "Leave Management",
      icon: Calendar,
      path: "/employee/leave",
      permission: "access_employee_portal",
      children: [
        { name: "My Requests", icon: FileText, path: "/employee/leave?tab=requests", permission: "access_employee_portal" },
        { name: "Leave Balance", icon: TrendingUp, path: "/employee/leave?tab=balance", permission: "access_employee_portal" },
      ],
    },
    {
      name: "Performance",
      icon: TrendingUp,
      path: "/employee/performance",
      permission: "access_employee_portal",
      children: [
        { name: "My Tasks", icon: ClipboardList, path: "/employee/performance?tab=tasks", permission: "access_employee_portal" },
        { name: "My Results", icon: TrendingUp, path: "/employee/performance?tab=results", permission: "access_employee_portal" },
      ],
    },
    {
      name: "Equipment",
      icon: Laptop,
      path: "/employee/equipment",
      permission: "access_employee_portal",
    },
    {
      name: "Payslips",
      icon: Receipt,
      path: "/employee/payslip/1",
      permission: "access_employee_portal",
    },
    {
      name: "Notifications",
      icon: Bell,
      path: "/employee/notifications",
      permission: "access_employee_portal",
    },
  ];

  // HR NAVIGATION
  const hrNavigation: NavigationItem[] = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/hr/dashboard",
      permission: "access_hr_portal",
    },
    {
      name: "Employee Management",
      icon: Users,
      path: "/employees",
      permission: "manage_employees",
      children: [
        { name: "Employees", icon: Users, path: "/employees", permission: "manage_employees" },
        { name: "Add Employee", icon: UserPlus, path: "/employees/new", permission: "manage_employees" },
        { name: "Import Employees", icon: Upload, path: "/employees/import", permission: "manage_employees" },
      ],
    },
    {
      name: "Departments",
      icon: Briefcase,
      path: "/departments",
      permission: "manage_employees",
    },
    {
      name: "Leave Management",
      icon: Calendar,
      path: "/leave",
      permission: "approve_leave",
      children: [
        { name: "All Requests", icon: FileText, path: "/leave?tab=history", permission: "approve_leave" },
        { name: "Approval", icon: Calendar, path: "/leave?tab=approvals", permission: "approve_leave" },
      ],
    },
    {
      name: "Performance",
      icon: TrendingUp,
      path: "/performance",
      permission: "manage_performance_reviews",
      children: [
        { name: "Evaluation Dashboard", icon: TrendingUp, path: "/performance", permission: "manage_performance_reviews" },
        { name: "Assign Evaluators", icon: Users, path: "/performance/assign-peers", permission: "performance_create" },
      ],
    },
    {
      name: "Recruitment",
      icon: Briefcase,
      path: "/jobs",
      permission: "manage_employees",
      children: [
        { name: "Job Vacancies", icon: Briefcase, path: "/jobs", permission: "manage_employees" },
        { name: "Applicants", icon: Users, path: "/applicants", permission: "manage_employees" },
      ],
    },
    {
      name: "Payroll",
      icon: DollarSign,
      path: "/payroll",
      permission: "manage_payroll",
    },
    {
      name: "Notifications",
      icon: Bell,
      path: "/notifications",
      permission: "access_employee_portal",
    },
  ];

  // ADMIN NAVIGATION
  const adminNavigation: NavigationItem[] = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/admin/dashboard",
      permission: "access_admin_portal",
    },
    {
      name: "Employee Permissions",
      icon: Shield,
      path: "/admin/permissions",
      permission: "access_admin_portal",
    },
    {
      name: "Company Management",
      icon: Building2,
      path: "/admin/companies",
      permission: "access_admin_portal",
    },
    {
      name: "User Management",
      icon: Users,
      path: "/admin/users",
      permission: "access_admin_portal",
    },
    {
      name: "Role Management",
      icon: Shield,
      path: "/admin/roles",
      permission: "access_admin_portal",
    },
    {
      name: "System Settings",
      icon: Settings,
      path: "/admin/settings",
      permission: "access_admin_portal",
    },
    {
      name: "Audit Logs",
      icon: FileText,
      path: "/admin/logs",
      permission: "access_admin_portal",
    },
  ];

  // Select navigation based on current role
  const navigation =
    currentRole === "employee"
      ? employeeNavigation
      : currentRole === "admin"
      ? adminNavigation
      : hrNavigation;

  const permittedNavigation = navigation
    .filter((item) => hasPermission(item.permission))
    .map((item): NavigationItem => {
      const children = item.children?.filter((child) => hasPermission(child.permission));
      return children ? { ...item, children } : { ...item };
    });

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const renderNavItem = (item: NavigationItem, isChild = false) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(
      item.name.toLowerCase().replace(/\s+/g, "-")
    );
    const sectionActive = isSectionActive(item);

    if (hasChildren && item.children && item.children.length > 0) {
      return (
        <div key={item.path}>
          <button
            onClick={() =>
              toggleSection(item.name.toLowerCase().replace(/\s+/g, "-"))
            }
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition ${
              sectionActive
                ? "bg-[rgba(255,255,255,0.08)] text-[#E5E7EB]"
                : "text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{item.name}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-[rgba(255,255,255,0.1)] pl-4">
              {item.children.map((child) => renderNavItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.path}
        onClick={() => navigate(item.path)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
          isChild ? "text-sm" : ""
        } ${
          active
            ? "bg-[#4F46E5] text-white"
            : "text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)]"
        }`}
      >
        <Icon className={`${isChild ? "w-4 h-4" : "w-5 h-5"} flex-shrink-0`} />
        <span className="text-sm">{item.name}</span>
      </button>
    );
  };

  return (
    <aside className="hidden lg:flex w-64 bg-[#111827] border-r border-[rgba(255,255,255,0.1)] flex-col h-full fixed left-0 top-0 bottom-0">
      {/* Logo/Brand */}
      <div className="px-6 py-5 border-b border-[rgba(255,255,255,0.1)] flex-shrink-0">
        <h2 className="text-base text-[#E5E7EB] font-semibold">HR System</h2>
        <p className="text-xs text-[#6B7280] mt-1 capitalize">{currentRole} Portal</p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-1">
          {permittedNavigation.map((item) => renderNavItem(item))}
        </div>

        {/* Settings for Employee */}
        {currentRole === "employee" && hasPermission("access_employee_portal") && (
          <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.1)]">
            <button
              onClick={() => navigate("/employee/settings")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                isActive("/employee/settings")
                  ? "bg-[#4F46E5] text-white"
                  : "text-[#E5E7EB] hover:bg-[rgba(255,255,255,0.08)]"
              }`}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        )}
      </nav>

      {/* Bottom Navigation - Logout */}
      <div className="border-t border-[rgba(255,255,255,0.1)] px-4 py-4 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[#E5E7EB] hover:bg-[rgba(239,68,68,0.1)] hover:text-[#EF4444] rounded-lg transition"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
