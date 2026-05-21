import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CheckCircle, XCircle, Eye, Download, Calendar, Users, DollarSign, AlertCircle, MessageSquare, ArrowLeft } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { AsyncState } from "../components/AsyncState";
import { payrollService, type PayrollRecord } from "../../services/payroll.service";
import { ApiError } from "../../lib/api";

interface Comment {
  id: number;
  author: string;
  role: string;
  date: string;
  message: string;
  type: "comment" | "approval" | "rejection";
}

export function PayrollApproval() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [comment, setComment] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<"approved" | "rejected" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payrollRows, setPayrollRows] = useState<PayrollRecord[]>([]);
  const [payrollPeriod, setPayrollPeriod] = useState({
    id: 0,
    name: "",
    startDate: "",
    endDate: "",
    payDate: "",
    status: "pending_approval",
    submittedBy: "HR Department",
    submittedDate: "",
  });

  const [comments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    payrollService
      .get(Number(id))
      .then(async (row) => {
        const period = await payrollService.period(row.year, row.month);
        const rows = period.employees ?? [];
        setPayrollRows(rows);
        setPayrollPeriod({
          id: period.id ?? Number(id),
          name: period.name,
          startDate: period.startDate ?? "",
          endDate: period.endDate ?? "",
          payDate: period.payDate ?? "",
          status: period.status,
          submittedBy: "HR Department",
          submittedDate: new Date().toISOString().slice(0, 10),
        });
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load payroll for approval.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const summary = useMemo(() => {
    const deptMap = new Map<string, { name: string; employees: number; amount: number }>();
    let totalGrossPay = 0;
    let totalDeductions = 0;
    let totalNetPay = 0;
    for (const r of payrollRows) {
      const dept = r.employee?.department ?? r.department ?? "Other";
      const net = r.netPay ?? r.net_salary ?? 0;
      const gross = r.grossPay ?? 0;
      const ded = r.totalDeductions ?? 0;
      totalGrossPay += gross;
      totalDeductions += ded;
      totalNetPay += net;
      const existing = deptMap.get(dept) ?? { name: dept, employees: 0, amount: 0 };
      existing.employees += 1;
      existing.amount += net;
      deptMap.set(dept, existing);
    }
    return {
      totalEmployees: payrollRows.length,
      totalGrossPay,
      totalDeductions,
      totalNetPay,
      departments: Array.from(deptMap.values()),
    };
  }, [payrollRows]);

  const handleApprove = async () => {
    if (!payrollRows.length) return;
    setIsProcessing(true);
    try {
      await Promise.all(payrollRows.map((r) => payrollService.approve(r.id)));
      setApprovalStatus("approved");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to approve payroll.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    if (!payrollRows.length) return;
    setIsProcessing(true);
    try {
      await Promise.all(
        payrollRows.map((r) => payrollService.reject(r.id, rejectReason.trim()))
      );
      setApprovalStatus("rejected");
      setShowRejectModal(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reject payroll.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Add comment
  const handleAddComment = () => {
    if (!comment.trim()) return;
    
    console.log("Adding comment:", comment);
    setComment("");
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Success/Rejection state
  if (approvalStatus) {
    const isApproved = approvalStatus === "approved";
    
    return (
      <AppLayout>
        {/* Result Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/payroll")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">
                  Payroll {isApproved ? "Approved" : "Rejected"}
                </h1>
                <p className="text-sm text-[#6B7280]">The payroll decision has been recorded</p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="max-w-2xl w-full">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
                <div className={`w-20 h-20 bg-gradient-to-br ${
                  isApproved 
                    ? "from-[#22C55E] to-[#22C55E]" 
                    : "from-[#EF4444] to-[#EF4444]"
                } rounded-full flex items-center justify-center mx-auto mb-6`}>
                  {isApproved ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <XCircle className="w-10 h-10 text-white" />
                  )}
                </div>
                
                <h2 className="text-2xl text-[#111827] mb-3">
                  Payroll {isApproved ? "Approved" : "Rejected"}
                </h2>
                <p className="text-sm text-[#6B7280] mb-8">
                  {isApproved 
                    ? `${payrollPeriod.name} has been approved and will be processed for payment.`
                    : `${payrollPeriod.name} has been rejected and returned to HR for revision.`
                  }
                </p>

                {!isApproved && rejectReason && (
                  <div className="mb-8 p-4 bg-[#FEF2F2] border border-[#EF4444]/20 rounded-lg text-left">
                    <p className="text-xs text-[#EF4444] mb-1">Rejection Reason</p>
                    <p className="text-sm text-[#EF4444]">{rejectReason}</p>
                  </div>
                )}

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-[#F9FAFB] rounded-xl">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Employees</p>
                    <p className="text-xl text-[#111827]">{summary.totalEmployees}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Payment Date</p>
                    <p className="text-xl text-[#111827]">{formatDate(payrollPeriod.payDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Total Amount</p>
                    <p className={`text-xl ${isApproved ? "text-[#22C55E]" : "text-[#111827]"}`}>
                      {formatCurrency(summary.totalNetPay)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate("/payroll")}
                    className="flex-1 px-6 py-3 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
                  >
                    Back to Payroll
                  </button>
                  {isApproved && (
                    <button
                      onClick={() => navigate(`/payroll/${id}/review`)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-3 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
                    >
                      <Eye className="w-5 h-5" />
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/payroll")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">Approve Payroll</h1>
                <p className="text-sm text-[#6B7280]">{payrollPeriod.name}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/payroll/${id}/review`)}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">View Full Details</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Period Information */}
            <div className="bg-white rounded-xl border border-[#4F46E5]/20 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-[#4F46E5]" />
                  </div>
                  <div>
                    <h3 className="text-base text-[#111827] mb-1">{payrollPeriod.name}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                        <span>Period: {formatDate(payrollPeriod.startDate)} - {formatDate(payrollPeriod.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                        <span>Payment Date: {formatDate(payrollPeriod.payDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                        <User className="w-4 h-4" />
                        <span>Submitted by {payrollPeriod.submittedBy} on {payrollPeriod.submittedDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">
                  <Clock className="w-3.5 h-3.5" />
                  Pending Approval
                </span>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Employees */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#6B7280]">Employees</span>
                  <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#4F46E5]" />
                  </div>
                </div>
                <div className="text-3xl text-[#111827]">{summary.totalEmployees}</div>
                <p className="text-xs text-[#6B7280] mt-1">{summary.departments.length} departments</p>
              </div>

              {/* Gross Pay */}
              <div className="bg-white rounded-xl border border-[#06B6D4]/20 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-blue-600">Gross Pay</span>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl text-[#06B6D4]">{formatCurrency(summary.totalGrossPay)}</div>
                <p className="text-xs text-blue-600 mt-1">Before deductions</p>
              </div>

              {/* Total Deductions */}
              <div className="bg-white rounded-xl border border-[#EF4444]/20 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#EF4444]">Deductions</span>
                  <div className="w-10 h-10 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#EF4444]" />
                  </div>
                </div>
                <div className="text-3xl text-[#EF4444]">-{formatCurrency(summary.totalDeductions)}</div>
                <p className="text-xs text-[#EF4444] mt-1">Tax & benefits</p>
              </div>

              {/* Net Pay */}
              <div className="bg-white rounded-xl border border-green-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#22C55E]">Net Pay</span>
                  <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                  </div>
                </div>
                <div className="text-3xl text-[#22C55E]">{formatCurrency(summary.totalNetPay)}</div>
                <p className="text-xs text-[#22C55E] mt-1">Total payout</p>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-base text-[#111827] mb-4">Department Breakdown</h2>
              <div className="space-y-3">
                {summary.departments.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-[#111827] mb-1">{dept.name}</p>
                      <p className="text-xs text-[#6B7280]">{dept.employees} employee{dept.employees !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base text-[#111827]">{formatCurrency(dept.amount)}</p>
                      <p className="text-xs text-[#6B7280]">
                        {((dept.amount / summary.totalNetPay) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[#4F46E5]" />
                </div>
                <div>
                  <h2 className="text-base text-[#111827]">Comments & Discussion</h2>
                  <p className="text-sm text-[#6B7280]">{comments.length} comment{comments.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4 mb-6">
                {comments.map((commentItem) => (
                  <div key={commentItem.id} className="border border-[#E5E7EB] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-white font-medium">
                            {commentItem.author.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-[#111827]">{commentItem.author}</p>
                          <p className="text-xs text-[#6B7280]">{commentItem.role}</p>
                        </div>
                      </div>
                      <span className="text-xs text-[#6B7280]">{commentItem.date}</span>
                    </div>
                    <p className="text-sm text-[#111827]">{commentItem.message}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="border-t border-[#E5E7EB] pt-6">
                <label className="block text-sm text-[#111827] mb-2">Add a Comment</label>
                <div className="flex gap-3">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="flex-1 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] resize-none"
                    placeholder="Share your thoughts or questions about this payroll..."
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                    className="self-end px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Approval Actions */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-start gap-3 mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-900 mb-1">Review Carefully Before Approving</p>
                  <p className="text-xs text-yellow-700">
                    Once approved, this payroll will be queued for payment processing. Make sure all amounts and employee data are correct.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#EF4444]/30 text-red-700 rounded-lg hover:bg-[#FEF2F2] transition disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Payroll
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#22C55E] to-[#22C55E] text-white px-6 py-3 rounded-lg hover:from-[#22C55E] hover:to-[#22C55E] transition shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Approve Payroll
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-[#EF4444]" />
              </div>
              <div>
                <h3 className="text-lg text-[#111827]">Reject Payroll</h3>
                <p className="text-sm text-[#6B7280]">Please provide a reason for rejection</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-[#111827] mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF4444] resize-none"
                placeholder="Explain why this payroll is being rejected..."
              />
              <p className="mt-2 text-xs text-[#6B7280]">
                This reason will be shared with the HR team so they can make necessary corrections.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2.5 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isProcessing}
                className="flex-1 flex items-center justify-center gap-2 bg-[#EF4444] text-white px-4 py-2.5 rounded-lg hover:bg-[#EF4444] transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Reject Payroll
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}