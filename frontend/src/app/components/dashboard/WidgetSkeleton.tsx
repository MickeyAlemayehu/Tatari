interface WidgetSkeletonProps {
  height?: string;
}

export function WidgetSkeleton({ height = "h-32" }: WidgetSkeletonProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#E5E7EB] p-6 animate-pulse ${height}`}
    >
      <div className="w-12 h-12 bg-[#E5E7EB] rounded-lg mb-4" />
      <div className="h-3 w-24 bg-[#E5E7EB] rounded mb-2" />
      <div className="h-6 w-16 bg-[#E5E7EB] rounded mb-2" />
      <div className="h-3 w-32 bg-[#E5E7EB] rounded" />
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 animate-pulse h-64">
      <div className="h-4 w-40 bg-[#E5E7EB] rounded mb-4" />
      <div className="space-y-3">
        <div className="h-3 w-full bg-[#E5E7EB] rounded" />
        <div className="h-3 w-5/6 bg-[#E5E7EB] rounded" />
        <div className="h-3 w-4/6 bg-[#E5E7EB] rounded" />
      </div>
    </div>
  );
}

export function FullDashboardSkeleton() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <WidgetSkeleton />
        <WidgetSkeleton />
        <WidgetSkeleton />
        <WidgetSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PanelSkeleton />
        <PanelSkeleton />
      </div>
    </div>
  );
}
