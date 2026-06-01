import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { leaveService } from "../../../../services/leave.service";
import { StatCard } from "../StatCard";

export default function LeaveWidget() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    leaveService
      .summary()
      .then((s) => setPendingCount(s.pendingLeaveRequests))
      .catch(() => {});
  }, []);

  return (
    <StatCard
      title="Pending Leave Requests"
      value={String(pendingCount)}
      subtitle="Awaiting approval"
      icon={Calendar}
      gradient="from-[#F59E0B] to-[#F59E0B]"
    />
  );
}
