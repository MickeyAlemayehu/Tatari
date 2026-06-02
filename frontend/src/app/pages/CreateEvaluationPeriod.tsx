import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Info,
  FileText,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { Badge } from "../components/Badge";
import {
  performanceService,
  type EvaluationTemplateRecord,
  type SelfWarning,
} from "../../services/performance.service";
import { ApiError } from "../../lib/api";

type EvalType = "self" | "peer" | "manager";

interface TemplateAttachment {
  templateId: number | null;
}

export function CreateEvaluationPeriod() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selfWarnings, setSelfWarnings] = useState<SelfWarning[]>([]);
  const [periodLoading, setPeriodLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attachments, setAttachments] = useState<TemplateAttachment[]>([
    { templateId: null },
  ]);

  // Template data
  const [templates, setTemplates] = useState<EvaluationTemplateRecord[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  // Validation errors
  const [errors, setErrors] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    performanceService
      .templates()
      .then((res) => setTemplates(res.data.filter((t) => t.status === "active")))
      .catch(() => {})
      .finally(() => setTemplatesLoading(false));

    if (isEditing) {
      setPeriodLoading(true);
      setLoadError(null);
      performanceService
        .getPeriod(Number(id))
        .then((p) => {
          setName(p.title ?? p.name ?? "");
          setStartDate(p.startDate ?? "");
          setEndDate(p.endDate ?? "");
          if (p.templates && p.templates.length > 0) {
            setAttachments(p.templates.map((t) => ({ templateId: t.id })));
          }
        })
        .catch(() => {
          setLoadError("Failed to load evaluation period.");
        })
        .finally(() => setPeriodLoading(false));
    }
  }, [isEditing, id]);

  const templateById = useMemo(() => {
    const map = new Map<number, EvaluationTemplateRecord>();
    templates.forEach((t) => map.set(t.id, t));
    return map;
  }, [templates]);

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
    setSelfWarnings([]);

    const templateRows = attachments
      .filter((a) => a.templateId !== null)
      .map((a) => {
        const t = templateById.get(a.templateId as number)!;
        return {
          template_id: t.id,
          evaluation_type: (t.evaluationType ?? t.evaluation_type ?? "self") as EvalType,
          department_id: t.departmentId ?? t.department_id ?? null,
        };
      });

    try {
      let res;
      if (isEditing) {
        res = await performanceService.updatePeriod(Number(id), {
          name: name.trim(),
          start_date: startDate,
          end_date: endDate,
          ...(templateRows.length > 0 ? { template_ids: templateRows } : {}),
        });
      } else {
        res = await performanceService.createPeriod({
          name: name.trim(),
          start_date: startDate,
          end_date: endDate,
          status: "active",
          ...(templateRows.length > 0 ? { template_ids: templateRows } : {}),
        });
      }

      setSelfWarnings(res.data?.selfWarnings ?? res.selfWarnings ?? []);
      setShowSuccess(true);
      if (!res.selfWarnings || res.selfWarnings.length === 0) {
        setTimeout(() => navigate("/performance"), 1500);
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        name: err instanceof ApiError ? err.message : `Failed to ${isEditing ? "update" : "create"} evaluation period.`,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    if (errors[field as keyof typeof errors]) setErrors({ ...errors, [field]: "" });
    if (field === "name") setName(value);
    if (field === "startDate") setStartDate(value);
    if (field === "endDate") setEndDate(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const addAttachment = () =>
    setAttachments((prev) => [...prev, { templateId: null }]);
  const removeAttachment = (idx: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  const updateAttachment = (idx: number, templateId: number | null) =>
    setAttachments((prev) => prev.map((a, i) => (i === idx ? { templateId } : a)));

  const badgeVariant = (et: EvalType): "info" | "success" | "default" =>
    et === "self" ? "info" : et === "peer" ? "success" : "default";

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
              <h1 className="text-xl text-[#111827]">{isEditing ? "Edit Evaluation Period" : "Create Evaluation Period"}</h1>
              <p className="text-sm text-[#6B7280]">
                {isEditing ? "Update performance review cycle details" : "Set up a new performance review cycle"}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {loadError && (
              <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#EF4444]/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#EF4444]">{loadError}</p>
              </div>
            )}

            {periodLoading && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 flex flex-col items-center justify-center gap-3 text-sm text-[#6B7280]">
                <Loader2 className="w-6 h-6 animate-spin text-[#4F46E5]" />
                Loading evaluation period…
              </div>
            )}

            {!periodLoading && !loadError && (
            <>
            {showSuccess && (
              <div className="mb-6 p-4 bg-[#DCFCE7] border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm text-[#22C55E] mb-1">Success!</h3>
                  <p className="text-sm text-[#22C55E]">
                    Evaluation period {isEditing ? "updated" : "created"}.{" "}
                    {selfWarnings.length === 0
                      ? "Redirecting…"
                      : "Review warnings below before continuing."}
                  </p>
                </div>
              </div>
            )}

            {selfWarnings.length > 0 && (
              <div className="mb-6 p-4 bg-[#FFFBEB] border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm text-amber-700 mb-1">
                      {selfWarnings.length} employee
                      {selfWarnings.length !== 1 ? "s" : ""} could not be matched
                      to a self-evaluation template
                    </h3>
                    <p className="text-xs text-amber-700">
                      They were skipped during auto-assignment. Add a matching
                      self template in the Evaluation Builder and re-activate the
                      period to retry.
                    </p>
                  </div>
                </div>
                <ul className="ml-7 mt-2 text-xs text-amber-700 list-disc">
                  {selfWarnings.slice(0, 10).map((w) => (
                    <li key={w.employee_id}>
                      {w.employee_name ?? `Employee #${w.employee_id}`}
                    </li>
                  ))}
                  {selfWarnings.length > 10 && (
                    <li>…and {selfWarnings.length - 10} more.</li>
                  )}
                </ul>
                <button
                  type="button"
                  onClick={() => navigate("/performance")}
                  className="mt-3 text-sm text-amber-700 underline"
                >
                  Continue to Performance dashboard
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <h2 className="text-sm text-[#111827] mb-4">Basic Information</h2>

                <div className="space-y-4">
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

              {/* Templates */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#4F46E5]" />
                    <h2 className="text-sm text-[#111827]">Attached Templates</h2>
                    <span className="text-xs text-[#6B7280]">(Optional)</span>
                  </div>
                  <button
                    type="button"
                    onClick={addAttachment}
                    className="flex items-center gap-1 text-sm text-[#4F46E5] hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    Add template
                  </button>
                </div>
                <p className="text-xs text-[#6B7280] mb-4">
                  Attach one self/peer/manager template per evaluation type and department.
                  Self templates drive auto-assignment when the period activates.
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
                  <div className="space-y-2">
                    {attachments.map((a, idx) => {
                      const tpl = a.templateId ? templateById.get(a.templateId) : null;
                      const et =
                        (tpl?.evaluationType ?? tpl?.evaluation_type ?? "self") as EvalType;
                      return (
                        <div
                          key={idx}
                          className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2 items-center"
                        >
                          <select
                            value={a.templateId ?? ""}
                            onChange={(e) =>
                              updateAttachment(
                                idx,
                                e.target.value === "" ? null : Number(e.target.value)
                              )
                            }
                            className="px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition"
                          >
                            <option value="">— Pick template —</option>
                            {templates.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.title} ({t.evaluationType ?? t.evaluation_type})
                              </option>
                            ))}
                          </select>
                          {tpl && (
                            <Badge variant={badgeVariant(et)} size="sm">
                              {et}
                            </Badge>
                          )}
                          {tpl && (
                            <span className="text-xs text-[#6B7280]">
                              {tpl.department?.name ?? "Default"}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="p-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

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
                    <span>{isSubmitting ? "Saving..." : isEditing ? "Update Evaluation Period" : "Save Evaluation Period"}</span>
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 p-4 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg">
              <p className="text-sm text-[#06B6D4]">
                <strong>Tip:</strong> Activating the period auto-assigns self
                evaluations using the attached self templates. Peer and manager
                evaluators are set per-employee on the Assign Evaluators page.
              </p>
            </div>
            </>
            )}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
