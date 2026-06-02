import { useNavigate } from "react-router";
import { CheckCircle } from "lucide-react";

export default function RecentActivityWidget() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
      <h3 className="text-base text-[#111827] mb-4">Recent Activity</h3>
      <div className="flex items-center gap-3 text-sm text-[#6B7280]">
        <CheckCircle className="w-5 h-5 text-[#22C55E]" />
        <span>Check notifications for the latest updates</span>
      </div>
      <button
        onClick={() => navigate("/employee/notifications")}
        className="mt-4 text-sm text-[#4F46E5] hover:underline"
      >
        View notifications
      </button>
    </div>
  );
}
