import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, MapPin, Briefcase, Clock, DollarSign, ChevronRight, Building, Users, Award, TrendingUp } from "lucide-react";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  experience: string;
  salary: string;
  postedDate: string;
  description: string;
  requirements: string[];
  tags: string[];
}

export function PublicJobListing() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  // Jobs data
  const [jobs] = useState<Job[]>([
    {
      id: 1,
      title: "Senior Software Engineer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      experience: "5+ years",
      salary: "$140,000 - $180,000",
      postedDate: "2026-03-15",
      description: "We're looking for an experienced software engineer to join our growing team and help build scalable web applications.",
      requirements: ["5+ years of experience", "React & Node.js expertise", "Strong problem-solving skills"],
      tags: ["React", "Node.js", "AWS", "TypeScript"],
    },
    {
      id: 2,
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      experience: "3+ years",
      salary: "$100,000 - $130,000",
      postedDate: "2026-03-14",
      description: "Join our design team to create beautiful and intuitive user experiences for our products.",
      requirements: ["3+ years of UX/UI design", "Figma proficiency", "Portfolio required"],
      tags: ["Figma", "UI/UX", "User Research", "Prototyping"],
    },
    {
      id: 3,
      title: "Marketing Manager",
      department: "Marketing",
      location: "New York, NY",
      type: "Full-time",
      experience: "4+ years",
      salary: "$90,000 - $120,000",
      postedDate: "2026-03-13",
      description: "Lead our marketing efforts and develop strategies to grow our brand and customer base.",
      requirements: ["4+ years in marketing", "Digital marketing expertise", "Team leadership experience"],
      tags: ["Digital Marketing", "SEO", "Analytics", "Content Strategy"],
    },
    {
      id: 4,
      title: "HR Coordinator",
      department: "Human Resources",
      location: "San Francisco, CA",
      type: "Full-time",
      experience: "2+ years",
      salary: "$60,000 - $75,000",
      postedDate: "2026-03-12",
      description: "Support our HR team in recruiting, onboarding, and employee relations activities.",
      requirements: ["2+ years HR experience", "HRIS knowledge", "Excellent communication"],
      tags: ["Recruiting", "HRIS", "Employee Relations", "Onboarding"],
    },
    {
      id: 5,
      title: "Data Analyst",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      experience: "3+ years",
      salary: "$85,000 - $110,000",
      postedDate: "2026-03-10",
      description: "Analyze data to provide insights that drive business decisions and product improvements.",
      requirements: ["3+ years of data analysis", "SQL & Python skills", "Statistics knowledge"],
      tags: ["SQL", "Python", "Tableau", "Statistics"],
    },
    {
      id: 6,
      title: "Frontend Developer Intern",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Internship",
      experience: "Student",
      salary: "$25 - $35/hour",
      postedDate: "2026-03-08",
      description: "Gain hands-on experience building modern web applications with our engineering team.",
      requirements: ["Enrolled in CS program", "JavaScript knowledge", "Eager to learn"],
      tags: ["React", "JavaScript", "HTML/CSS", "Git"],
    },
    {
      id: 7,
      title: "Sales Representative",
      department: "Sales",
      location: "Boston, MA",
      type: "Full-time",
      experience: "2+ years",
      salary: "$70,000 - $90,000 + Commission",
      postedDate: "2026-03-05",
      description: "Drive revenue growth by building relationships with clients and closing deals.",
      requirements: ["2+ years sales experience", "Excellent communication", "Self-motivated"],
      tags: ["B2B Sales", "CRM", "Negotiation", "Client Relations"],
    },
    {
      id: 8,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Contract",
      experience: "4+ years",
      salary: "$120,000 - $150,000",
      postedDate: "2026-03-03",
      description: "Manage and optimize our cloud infrastructure and deployment pipelines.",
      requirements: ["4+ years DevOps experience", "AWS/GCP expertise", "CI/CD knowledge"],
      tags: ["AWS", "Docker", "Kubernetes", "Terraform"],
    },
  ]);

  // Get unique values for filters
  const departments = Array.from(new Set(jobs.map(j => j.department)));
  const locations = Array.from(new Set(jobs.map(j => j.location)));
  const types = Array.from(new Set(jobs.map(j => j.type)));

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDepartment = filterDepartment === "all" || job.department === filterDepartment;
    const matchesLocation = filterLocation === "all" || job.location === filterLocation;
    const matchesType = filterType === "all" || job.type === filterType;
    return matchesSearch && matchesDepartment && matchesLocation && matchesType;
  });

  // Calculate days ago
  const getDaysAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Type badge styling
  const getTypeBadge = (type: Job["type"]) => {
    const styles = {
      "Full-time": "bg-[#DCFCE7] text-[#22C55E] border-green-200",
      "Part-time": "bg-blue-100 text-blue-700 border-[#06B6D4]/20",
      "Contract": "bg-[#EEF2FF] text-[#4F46E5] border-purple-200",
      "Internship": "bg-orange-100 text-orange-700 border-orange-200",
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${styles[type]}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-[#111827]">Careers</h1>
              <p className="text-sm text-[#6B7280] mt-1">Join our team and make an impact</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 text-sm text-[#4F46E5] hover:text-indigo-700 transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl mb-4">
            Build Your Career With Us
          </h2>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
            We're looking for talented individuals to join our growing team. Explore open positions and find your perfect fit.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-2xl">500+</p>
                <p className="text-sm text-indigo-100">Team Members</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-2xl">50+</p>
                <p className="text-sm text-indigo-100">Awards Won</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-2xl">98%</p>
                <p className="text-sm text-indigo-100">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs by title, skills, or keywords..."
                className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
              />
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              >
                <option value="all">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Type Filter Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-full text-sm transition ${
                filterType === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-[#F9FAFB] text-[#111827] hover:bg-gray-200"
              }`}
            >
              All Types
            </button>
            {types.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  filterType === type
                    ? "bg-indigo-600 text-white"
                    : "bg-[#F9FAFB] text-[#111827] hover:bg-gray-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-[#6B7280]">
            Showing <span className="text-[#111827]">{filteredJobs.length}</span> of{" "}
            <span className="text-[#111827]">{jobs.length}</span> open positions
          </p>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg text-[#111827] mb-2">No jobs found</p>
              <p className="text-sm text-[#6B7280]">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-[#E5E7EB] p-6 hover:shadow-lg hover:border-[#4F46E5]/20 transition cursor-pointer group"
                onClick={() => navigate(`/careers/${job.id}`)}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left: Job Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl text-[#111827] group-hover:text-[#4F46E5] transition mb-1">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-4 h-4 text-[#6B7280]" />
                            {job.department}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#6B7280]" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-[#6B7280]" />
                            {job.experience}
                          </div>
                        </div>
                      </div>
                      {getTypeBadge(job.type)}
                    </div>

                    <p className="text-sm text-[#111827] mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-[#EEF2FF] text-indigo-700 rounded-md text-xs border border-indigo-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-[#6B7280]">
                        <DollarSign className="w-4 h-4 text-[#6B7280]" />
                        {job.salary}
                      </div>
                      <div className="flex items-center gap-1.5 text-[#6B7280]">
                        <Clock className="w-4 h-4 text-[#6B7280]" />
                        Posted {getDaysAgo(job.postedDate)}
                      </div>
                    </div>
                  </div>

                  {/* Right: Apply Button */}
                  <div className="flex items-start">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/careers/${job.id}/apply`);
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-3 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl whitespace-nowrap"
                    >
                      <span>Apply Now</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Why Join Us Section */}
        <section className="mt-16 bg-white rounded-xl border border-[#E5E7EB] p-8">
          <h2 className="text-2xl text-[#111827] text-center mb-8">Why Join Our Team?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg text-[#111827] mb-2">Competitive Benefits</h3>
              <p className="text-sm text-[#6B7280]">
                Comprehensive health coverage, 401(k) matching, and generous PTO policy
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg text-[#111827] mb-2">Career Growth</h3>
              <p className="text-sm text-[#6B7280]">
                Professional development opportunities, mentorship programs, and clear career paths
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg text-[#111827] mb-2">Great Culture</h3>
              <p className="text-sm text-[#6B7280]">
                Collaborative environment, team events, and work-life balance initiatives
              </p>
            </div>
          </div>
        </section>
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