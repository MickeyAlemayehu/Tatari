import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  applicantsService,
  type ApplicantRecord,
  type ApplicantStatus,
} from "../../services/applicants.service";
import { AsyncState } from "../components/AsyncState";
import { ApiError } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { useActionSound } from "../hooks/useActionSound";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Download,
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  GraduationCap,
  FileText,
  Eye,
  Building,
  Clock,
  Award,
  Loader2,
  Pause,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";

interface ApplicantView {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  jobTitle: string;
  jobId: number;
  department: string;
  appliedDate: string;
  status: ApplicantStatus;
  experience: string;
  rating: number;
  coverLetter: string;
  resumePath: string | null;
  interviewAt: string | null;
}

const STATUS_STYLES: Record<ApplicantStatus, string> = {
  new: "bg-blue-100 text-blue-700 border-[#06B6D4]/20",
  reviewing: "bg-[#EEF2FF] text-[#4F46E5] border-purple-200",
  shortlisted: "bg-[#DCFCE7] text-[#22C55E] border-green-200",
  rejected: "bg-[#FEF2F2] text-red-700 border-[#EF4444]/20",
  hired: "bg-[#EEF2FF] text-indigo-700 border-[#4F46E5]/20",
  interview_scheduled: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_LABELS: Record<ApplicantStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  hired: "Hired",
  interview_scheduled: "Interview Scheduled",
};

