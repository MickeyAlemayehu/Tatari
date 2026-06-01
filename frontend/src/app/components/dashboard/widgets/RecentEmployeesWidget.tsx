import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Eye } from "lucide-react";
import { Badge } from "../../Badge";
import { employeesService } from "../../../../services/employees.service";
import { formatDate, initials } from "../../../../lib/utils";

interface RecentEmployee {
  id: number;
  name: string;
  role: string;
  department: string;
  joinDate: string;
  status: "active" | "inactive";
  avatar: string;
}

export default function RecentEmployeesWidget() {
  const navigate = useNavigate();
  const [recent, setRecent] = useState<RecentEmployee[]>([]);

  useEffect(() => {
    employeesService
      .list({ per_page: 5 })
      .then((res) => {
        setRecent(
          res.data.map((e) => ({
            id: e.id,
            name: `${e.first_name} ${e.last_name}`,
            role: e.position ?? "—",
            department: e.department?.name ?? "—",
            joinDate: formatDate(e.created_at),
            status: e.status === "inactive" ? "inactive" : "active",
            avatar: initials(e.first_name, e.last_name),
          }))
        );
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB]">
      <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <h2 className="text-sm text-[#111827]">Recent Employees</h2>
        <button
          onClick={() => navigate("/employees")}
          className="text-sm text-[#4F46E5] hover:underline"
        >
          View all
        </button>
      </div>
      <div className="divide-y divide-gray-200">
        {recent.map((emp) => (
          <div
            key={emp.id}
            className="px-6 py-4 flex items-center justify-between hover:bg-[#F9FAFB]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EEF2FF] rounded-full flex items-center justify-center text-sm text-[#4F46E5]">
                {emp.avatar}
              </div>
              <div>
                <p className="text-sm text-[#111827]">{emp.name}</p>
                <p className="text-xs text-[#6B7280]">
                  {emp.role} · {emp.department}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={emp.status === "active" ? "success" : "danger"} size="sm">
                {emp.status}
              </Badge>
              <button
                onClick={() => navigate(`/employees/${emp.id}`)}
                className="p-2 text-[#6B7280] hover:text-[#4F46E5]"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {recent.length === 0 && (
          <p className="p-8 text-center text-sm text-[#6B7280]">No employees found.</p>
        )}
      </div>
    </div>
  );
}
