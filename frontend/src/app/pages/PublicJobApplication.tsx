import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";

export function PublicJobApplication() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    coverLetter: "",
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);

  // Job data (in real app, this would be fetched based on id)
  const job = {
    id: 1,
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    // Validate file type
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, resume: "Please upload a PDF or Word document" }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, resume: "File size must be less than 5MB" }));
      return;
    }

    setResumeFile(file);
    setErrors(prev => ({ ...prev, resume: "" }));
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!resumeFile) {
      newErrors.resume = "Resume is required";
    }

    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = "Cover letter is required";
    } else if (formData.coverLetter.trim().length < 100) {
      newErrors.coverLetter = "Cover letter must be at least 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form submitted:", { formData, resumeFile });
      setIsSubmitted(true);
    }
  };

  // Success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E5E7EB] shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#22C55E] to-[#22C55E] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl text-[#111827] mb-3">Application Submitted!</h1>
          <p className="text-sm text-[#6B7280] mb-6">
            Thank you for applying to the <span className="text-[#111827]">{job.title}</span> position. We've received your application and will review it shortly.
          </p>
          <p className="text-sm text-[#6B7280] mb-8">
            You'll receive a confirmation email at <span className="text-[#4F46E5]">{formData.email}</span> with next steps.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/careers")}
              className="flex-1 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-3 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition"
            >
              Browse More Jobs
            </button>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  coverLetter: "",
                });
                setResumeFile(null);
              }}
              className="flex-1 border border-[#E5E7EB] text-[#111827] px-6 py-3 rounded-lg hover:bg-[#F9FAFB] transition"
            >
              Apply to Another
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/careers")}
              className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl text-[#111827]">Apply for Position</h1>
              <p className="text-sm text-[#6B7280]">{job.title} • {job.department}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Job Info Card */}
        <div className="bg-white rounded-xl border border-[#4F46E5]/20 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl text-[#111827] mb-2">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
                <span>{job.department}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                <span>{job.location}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                <span>{job.type}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E5E7EB] p-8">
          <h2 className="text-xl text-[#111827] mb-6">Application Details</h2>

          {/* Personal Information */}
          <div className="mb-8">
            <h3 className="text-sm text-[#111827] mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm text-[#111827] mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition ${
                    errors.firstName ? "border-[#EF4444]/30 bg-[#FEF2F2]" : "border-[#E5E7EB]"
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm text-[#111827] mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition ${
                    errors.lastName ? "border-[#EF4444]/30 bg-[#FEF2F2]" : "border-[#E5E7EB]"
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.lastName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-[#111827] mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition ${
                    errors.email ? "border-[#EF4444]/30 bg-[#FEF2F2]" : "border-[#E5E7EB]"
                  }`}
                  placeholder="john.doe@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-[#111827] mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition ${
                    errors.phone ? "border-[#EF4444]/30 bg-[#FEF2F2]" : "border-[#E5E7EB]"
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="mb-8">
            <label className="block text-sm text-[#111827] mb-2">
              Resume <span className="text-red-500">*</span>
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                isDragging
                  ? "border-[#4F46E5] bg-[#EEF2FF]"
                  : errors.resume
                  ? "border-[#EF4444]/30 bg-[#FEF2F2]"
                  : resumeFile
                  ? "border-green-300 bg-[#DCFCE7]"
                  : "border-[#E5E7EB] bg-[#F9FAFB]"
              }`}
            >
              {resumeFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-3 bg-white border border-green-200 rounded-lg px-4 py-3">
                    <FileText className="w-5 h-5 text-[#22C55E]" />
                    <div className="text-left">
                      <p className="text-sm text-[#111827]">{resumeFile.name}</p>
                      <p className="text-xs text-[#6B7280]">
                        {(resumeFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResumeFile(null)}
                      className="p-1 hover:bg-[#F9FAFB] rounded transition"
                    >
                      <X className="w-4 h-4 text-[#6B7280]" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 mx-auto mb-4 text-[#6B7280]" />
                  <p className="text-sm text-[#111827] mb-2">
                    Drag and drop your resume here, or click to browse
                  </p>
                  <p className="text-xs text-[#6B7280] mb-4">
                    Supported formats: PDF, DOC, DOCX (Max 5MB)
                  </p>
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="inline-block px-6 py-2.5 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] cursor-pointer transition"
                  >
                    Choose File
                  </label>
                </>
              )}
            </div>
            {errors.resume && (
              <p className="mt-2 text-xs text-[#EF4444] flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.resume}
              </p>
            )}
          </div>

          {/* Cover Letter */}
          <div className="mb-8">
            <label className="block text-sm text-[#111827] mb-2">
              Cover Letter <span className="text-red-500">*</span>
            </label>
            <textarea
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              rows={10}
              className={`w-full px-4 py-3 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition resize-none ${
                errors.coverLetter ? "border-[#EF4444]/30 bg-[#FEF2F2]" : "border-[#E5E7EB]"
              }`}
              placeholder="Tell us why you're interested in this position and why you'd be a great fit for our team..."
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-[#6B7280]">
                {formData.coverLetter.length} characters (minimum 100 required)
              </p>
              {errors.coverLetter && (
                <p className="text-xs text-[#EF4444] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.coverLetter}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => navigate("/careers")}
              className="flex-1 px-6 py-3 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-3 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
            >
              Submit Application
            </button>
          </div>
        </form>

        {/* Tips Section */}
        <div className="mt-8 bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-xl p-6">
          <h3 className="text-sm text-[#111827] mb-3">Application Tips</h3>
          <ul className="space-y-2 text-sm text-[#111827]">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#4F46E5] flex-shrink-0 mt-0.5" />
              <span>Make sure your resume is up-to-date and highlights relevant experience</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#4F46E5] flex-shrink-0 mt-0.5" />
              <span>Customize your cover letter to explain why you're interested in this specific role</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#4F46E5] flex-shrink-0 mt-0.5" />
              <span>Double-check all information for accuracy before submitting</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#4F46E5] flex-shrink-0 mt-0.5" />
              <span>You'll receive a confirmation email once your application is submitted</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
