import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { employeesService } from "../../../../services/employees.service";
import { StatCard } from "../StatCard";

export default function HeadcountWidget() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    employeesService
      .list({ per_page: 1 })
      .then((res) => setTotal(res.total))
      .catch(() => {});
  }, []);

  return (
    <StatCard
      title="Total Employees"
      value={String(total)}
      subtitle="Active workforce"
      icon={Users}
      gradient="from-[#4F46E5] to-[#4338CA]"
    />
  );
}
