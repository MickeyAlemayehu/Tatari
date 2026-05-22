import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Filter, Eye, Download, Star, Mail, Phone, Clock, Briefcase, Users, CheckCircle, XCircle, TrendingUp, Calendar, MessageSquare, MoreVertical } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { applicantsService, type ApplicantRecord } from "../../services/applicants.service";
import { initials } from "../../lib/utils";

interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  jobId: number;
  department: string;
  appliedDate: string;
  status: "new" | "reviewing" | "shortlisted" | "rejected" | "hired";
  experience: string;
  location: string;
  avatar: string;
  rating?: number | undefined;
}

export function ApplicantManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Applicant["status"]>("all");
  const [filterJob, setFilterJob] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState<number[]>([]);

  const [applicants, setApplicants] = useState<Applicant[]>([]);

  useEffect(() => {
    applicantsService.list({ per_page: 100 }).then((res) =>
      setApplicants(
        res.data.map((a: ApplicantRecord) => ({
          id: a.id,
          name: a.name,
          email: a.email,
          phone: a.phone ?? "",
          jobTitle: a.jobTitle ?? "—",
          jobId: a.jobId ?? 0,
          department: a.department ?? "—",
          appliedDate: a.appliedDate ?? "",
          status: a.status as Applicant["status"],
          experience: a.experience ?? "—",
          location: a.location ?? "—",
          avatar: initials(
            a.firstName ?? a.name.split(" ")[0],
            (a.lastName ?? a.name.split(" ").slice(1).join(" ")) || "?"
          ),
          rating: a.rating,
        }))
      )
    );
  }, []);


  // Get unique jobs and departments
  const jobs = Array.from(new Set(applicants.map(a => a.jobTitle)));
  const departments = Array.from(new Set(applicants.map(a => a.department)));

  // Filter applicants
  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         applicant.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || applicant.status === filterStatus;
    const matchesJob = filterJob === "all" || applicant.jobTitle === filterJob;
    const matchesDepartment = filterDepartment === "all" || applicant.department === filterDepartment;
    return matchesSearch && matchesStatus && matchesJob && matchesDepartment;
  });

  // Status badge styling
  const getStatusBadge = (status: Applicant["status"]) => {
    const styles = {
      new: "bg-blue-100 text-blue-700 border-[#06B6D4]/20",
      reviewing: "bg-[#EEF2FF] text-[#4F46E5] border-purple-200",
      shortlisted: "bg-[#DCFCE7] text-[#22C55E] border-green-200",
      rejected: "bg-[#FEF2F2] text-red-700 border-[#EF4444]/20",
      hired: "bg-[#EEF2FF] text-indigo-700 border-[#4F46E5]/20",
    };

    const labels = {
      new: "New",
      reviewing: "Reviewing",
      shortlisted: "Shortlisted",
      rejected: "Rejected",
      hired: "Hired",
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Count by status
  const statusCounts = {
    all: applicants.length,
    new: applicants.filter(a => a.status === "new").length,
    reviewing: applicants.filter(a => a.status === "reviewing").length,
    shortlisted: applicants.filter(a => a.status === "shortlisted").length,
    rejected: applicants.filter(a => a.status === "rejected").length,
    hired: applicants.filter(a => a.status === "hired").length,
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplicants(filteredApplicants.map(a => a.id));
    } else {
      setSelectedApplicants([]);
    }
  };

  // Handle select applicant
  const handleSelectApplicant = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedApplicants([...selectedApplicants, id]);
    } else {
      setSelectedApplicants(selectedApplicants.filter(aid => aid !== id));
    }
  };

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl text-[#111827]">Applicant Management</h1>
              <p className="text-sm text-[#6B7280]">{filteredApplicants.length} applicants</p>
            </div>
            <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl">
              <Download className="w-5 h-5" />
              <span>Export Data</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
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

              <div className="bg-white rounded-xl border border-purple-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#4F46E5]">Reviewing</span>
                  <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-[#4F46E5]" />
                  </div>
                </div>
                <div className="text-2xl text-[#4F46E5]">{statusCounts.reviewing}</div>
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
                {/* Search */}
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

                {/* Filter Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition ${
                    showFilters ? "bg-[#EEF2FF] border-[#4F46E5]/20 text-[#4F46E5]" : "bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]"
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm text-[#111827] mb-2">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                    >
                      <option value="all">All Status ({statusCounts.all})</option>
                      <option value="new">New ({statusCounts.new})</option>
                      <option value="reviewing">Reviewing ({statusCounts.reviewing})</option>
                      <option value="shortlisted">Shortlisted ({statusCounts.shortlisted})</option>
                      <option value="rejected">Rejected ({statusCounts.rejected})</option>
                      <option value="hired">Hired ({statusCounts.hired})</option>
                    </select>
                  </div>

                  {/* Job Filter */}
                  <div>
                    <label className="block text-sm text-[#111827] mb-2">Job Position</label>
                    <select
                      value={filterJob}
                      onChange={(e) => setFilterJob(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                    >
                      <option value="all">All Jobs</option>
                      {jobs.map(job => (
                        <option key={job} value={job}>{job}</option>
                      ))}
                    </select>
                  </div>

                  {/* Department Filter */}
                  <div>
                    <label className="block text-sm text-[#111827] mb-2">Department</label>
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                    >
                      <option value="all">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Bulk Actions */}
            {selectedApplicants.length > 0 && (
              <div className="bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg px-4 py-3 flex items-center justify-between">
                <p className="text-sm text-[#111827]">
                  {selectedApplicants.length} applicant{selectedApplicants.length > 1 ? "s" : ""} selected
                </p>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#4F46E5]/20 text-indigo-700 rounded-lg hover:bg-[#EEF2FF] transition text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Shortlist
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#EF4444]/20 text-red-700 rounded-lg hover:bg-[#FEF2F2] transition text-sm">
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#4F46E5]/20 text-indigo-700 rounded-lg hover:bg-[#EEF2FF] transition text-sm">
                    <MessageSquare className="w-4 h-4" />
                    Send Message
                  </button>
                </div>
              </div>
            )}

            {/* Applicants Table */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                      <th className="py-3 px-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedApplicants.length === filteredApplicants.length && filteredApplicants.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 text-[#4F46E5] border-[#E5E7EB] rounded focus:ring-[#4F46E5]"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Applicant</th>
                      <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Job Position</th>
                      <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Department</th>
                      <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Experience</th>
                      <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Applied Date</th>
                      <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Status</th>
                      <th className="text-center py-3 px-4 text-sm text-[#6B7280]">Rating</th>
                      <th className="text-right py-3 px-4 text-sm text-[#6B7280]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApplicants.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center">
                          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm text-[#6B7280]">No applicants found</p>
                          <p className="text-xs text-[#6B7280] mt-1">Try adjusting your filters</p>
                        </td>
                      </tr>
                    ) : (
                      filteredApplicants.map((applicant) => (
                        <tr key={applicant.id} className="hover:bg-[#F9FAFB] transition">
                          {/* Checkbox */}
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              checked={selectedApplicants.includes(applicant.id)}
                              onChange={(e) => handleSelectApplicant(applicant.id, e.target.checked)}
                              className="w-4 h-4 text-[#4F46E5] border-[#E5E7EB] rounded focus:ring-[#4F46E5]"
                            />
                          </td>

                          {/* Applicant */}
                          <td className="py-4 px-4">
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

                          {/* Job Position */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-[#6B7280]" />
                              <span className="text-sm text-[#111827]">{applicant.jobTitle}</span>
                            </div>
                          </td>

                          {/* Department */}
                          <td className="py-4 px-4">
                            <span className="text-sm text-[#111827]">{applicant.department}</span>
                          </td>

                          {/* Experience */}
                          <td className="py-4 px-4">
                            <span className="text-sm text-[#111827]">{applicant.experience}</span>
                          </td>

                          {/* Applied Date */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5 text-sm text-[#111827]">
                              <Calendar className="w-4 h-4 text-[#6B7280]" />
                              {formatDate(applicant.appliedDate)}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            {getStatusBadge(applicant.status)}
                          </td>

                          {/* Rating */}
                          <td className="py-4 px-4">
                            {applicant.rating ? (
                              <div className="flex items-center justify-center gap-1">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="text-sm text-[#111827]">{applicant.rating.toFixed(1)}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-[#6B7280] flex justify-center">N/A</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
                                title="View Resume"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
                                title="Message"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
                                title="More Actions"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredApplicants.length > 0 && (
                <div className="border-t border-[#E5E7EB] px-4 py-3 flex items-center justify-between">
                  <p className="text-sm text-[#6B7280]">
                    Showing <span className="text-[#111827]">{filteredApplicants.length}</span> of{" "}
                    <span className="text-[#111827]">{applicants.length}</span> applicants
                  </p>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                      Previous
                    </button>
                    <button className="px-3 py-1.5 bg-[#EEF2FF]0 text-white rounded-lg hover:bg-indigo-600 transition text-sm">
                      1
                    </button>
                    <button className="px-3 py-1.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition text-sm">
                      2
                    </button>
                    <button className="px-3 py-1.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition text-sm">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
