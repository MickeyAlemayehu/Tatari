import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, AlertCircle, CheckCircle } from "lucide-react";
import { AppLayout } from "../components/AppLayout";

export function DepartmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form fields
  const [name, setName] = useState(isEditing ? "Engineering" : "");
  const [description, setDescription] = useState(
    isEditing ? "Software development and technical operations" : ""
  );

  // Validation errors
  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });

  // Validation function
  const validateForm = () => {
    const newErrors = {
      name: "",
      description: "",
    };

    let isValid = true;

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Department name is required";
      isValid = false;
    } else if (name.trim().length < 2) {
      newErrors.name = "Department name must be at least 2 characters";
      isValid = false;
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
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

    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSaving(false);
    setShowSuccess(true);

    // Log form data (in a real app, this would be sent to an API)
    console.log(isEditing ? "Update Department:" : "New Department:", {
      name,
      description,
    });

    // Show success message and redirect after 2 seconds
    setTimeout(() => {
      navigate("/departments");
    }, 2000);
  };

  // Clear error when user starts typing
  const handleFieldChange = (field: string, value: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: "" });
    }

    switch (field) {
      case "name":
        setName(value);
        break;
      case "description":
        setDescription(value);
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
              onClick={() => navigate("/departments")}
              className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl text-[#111827]">
                {isEditing ? "Edit Department" : "Create New Department"}
              </h1>
              <p className="text-sm text-[#6B7280]">
                {isEditing
                  ? "Update department information"
                  : "Add a new department to the system"}
              </p>
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
                    Department has been {isEditing ? "updated" : "created"} successfully.
                    Redirecting to department list...
                  </p>
                </div>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Department Name */}
                <div>
                  <label htmlFor="name" className="block text-sm text-[#111827] mb-2">
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    placeholder="e.g., Engineering, Marketing, Sales"
                    className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                      errors.name
                        ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                        : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                    }`}
                  />
                  {errors.name && (
                    <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.name}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm text-[#111827] mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    placeholder="Brief description of the department's responsibilities and functions"
                    rows={4}
                    className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                      errors.description
                        ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                        : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                    }`}
                  />
                  {errors.description && (
                    <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.description}</p>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => navigate("/departments")}
                    className="px-6 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    <span>{isSaving ? "Saving..." : "Save Department"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg">
              <p className="text-sm text-[#06B6D4]">
                <strong>Note:</strong> Fields marked with <span className="text-red-500">*</span>{" "}
                are required. All department information can be updated later from the department
                management page.
              </p>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}