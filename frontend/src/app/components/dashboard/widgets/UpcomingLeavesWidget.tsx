import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Clock } from "lucide-react";
import { Badge } from "../../Badge";
import { leaveService } from "../../../../services/leave.service";
import { formatDate } from "../../../../lib/utils";

interface UpcomingLeave {
  id: number;
  employee: string;
  type: string;
  dates: string;
  status: string;
}

export default function UpcomingLeavesWidget() {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<UpcomingLeave[]>([]);

  useEffect(() => {
    leaveService
      .list({ status: "pending", per_page: 5 })
      .then((res) => {
        setUpcoming(
          res.data.map((r) => ({
            id: r.id,
            employee: r.employee?.name ?? "Unknown",
            type: r.type ?? r.leaveType ?? "Leave",
            dates: `${formatDate(r.startDate)} – ${formatDate(r.endDate)}`,
            status: r.status,
          }))
        );
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB]">
      <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h3 className="text-[#111827]">Upcoming Leaves</h3>
          <p className="text-sm text-[#6B7280]">Pending requests</p>
        </div>
        <button
          onClick={() => navigate("/leave")}
          className="text-sm text-[#4F46E5] hover:underline"
        >
          View all
        </button>
      </div>
      <div className="p-6 space-y-4">
        {upcoming.length === 0 && (
          <p className="text-sm text-[#6B7280]">No pending leave requests.</p>
        )}
        {upcoming.map((leave) => (
          <div
            key={leave.id}
            className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-[#111827]">{leave.employee}</p>
                <p className="text-xs text-[#6B7280]">{leave.type}</p>
              </div>
              <Badge
                variant={leave.status === "approved" ? "success" : "warning"}
                size="sm"
              >
                {leave.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <Clock className="w-3 h-3" />
              {leave.dates}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
