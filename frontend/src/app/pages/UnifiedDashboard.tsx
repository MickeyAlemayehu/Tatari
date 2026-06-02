import { Suspense, lazy, useMemo, useState, type ComponentType } from "react";
import { AppLayout } from "../components/AppLayout";
import {
  WidgetSkeleton,
  PanelSkeleton,
  FullDashboardSkeleton,
} from "../components/dashboard/WidgetSkeleton";
import { useAuth } from "../../contexts/AuthContext";

type WidgetCategory = "personal" | "management";

interface WidgetConfig {
  id: string;
  permission: string;
  type: "stat" | "panel";
  category: WidgetCategory;
  component: () => Promise<{ default: ComponentType }>;
}

// Stat cards render in the top 4-column grid (in declared order).
// Panels render in a 2-column grid below.
const widgets: WidgetConfig[] = [
  // ---- Stats row ----
  {
    id: "headcount",
    permission: "view_employees",
    type: "stat",
    category: "management",
    component: () => import("../components/dashboard/widgets/HeadcountWidget"),
  },
  {
    id: "leave",
    permission: "view_leave",
    type: "stat",
    category: "management",
    component: () => import("../components/dashboard/widgets/LeaveWidget"),
  },
  {
    id: "recruitment",
    permission: "view_recruitment",
    type: "stat",
    category: "management",
    component: () => import("../components/dashboard/widgets/RecruitmentWidget"),
  },
  {
    id: "performance",
    permission: "view_performance",
    type: "stat",
    category: "management",
    component: () => import("../components/dashboard/widgets/PerformanceWidget"),
  },
  {
    id: "my-leave-balance",
    permission: "view_my_leave_balance",
    type: "stat",
    category: "personal",
    component: () => import("../components/dashboard/widgets/MyLeaveBalanceWidget"),
  },
  {
    id: "my-pending-leave",
    permission: "view_my_leave_balance",
    type: "stat",
    category: "personal",
    component: () => import("../components/dashboard/widgets/MyPendingLeaveWidget"),
  },
  {
    id: "my-tasks",
    permission: "view_my_tasks",
    type: "stat",
    category: "personal",
    component: () => import("../components/dashboard/widgets/MyTasksWidget"),
  },
  {
    id: "my-performance",
    permission: "view_my_performance",
    type: "stat",
    category: "personal",
    component: () => import("../components/dashboard/widgets/MyPerformanceWidget"),
  },

  // ---- Panels row ----
  {
    id: "recent-employees",
    permission: "view_employees",
    type: "panel",
    category: "management",
    component: () => import("../components/dashboard/widgets/RecentEmployeesWidget"),
  },
  {
    id: "upcoming-leaves",
    permission: "view_leave",
    type: "panel",
    category: "management",
    component: () => import("../components/dashboard/widgets/UpcomingLeavesWidget"),
  },
  {
    id: "quick-actions",
    permission: "view_quick_actions",
    type: "panel",
    category: "personal",
    component: () => import("../components/dashboard/widgets/QuickActionsWidget"),
  },
  {
    id: "recent-activity",
    permission: "view_quick_actions",
    type: "panel",
    category: "personal",
    component: () => import("../components/dashboard/widgets/RecentActivityWidget"),
  },
];

export function UnifiedDashboard() {
  const { employee, isLoading, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<WidgetCategory>("personal");

  const { visibleWidgets, hasPersonal, hasManagement } = useMemo(() => {
    const allowed = widgets.filter((w) => hasPermission(w.permission));
    
    return {
      visibleWidgets: allowed.map((w) => ({ ...w, Lazy: lazy(w.component) })),
      hasPersonal: allowed.some(w => w.category === "personal"),
      hasManagement: allowed.some(w => w.category === "management"),
    };
  }, [hasPermission]);

  const greeting = employee
    ? `Welcome back, ${employee.first_name} ${employee.last_name}`
    : "Welcome back";

  if (isLoading) {
    return (
      <AppLayout title="Dashboard" subtitle="Loading…">
        <FullDashboardSkeleton />
      </AppLayout>
    );
  }

  const hasAny = visibleWidgets.length > 0;
  
  // Only show tabs if user has permissions for both personal and management widgets
  const showTabs = hasPersonal && hasManagement;

  // If tabs are shown, filter by active tab. Otherwise, just show whatever they have access to.
  const currentWidgets = showTabs 
    ? visibleWidgets.filter(w => w.category === activeTab)
    : visibleWidgets;

  const stats = currentWidgets.filter(w => w.type === "stat");
  const panels = currentWidgets.filter(w => w.type === "panel");

  return (
    <AppLayout title="Dashboard" subtitle={greeting}>
      {showTabs && (
        <div className="bg-white border-b border-[#E5E7EB] px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("personal")}
              className={`px-4 py-3 border-b-2 transition font-medium ${
                activeTab === "personal"
                  ? "border-[#4F46E5] text-[#4F46E5]"
                  : "border-transparent text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setActiveTab("management")}
              className={`px-4 py-3 border-b-2 transition font-medium ${
                activeTab === "management"
                  ? "border-[#4F46E5] text-[#4F46E5]"
                  : "border-transparent text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Management
            </button>
          </div>
        </div>
      )}

      <div className="p-6">
        {!hasAny ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
            <h3 className="text-base text-[#111827] mb-2">
              No dashboard content available
            </h3>
            <p className="text-sm text-[#6B7280]">
              Your account does not have permission to view any dashboard widgets yet.
              Contact your administrator if you believe this is a mistake.
            </p>
          </div>
        ) : (
          <>
            {stats.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map(({ id, Lazy }) => (
                  <Suspense key={id} fallback={<WidgetSkeleton />}>
                    <Lazy />
                  </Suspense>
                ))}
              </div>
            )}
            {panels.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {panels.map(({ id, Lazy }) => (
                  <Suspense key={id} fallback={<PanelSkeleton />}>
                    <Lazy />
                  </Suspense>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
