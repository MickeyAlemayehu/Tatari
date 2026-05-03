import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, AlertCircle, CheckCircle } from "lucide-react";
import { AppLayout } from "../components/AppLayout";

export function CreateEmployee() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("active");

  // Validation errors
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    department: "",
    role: "",
  });

  // Validation function
  const validateForm = () => {
    const newErrors = {
      fullName: "",
      email: "",
      department: "",
      role: "",
    };

    let isValid = true;

    // Full Name validation
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
      isValid = false;
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Department validation
    if (!department) {
      newErrors.department = "Please select a department";
      isValid = false;
    }

    // Role validation
    if (!role.trim()) {
      newErrors.role = "Job role is required";
      isValid = false;
    } else if (role.trim().length < 2) {
      newErrors.role = "Job role must be at least 2 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setShowSuccess(true);

    // Log form data (in a real app, this would be sent to an API)
    console.log("New Employee:", {
      fullName,
      email,
      department,
      role,
      status,
    });

    // Show success message and redirect after 2 seconds
    setTimeout(() => {
      navigate("/employees");
    }, 2000);
  };

  // Clear error when user starts typing
  const handleFieldChange = (field: string, value: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: "" });
    }

    switch (field) {
      case "fullName":
        setFullName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "department":
        setDepartment(value);
        break;
      case "role":
        setRole(value);
        break;
    }
  };

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/employees")}
              className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl text-[#111827]">Create New Employee</h1>
              <p className="text-sm text-[#6B7280]">Add a new employee to the system</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-[#DCFCE7] border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm text-[#22C55E] mb-1">Success!</h3>
                  <p className="text-sm text-[#22C55E]">
                    Employee has been created successfully. Redirecting to employee list...
                  </p>
                </div>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm text-[#111827] mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => handleFieldChange("fullName", e.target.value)}
                    placeholder="Enter employee's full name"
                    className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                      errors.fullName
                        ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                        : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                    }`}
                  />
                  {errors.fullName && (
                    <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.fullName}</p>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm text-[#111827] mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="employee@company.com"
                    className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                      errors.email
                        ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                        : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                    }`}
                  />
                  {errors.email && (
                    <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.email}</p>
                    </div>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label htmlFor="department" className="block text-sm text-[#111827] mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => handleFieldChange("department", e.target.value)}
                    className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                      errors.department
                        ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                        : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                    }`}
                  >
                    <option value="">Select a department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                  {errors.department && (
                    <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.department}</p>
                    </div>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm text-[#111827] mb-2">
                    Job Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="role"
                    type="text"
                    value={role}
                    onChange={(e) => handleFieldChange("role", e.target.value)}
                    placeholder="e.g., Senior Developer, Marketing Manager"
                    className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                      errors.role
                        ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                        : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                    }`}
                  />
                  {errors.role && (
                    <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.role}</p>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm text-[#111827] mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                  >
                    <option value="active">Active</option>
                    <option value="on-leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => navigate("/employees")}
                    className="px-6 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    <span>{isSubmitting ? "Creating..." : "Create Employee"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg">
              <p className="text-sm text-[#06B6D4]">
                <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span>{" "}
                are required. Make sure all required information is provided before submitting.
              </p>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}