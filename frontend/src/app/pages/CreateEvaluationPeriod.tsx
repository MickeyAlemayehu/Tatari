import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Info,
  FileText,
  Loader2,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import {
  performanceService,
  type EvaluationTemplateRecord,
} from "../../services/performance.service";
import { ApiError } from "../../lib/api";

export function CreateEvaluationPeriod() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess]   = useState(false);

  // Form fields
  const [name, setName]           = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [templateId, setTemplateId] = useState<number | "">("");

  // Template data
  const [templates, setTemplates]       = useState<EvaluationTemplateRecord[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  // Validation errors
  const [errors, setErrors] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  // Load active templates on mount
  useEffect(() => {
    performanceService
      .templates()
      .then((res) => setTemplates(res.data.filter((t) => t.status === "active")))
      .catch(() => {})
      .finally(() => setTemplatesLoading(false));
  }, []);

  const selectedTemplate = templates.find((t) => t.id === templateId) ?? null;

  const validateForm = () => {
    const newErrors = { name: "", startDate: "", endDate: "" };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Evaluation period name is required";
      isValid = false;
    } else if (name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
      isValid = false;
    }

    if (!startDate) {
      newErrors.startDate = "Start date is required";
      isValid = false;
    }

    if (!endDate) {
      newErrors.endDate = "End date is required";
      isValid = false;
    } else if (startDate && new Date(endDate) <= new Date(startDate)) {
      newErrors.endDate = "End date must be after start date";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await performanceService.createPeriod({
        name: name.trim(),
        start_date: startDate,
        end_date:   endDate,
        status:     "active",
        ...(templateId !== "" ? { template_id: templateId as number } : {}),
      });
      setShowSuccess(true);
      setTimeout(() => navigate("/performance"), 1500);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        name: err instanceof ApiError ? err.message : "Failed to create evaluation period.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    if (errors[field as keyof typeof errors]) setErrors({ ...errors, [field]: "" });
    if (field === "name")      setName(value);
    if (field === "startDate") setStartDate(value);
    if (field === "endDate")   setEndDate(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
  };

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/performance")}
              className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl text-[#111827]">Create Evaluation Period</h1>
              <p className="text-sm text-[#6B7280]">Set up a new performance review cycle</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {/* Success */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-[#DCFCE7] border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm text-[#22C55E] mb-1">Success!</h3>
                  <p className="text-sm text-[#22C55E]">
                    Evaluation period has been created successfully. Redirecting...
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <h2 className="text-sm text-[#111827] mb-4">Basic Information</h2>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm text-[#111827] mb-2">
                      Period Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      placeholder="e.g., Q1 2026 Performance Review"
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

                  {/* Date Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm text-[#111827] mb-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => handleFieldChange("startDate", e.target.value)}
                        className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                          errors.startDate
                            ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                            : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                        }`}
                      />
                      {errors.startDate && (
                        <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                          <AlertCircle className="w-4 h-4" />
                          <p className="text-sm">{errors.startDate}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="endDate" className="block text-sm text-[#111827] mb-2">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => handleFieldChange("endDate", e.target.value)}
                        className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                          errors.endDate
                            ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                            : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                        }`}
                      />
                      {errors.endDate && (
                        <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                          <AlertCircle className="w-4 h-4" />
                          <p className="text-sm">{errors.endDate}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Duration display */}
                  {startDate && endDate && new Date(endDate) > new Date(startDate) && (
                    <div className="p-3 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg flex items-center gap-2 text-sm text-[#06B6D4]">
                      <Info className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Duration: {formatDate(startDate)} to {formatDate(endDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Evaluation Template */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-[#4F46E5]" />
                  <h2 className="text-sm text-[#111827]">Evaluation Template</h2>
                  <span className="text-xs text-[#6B7280]">(Optional)</span>
                </div>
                <p className="text-xs text-[#6B7280] mb-4">
                  Link an active template to define the questions employees will answer during this period.
                </p>

                {templatesLoading ? (
                  <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading templates…
                  </div>
                ) : templates.length === 0 ? (
                  <div className="p-4 bg-[#FFFBEB] border border-amber-200 rounded-lg text-sm text-amber-700">
                    No active templates found.{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/performance/builder")}
                      className="underline hover:no-underline"
                    >
                      Create one in the Evaluation Builder
                    </button>
                    .
                  </div>
                ) : (
                  <>
                    <select
                      id="template"
                      value={templateId}
                      onChange={(e) =>
                        setTemplateId(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                    >
                      <option value="">— No template (use default questions) —</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({t.questionCount ?? 0} questions)
                        </option>
                      ))}
                    </select>

                    {/* Show selected template weights */}
                    {selectedTemplate?.weights && (
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {(["self", "peer", "manager"] as const).map((role) => (
                          <div
                            key={role}
                            className="border border-[#E5E7EB] rounded-lg p-3 text-center"
                          >
                            <p className="text-xs text-[#6B7280] capitalize mb-1">{role}</p>
                            <p className="text-lg text-[#111827]">
                              {selectedTemplate.weights![role] ?? 0}%
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                              <div
                                className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] h-1.5 rounded-full"
                                style={{ width: `${selectedTemplate.weights![role] ?? 0}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/performance")}
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
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    <span>{isSubmitting ? "Saving..." : "Save Evaluation Period"}</span>
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 p-4 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg">
              <p className="text-sm text-[#06B6D4]">
                <strong>Tip:</strong> Linking a template lets employees answer structured questions
                during their evaluations. Periods without a template fall back to default questions.
              </p>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}