import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Users,
  Calendar,
  Eye,
  CheckCircle,
  Share2,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string;
  appliedDate: string;
  status: "new" | "reviewing" | "shortlisted" | "rejected" | "hired";
  experience: string;
  avatar: string;
  rating?: number;
}

export function JobDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<"overview" | "applicants">("overview");

  // Job data (in real app, this would be fetched based on id)
  const job = {
    id: 1,
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    status: "open",
    postedDate: "2026-03-01",
    closingDate: "2026-04-15",
    salary: "$120,000 - $160,000",
    positions: 2,
    description: "We are seeking an experienced Senior Software Engineer to join our growing engineering team. In this role, you will be responsible for designing, developing, and maintaining high-quality software solutions that power our platform. You'll work closely with product managers, designers, and other engineers to deliver features that delight our users and drive business growth.\n\nAs a Senior Software Engineer, you'll have the opportunity to mentor junior developers, contribute to architectural decisions, and work on challenging technical problems at scale. We're looking for someone who is passionate about clean code, best practices, and continuous improvement.",
    responsibilities: [
      "Design and develop scalable, high-performance web applications using modern technologies",
      "Write clean, maintainable, and well-tested code following best practices",
      "Collaborate with cross-functional teams to define and implement new features",
      "Mentor junior engineers and conduct code reviews",
      "Participate in architectural decisions and technical planning",
      "Optimize application performance and resolve production issues",
      "Stay current with emerging technologies and industry trends",
    ],
    requirements: [
      "5+ years of professional software development experience",
      "Strong proficiency in JavaScript/TypeScript and React",
      "Experience with Node.js and RESTful API development",
      "Solid understanding of database design (SQL and NoSQL)",
      "Experience with cloud platforms (AWS, GCP, or Azure)",
      "Strong problem-solving and debugging skills",
      "Excellent communication and collaboration abilities",
      "Bachelor's degree in Computer Science or related field (or equivalent experience)",
    ],
    preferredQualifications: [
      "Experience with microservices architecture",
      "Knowledge of containerization (Docker, Kubernetes)",
      "Familiarity with CI/CD pipelines",
      "Open source contributions",
      "Experience leading technical projects",
    ],
    benefits: [
      "Competitive salary and equity package",
      "Comprehensive health, dental, and vision insurance",
      "401(k) matching program",
      "Flexible work arrangements and remote options",
      "Professional development budget ($2,500/year)",
      "Generous PTO policy (25 days + holidays)",
      "Modern office in downtown San Francisco",
      "Catered lunches and snacks",
      "Team building events and activities",
    ],
  };

  // Applicants data
  const [applicants] = useState<Applicant[]>([
    {
      id: 1,
      name: "Alex Martinez",
      email: "alex.martinez@email.com",
      phone: "+1 (555) 123-4567",
      appliedDate: "2026-03-18",
      status: "shortlisted",
      experience: "7 years",
      avatar: "AM",
      rating: 4.5,
    },
    {
      id: 2,
      name: "Sarah Chen",
      email: "sarah.chen@email.com",
      phone: "+1 (555) 234-5678",
      appliedDate: "2026-03-17",
      status: "reviewing",
      experience: "6 years",
      avatar: "SC",
      rating: 4.0,
    },
    {
      id: 3,
      name: "Michael Rodriguez",
      email: "m.rodriguez@email.com",
      phone: "+1 (555) 345-6789",
      appliedDate: "2026-03-16",
      status: "shortlisted",
      experience: "8 years",
      avatar: "MR",
      rating: 5.0,
    },
    {
      id: 4,
      name: "Emily Thompson",
      email: "emily.t@email.com",
      phone: "+1 (555) 456-7890",
      appliedDate: "2026-03-15",
      status: "new",
      experience: "5 years",
      avatar: "ET",
    },
    {
      id: 5,
      name: "David Kim",
      email: "david.kim@email.com",
      phone: "+1 (555) 567-8901",
      appliedDate: "2026-03-14",
      status: "rejected",
      experience: "3 years",
      avatar: "DK",
      rating: 2.5,
    },
  ]);

  // Status badge styling
  const getStatusBadge = (status: typeof job.status) => {
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Applicant status badge
  const getApplicantStatusBadge = (status: Applicant["status"]) => {
    const styles = {
      new: "bg-blue-100 text-blue-700",
      reviewing: "bg-[#EEF2FF] text-[#4F46E5]",
      shortlisted: "bg-[#DCFCE7] text-[#22C55E]",
      rejected: "bg-[#FEF2F2] text-red-700",
      hired: "bg-[#EEF2FF] text-indigo-700",
    };

    const labels = {
      new: "New",
      reviewing: "Reviewing",
      shortlisted: "Shortlisted",
      rejected: "Rejected",
      hired: "Hired",
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Get applicant counts by status
  const applicantCounts = {
    total: applicants.length,
    new: applicants.filter(a => a.status === "new").length,
    reviewing: applicants.filter(a => a.status === "reviewing").length,
    shortlisted: applicants.filter(a => a.status === "shortlisted").length,
    rejected: applicants.filter(a => a.status === "rejected").length,
    hired: applicants.filter(a => a.status === "hired").length,
  };

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/jobs")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">{job.title}</h1>
                <p className="text-sm text-[#6B7280]">{job.department} • Posted {formatDate(job.postedDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/jobs/${id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-[#EF4444]/20 text-[#EF4444] rounded-lg hover:bg-[#FEF2F2] transition">
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-[#E5E7EB] px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 px-1 border-b-2 transition ${
                activeTab === "overview"
                  ? "border-indigo-600 text-[#4F46E5]"
                  : "border-transparent text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              <span className="text-sm">Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("applicants")}
              className={`pb-3 px-1 border-b-2 transition ${
                activeTab === "applicants"
                  ? "border-indigo-600 text-[#4F46E5]"
                  : "border-transparent text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              <span className="text-sm">Applicants ({applicantCounts.total})</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {activeTab === "overview" ? (
              <div className="space-y-6">
                {/* Quick Info Card */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-[#4F46E5]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280] mb-1">Location</p>
                        <p className="text-sm text-[#111827]">{job.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-[#22C55E]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280] mb-1">Employment Type</p>
                        <p className="text-sm text-[#111827]">{job.type}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-[#4F46E5]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280] mb-1">Salary Range</p>
                        <p className="text-sm text-[#111827]">{job.salary}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#FFFBEB] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-[#F59E0B]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280] mb-1">Closing Date</p>
                        <p className="text-sm text-[#111827]">{formatDate(job.closingDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[#E5E7EB] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#6B7280]" />
                        <span className="text-sm text-[#6B7280]">
                          {job.positions} {job.positions === 1 ? "position" : "positions"} available
                        </span>
                      </div>
                      <div className="h-4 w-px bg-gray-300" />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#6B7280]">
                          {applicantCounts.total} applicants
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                </div>

                {/* Job Description */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <h2 className="text-sm text-[#111827] mb-4">Job Description</h2>
                  <div className="prose prose-sm max-w-none">
                    {job.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-sm text-[#111827] leading-relaxed mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <h2 className="text-sm text-[#111827] mb-4">Key Responsibilities</h2>
                  <ul className="space-y-2.5">
                    {job.responsibilities.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#111827] leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requirements */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <h2 className="text-sm text-[#111827] mb-4">Requirements & Qualifications</h2>
                  <ul className="space-y-2.5">
                    {job.requirements.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2" />
                        </div>
                        <span className="text-sm text-[#111827] leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Preferred Qualifications */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <h2 className="text-sm text-[#111827] mb-4">Preferred Qualifications</h2>
                  <ul className="space-y-2.5">
                    {job.preferredQualifications.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#111827] leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <h2 className="text-sm text-[#111827] mb-4">Benefits & Perks</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {job.benefits.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#111827] leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Applicant Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                    <p className="text-xs text-[#6B7280] mb-1">Total</p>
                    <p className="text-2xl text-[#111827]">{applicantCounts.total}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-[#06B6D4]/20 p-4">
                    <p className="text-xs text-blue-600 mb-1">New</p>
                    <p className="text-2xl text-blue-700">{applicantCounts.new}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-purple-200 p-4">
                    <p className="text-xs text-[#4F46E5] mb-1">Reviewing</p>
                    <p className="text-2xl text-[#4F46E5]">{applicantCounts.reviewing}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-green-200 p-4">
                    <p className="text-xs text-[#22C55E] mb-1">Shortlisted</p>
                    <p className="text-2xl text-[#22C55E]">{applicantCounts.shortlisted}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-[#EF4444]/20 p-4">
                    <p className="text-xs text-[#EF4444] mb-1">Rejected</p>
                    <p className="text-2xl text-red-700">{applicantCounts.rejected}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-[#4F46E5]/20 p-4">
                    <p className="text-xs text-[#4F46E5] mb-1">Hired</p>
                    <p className="text-2xl text-indigo-700">{applicantCounts.hired}</p>
                  </div>
                </div>

                {/* Applicants List */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                  <div className="p-4 border-b border-[#E5E7EB]">
                    <h2 className="text-sm text-[#111827]">All Applicants</h2>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {applicants.length === 0 ? (
                      <div className="py-12 text-center">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm text-[#6B7280]">No applicants yet</p>
                      </div>
                    ) : (
                      applicants.map((applicant) => (
                        <div key={applicant.id} className="p-5 hover:bg-[#F9FAFB] transition">
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white flex-shrink-0">
                              {applicant.avatar}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                  <h3 className="text-sm text-[#111827] mb-1">{applicant.name}</h3>
                                  <p className="text-xs text-[#6B7280]">{applicant.experience} experience</p>
                                </div>
                                {getApplicantStatusBadge(applicant.status)}
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280] mb-3">
                                <span>{applicant.email}</span>
                                <span>{applicant.phone}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Applied {formatDate(applicant.appliedDate)}
                                </span>
                              </div>

                              {applicant.rating && (
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-4 h-4 ${
                                          star <= Math.round(applicant.rating!)
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-[#6B7280]">{applicant.rating.toFixed(1)}/5.0</span>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2FF] text-[#4F46E5] rounded-lg hover:bg-[#EEF2FF] transition text-xs">
                                  <Eye className="w-3.5 h-3.5" />
                                  View Resume
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F9FAFB] text-[#111827] rounded-lg hover:bg-gray-200 transition text-xs">
                                  <Share2 className="w-3.5 h-3.5" />
                                  Share
                                </button>
                                {applicant.status === "shortlisted" && (
                                  <>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#DCFCE7] text-[#22C55E] rounded-lg hover:bg-[#DCFCE7] transition text-xs">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      Accept
                                    </button>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF2F2] text-[#EF4444] rounded-lg hover:bg-[#FEF2F2] transition text-xs">
                                      <XCircle className="w-3.5 h-3.5" />
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}