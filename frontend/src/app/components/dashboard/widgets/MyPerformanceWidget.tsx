import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { performanceService } from "../../../../services/performance.service";
import { StatCard } from "../StatCard";

export default function MyPerformanceWidget() {
  const [score, setScore] = useState("—");

  useEffect(() => {
    performanceService
      .myResults()
      .then((res) => {
        const latest = res.data[0];
        if (latest?.finalScore) {
          setScore(`${latest.finalScore.toFixed(1)}/5`);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <StatCard
      title="Performance"
      value={score}
      subtitle="Latest evaluation score"
      icon={TrendingUp}
      gradient="from-[#22C55E] to-[#22C55E]"
    />
  );
}
