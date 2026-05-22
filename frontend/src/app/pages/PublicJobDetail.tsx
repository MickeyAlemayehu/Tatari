import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  ChevronRight,
  Share2,
  Building,
} from "lucide-react";
import { jobsService, type JobRecord } from "../../services/jobs.service";
import { AsyncState } from "../components/AsyncState";

type JobView = {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  postedDate: string;
  closingDate: string;
  salary: string;
  positions: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
};

function mapJob(j: JobRecord): JobView {
  const salary =
    j.salary ??
    (j.salary_min && j.salary_max
      ? `$${j.salary_min.toLocaleString()} - $${j.salary_max.toLocaleString()}`
      : "Competitive");

  return {
    id: j.id,
    title: j.title,
    department: j.department ?? "General",
    location: j.location ?? "Remote",
    type: j.type ?? j.employment_type ?? "Full-time",
    postedDate: j.postedDate ?? "",
    closingDate: j.closingDate ?? "",
    salary,
    positions: j.positions ?? 1,
    description: j.description ?? "",
    responsibilities: j.responsibilities ?? [],
    requirements: j.requirements ?? [],
    benefits: j.benefits ?? [],
  };
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function PublicJobDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [job, setJob] = useState<JobView | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    void jobsService
      .publicGet(Number(id))
      .then((res) => setJob(mapJob(res)))
      .catch(() => setLoadError("This position is no longer available."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <AsyncState
            loading={loading}
            error={loadError}
            empty={!loading}
            emptyMessage="Job not found."
          />
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/careers")}
              className="text-sm text-[#4F46E5] hover:text-indigo-700 transition"
            >
              ← Back to all openings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate("/careers")}
              className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#111827] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Openings</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition text-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? "Link Copied!" : "Share"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-indigo-100 mb-2">{job.department}</p>
          <h1 className="text-3xl md:text-4xl mb-4">{job.title}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-indigo-100">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              <span>{job.type}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              <span>{job.salary}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Apply by {formatDate(job.closingDate)}</span>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => navigate(`/careers/${job.id}/apply`)}
              className="inline-flex items-center gap-2 bg-white text-[#4F46E5] px-6 py-3 rounded-lg hover:bg-indigo-50 transition shadow-lg hover:shadow-xl"
            >
              <span>Apply for this Role</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Job content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-lg text-[#111827] mb-4">About the Role</h2>
              <div className="prose prose-sm max-w-none">
                {job.description.split("\n").map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-sm text-[#111827] leading-relaxed mb-3 last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            {/* Responsibilities */}
            {job.responsibilities.length > 0 && (
              <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <h2 className="text-lg text-[#111827] mb-4">
                  Key Responsibilities
                </h2>
                <ul className="space-y-2.5">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#111827] leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Requirements */}
            {job.requirements.length > 0 && (
              <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <h2 className="text-lg text-[#111827] mb-4">
                  Requirements &amp; Qualifications
                </h2>
                <ul className="space-y-2.5">
                  {job.requirements.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2" />
                      </div>
                      <span className="text-sm text-[#111827] leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Benefits */}
            {job.benefits.length > 0 && (
              <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <h2 className="text-lg text-[#111827] mb-4">
                  Benefits &amp; Perks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {job.benefits.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg"
                    >
                      <CheckCircle className="w-5 h-5 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#111827] leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right: Sticky CTA */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-white rounded-xl border border-[#4F46E5]/20 p-6 shadow-sm">
                <h3 className="text-base text-[#111827] mb-4">
                  Ready to apply?
                </h3>
                <p className="text-sm text-[#6B7280] mb-5">
                  Submit your application now. The hiring team will get back to
                  you soon.
                </p>
                <button
                  onClick={() => navigate(`/careers/${job.id}/apply`)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-3 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
                >
                  <span>Apply Now</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="mt-6 pt-6 border-t border-[#E5E7EB] space-y-3 text-sm">
                  <div className="flex items-start gap-2 text-[#6B7280]">
                    <Building className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#6B7280]">Department</p>
                      <p className="text-[#111827]">{job.department}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-[#6B7280]">
                    <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#6B7280]">Openings</p>
                      <p className="text-[#111827]">
                        {job.positions}{" "}
                        {job.positions === 1 ? "position" : "positions"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-[#6B7280]">
                    <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#6B7280]">Posted</p>
                      <p className="text-[#111827]">
                        {formatDate(job.postedDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-[#6B7280]">
            © 2026 HR System. All rights reserved. | Equal Opportunity Employer
          </p>
        </div>
      </footer>
    </div>
  );
}
