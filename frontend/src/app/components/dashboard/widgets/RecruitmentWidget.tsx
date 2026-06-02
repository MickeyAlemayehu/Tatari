import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import { jobsService } from "../../../../services/jobs.service";
import { StatCard } from "../StatCard";

export default function RecruitmentWidget() {
  const [openJobs, setOpenJobs] = useState(0);

  useEffect(() => {
    jobsService
      .list({ status: "open", per_page: 100 })
      .then((res) => setOpenJobs(res.data.length))
      .catch(() => {});
  }, []);

  return (
    <StatCard
      title="Active Job Vacancies"
      value={String(openJobs)}
      subtitle="Currently hiring"
      icon={Briefcase}
      gradient="from-[#06B6D4] to-[#06B6D4]"
    />
  );
}
