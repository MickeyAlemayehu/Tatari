import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { performanceService } from "../../../../services/performance.service";
import { StatCard } from "../StatCard";

export default function MyTasksWidget() {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    performanceService
      .myAssignments()
      .then((res) => {
        setPending(
          res.data.filter((a) => a.status !== "submitted" && a.status !== "completed").length
        );
      })
      .catch(() => {});
  }, []);

  return (
    <StatCard
      title="My Tasks"
      value={String(pending)}
      subtitle="Evaluations to complete"
      icon={ClipboardList}
      gradient="from-[#4F46E5] to-[#4338CA]"
    />
  );
}
