import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Filter,
  Eye,
  Star,
  Briefcase,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Pause,
  Loader2,
  Sparkles,
  ArrowDownUp,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { AsyncState } from "../components/AsyncState";
import {
  applicantsService,
  type ApplicantRecord,
  type ApplicantRecommendation,
  type ApplicantStatus,
} from "../../services/applicants.service";
import { ApiError } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { initials } from "../../lib/utils";

interface ApplicantRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  jobId: number;
  department: string;
  appliedDate: string;
  status: ApplicantStatus;
  experience: string;
  location: string;
  avatar: string;
  interviewAt: string | null;
  recommendation: ApplicantRecommendation | null;
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

const STATUS_LIST: ApplicantStatus[] = [
  "new",
  "reviewing",
  "interview_scheduled",
  "shortlisted",
  "rejected",
  "hired",
];

function isApplicantStatus(value: string | undefined | null): value is ApplicantStatus {
  return STATUS_LIST.includes(value as ApplicantStatus);
}

function mapRow(a: ApplicantRecord): ApplicantRow {
  return {
    id: a.id,
    name: a.name,
    email: a.email,
    phone: a.phone ?? "",
    jobTitle: a.jobTitle ?? "—",
    jobId: a.jobId ?? 0,
    department: a.department ?? "—",
    appliedDate: a.appliedDate ?? "",
    status: isApplicantStatus(a.status) ? a.status : "new",
    experience: a.experience ?? "—",
    location: a.location ?? "—",
    avatar: initials(
      a.firstName ?? a.name.split(" ")[0],
      (a.lastName ?? a.name.split(" ").slice(1).join(" ")) || "?"
    ),
    interviewAt: a.interviewAt ?? null,
    recommendation: a.recommendation ?? null,
  };
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ApplicantManagement() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("manage_employees");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | ApplicantStatus>("all");
  const [filterJob, setFilterJob] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState<number[]>([]);
  const [sortByScore, setSortByScore] = useState(false);

  const [applicants, setApplicants] = useState<ApplicantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [bulkPending, setBulkPending] = useState<ApplicantStatus | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await applicantsService.list({ per_page: 100 });
      setApplicants(res.data.map(mapRow));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load applicants.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const jobs = useMemo(
    () => Array.from(new Set(applicants.map((a) => a.jobTitle))).filter((t) => t !== "—"),
    [applicants]
  );
  const departments = useMemo(
    () => Array.from(new Set(applicants.map((a) => a.department))).filter((d) => d !== "—"),
    [applicants]
  );

  const filteredApplicants = useMemo(() => {
    const filtered = applicants.filter((applicant) => {
      const matchesSearch =
        applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || applicant.status === filterStatus;
      const matchesJob = filterJob === "all" || applicant.jobTitle === filterJob;
      const matchesDepartment = filterDepartment === "all" || applicant.department === filterDepartment;
      return matchesSearch && matchesStatus && matchesJob && matchesDepartment;
    });

    if (sortByScore) {
      filtered.sort((a, b) => {
        const sa = a.recommendation?.score ?? -1;
        const sb = b.recommendation?.score ?? -1;
        return sb - sa;
      });
    }

    return filtered;
  }, [applicants, searchQuery, filterStatus, filterJob, filterDepartment, sortByScore]);

  const statusCounts = useMemo(() => {
    const counts: Record<"all" | ApplicantStatus, number> = {
      all: applicants.length,
      new: 0,
      reviewing: 0,
      interview_scheduled: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0,
    };
    for (const a of applicants) counts[a.status] += 1;
    return counts;
  }, [applicants]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedApplicants(filteredApplicants.map((a) => a.id));
    else setSelectedApplicants([]);
  };

  const handleSelectApplicant = (id: number, checked: boolean) => {
    setSelectedApplicants((prev) =>
      checked ? [...prev, id] : prev.filter((aid) => aid !== id)
    );
  };

  const flashSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const friendlyError = (err: unknown, fallback: string): string => {
    if (err instanceof ApiError) {
      if (err.status === 403) return "You are not authorized to perform this action.";
      return err.message;
    }
    return fallback;
  };

  const bulkUpdate = async (status: ApplicantStatus, successMsg: string) => {
    if (selectedApplicants.length === 0) return;
    setBulkPending(status);
    setActionError(null);
    setActionSuccess(null);
    try {
      await Promise.all(
        selectedApplicants.map((id) => applicantsService.update(id, { status }))
      );
      await load();
      setSelectedApplicants([]);
      flashSuccess(successMsg);
    } catch (err) {
      setActionError(friendlyError(err, "Some updates failed. Refresh to see the latest state."));
      await load();
    } finally {
      setBulkPending(null);
    }
  };

  const renderStatusBadge = (status: ApplicantStatus) => (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div>
            <h1 className="text-xl text-[#111827]">Applicant Management</h1>
            <p className="text-sm text-[#6B7280]">{filteredApplicants.length} applicants</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6B7280]">Total</span>
                  <div className="w-10 h-10 bg-[#F9FAFB] rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#6B7280]" />
                  </div>
                </div>
                <div className="text-2xl text-[#111827]">{statusCounts.all}</div>
              </div>

              <div className="bg-white rounded-xl border border-[#06B6D4]/20 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600">New</span>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl text-blue-700">{statusCounts.new}</div>
              </div>

              <div className="bg-white rounded-xl border border-amber-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-amber-700">Interviewing</span>
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div className="text-2xl text-amber-700">{statusCounts.interview_scheduled}</div>
              </div>

              <div className="bg-white rounded-xl border border-green-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#22C55E]">Shortlisted</span>
                  <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                  </div>
                </div>
                <div className="text-2xl text-[#22C55E]">{statusCounts.shortlisted}</div>
              </div>

              <div className="bg-white rounded-xl border border-[#EF4444]/20 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#EF4444]">Rejected</span>
                  <div className="w-10 h-10 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-[#EF4444]" />
                  </div>
                </div>
                <div className="text-2xl text-red-700">{statusCounts.rejected}</div>
              </div>

              <div className="bg-white rounded-xl border border-[#4F46E5]/20 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#4F46E5]">Hired</span>
                  <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#4F46E5]" />
                  </div>
                </div>
                <div className="text-2xl text-indigo-700">{statusCounts.hired}</div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or job title..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition ${
                    showFilters
                      ? "bg-[#EEF2FF] border-[#4F46E5]/20 text-[#4F46E5]"
                      : "bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]"
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </button>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-[#111827] mb-2">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                    >
                      <option value="all">All Status ({statusCounts.all})</option>
                      {STATUS_LIST.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]} ({statusCounts[s]})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-[#111827] mb-2">Job Position</label>
                    <select
                      value={filterJob}
                      onChange={(e) => setFilterJob(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                    >
                      <option value="all">All Jobs</option>
                      {jobs.map((job) => (
                        <option key={job} value={job}>
                          {job}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-[#111827] mb-2">Department</label>
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                    >
                      <option value="all">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Bulk Actions */}
            {selectedApplicants.length > 0 && canManage && (
              <div className="bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg px-4 py-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <p className="text-sm text-[#111827]">
                  {selectedApplicants.length} applicant{selectedApplicants.length > 1 ? "s" : ""} selected
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => bulkUpdate("hired", "Selected applicants accepted.")}
                    disabled={bulkPending !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-green-200 text-[#22C55E] rounded-lg hover:bg-[#F0FDF4] transition text-sm disabled:opacity-50"
                  >
                    {bulkPending === "hired" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Accept
                  </button>
                  <button
                    onClick={() => bulkUpdate("shortlisted", "Selected applicants waitlisted.")}
                    disabled={bulkPending !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#4F46E5]/20 text-indigo-700 rounded-lg hover:bg-[#EEF2FF] transition text-sm disabled:opacity-50"
                  >
                    {bulkPending === "shortlisted" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Pause className="w-4 h-4" />
                    )}
                    Waitlist
                  </button>
                  <button
                    onClick={() => bulkUpdate("rejected", "Selected applicants rejected.")}
                    disabled={bulkPending !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#EF4444]/20 text-red-700 rounded-lg hover:bg-[#FEF2F2] transition text-sm disabled:opacity-50"
                  >
                    {bulkPending === "rejected" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                </div>
              </div>
            )}

            {/* Applicants Table */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <AsyncState
                loading={loading}
                error={error}
                empty={!loading && filteredApplicants.length === 0}
                emptyMessage="No applicants found. Try adjusting your filters."
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                        <th className="py-3 px-4 text-left">
                          <input
                            type="checkbox"
                            checked={
                              selectedApplicants.length === filteredApplicants.length &&
                              filteredApplicants.length > 0
                            }
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="w-4 h-4 text-[#4F46E5] border-[#E5E7EB] rounded focus:ring-[#4F46E5]"
                          />
                        </th>
                        <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Applicant</th>
                        <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Job Position</th>
                        <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Department</th>
                        <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Experience</th>
                        <th className="text-left py-3 px-4 text-sm text-[#6B7280]">
                          <button
                            type="button"
                            onClick={() => setSortByScore((v) => !v)}
                            className={`inline-flex items-center gap-1 hover:text-[#111827] transition ${
                              sortByScore ? "text-[#4F46E5]" : ""
                            }`}
                            title="Sort by AI match score (highest first)"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Match
                            <ArrowDownUp className="w-3 h-3" />
                          </button>
                        </th>
                        <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Applied Date</th>
                        <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Status</th>
                        <th className="text-right py-3 px-4 text-sm text-[#6B7280]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredApplicants.map((applicant) => (
                        <tr key={applicant.id} className="hover:bg-[#F9FAFB] transition">
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              checked={selectedApplicants.includes(applicant.id)}
                              onChange={(e) => handleSelectApplicant(applicant.id, e.target.checked)}
                              className="w-4 h-4 text-[#4F46E5] border-[#E5E7EB] rounded focus:ring-[#4F46E5]"
                            />
                          </td>

                          <td
                            className="py-4 px-4 cursor-pointer"
                            onClick={() => navigate(`/applicants/${applicant.id}`)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                                {applicant.avatar}
                              </div>
                              <div>
                                <p className="text-sm text-[#111827]">{applicant.name}</p>
                                <p className="text-xs text-[#6B7280]">{applicant.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-[#6B7280]" />
                              <span className="text-sm text-[#111827]">{applicant.jobTitle}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="text-sm text-[#111827]">{applicant.department}</span>
                          </td>

                          <td className="py-4 px-4">
                            <span className="text-sm text-[#111827]">{applicant.experience}</span>
                          </td>

                          <td className="py-4 px-4">
                            <MatchBadge recommendation={applicant.recommendation} />
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5 text-sm text-[#111827]">
                              <Calendar className="w-4 h-4 text-[#6B7280]" />
                              {formatDate(applicant.appliedDate)}
                            </div>
                          </td>

                          <td className="py-4 px-4">{renderStatusBadge(applicant.status)}</td>

                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => navigate(`/applicants/${applicant.id}`)}
                                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
                                title="View profile"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredApplicants.length > 0 && (
                  <div className="border-t border-[#E5E7EB] px-4 py-3">
                    <p className="text-sm text-[#6B7280]">
                      Showing <span className="text-[#111827]">{filteredApplicants.length}</span> of{" "}
                      <span className="text-[#111827]">{applicants.length}</span> applicants
                    </p>
                  </div>
                )}
              </AsyncState>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}

function MatchBadge({ recommendation }: { recommendation: ApplicantRecommendation | null }) {
  if (!recommendation) {
    return <span className="text-sm text-[#9CA3AF]">—</span>;
  }

  const { status, score } = recommendation;

  if (status === "pending" || status === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-[#6B7280]">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Scoring…
      </span>
    );
  }

  if (status === "manual_review") {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200"
        title="CV could not be parsed automatically"
      >
        Manual
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#FEF2F2] text-red-700 border border-[#EF4444]/20"
        title={recommendation.errorMessage ?? "AI screening failed"}
      >
        Failed
      </span>
    );
  }

  if (score === null) {
    return <span className="text-sm text-[#9CA3AF]">—</span>;
  }

  const rounded = Math.round(score);
  const tone =
    score >= 75
      ? "bg-[#DCFCE7] text-[#15803D] border border-green-200"
      : score >= 60
        ? "bg-amber-50 text-amber-700 border border-amber-200"
        : "bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${tone}`}
      title="AI-evaluated match against this job's requirements"
    >
      {rounded}%
    </span>
  );
}
