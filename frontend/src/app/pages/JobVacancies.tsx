import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Filter, Eye, Edit, Trash2, MapPin, Briefcase, Clock, Users } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { jobsService, type JobRecord } from "../../services/jobs.service";
import { ApiError } from "../../lib/api";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  status: "open" | "closed" | "draft" | "on-hold";
  applicants: number;
  postedDate: string;
  closingDate: string;
  salary: string;
}

export function JobVacancies() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed" | "draft" | "on-hold">("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    jobsService
      .list({ per_page: 100 })
      .then((res) =>
        setJobs(
          res.data.map((j: JobRecord) => ({
            id: j.id,
            title: j.title,
            department: j.department ?? "—",
            location: j.location ?? "—",
            type: (j.type as Job["type"]) ?? "Full-time",
            status: (j.status as Job["status"]) ?? "open",
            applicants: j.applicants ?? 0,
            postedDate: j.postedDate ?? "",
            closingDate: j.closingDate ?? "",
            salary: j.salary ?? "—",
          }))
        )
      )
      .catch((err) =>
        setLoadError(err instanceof ApiError ? err.message : "Failed to load jobs.")
      );
  }, []);

  // Get unique departments
  const departments = Array.from(new Set(jobs.map(job => job.department)));

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    const matchesDepartment = filterDepartment === "all" || job.department === filterDepartment;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Status badge styling
  const getStatusBadge = (status: Job["status"]) => {
    const styles = {
      open: "bg-[#DCFCE7] text-[#22C55E] border-green-200",
      closed: "bg-[#F9FAFB] text-[#111827] border-[#E5E7EB]",
      draft: "bg-[#FFFBEB] text-amber-700 border-[#F59E0B]/20",
      "on-hold": "bg-[#FEF2F2] text-red-700 border-[#EF4444]/20",
    };

    const labels = {
      open: "Open",
      closed: "Closed",
      draft: "Draft",
      "on-hold": "On Hold",
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
    all: jobs.length,
    open: jobs.filter(j => j.status === "open").length,
    closed: jobs.filter(j => j.status === "closed").length,
    draft: jobs.filter(j => j.status === "draft").length,
    "on-hold": jobs.filter(j => j.status === "on-hold").length,
  };

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl text-[#111827]">Job Vacancies</h1>
              <p className="text-sm text-[#6B7280]">{filteredJobs.length} active positions</p>
            </div>
            <button
              onClick={() => navigate("/jobs/new")}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Create Job Posting</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6B7280]">Open Positions</span>
                  <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-[#22C55E]" />
                  </div>
                </div>
                <div className="text-2xl text-[#111827]">{statusCounts.open}</div>
                <p className="text-xs text-[#6B7280] mt-1">Currently accepting applications</p>
              </div>

              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6B7280]">Total Applicants</span>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl text-[#111827]">
                  {jobs.reduce((sum, job) => sum + job.applicants, 0)}
                </div>
                <p className="text-xs text-[#6B7280] mt-1">Across all positions</p>
              </div>

              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6B7280]">Draft Positions</span>
                  <div className="w-10 h-10 bg-[#FFFBEB] rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                </div>
                <div className="text-2xl text-[#111827]">{statusCounts.draft}</div>
                <p className="text-xs text-[#6B7280] mt-1">Ready to publish</p>
              </div>

              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6B7280]">Avg. Applicants</span>
                  <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#4F46E5]" />
                  </div>
                </div>
                <div className="text-2xl text-[#111827]">
                  {Math.round(jobs.reduce((sum, job) => sum + job.applicants, 0) / jobs.length)}
                </div>
                <p className="text-xs text-[#6B7280] mt-1">Per job posting</p>
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
                    placeholder="Search jobs by title, department, or location..."
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
                <div className="mt-4 pt-4 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm text-[#111827] mb-2">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                    >
                      <option value="all">All Status ({statusCounts.all})</option>
                      <option value="open">Open ({statusCounts.open})</option>
                      <option value="draft">Draft ({statusCounts.draft})</option>
                      <option value="on-hold">On Hold ({statusCounts["on-hold"]})</option>
                      <option value="closed">Closed ({statusCounts.closed})</option>
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

            {/* Job Table */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                      <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Job Title</th>
                      <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Department</th>
                      <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Location</th>
                      <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Type</th>
                      <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Status</th>
                      <th className="text-center py-3 px-4 text-sm text-[#6B7280]">Applicants</th>
                      <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Closing Date</th>
                      <th className="text-right py-3 px-4 text-sm text-[#6B7280]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center">
                          <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm text-[#6B7280]">No job vacancies found</p>
                          <p className="text-xs text-[#6B7280] mt-1">Try adjusting your filters</p>
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-[#F9FAFB] transition">
                          {/* Job Title */}
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-sm text-[#111827] mb-0.5">{job.title}</p>
                              <p className="text-xs text-[#6B7280]">{job.salary}</p>
                            </div>
                          </td>

                          {/* Department */}
                          <td className="py-4 px-4">
                            <span className="text-sm text-[#111827]">{job.department}</span>
                          </td>

                          {/* Location */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5 text-sm text-[#111827]">
                              <MapPin className="w-4 h-4 text-[#6B7280]" />
                              {job.location}
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-4 px-4">
                            <span className="text-sm text-[#111827]">{job.type}</span>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            {getStatusBadge(job.status)}
                          </td>

                          {/* Applicants */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Users className="w-4 h-4 text-[#6B7280]" />
                              <span className="text-sm text-[#111827]">{job.applicants}</span>
                            </div>
                          </td>

                          {/* Closing Date */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5 text-sm text-[#111827]">
                              <Clock className="w-4 h-4 text-[#6B7280]" />
                              {formatDate(job.closingDate)}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => navigate(`/jobs/${job.id}`)}
                                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/jobs/${job.id}/edit`)}
                                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
                                title="More Actions"
                              >
                                <Trash2 className="w-4 h-4" />
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
              {filteredJobs.length > 0 && (
                <div className="border-t border-[#E5E7EB] px-4 py-3 flex items-center justify-between">
                  <p className="text-sm text-[#6B7280]">
                    Showing <span className="text-[#111827]">{filteredJobs.length}</span> of{" "}
                    <span className="text-[#111827]">{jobs.length}</span> job vacancies
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