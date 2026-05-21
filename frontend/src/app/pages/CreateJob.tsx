import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save,FileText, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { jobsService } from "../../services/jobs.service";
import { departmentsService, type DepartmentRecord } from "../../services/departments.service";
import { ApiError } from "../../lib/api";

export function CreateJob() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    void departmentsService.list().then((res) => setDepartments(res.data)).catch(() => {});
  }, []);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    positions: "1",
    salaryMin: "",
    salaryMax: "",
    deadline: "",
    description: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    }

    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.positions || parseInt(formData.positions) < 1) {
      newErrors.positions = "At least 1 position is required";
    }

    if (!formData.deadline) {
      newErrors.deadline = "Application deadline is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Job description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = (status: "open" | "draft") => ({
    title: formData.title.trim(),
    department: formData.department,
    location: formData.location.trim(),
    type: formData.type,
    positions: parseInt(formData.positions, 10),
    salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
    salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
    deadline: formData.deadline,
    description: formData.description.trim(),
    responsibilities: formData.responsibilities.trim() || undefined,
    requirements: formData.requirements.trim() || undefined,
    benefits: formData.benefits.trim() || undefined,
    status,
  });

  const submitJob = async (status: "open" | "draft") => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await jobsService.create(buildPayload(status));
      navigate("/jobs");
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "Failed to save job");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      void submitJob("open");
    }
  };

  const handleSaveDraft = () => {
    if (!formData.title.trim()) {
      setErrors({ title: "Job title is required" });
      return;
    }
    void submitJob("draft");
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
                <h1 className="text-xl text-[#111827]">Create Job Posting</h1>
                <p className="text-sm text-[#6B7280]">Fill in the details to post a new job vacancy</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handlePublish} className="space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <h2 className="text-sm text-[#111827] mb-5 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#4F46E5]" />
                  Basic Information
                </h2>

                <div className="space-y-4">
                  {/* Job Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm text-[#111827] mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Senior Software Engineer"
                      className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                        errors.title
                          ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                          : "border-[#E5E7EB] focus:ring-[#4F46E5]"
                      }`}
                    />
                    {errors.title && (
                      <p className="mt-1.5 text-sm text-[#EF4444] flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Department and Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Department */}
                    <div>
                      <label htmlFor="department" className="block text-sm text-[#111827] mb-2">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                          errors.department
                            ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                            : "border-[#E5E7EB] focus:ring-[#4F46E5]"
                        }`}
                      >
                        <option value="">Select Department</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                        <option value="Operations">Operations</option>
                        <option value="Customer Support">Customer Support</option>
                      </select>
                      {errors.department && (
                        <p className="mt-1.5 text-sm text-[#EF4444] flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.department}
                        </p>
                      )}
                    </div>

                    {/* Location */}
                    <div>
                      <label htmlFor="location" className="block text-sm text-[#111827] mb-2">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="e.g., San Francisco, CA or Remote"
                          className={`w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                            errors.location
                              ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                              : "border-[#E5E7EB] focus:ring-[#4F46E5]"
                          }`}
                        />
                      </div>
                      {errors.location && (
                        <p className="mt-1.5 text-sm text-[#EF4444] flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Employment Type and Positions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Employment Type */}
                    <div>
                      <label htmlFor="type" className="block text-sm text-[#111827] mb-2">
                        Employment Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>

                    {/* Number of Positions */}
                    <div>
                      <label htmlFor="positions" className="block text-sm text-[#111827] mb-2">
                        Positions <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                        <input
                          type="number"
                          id="positions"
                          name="positions"
                          min="1"
                          value={formData.positions}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                            errors.positions
                              ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                              : "border-[#E5E7EB] focus:ring-[#4F46E5]"
                          }`}
                        />
                      </div>
                      {errors.positions && (
                        <p className="mt-1.5 text-sm text-[#EF4444] flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.positions}
                        </p>
                      )}
                    </div>

                    {/* Deadline */}
                    <div>
                      <label htmlFor="deadline" className="block text-sm text-[#111827] mb-2">
                        Deadline <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                        <input
                          type="date"
                          id="deadline"
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                            errors.deadline
                              ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                              : "border-[#E5E7EB] focus:ring-[#4F46E5]"
                          }`}
                        />
                      </div>
                      {errors.deadline && (
                        <p className="mt-1.5 text-sm text-[#EF4444] flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.deadline}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Salary Range */}
                  <div>
                    <label className="block text-sm text-[#111827] mb-2">
                      Salary Range (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                        <input
                          type="text"
                          name="salaryMin"
                          value={formData.salaryMin}
                          onChange={handleChange}
                          placeholder="Min (e.g., 80000)"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition"
                        />
                      </div>
                      <div className="relative">
                        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                        <input
                          type="text"
                          name="salaryMax"
                          value={formData.salaryMax}
                          onChange={handleChange}
                          placeholder="Max (e.g., 120000)"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description Card */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <h2 className="text-sm text-[#111827] mb-5 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#4F46E5]" />
                  Job Details
                </h2>

                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm text-[#111827] mb-2">
                      Job Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Provide a comprehensive overview of the role, what the position entails, and what the ideal candidate will accomplish..."
                      className={`w-full px-4 py-3 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                        errors.description
                          ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                          : "border-[#E5E7EB] focus:ring-[#4F46E5]"
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-1.5 text-sm text-[#EF4444] flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Responsibilities */}
                  <div>
                    <label htmlFor="responsibilities" className="block text-sm text-[#111827] mb-2">
                      Key Responsibilities
                    </label>
                    <textarea
                      id="responsibilities"
                      name="responsibilities"
                      value={formData.responsibilities}
                      onChange={handleChange}
                      rows={5}
                      placeholder="List the main responsibilities and duties of this role (one per line or use bullet points)..."
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition resize-none"
                    />
                  </div>

                  {/* Requirements */}
                  <div>
                    <label htmlFor="requirements" className="block text-sm text-[#111827] mb-2">
                      Requirements & Qualifications
                    </label>
                    <textarea
                      id="requirements"
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Specify required skills, experience, education, and qualifications..."
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition resize-none"
                    />
                  </div>

                  {/* Benefits */}
                  <div>
                    <label htmlFor="benefits" className="block text-sm text-[#111827] mb-2">
                      Benefits & Perks
                    </label>
                    <textarea
                      id="benefits"
                      name="benefits"
                      value={formData.benefits}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe the benefits, perks, and what makes this role attractive..."
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-4 bg-white rounded-xl border border-[#E5E7EB] p-6">
                <button
                  type="button"
                  onClick={() => navigate("/jobs")}
                  className="px-6 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex items-center gap-2 px-6 py-2.5 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
                  >
                    <Save className="w-4 h-4" />
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-4 h-4" />
                    Publish Job Posting
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm text-[#06B6D4] mb-1">Before Publishing</h3>
                    <p className="text-sm text-blue-700">
                      Make sure all required fields are filled out correctly. Once published, the job posting will be visible to candidates and you'll start receiving applications. You can edit or close the posting at any time.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}