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

interface NavigationItem {
  name: string;
  icon: any;
  path: string;
  children?: NavigationItem[];
}

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
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
    },
    {
      name: "My Profile",
      icon: User,
      path: "/employee/profile",
    },
    {
      name: "My Department",
      icon: Briefcase,
      path: "/employee/department",
    },
    {
      name: "Leave Management",
      icon: Calendar,
      path: "/employee/leave",
      children: [
        { name: "My Requests", icon: FileText, path: "/employee/leave?tab=requests" },
        { name: "Leave Balance", icon: TrendingUp, path: "/employee/leave?tab=balance" },
      ],
    },
    {
      name: "Performance",
      icon: TrendingUp,
      path: "/employee/performance",
      children: [
        { name: "My Tasks", icon: ClipboardList, path: "/employee/performance?tab=tasks" },
        { name: "My Results", icon: TrendingUp, path: "/employee/performance?tab=results" },
      ],
    },
    {
      name: "Equipment",
      icon: Laptop,
      path: "/employee/equipment",
    },
    {
      name: "Payslips",
      icon: Receipt,
      path: "/employee/payslip/1",
    },
    {
      name: "Notifications",
      icon: Bell,
      path: "/employee/notifications",
    },
  ];

  // HR NAVIGATION
  const hrNavigation: NavigationItem[] = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/hr/dashboard",
    },
    {
      name: "Employee Management",
      icon: Users,
      path: "/employees",
      children: [
        { name: "Employees", icon: Users, path: "/employees" },
        { name: "Add Employee", icon: UserPlus, path: "/employees/new" },
        { name: "Import Employees", icon: Upload, path: "/employees/import" },
      ],
    },
    {
      name: "Departments",
      icon: Briefcase,
      path: "/departments",
    },
    {
      name: "Leave Management",
      icon: Calendar,
      path: "/leave",
      children: [
        { name: "All Requests", icon: FileText, path: "/leave?tab=history" },
        { name: "Approval", icon: Calendar, path: "/leave?tab=approvals" },
      ],
    },
    {
      name: "Performance",
      icon: TrendingUp,
      path: "/performance",
      children: [
        { name: "Evaluation Dashboard", icon: TrendingUp, path: "/performance" },
        { name: "Assign Evaluators", icon: Users, path: "/performance/assign-peers" },
      ],
    },
    {
      name: "Recruitment",
      icon: Briefcase,
      path: "/jobs",
      children: [
        { name: "Job Vacancies", icon: Briefcase, path: "/jobs" },
        { name: "Applicants", icon: Users, path: "/applicants" },
      ],
    },
    {
      name: "Payroll",
      icon: DollarSign,
      path: "/payroll",
    },
    {
      name: "Notifications",
      icon: Bell,
      path: "/notifications",
    },
  ];

  // ADMIN NAVIGATION
  const adminNavigation: NavigationItem[] = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/admin/dashboard",
    },
    {
      name: "Company Management",
      icon: Building2,
      path: "/admin/companies",
    },
    {
      name: "User Management",
      icon: Users,
      path: "/admin/users",
    },
    {
      name: "Role Management",
      icon: Shield,
      path: "/admin/roles",
    },
    {
      name: "System Settings",
      icon: Settings,
      path: "/admin/settings",
    },
    {
      name: "Audit Logs",
      icon: FileText,
      path: "/admin/logs",
    },
  ];

  // Select navigation based on current role
  const navigation =
    currentRole === "employee"
      ? employeeNavigation
      : currentRole === "admin"
      ? adminNavigation
      : hrNavigation;

  const handleLogout = () => {
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
    <aside className="hidden lg:block w-64 bg-[#111827] border-r border-[rgba(255,255,255,0.1)] flex flex-col h-full fixed left-0 top-0 bottom-0">
      {/* Logo/Brand */}
      <div className="px-6 py-5 border-b border-[rgba(255,255,255,0.1)] flex-shrink-0">
        <h2 className="text-base text-[#E5E7EB] font-semibold">HR System</h2>
        <p className="text-xs text-[#6B7280] mt-1 capitalize">{currentRole} Portal</p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => renderNavItem(item))}
        </div>

        {/* Settings for Employee */}
        {currentRole === "employee" && (
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