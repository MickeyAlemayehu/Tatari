import { Suspense, lazy, useMemo, type ComponentType } from "react";
import { AppLayout } from "../components/AppLayout";
import {
  WidgetSkeleton,
  PanelSkeleton,
  FullDashboardSkeleton,
} from "../components/dashboard/WidgetSkeleton";
import { useAuth } from "../../contexts/AuthContext";

interface WidgetConfig {
  id: string;
  permission: string;
  type: "stat" | "panel";
  component: () => Promise<{ default: ComponentType }>;
}

// Stat cards render in the top 4-column grid (in declared order).
// Panels render in a 2-column grid below.
// Order matches original Dashboard / HRDashboard / EmployeeDashboard.
const widgets: WidgetConfig[] = [
  // ---- Stats row ----
  {
    id: "headcount",
    permission: "view_employees",
    type: "stat",
    component: () => import("../components/dashboard/widgets/HeadcountWidget"),
  },
  {
    id: "leave",
    permission: "view_leave",
    type: "stat",
    component: () => import("../components/dashboard/widgets/LeaveWidget"),
  },
  {
    id: "recruitment",
    permission: "view_recruitment",
    type: "stat",
    component: () => import("../components/dashboard/widgets/RecruitmentWidget"),
  },
  {
    id: "performance",
    permission: "view_performance",
    type: "stat",
    component: () => import("../components/dashboard/widgets/PerformanceWidget"),
  },
  {
    id: "my-leave-balance",
    permission: "view_my_leave_balance",
    type: "stat",
    component: () => import("../components/dashboard/widgets/MyLeaveBalanceWidget"),
  },
  {
    id: "my-pending-leave",
    permission: "view_my_leave_balance",
    type: "stat",
    component: () => import("../components/dashboard/widgets/MyPendingLeaveWidget"),
  },
  {
    id: "my-tasks",
    permission: "view_my_tasks",
    type: "stat",
    component: () => import("../components/dashboard/widgets/MyTasksWidget"),
  },
  {
    id: "my-performance",
    permission: "view_my_performance",
    type: "stat",
    component: () => import("../components/dashboard/widgets/MyPerformanceWidget"),
  },

  // ---- Panels row ----
  {
    id: "recent-employees",
    permission: "view_employees",
    type: "panel",
    component: () => import("../components/dashboard/widgets/RecentEmployeesWidget"),
  },
  {
    id: "upcoming-leaves",
    permission: "view_leave",
    type: "panel",
    component: () => import("../components/dashboard/widgets/UpcomingLeavesWidget"),
  },
  {
    id: "quick-actions",
    permission: "view_quick_actions",
    type: "panel",
    component: () => import("../components/dashboard/widgets/QuickActionsWidget"),
  },
  {
    id: "recent-activity",
    permission: "view_quick_actions",
    type: "panel",
    component: () => import("../components/dashboard/widgets/RecentActivityWidget"),
  },
];

export function UnifiedDashboard() {
  const { employee, isLoading, hasPermission } = useAuth();

  const { stats, panels } = useMemo(() => {
    const visible = widgets
      .filter((w) => hasPermission(w.permission))
      .map((w) => ({ ...w, Lazy: lazy(w.component) }));
    return {
      stats: visible.filter((w) => w.type === "stat"),
      panels: visible.filter((w) => w.type === "panel"),
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

  const hasAny = stats.length + panels.length > 0;

  return (
    <AppLayout title="Dashboard" subtitle={greeting}>
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
