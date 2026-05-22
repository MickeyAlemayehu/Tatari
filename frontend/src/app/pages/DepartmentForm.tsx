import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, AlertCircle, CheckCircle } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { departmentsService } from "../../services/departments.service";
import { ApiError } from "../../lib/api";
import { AsyncState } from "../components/AsyncState";

export function DepartmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const dept = await departmentsService.get(Number(id));
        setName(dept.name);
        setDescription(dept.description ?? "");
      } catch (e) {
        setLoadError(e instanceof ApiError ? e.message : "Failed to load department");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const validateForm = () => {
    const newErrors = {
      name: "",
      description: "",
    };

    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Department name is required";
      isValid = false;
    } else if (name.trim().length < 2) {
      newErrors.name = "Department name must be at least 2 characters";
      isValid = false;
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const payload = { name: name.trim(), description: description.trim() };
      if (isEditing) {
        await departmentsService.update(Number(id), payload);
      } else {
        await departmentsService.create(payload);
      }
      setShowSuccess(true);
      setTimeout(() => navigate("/departments"), 2000);
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "Failed to save department");
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="flex-1 flex flex-col overflow-hidden">
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
                {isEditing ? "Edit Department" : "Create Department"}
              </h1>
              <p className="text-sm text-[#6B7280]">
                {isEditing ? "Update department information" : "Add a new department to your organization"}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <AsyncState loading={loading} error={loadError}>
              {showSuccess ? (
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
                  <div className="w-16 h-16 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-[#22C55E]" />
                  </div>
                  <h2 className="text-xl text-[#111827] mb-2">
                    Department {isEditing ? "Updated" : "Created"} Successfully!
                  </h2>
                  <p className="text-sm text-[#6B7280]">Redirecting to departments list...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-6">
                  {saveError && (
                    <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] border border-[#EF4444]/20 rounded-lg text-sm text-[#EF4444]">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {saveError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-[#111827] mb-2">
                      Department Name <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent ${
                        errors.name ? "border-[#EF4444]" : "border-[#E5E7EB]"
                      }`}
                      placeholder="e.g., Engineering"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-[#EF4444] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-[#111827] mb-2">
                      Description <span className="text-[#EF4444]">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => handleFieldChange("description", e.target.value)}
                      rows={4}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent resize-none ${
                        errors.description ? "border-[#EF4444]" : "border-[#E5E7EB]"
                      }`}
                      placeholder="Describe the department's role and responsibilities..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-[#EF4444] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-[#E5E7EB]">
                    <button
                      type="button"
                      onClick={() => navigate("/departments")}
                      className="flex-1 px-4 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? "Saving..." : isEditing ? "Update Department" : "Create Department"}</span>
                    </button>
                  </div>
                </form>
              )}
            </AsyncState>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
