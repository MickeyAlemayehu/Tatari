import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { applicantsService, type ApplicantRecord } from "../../services/applicants.service";
import { AsyncState } from "../components/AsyncState";
import { ApiError } from "../../lib/api";
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
 
  Globe,
  Award,
  GraduationCap,
  FileText,
  ExternalLink,
  Eye,
  Building,
  Clock,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

type ApplicantStatus = "new" | "reviewing" | "shortlisted" | "rejected" | "hired";

interface ResumeExperience {
  company: string;
  role: string;
  title: string;
  duration: string;
  period: string;
  description: string;
  highlights: string[];
  achievements: string[];
}

interface ResumeEducation {
  degree: string;
  school: string;
  year: string;
  gpa?: string;
}

export function ApplicantProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewType, setInterviewType] = useState("video");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [applicant, setApplicant] = useState({
    id: 0,
    name: "",
    email: "",
    phone: "",
    location: "",
    avatar: "",
    jobTitle: "",
    jobId: 0,
    department: "",
    appliedDate: "",
    status: "new" as ApplicantStatus,
    experience: "",
    currentCompany: "",
    currentRole: "",
    education: "",
    expectedSalary: "",
    noticePeriod: "",
    rating: 0,
    skills: [] as string[],
    coverLetter: "",
    resumeHighlights: {
      summary: "",
      experience: [] as ResumeExperience[],
      education: [] as ResumeEducation[],
      certifications: [] as string[],
    },
  });

  useEffect(() => {
    if (!id) return;
    void applicantsService
      .get(Number(id))
      .then((a: ApplicantRecord) => {
        const name = a.name ?? `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim();
        const parts = name.split(" ");
        const avatar =
          parts.length >= 2
            ? `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase()
            : name.slice(0, 2).toUpperCase();
        setApplicant({
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
          status: a.status as ApplicantStatus,
          experience: a.experience ?? "—",
          currentCompany: "",
          currentRole: "",
          education: "",
          expectedSalary: "",
          noticePeriod: "",
          rating: a.rating ?? 0,
          skills: [],
          coverLetter: a.coverLetter ?? "",
          resumeHighlights: { summary: "", experience: [], education: [], certifications: [] },
        });
      })
      .catch(() => setLoadError("Failed to load applicant"))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: ApplicantStatus) => {
    if (!id) return;
    try {
      const updated = await applicantsService.update(Number(id), { status });
      setApplicant((prev) => ({ ...prev, status: updated.status as ApplicantStatus }));
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Failed to update status");
    }
  };

  // Status badge styling
  const getStatusBadge = (status: ApplicantStatus) => {
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Handle schedule interview
  const handleScheduleInterview = () => {
    console.log("Scheduling interview:", { interviewDate, interviewTime, interviewType });
    setShowScheduleModal(false);
    // Reset form
    setInterviewDate("");
    setInterviewTime("");
    setInterviewType("video");
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
              <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download Resume</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Message</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Applicant Overview Card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Avatar and Basic Info */}
                <div className="flex flex-col items-center lg:items-start gap-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-2xl">
                    {applicant.avatar}
                  </div>
                  {getStatusBadge(applicant.status)}
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
                </div>

                {/* Right: Detailed Info */}
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
                      <p className="text-xs text-[#6B7280] mb-0.5">Current Company</p>
                      <p className="text-sm text-[#111827]">{applicant.currentCompany}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#6B7280] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#6B7280] mb-0.5">Applied Date</p>
                      <p className="text-sm text-[#111827]">{formatDate(applicant.appliedDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-[#6B7280] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#6B7280] mb-0.5">Education</p>
                      <p className="text-sm text-[#111827]">{applicant.education}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#6B7280] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#6B7280] mb-0.5">Notice Period</p>
                      <p className="text-sm text-[#111827]">{applicant.noticePeriod}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-sm text-[#111827] mb-4">Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl">
                  <Calendar className="w-5 h-5" />
                  Schedule Interview
                </button>
                <button className="flex items-center gap-2 bg-[#DCFCE7]0 text-white px-6 py-2.5 rounded-lg hover:bg-green-600 transition">
                  <CheckCircle className="w-5 h-5" />
                  Shortlist Candidate
                </button>
                <button className="flex items-center gap-2 bg-[#FEF2F2]0 text-white px-6 py-2.5 rounded-lg hover:bg-[#EF4444] transition">
                  <XCircle className="w-5 h-5" />
                  Reject Application
                </button>
                <button className="flex items-center gap-2 border border-[#E5E7EB] text-[#111827] px-6 py-2.5 rounded-lg hover:bg-[#F9FAFB] transition">
                  <MessageSquare className="w-5 h-5" />
                  Send Message
                </button>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-sm text-[#111827] mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {applicant.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1.5 bg-[#EEF2FF] text-indigo-700 rounded-full text-sm border border-[#4F46E5]/20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Cover Letter */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[#4F46E5]" />
                <h2 className="text-sm text-[#111827]">Cover Letter</h2>
              </div>
              <div className="prose prose-sm max-w-none">
                {applicant.coverLetter.split('\n').map((paragraph, index) => (
                  paragraph.trim() ? (
                    <p key={index} className="text-sm text-[#111827] leading-relaxed mb-3">
                      {paragraph}
                    </p>
                  ) : (
                    <div key={index} className="h-2" />
                  )
                ))}
              </div>
            </div>

            {/* Resume Preview */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#4F46E5]" />
                  <h2 className="text-sm text-[#111827]">Resume</h2>
                </div>
                <button className="flex items-center gap-2 text-[#4F46E5] hover:text-indigo-700 text-sm">
                  <ExternalLink className="w-4 h-4" />
                  View Full Resume
                </button>
              </div>

              {/* Professional Summary */}
              <div className="mb-6">
                <h3 className="text-sm text-[#111827] mb-3">Professional Summary</h3>
                <p className="text-sm text-[#111827] leading-relaxed">{applicant.resumeHighlights.summary}</p>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <h3 className="text-sm text-[#111827] mb-4">Work Experience</h3>
                <div className="space-y-5">
                  {applicant.resumeHighlights.experience.map((exp, index) => (
                    <div key={index} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-indigo-600 before:rounded-full">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <div>
                          <h4 className="text-sm text-[#111827]">{exp.title}</h4>
                          <p className="text-sm text-[#4F46E5]">{exp.company}</p>
                        </div>
                        <span className="text-xs text-[#6B7280]">{exp.period}</span>
                      </div>
                      <p className="text-sm text-[#6B7280] mb-3">{exp.description}</p>
                      <ul className="space-y-1.5">
                        {exp.achievements.map((achievement, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-[#111827]">
                            <CheckCircle className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="mb-6">
                <h3 className="text-sm text-[#111827] mb-4">Education</h3>
                {applicant.resumeHighlights.education.map((edu, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-[#F9FAFB] rounded-lg">
                    <GraduationCap className="w-5 h-5 text-[#4F46E5] mt-0.5" />
                    <div>
                      <h4 className="text-sm text-[#111827] mb-1">{edu.degree}</h4>
                      <p className="text-sm text-[#6B7280]">{edu.school}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-[#6B7280]">Graduated: {edu.year}</span>
                        <span className="text-xs text-[#6B7280]">GPA: {edu.gpa}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <div>
                <h3 className="text-sm text-[#111827] mb-3">Certifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {applicant.resumeHighlights.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                      <Award className="w-5 h-5 text-[#4F46E5]" />
                      <span className="text-sm text-[#111827]">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Application Timeline */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-sm text-[#111827] mb-4">Application Timeline</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-[#DCFCE7] rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                    </div>
                    <div className="w-px h-full bg-gray-200 mt-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="text-sm text-[#111827] mb-1">Application Shortlisted</p>
                    <p className="text-xs text-[#6B7280]">March 19, 2026 at 2:30 PM</p>
                    <p className="text-sm text-[#6B7280] mt-2">Candidate moved to shortlist by Jennifer Wilson</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-[#EEF2FF] rounded-full flex items-center justify-center">
                      <Eye className="w-4 h-4 text-[#4F46E5]" />
                    </div>
                    <div className="w-px h-full bg-gray-200 mt-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="text-sm text-[#111827] mb-1">Application Reviewed</p>
                    <p className="text-xs text-[#6B7280]">March 18, 2026 at 4:15 PM</p>
                    <p className="text-sm text-[#6B7280] mt-2">Resume reviewed and rated 4.5/5.0</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#111827] mb-1">Application Submitted</p>
                    <p className="text-xs text-[#6B7280]">March 18, 2026 at 10:23 AM</p>
                    <p className="text-sm text-[#6B7280] mt-2">Candidate applied for Senior Software Engineer position</p>
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
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleInterview}
                className="flex-1 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
