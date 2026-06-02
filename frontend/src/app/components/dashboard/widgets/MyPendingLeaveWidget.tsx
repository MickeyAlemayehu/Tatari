import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { leaveService } from "../../../../services/leave.service";
import { StatCard } from "../StatCard";

export default function MyPendingLeaveWidget() {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    leaveService
      .myRequests({ per_page: 50 })
      .then((res) => {
        setPending(res.data.filter((r) => r.status === "pending").length);
      })
      .catch(() => {});
  }, []);

  return (
    <StatCard
      title="Pending Leave"
      value={String(pending)}
      subtitle="Awaiting approval"
      icon={Clock}
      gradient="from-[#F59E0B] to-[#F59E0B]"
    />
  );
}
