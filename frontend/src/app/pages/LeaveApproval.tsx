import { useState } from "react";
import { useNavigate } from "react-router";
import { Check, X, Eye, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

interface LeaveRequest {
  id: number;
  employee: {
    name: string;
    position: string;
    department: string;
    avatar: string;
  };
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  appliedDate: string;
  status: "pending" | "approved" | "rejected";
}

export function LeaveApproval() {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [actionStatus, setActionStatus] = useState<{
    show: boolean;
    type: "approve" | "reject";
    message: string;
  } | null>(null);

  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([
    {
      id: 1,
      employee: {
        name: "Emily Davis",
        position: "Marketing Specialist",
        department: "Marketing",
        avatar: "ED",
      },
      type: "Annual Leave",
      startDate: "2026-04-01",
      endDate: "2026-04-03",
      days: 3,
      reason: "Personal matters to attend to. Planning a short trip with family.",
      appliedDate: "2026-03-20",
      status: "pending",
    },
    {
      id: 2,
      employee: {
        name: "David Martinez",
        position: "Senior Developer",
        department: "Engineering",
        avatar: "DM",
      },
      type: "Annual Leave",
      startDate: "2026-05-10",
      endDate: "2026-05-17",
      days: 8,
      reason: "International travel and vacation. Booked flights and accommodation for a week-long trip.",
      appliedDate: "2026-03-15",
      status: "pending",
    },
    {
      id: 3,
      employee: {
        name: "Robert Brown",
        position: "Product Designer",
        department: "Design",
        avatar: "RB",
      },
      type: "Personal Leave",
      startDate: "2026-04-05",
      endDate: "2026-04-05",
      days: 1,
      reason: "Attending a personal event - family celebration.",
      appliedDate: "2026-03-19",
      status: "pending",
    },
    {
      id: 4,
      employee: {
        name: "Jennifer Taylor",
        position: "HR Manager",
        department: "Human Resources",
        avatar: "JT",
      },
      type: "Sick Leave",
      startDate: "2026-03-28",
      endDate: "2026-03-29",
      days: 2,
      reason: "Medical appointment and follow-up consultation with specialist.",
      appliedDate: "2026-03-22",
      status: "pending",
    },
    {
      id: 5,
      employee: {
        name: "Alex Johnson",
        position: "Sales Representative",
        department: "Sales",
        avatar: "AJ",
      },
      type: "Annual Leave",
      startDate: "2026-04-20",
      endDate: "2026-04-24",
      days: 5,
      reason: "Taking time off for rest and relaxation. Planning to spend time with family.",
      appliedDate: "2026-03-18",
      status: "pending",
    },
    {
      id: 6,
      employee: {
        name: "Michelle Chen",
        position: "Content Writer",
        department: "Marketing",
        avatar: "MC",
      },
      type: "Personal Leave",
      startDate: "2026-04-12",
      endDate: "2026-04-14",
      days: 3,
      reason: "Moving to a new apartment and need time to settle in.",
      appliedDate: "2026-03-17",
      status: "pending",
    },
  ]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      weekday: "short",
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    // Update request status
    setPendingRequests((prev) =>
      prev.filter((req) => req.id !== selectedRequest.id)
    );

    // Show success message
    setActionStatus({
      show: true,
      type: "approve",
      message: `Leave request for ${selectedRequest.employee.name} has been approved`,
    });

    // Clear selection after delay
    setTimeout(() => {
      setSelectedRequest(null);
      setActionStatus(null);
    }, 2000);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    // Validate reject reason
    if (!rejectReason.trim()) {
      setRejectError("Please provide a reason for rejection");
      return;
    }

    if (rejectReason.trim().length < 10) {
      setRejectError("Reason must be at least 10 characters");
      return;
    }

    // Update request status
    setPendingRequests((prev) =>
      prev.filter((req) => req.id !== selectedRequest.id)
    );

    // Show success message
    setActionStatus({
      show: true,
      type: "reject",
      message: `Leave request for ${selectedRequest.employee.name} has been rejected`,
    });

    // Reset states after delay
    setTimeout(() => {
      setSelectedRequest(null);
      setShowRejectInput(false);
      setRejectReason("");
      setRejectError("");
      setActionStatus(null);
    }, 2000);
  };

  const handleRejectClick = () => {
    setShowRejectInput(true);
    setRejectError("");
  };

  const handleCancelReject = () => {
    setShowRejectInput(false);
    setRejectReason("");
    setRejectError("");
  };

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-[#111827]">Leave Approval</h1>
              <p className="text-sm text-[#6B7280]">
                Review and approve pending leave requests
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#FFFBEB] border border-[#F59E0B]/20 rounded-lg">
              <Calendar className="w-5 h-5 text-[#F59E0B]" />
              <span className="text-sm text-[#F59E0B]">
                {pendingRequests.length} pending request{pendingRequests.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </header>

        {/* Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Request List */}
          <div className="w-full lg:w-96 border-r border-[#E5E7EB] bg-white overflow-y-auto">
            <div className="p-4">
              <h2 className="text-sm text-[#6B7280] mb-3 px-2">PENDING REQUESTS</h2>
              
              {pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[#6B7280]">
                  <CheckCircle className="w-12 h-12 mb-3" />
                  <p className="text-sm text-[#6B7280]">All caught up!</p>
                  <p className="text-xs text-[#6B7280]">No pending requests to review</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingRequests.map((request) => (
                    <button
                      key={request.id}
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRejectInput(false);
                        setRejectReason("");
                        setRejectError("");
                      }}
                      className={`w-full p-4 rounded-lg border transition text-left ${
                        selectedRequest?.id === request.id
                          ? "border-[#4F46E5] bg-[#EEF2FF]"
                          : "border-[#E5E7EB] hover:border-[#E5E7EB] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                          {request.employee.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#111827] mb-0.5">
                            {request.employee.name}
                          </p>
                          <p className="text-xs text-[#6B7280] mb-2">
                            {request.employee.position}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{request.days} {request.days === 1 ? "day" : "days"}</span>
                            <span>•</span>
                            <span>{request.type}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Request Details */}
          <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
            {actionStatus?.show ? (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <div
                    className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                      actionStatus.type === "approve"
                        ? "bg-[#DCFCE7]"
                        : "bg-[#FEF2F2]"
                    }`}
                  >
                    {actionStatus.type === "approve" ? (
                      <Check className="w-8 h-8 text-[#22C55E]" />
                    ) : (
                      <X className="w-8 h-8 text-[#EF4444]" />
                    )}
                  </div>
                  <h3 className="text-lg text-[#111827] mb-2">
                    {actionStatus.type === "approve" ? "Approved!" : "Rejected"}
                  </h3>
                  <p className="text-sm text-[#6B7280]">{actionStatus.message}</p>
                </div>
              </div>
            ) : selectedRequest ? (
              <div className="p-6 space-y-6">
                {/* Employee Info */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                      {selectedRequest.employee.avatar}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg text-[#111827] mb-1">
                        {selectedRequest.employee.name}
                      </h2>
                      <p className="text-sm text-[#6B7280] mb-1">
                        {selectedRequest.employee.position}
                      </p>
                      <p className="text-sm text-[#6B7280]">
                        {selectedRequest.employee.department}
                      </p>
                    </div>
                    <Badge variant="warning" size="sm">
                      Pending Review
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5E7EB]">
                    <div>
                      <p className="text-xs text-[#6B7280] mb-1">Leave Type</p>
                      <p className="text-sm text-[#111827]">{selectedRequest.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280] mb-1">Applied On</p>
                      <p className="text-sm text-[#111827]">
                        {formatDate(selectedRequest.appliedDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Leave Details */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <h3 className="text-sm text-[#111827] mb-4">Leave Details</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg">
                      <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-[#4F46E5]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#4F46E5] mb-1">Duration</p>
                        <p className="text-lg text-[#111827]">
                          {selectedRequest.days} {selectedRequest.days === 1 ? "day" : "days"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[#6B7280] mb-2">Start Date</p>
                        <p className="text-sm text-[#111827]">
                          {formatDate(selectedRequest.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280] mb-2">End Date</p>
                        <p className="text-sm text-[#111827]">
                          {formatDate(selectedRequest.endDate)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-[#6B7280] mb-2">Reason for Leave</p>
                      <p className="text-sm text-[#111827] leading-relaxed">
                        {selectedRequest.reason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rejection Input */}
                {showRejectInput && (
                  <div className="bg-white rounded-xl border border-[#EF4444]/20 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-[#EF4444]" />
                      <h3 className="text-sm text-[#111827]">Reason for Rejection</h3>
                    </div>
                    
                    <div className="mb-4">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => {
                          setRejectReason(e.target.value);
                          setRejectError("");
                        }}
                        placeholder="Please provide a detailed reason for rejecting this leave request..."
                        rows={4}
                        className={`w-full px-4 py-3 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                          rejectError
                            ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                            : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                        }`}
                      />
                      {rejectError && (
                        <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                          <AlertCircle className="w-4 h-4" />
                          <p className="text-sm">{rejectError}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleReject}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#EF4444] text-white px-4 py-2.5 rounded-lg hover:bg-[#EF4444] transition"
                      >
                        <X className="w-5 h-5" />
                        <span>Confirm Rejection</span>
                      </button>
                      <button
                        onClick={handleCancelReject}
                        className="px-4 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {!showRejectInput && (
                  <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                    <h3 className="text-sm text-[#111827] mb-4">Decision</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleApprove}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#22C55E] to-[#22C55E] text-white px-4 py-3 rounded-lg hover:from-[#22C55E] hover:to-[#22C55E] transition shadow-lg hover:shadow-xl"
                      >
                        <Check className="w-5 h-5" />
                        <span>Approve Request</span>
                      </button>
                      <button
                        onClick={handleRejectClick}
                        className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-red-500 text-[#EF4444] px-4 py-3 rounded-lg hover:bg-[#FEF2F2] transition"
                      >
                        <X className="w-5 h-5" />
                        <span>Reject Request</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Info Note */}
                <div className="bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg p-4">
                  <p className="text-sm text-[#06B6D4]">
                    <strong>Note:</strong> The employee will be notified via email once you
                    approve or reject their leave request.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center text-[#6B7280]">
                  <Calendar className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-sm text-[#6B7280]">Select a request to review</p>
                  <p className="text-xs text-[#6B7280]">
                    Choose a pending request from the list to view details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}