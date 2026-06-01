import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { leaveService } from "../../../../services/leave.service";
import { StatCard } from "../StatCard";

export default function MyLeaveBalanceWidget() {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    leaveService
      .myBalances()
      .then((res) => {
        const total = res.data.reduce((sum, b) => sum + (b.remaining ?? 0), 0);
        setRemaining(Math.round(total));
      })
      .catch(() => {});
  }, []);

  return (
    <StatCard
      title="Leave Balance"
      value={`${remaining} days`}
      subtitle="Remaining this year"
      icon={Calendar}
      gradient="from-[#06B6D4] to-[#06B6D4]"
    />
  );
}
