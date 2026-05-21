import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Send, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { leaveService, type LeaveTypeRecord } from "../../services/leave.service";
import { ApiError } from "../../lib/api";

export function LeaveRequest() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeRecord[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    leaveService.types().then((res) => setLeaveTypes(res.data)).catch(() => {});
  }, []);

  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Validation function
  const validateForm = () => {
    const newErrors = {
      leaveType: "",
      startDate: "",
      endDate: "",
      reason: "",
    };

    let isValid = true;

    // Leave type validation
    if (!leaveType) {
      newErrors.leaveType = "Please select a leave type";
      isValid = false;
    }

    // Start date validation
    if (!startDate) {
      newErrors.startDate = "Start date is required";
      isValid = false;
    }

    // End date validation
    if (!endDate) {
      newErrors.endDate = "End date is required";
      isValid = false;
    } else if (startDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = "End date must be after start date";
      isValid = false;
    }

    // Reason validation
    if (!reason.trim()) {
      newErrors.reason = "Reason is required";
      isValid = false;
    } else if (reason.trim().length < 10) {
      newErrors.reason = "Reason must be at least 10 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Calculate number of days
  const calculateDays = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const selected = leaveTypes.find((t) => t.name === leaveType);
      await leaveService.create({
        leave_type_id: selected?.id,
        type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason.trim(),
      });
      setShowSuccess(true);
      setTimeout(() => navigate("/employee/leave"), 1500);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Failed to submit leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear error when user starts typing
  const handleFieldChange = (field: string, value: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: "" });
    }

    switch (field) {
      case "leaveType":
        setLeaveType(value);
        break;
      case "startDate":
        setStartDate(value);
        break;
      case "endDate":
        setEndDate(value);
        break;
      case "reason":
        setReason(value);
        break;
    }
  };

  const days = calculateDays();

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl text-[#111827]">Leave Request</h1>
              <p className="text-sm text-[#6B7280]">Submit a new leave request</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-[#DCFCE7] border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm text-[#22C55E] mb-1">Success!</h3>
                  <p className="text-sm text-[#22C55E]">
                    Your leave request has been submitted successfully. Redirecting to dashboard...
                  </p>
                </div>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Leave Type */}
                <div>
                  <label htmlFor="leaveType" className="block text-sm text-[#111827] mb-2">
                    Leave Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="leaveType"
                    value={leaveType}
                    onChange={(e) => handleFieldChange("leaveType", e.target.value)}
                    className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                      errors.leaveType
                        ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                        : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                    }`}
                  >
                    <option value="">Select leave type</option>
                    {leaveTypes.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  {submitError && (
                    <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{submitError}</p>
                    </div>
                  )}
                  {errors.leaveType && (
                    <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.leaveType}</p>
                    </div>
                  )}
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <label htmlFor="startDate" className="block text-sm text-[#111827] mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => handleFieldChange("startDate", e.target.value)}
                        className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                          errors.startDate
                            ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                            : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                        }`}
                      />
                    </div>
                    {errors.startDate && (
                      <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errors.startDate}</p>
                      </div>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label htmlFor="endDate" className="block text-sm text-[#111827] mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => handleFieldChange("endDate", e.target.value)}
                        className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                          errors.endDate
                            ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                            : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                        }`}
                      />
                    </div>
                    {errors.endDate && (
                      <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errors.endDate}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration Display */}
                {days > 0 && (
                  <div className="p-4 bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#4F46E5]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#111827]">
                        <strong>Duration:</strong> {days} {days === 1 ? "day" : "days"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label htmlFor="reason" className="block text-sm text-[#111827] mb-2">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => handleFieldChange("reason", e.target.value)}
                    placeholder="Please provide a brief reason for your leave request"
                    rows={4}
                    className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                      errors.reason
                        ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                        : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                    }`}
                  />
                  {errors.reason && (
                    <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.reason}</p>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="px-6 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    <span>{isSubmitting ? "Submitting..." : "Submit Request"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg">
              <p className="text-sm text-[#06B6D4]">
                <strong>Note:</strong> Your leave request will be sent to your manager for approval.
                You will receive a notification once your request has been reviewed.
              </p>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}