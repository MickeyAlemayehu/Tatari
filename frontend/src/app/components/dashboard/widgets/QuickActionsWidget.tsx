import { useNavigate } from "react-router";
import { Calendar, ClipboardList } from "lucide-react";

export default function QuickActionsWidget() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
      <h3 className="text-base text-[#111827] mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <button
          onClick={() => navigate("/employee/leave")}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:border-[#06B6D4] transition text-left"
        >
          <Calendar className="w-5 h-5 text-[#06B6D4]" />
          <span className="text-sm">Request Leave</span>
        </button>
        <button
          onClick={() => navigate("/employee/performance")}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:border-[#4F46E5] transition text-left"
        >
          <ClipboardList className="w-5 h-5 text-[#4F46E5]" />
          <span className="text-sm">View Evaluations</span>
        </button>
      </div>
    </div>
  );
}