function isApplicantStatus(value: string | undefined | null): value is ApplicantStatus {
  return (
    value === "new" ||
    value === "reviewing" ||
    value === "shortlisted" ||
    value === "rejected" ||
    value === "hired" ||
    value === "interview_scheduled"
  );
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function mapApplicant(a: ApplicantRecord): ApplicantView {
  const name = a.name ?? `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim();
  const parts = name.split(" ").filter(Boolean);
  const avatar =
    parts.length >= 2
      ? `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  const record = a as ApplicantRecord & { resumePath?: string | null };
  return {
    id: a.id,
    name,
    email: a.email,
    phone: a.phone ?? "—",
    location: a.location ?? "—",
    avatar,
    jobTitle: a.jobTitle ?? "—",
    jobId: a.jobId ?? 0,
    department: a.department ?? "—",
    appliedDate: a.appliedDate ?? "",
    status: isApplicantStatus(a.status) ? a.status : "new",
    experience: a.experience ?? "—",
    rating: a.rating ?? 0,
    coverLetter: a.coverLetter ?? "",
    resumePath: record.resumePath ?? null,
    interviewAt: a.interviewAt ?? null,
  };
}

export function ApplicantProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasPermission } = useAuth();
  const { playSendSound } = useActionSound();
  const canManage = hasPermission("manage_employees");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [applicant, setApplicant] = useState<ApplicantView | null>(null);

  const [actionPending, setActionPending] = useState<ApplicantStatus | "schedule" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewType, setInterviewType] = useState("video");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    applicantsService
      .get(Number(id))
      .then((a) => {
        if (cancelled) return;
        setApplicant(mapApplicant(a));
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof ApiError ? err.message : "Failed to load applicant.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const friendlyError = (err: unknown, fallback: string): string => {
    if (err instanceof ApiError) {
      if (err.status === 403) return "You are not authorized to perform this action.";
      return err.message;
    }
    return fallback;
  };

  const flashSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const updateStatus = async (status: ApplicantStatus, successMsg: string) => {
    if (!id || !applicant) return;
    setActionPending(status);
    setActionError(null);
    setActionSuccess(null);
    try {
      const updated = await applicantsService.update(Number(id), { status });
      setApplicant(mapApplicant(updated));
      playSendSound();
      flashSuccess(successMsg);
    } catch (err) {
      setActionError(friendlyError(err, "Failed to update status."));
    } finally {
      setActionPending(null);
    }
  };

  const handleScheduleInterview = async () => {
    if (!id || !applicant) return;
    if (!interviewDate || !interviewTime) {
      setActionError("Please pick a date and time for the interview.");
      return;
    }
    const interview_at = new Date(`${interviewDate}T${interviewTime}`);
    if (Number.isNaN(interview_at.getTime())) {
      setActionError("That date/time isn't valid.");
      return;
    }
    setActionPending("schedule");
    setActionError(null);
    setActionSuccess(null);
    try {
      const updated = await applicantsService.update(Number(id), {
        status: "interview_scheduled",
        interview_at: interview_at.toISOString(),
      });
      setApplicant(mapApplicant(updated));
      setShowScheduleModal(false);
      setInterviewDate("");
      setInterviewTime("");
      setInterviewType("video");
      playSendSound();
      flashSuccess("Interview scheduled.");
    } catch (err) {
      setActionError(friendlyError(err, "Failed to schedule interview."));
    } finally {
      setActionPending(null);
    }
  };

  const handleSendMessage = () => {
    if (!applicant?.email) return;
    const subject = encodeURIComponent(`Regarding your application for ${applicant.jobTitle}`);
    window.location.href = `mailto:${applicant.email}?subject=${subject}`;
  };

  const handleDownloadResume = () => {
    if (!applicant?.resumePath) {
      setActionError("This applicant has no resume on file.");
      return;
    }
    const base = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/api$/, "");
    window.open(`${base}/storage/${applicant.resumePath}`, "_blank", "noopener,noreferrer");
  };

  if (loading || loadError || !applicant) {
    return (
      <AppLayout title="Applicant" subtitle="View applicant details">
        <div className="p-6">
          <AsyncState loading={loading} error={loadError} empty={!loading && !loadError && !applicant} />
        </div>
      </AppLayout>
    );
  }

  const status = applicant.status;
  const canTransitionFromHere = status === "new" || status === "reviewing" || status === "interview_scheduled";
  const showSchedule = canManage && (status === "new" || status === "reviewing");
  const showAccept = canManage && canTransitionFromHere;
  const showReject = canManage && canTransitionFromHere;
  const showWaitlist = canManage && canTransitionFromHere;

  const renderStatusBadge = (s: ApplicantStatus) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${STATUS_STYLES[s]}`}>
      {STATUS_LABELS[s]}
    </span>
  );

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/applicants")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">{applicant.name}</h1>
                <p className="text-sm text-[#6B7280]">Applied for {applicant.jobTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadResume}
                disabled={!applicant.resumePath}
                className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition disabled:opacity-40 disabled:cursor-not-allowed"
                title={applicant.resumePath ? "Download resume" : "No resume on file"}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download Resume</span>
              </button>
              <button
                onClick={handleSendMessage}
                className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Message</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {actionSuccess && (
              <div className="p-4 bg-[#DCFCE7] border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#22C55E]">{actionSuccess}</p>
              </div>
            )}
            {actionError && (
              <div className="p-4 bg-[#FEF2F2] border border-[#EF4444]/20 rounded-lg text-sm text-[#EF4444]">
                {actionError}
              </div>
            )}

            {/* Overview */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex flex-col items-center lg:items-start gap-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-2xl">
                    {applicant.avatar}
                  </div>
                  {renderStatusBadge(status)}
                  {applicant.rating > 0 && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(applicant.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-[#6B7280]">{applicant.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#6B7280] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#6B7280] mb-0.5">Email</p>
                      <p className="text-sm text-[#111827]">{applicant.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#6B7280] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#6B7280] mb-0.5">Phone</p>
                      <p className="text-sm text-[#111827]">{applicant.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#6B7280] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#6B7280] mb-0.5">Location</p>
                      <p className="text-sm text-[#111827]">{applicant.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-[#6B7280] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#6B7280] mb-0.5">Experience</p>
                      <p className="text-sm text-[#111827]">{applicant.experience}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-[#6B7280] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#6B7280] mb-0.5">Department</p>
                      <p className="text-sm text-[#111827]">{applicant.department}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#6B7280] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#6B7280] mb-0.5">Applied Date</p>
                      <p className="text-sm text-[#111827]">{formatDate(applicant.appliedDate)}</p>
                    </div>
                  </div>

                  {applicant.interviewAt && (
                    <div className="flex items-start gap-3 md:col-span-2">
                      <Clock className="w-5 h-5 text-[#4F46E5] mt-0.5" />
                      <div>
                        <p className="text-xs text-[#6B7280] mb-0.5">Interview Scheduled</p>
                        <p className="text-sm text-[#111827]">{formatDateTime(applicant.interviewAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {canManage && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <h2 className="text-sm text-[#111827] mb-4">Actions</h2>
                <div className="flex flex-wrap gap-3">
                  {showSchedule && (
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      disabled={actionPending !== null}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      <Calendar className="w-5 h-5" />
                      {applicant.interviewAt ? "Reschedule Interview" : "Schedule Interview"}
                    </button>
                  )}
                  {showAccept && (
                    <button
                      onClick={() => updateStatus("hired", "Applicant accepted.")}
                      disabled={actionPending !== null}
                      className="flex items-center gap-2 bg-[#22C55E] text-white px-6 py-2.5 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                    >
                      {actionPending === "hired" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      Accept
                    </button>
                  )}
                  {showWaitlist && (
                    <button
                      onClick={() => updateStatus("shortlisted", "Applicant waitlisted.")}
                      disabled={actionPending !== null}
                      className="flex items-center gap-2 border border-[#4F46E5]/30 text-[#4F46E5] bg-[#EEF2FF] px-6 py-2.5 rounded-lg hover:bg-[#E0E7FF] transition disabled:opacity-50"
                    >
                      {actionPending === "shortlisted" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Pause className="w-5 h-5" />
                      )}
                      Waitlist
                    </button>
                  )}
                  {showReject && (
                    <button
                      onClick={() => updateStatus("rejected", "Applicant rejected.")}
                      disabled={actionPending !== null}
                      className="flex items-center gap-2 bg-[#EF4444] text-white px-6 py-2.5 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                    >
                      {actionPending === "rejected" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      Reject
                    </button>
                  )}
                  <button
                    onClick={handleSendMessage}
                    className="flex items-center gap-2 border border-[#E5E7EB] text-[#111827] px-6 py-2.5 rounded-lg hover:bg-[#F9FAFB] transition"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Send Email
                  </button>
                </div>
                {!showSchedule && !showAccept && !showReject && !showWaitlist && (
                  <p className="text-xs text-[#6B7280]">
                    This applicant is in a final state. No further status changes are available.
                  </p>
                )}
              </div>
            )}

            {/* Cover Letter */}
            {applicant.coverLetter && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-[#4F46E5]" />
                  <h2 className="text-sm text-[#111827]">Cover Letter</h2>
                </div>
                <div className="prose prose-sm max-w-none">
                  {applicant.coverLetter.split("\n").map((paragraph, index) =>
                    paragraph.trim() ? (
                      <p key={index} className="text-sm text-[#111827] leading-relaxed mb-3">
                        {paragraph}
                      </p>
                    ) : (
                      <div key={index} className="h-2" />
                    )
                  )}
                </div>
              </div>
            )}

            {/* Resume */}
            {applicant.resumePath && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#4F46E5]" />
                    <h2 className="text-sm text-[#111827]">Resume</h2>
                  </div>
                  <button
                    onClick={handleDownloadResume}
                    className="flex items-center gap-2 text-[#4F46E5] hover:text-indigo-700 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Open Resume
                  </button>
                </div>
                <p className="text-xs text-[#6B7280]">{applicant.resumePath}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-sm text-[#111827] mb-4">Application Timeline</h2>
              <div className="space-y-4">
                {applicant.interviewAt && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="w-px h-full bg-gray-200 mt-2" />
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="text-sm text-[#111827] mb-1">Interview Scheduled</p>
                      <p className="text-xs text-[#6B7280]">{formatDateTime(applicant.interviewAt)}</p>
                    </div>
                  </div>
                )}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#111827] mb-1">Application Submitted</p>
                    <p className="text-xs text-[#6B7280]">{formatDate(applicant.appliedDate)}</p>
                    <p className="text-sm text-[#6B7280] mt-2">
                      Candidate applied for {applicant.jobTitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg text-[#111827] mb-4">Schedule Interview</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#111827] mb-2">Interview Date</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#111827] mb-2">Interview Time</label>
                <input
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-sm text-[#111827] mb-2">Interview Type</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="in-person">In Person</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setActionError(null);
                }}
                disabled={actionPending === "schedule"}
                className="flex-1 px-4 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleInterview}
                disabled={actionPending === "schedule"}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition disabled:opacity-50"
              >
                {actionPending === "schedule" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Schedule"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
