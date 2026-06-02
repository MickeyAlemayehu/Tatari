import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { performanceService } from "../../../../services/performance.service";
import { StatCard } from "../StatCard";

export default function PerformanceWidget() {
  const [activePeriods, setActivePeriods] = useState(0);

  useEffect(() => {
    performanceService
      .periods()
      .then((res) => {
        setActivePeriods(res.data.filter((p) => p.status === "active").length);
      })
      .catch(() => {});
  }, []);

  return (
    <StatCard
      title="Active Evaluations"
      value={String(activePeriods)}
      subtitle="Open evaluation periods"
      icon={TrendingUp}
      gradient="from-[#22C55E] to-[#22C55E]"
    />
  );
}
