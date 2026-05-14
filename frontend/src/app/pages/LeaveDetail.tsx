import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Check, X, Calendar, User, FileText, Clock } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

// Leave requests database
const leaveRequestsDatabase: Record<string, any> = {
  "1": {
    id: "1",
    employee: {
      name: "John Doe",
      employeeId: "EMP-001",
      department: "Engineering",
      position: "Software Engineer",
      avatar: "JD",
    },
    leaveType: "Annual Leave",
    startDate: "2026-05-15",
    endDate: "2026-05-19",
    days: 5,
    reason: "Family vacation to Hawaii",
    appliedDate: "2026-04-20",
    status: "pending",
    attachments: [],
  },
  "2": {
    id: "2",
    employee: {
      name: "Jane Smith",
      employeeId: "EMP-045",
      department: "Marketing",
      position: "Marketing Manager",
      avatar: "JS",
    },
    leaveType: "Sick Leave",
    startDate: "2026-05-10",
    endDate: "2026-05-12",
    days: 3,
    reason: "Medical appointment and recovery",
    appliedDate: "2026-05-08",
    status: "pending",
    attachments: ["medical_certificate.pdf"],
  },
  "3": {
    id: "3",
    employee: {
      name: "Robert Brown",
      employeeId: "EMP-089",
      department: "Sales",
      position: "Sales Executive",
      avatar: "RB",
    },
    leaveType: "Annual Leave",
    startDate: "2026-05-20",
    endDate: "2026-05-24",
    days: 5,
    reason: "Personal travel",
    appliedDate: "2026-04-25",
    status: "pending",
    attachments: [],
  },
};

export function LeaveDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get leave request by ID
  const leaveRequest = leaveRequestsDatabase[id || "1"] || leaveRequestsDatabase["1"];

  const handleApprove = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsProcessing(false);
    alert(`Leave request for ${leaveRequest.employee.name} has been approved`);
    navigate("/leave");
  };

  const handleReject = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsProcessing(false);
    alert(`Leave request for ${leaveRequest.employee.name} has been rejected`);
    navigate("/leave");
  };

  return (
    <AppLayout title="Leave Request Details" subtitle="Review and manage leave request">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <button
                onClick={() => navigate("/hr/dashboard")}
                className="hover:text-[#4F46E5] transition"
              >
                Dashboard
              </button>
              <span>/</span>
              <button
                onClick={() => navigate("/leave")}
                className="hover:text-[#4F46E5] transition"
              >
                Leave Management
              </button>
              <span>/</span>
              <span className="text-[#111827]">Request Details</span>
            </div>
          </div>

          {/* Employee Info Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-xl flex items-center justify-center text-white text-xl">
                  {leaveRequest.employee.avatar}
                </div>
                <div>
                  <h2 className="text-xl text-[#111827] mb-1">{leaveRequest.employee.name}</h2>
                  <p className="text-sm text-[#6B7280] mb-2">
                    {leaveRequest.employee.position} • {leaveRequest.employee.department}
                  </p>
                  <p className="text-xs text-[#6B7280]">ID: {leaveRequest.employee.employeeId}</p>
                </div>
              </div>
              <Badge variant="warning" size="sm">
                {leaveRequest.status}
              </Badge>
            </div>
          </div>

          {/* Leave Details */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-6">
            <h3 className="text-[#111827] mb-6 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#4F46E5]" />
              Leave Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-[#6B7280] mb-1">Leave Type</p>
                <p className="text-sm text-[#111827]">{leaveRequest.leaveType}</p>
              </div>

              <div>
                <p className="text-xs text-[#6B7280] mb-1">Duration</p>
                <p className="text-sm text-[#111827]">{leaveRequest.days} days</p>
              </div>

              <div>
                <p className="text-xs text-[#6B7280] mb-1">Start Date</p>
                <p className="text-sm text-[#111827]">
                  {new Date(leaveRequest.startDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#6B7280] mb-1">End Date</p>
                <p className="text-sm text-[#111827]">
                  {new Date(leaveRequest.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-[#6B7280] mb-1">Applied Date</p>
                <p className="text-sm text-[#111827]">
                  {new Date(leaveRequest.appliedDate).toLocaleDateString()}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-[#6B7280] mb-2">Reason</p>
                <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-sm text-[#111827]">{leaveRequest.reason}</p>
                </div>
              </div>

              {leaveRequest.attachments && leaveRequest.attachments.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-xs text-[#6B7280] mb-2">Attachments</p>
                  <div className="space-y-2">
                    {leaveRequest.attachments.map((file: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                      >
                        <FileText className="w-5 h-5 text-[#4F46E5]" />
                        <span className="text-sm text-[#111827]">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {leaveRequest.status === "pending" && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h3 className="text-[#111827] mb-4">Action Required</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#22C55E] to-[#22C55E] text-white px-6 py-3 rounded-lg hover:from-[#16A34A] hover:to-[#16A34A] transition shadow-lg disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                  {isProcessing ? "Processing..." : "Approve Leave"}
                </button>

                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#EF4444] to-[#EF4444] text-white px-6 py-3 rounded-lg hover:from-[#DC2626] hover:to-[#DC2626] transition shadow-lg disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  {isProcessing ? "Processing..." : "Reject Leave"}
                </button>
              </div>

              <button
                onClick={() => navigate("/leave")}
                className="w-full mt-4 px-6 py-3 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                Back to Leave Management
              </button>
            </div>
          )}

          {leaveRequest.status !== "pending" && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <p className="text-center text-[#6B7280] mb-4">
                This leave request has already been {leaveRequest.status}
              </p>
              <button
                onClick={() => navigate("/leave")}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg"
              >
                Back to Leave Management
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
