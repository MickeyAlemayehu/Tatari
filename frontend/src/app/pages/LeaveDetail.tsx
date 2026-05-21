import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Check, X, Calendar, User, FileText, Clock } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { AsyncState } from "../components/AsyncState";
import { leaveService, type LeaveRequestRecord } from "../../services/leave.service";
import { ApiError } from "../../lib/api";

export function LeaveDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequestRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    leaveService
      .get(Number(id))
      .then(setLeaveRequest)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load leave request.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    if (!leaveRequest) return;
    setIsProcessing(true);
    try {
      await leaveService.approve(leaveRequest.id);
      navigate("/leave");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to approve.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!leaveRequest || !rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setIsProcessing(true);
    try {
      await leaveService.reject(leaveRequest.id, rejectReason);
      navigate("/leave");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to reject.");
    } finally {
      setIsProcessing(false);
    }
  };

  const employee = leaveRequest?.employee;

  return (
    <AppLayout title="Leave Request Details" subtitle="Review and take action">
      <div className="p-6 max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/leave")}
          className="mb-6 flex items-center gap-2 text-[#6B7280] hover:text-[#111827]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to leave management
        </button>

        <AsyncState loading={loading} error={error} empty={!leaveRequest}>
          {leaveRequest && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white">
                    {employee?.avatar ?? "?"}
                  </div>
                  <div>
                    <h2 className="text-lg text-[#111827]">{employee?.name ?? "Employee"}</h2>
                    <p className="text-sm text-[#6B7280]">
                      {employee?.department} · {employee?.position}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    leaveRequest.status === "approved"
                      ? "success"
                      : leaveRequest.status === "rejected"
                      ? "danger"
                      : "warning"
                  }
                >
                  {leaveRequest.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#F9FAFB] rounded-lg">
                  <p className="text-xs text-[#6B7280] mb-1">Leave Type</p>
                  <p className="text-sm text-[#111827]">{leaveRequest.type ?? leaveRequest.leaveType}</p>
                </div>
                <div className="p-4 bg-[#F9FAFB] rounded-lg">
                  <p className="text-xs text-[#6B7280] mb-1">Duration</p>
                  <p className="text-sm text-[#111827]">{leaveRequest.days} day(s)</p>
                </div>
                <div className="p-4 bg-[#F9FAFB] rounded-lg">
                  <p className="text-xs text-[#6B7280] mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Start
                  </p>
                  <p className="text-sm text-[#111827]">{leaveRequest.startDate}</p>
                </div>
                <div className="p-4 bg-[#F9FAFB] rounded-lg">
                  <p className="text-xs text-[#6B7280] mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> End
                  </p>
                  <p className="text-sm text-[#111827]">{leaveRequest.endDate}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-[#6B7280] mb-2 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Reason
                </p>
                <p className="text-sm text-[#111827]">{leaveRequest.reason || "—"}</p>
              </div>

              <p className="text-xs text-[#6B7280] flex items-center gap-1">
                <Clock className="w-3 h-3" /> Applied {leaveRequest.appliedDate}
              </p>

              {leaveRequest.status === "pending" && (
                <div className="pt-4 border-t border-[#E5E7EB] space-y-4">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Rejection reason (required to reject)"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => void handleApprove()}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#22C55E] text-white py-2.5 rounded-lg disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => void handleReject()}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#EF4444] text-white py-2.5 rounded-lg disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </AsyncState>
      </div>
    </AppLayout>
  );
}
