import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  FileText,
  Star,
  MessageSquare,
  Zap,
  PowerOff,
  ChevronRight,
  Loader2,
  LayoutTemplate,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import {
  performanceService,
  type EvaluationTemplateRecord,
  type EvaluationQuestionRecord,
  type QuestionOptionInput,
} from "../../services/performance.service";
import {
  departmentsService,
  type DepartmentRecord,
} from "../../services/departments.service";
import { ApiError } from "../../lib/api";

type EvalType = "self" | "peer" | "manager";
type QuestionType =
  | "rating"
  | "text"
  | "textarea"
  | "multiple_choice"
  | "checkbox"
  | "yes_no"
  | "numeric";

const EVAL_TYPE_LABELS: Record<EvalType, string> = {
  self: "Self",
  peer: "Peer",
  manager: "Manager",
};

const EVAL_TYPE_VARIANTS: Record<EvalType, "info" | "success" | "default"> = {
  self: "info",
  peer: "success",
  manager: "default",
};

// ── Template form state ──────────────────────────────────────────────────────

interface TemplateFormState {
  title: string;
  description: string;
  evaluationType: EvalType;
  departmentId: number | null;
  weightSelf: number;
  weightPeer: number;
  weightManager: number;
}

const emptyTemplateForm = (): TemplateFormState => ({
  title: "",
  description: "",
  evaluationType: "self",
  departmentId: null,
  weightSelf: 30,
  weightPeer: 30,
  weightManager: 40,
});

// ── Question form state ──────────────────────────────────────────────────────

interface QuestionFormState {
  text: string;
  type: QuestionType;
  category: string;
  required: boolean;
  weight: number;
  options: { label: string; value: number }[];
}

const emptyQuestionForm = (): QuestionFormState => ({
  text: "",
  type: "rating",
  category: "",
  required: true,
  weight: 1,
  options: [],
});

const isSelectableType = (t: string) => t === "multiple_choice" || t === "checkbox";

// ─────────────────────────────────────────────────────────────────────────────

export function EvaluationBuilder() {
  const navigate = useNavigate();

  // ── Template list ──────────────────────────────────────────────────────────
  const [templates, setTemplates]             = useState<EvaluationTemplateRecord[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EvaluationTemplateRecord | null>(null);

  // ── Questions for selected template ───────────────────────────────────────
  const [questions, setQuestions] = useState<EvaluationQuestionRecord[]>([]);
  const [qLoading, setQLoading]   = useState(false);

  // ── Template creation form ─────────────────────────────────────────────────
  const [showTemplateForm, setShowTemplateForm]   = useState(false);
  const [templateForm, setTemplateForm]           = useState<TemplateFormState>(emptyTemplateForm());
  const [templateSaving, setTemplateSaving]       = useState(false);
  const [templateFormError, setTemplateFormError] = useState("");

  // ── Question form ──────────────────────────────────────────────────────────
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion]   = useState<EvaluationQuestionRecord | null>(null);
  const [questionForm, setQuestionForm]         = useState<QuestionFormState>(emptyQuestionForm());
  const [questionSaving, setQuestionSaving]     = useState(false);
  const [questionFormErrors, setQuestionFormErrors] = useState({ text: "", category: "" });

  // ── Departments (for the new template form) ───────────────────────────────
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);

  // ── General feedback ──────────────────────────────────────────────────────
  const [successMsg, setSuccessMsg] = useState("");

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // ── Load templates ─────────────────────────────────────────────────────────
  const loadTemplates = () => {
    setTemplatesLoading(true);
    performanceService
      .templates()
      .then((res) => setTemplates(res.data))
      .catch(() => {})
      .finally(() => setTemplatesLoading(false));
  };

  useEffect(() => {
    loadTemplates();
    departmentsService.list().then((res) => setDepartments(res.data)).catch(() => {});
  }, []);

  // ── Load questions when template is selected ───────────────────────────────
  const loadQuestions = (templateId: number) => {
    setQLoading(true);
    performanceService
      .questions({ template_id: templateId })
      .then((res) => setQuestions(res.data))
      .catch(() => {})
      .finally(() => setQLoading(false));
  };

  const selectTemplate = (t: EvaluationTemplateRecord) => {
    setSelectedTemplate(t);
    loadQuestions(t.id);
  };

  // ── Template CRUD ──────────────────────────────────────────────────────────
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.title.trim()) {
      setTemplateFormError("Template title is required");
      return;
    }
    const total = templateForm.weightSelf + templateForm.weightPeer + templateForm.weightManager;
    if (total !== 100) {
      setTemplateFormError(`Weights must sum to 100% (currently ${total}%)`);
      return;
    }
    setTemplateSaving(true);
    setTemplateFormError("");
    try {
      const description = templateForm.description.trim();
      const t = await performanceService.createTemplate({
        title: templateForm.title.trim(),
        ...(description ? { description } : {}),
        evaluation_type: templateForm.evaluationType,
        department_id: templateForm.departmentId,
        weights: {
          self: templateForm.weightSelf,
          peer: templateForm.weightPeer,
          manager: templateForm.weightManager,
        },
      });
      setTemplates((prev) => [t, ...prev]);
      setTemplateForm(emptyTemplateForm());
      setShowTemplateForm(false);
      flash(`Template "${t.title}" created.`);
      selectTemplate(t);
    } catch (err) {
      setTemplateFormError(err instanceof ApiError ? err.message : "Failed to create template.");
    } finally {
      setTemplateSaving(false);
    }
  };

  const handleDeleteTemplate = async (t: EvaluationTemplateRecord) => {
    if (!confirm(`Delete template "${t.title}"? This cannot be undone.`)) return;
    try {
      await performanceService.deleteTemplate(t.id);
      setTemplates((prev) => prev.filter((x) => x.id !== t.id));
      if (selectedTemplate?.id === t.id) {
        setSelectedTemplate(null);
        setQuestions([]);
      }
      flash("Template deleted.");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete template.");
    }
  };

  const handleToggleActive = async (t: EvaluationTemplateRecord) => {
    try {
      const updated =
        t.status === "active"
          ? await performanceService.deactivateTemplate(t.id)
          : await performanceService.activateTemplate(t.id);
      setTemplates((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: updated.status } : x)));
      if (selectedTemplate?.id === t.id)
        setSelectedTemplate((prev) => prev ? { ...prev, status: updated.status } : prev);
      flash(`Template ${updated.status === "active" ? "activated" : "deactivated"}.`);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to update template status.");
    }
  };

  // ── Question CRUD ──────────────────────────────────────────────────────────
  const validateQuestionForm = () => {
    const errs = { text: "", category: "" };
    let ok = true;
    if (!questionForm.text.trim()) {
      errs.text = "Question text is required";
      ok = false;
    } else if (questionForm.text.trim().length < 10) {
      errs.text = "Question must be at least 10 characters";
      ok = false;
    }
    if (!questionForm.category.trim()) {
      errs.category = "Category is required";
      ok = false;
    }
    setQuestionFormErrors(errs);
    return ok;
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateQuestionForm() || !selectedTemplate) return;

    setQuestionSaving(true);
    try {
      const optionsPayload = isSelectableType(questionForm.type)
        ? questionForm.options
            .filter((o) => o.label.trim().length > 0)
            .map((o) => ({ label: o.label.trim(), value: o.value }))
        : undefined;

      if (editingQuestion) {
        const updated = await performanceService.updateQuestion(editingQuestion.id, {
          text: questionForm.text.trim(),
          type: questionForm.type,
          category: questionForm.category.trim(),
          required: questionForm.required,
          weight: questionForm.weight,
          ...(optionsPayload ? { options: optionsPayload } : {}),
        });
        setQuestions((prev) => prev.map((q) => (q.id === editingQuestion.id ? updated : q)));
        flash("Question updated.");
      } else {
        const created = await performanceService.createQuestion({
          template_id: selectedTemplate.id,
          text: questionForm.text.trim(),
          type: questionForm.type,
          category: questionForm.category.trim(),
          required: questionForm.required,
          weight: questionForm.weight,
          ...(optionsPayload ? { options: optionsPayload } : {}),
        });
        setQuestions((prev) => [...prev, created]);
        // Update questionCount on template
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === selectedTemplate.id
              ? { ...t, questionCount: (t.questionCount ?? 0) + 1 }
              : t
          )
        );
        flash("Question added.");
      }
      resetQuestionForm();
    } catch (err) {
      setQuestionFormErrors((prev) => ({
        ...prev,
        text: err instanceof ApiError ? err.message : "Failed to save question.",
      }));
    } finally {
      setQuestionSaving(false);
    }
  };

  const handleEditQuestion = (q: EvaluationQuestionRecord) => {
    setEditingQuestion(q);
    setQuestionForm({
      text: q.text,
      type: q.type as QuestionType,
      category: q.category,
      required: q.required,
      weight: q.weight ?? 1,
      options: (q.options ?? []).map((o) => ({ label: o.label, value: o.value })),
    });
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = async (q: EvaluationQuestionRecord) => {
    if (!confirm("Delete this question?")) return;
    try {
      await performanceService.deleteQuestion(q.id);
      setQuestions((prev) => prev.filter((x) => x.id !== q.id));
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === selectedTemplate?.id
            ? { ...t, questionCount: Math.max(0, (t.questionCount ?? 1) - 1) }
            : t
        )
      );
      flash("Question deleted.");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete question.");
    }
  };

  const resetQuestionForm = () => {
    setEditingQuestion(null);
    setQuestionForm(emptyQuestionForm());
    setQuestionFormErrors({ text: "", category: "" });
    setShowQuestionForm(false);
  };

  const filteredQuestions = questions;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/performance")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">Evaluation Builder</h1>
                <p className="text-sm text-[#6B7280]">
                  {selectedTemplate
                    ? `Editing: ${selectedTemplate.title}`
                    : "Create templates and manage evaluation questions"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedTemplate && (
                <button
                  onClick={() => { setSelectedTemplate(null); setQuestions([]); }}
                  className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition text-sm"
                >
                  <LayoutTemplate className="w-4 h-4" />
                  All Templates
                </button>
              )}
              {!selectedTemplate && (
                <button
                  onClick={() => { setShowTemplateForm(true); setTemplateFormError(""); }}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl text-sm"
                >
                  <Plus className="w-5 h-5" />
                  New Template
                </button>
              )}
              {selectedTemplate && (
                <button
                  onClick={() => { resetQuestionForm(); setShowQuestionForm(true); }}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl text-sm"
                >
                  <Plus className="w-5 h-5" />
                  Add Question
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Flash success */}
            {successMsg && (
              <div className="mb-6 p-4 bg-[#DCFCE7] border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
                <p className="text-sm text-[#22C55E]">{successMsg}</p>
              </div>
            )}

            {/* ── Template List ──────────────────────────────────────────── */}
            {!selectedTemplate && (
              <>
                {/* Create template form */}
                {showTemplateForm && (
                  <div className="mb-6 bg-white rounded-xl border border-[#E5E7EB] p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-sm text-[#111827]">New Template</h2>
                      <button onClick={() => setShowTemplateForm(false)} className="p-1 text-[#6B7280] hover:bg-[#F9FAFB] rounded">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {templateFormError && (
                      <div className="mb-4 p-3 bg-[#FEF2F2] border border-red-200 rounded-lg flex items-center gap-2 text-sm text-[#EF4444]">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {templateFormError}
                      </div>
                    )}
                    <form onSubmit={handleCreateTemplate} className="space-y-4">
                      <div>
                        <label className="block text-sm text-[#111827] mb-1">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={templateForm.title}
                          onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                          placeholder="e.g., Q1 2026 Standard Evaluation"
                          className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#111827] mb-1">Description</label>
                        <textarea
                          value={templateForm.description}
                          onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                          placeholder="Optional description…"
                          rows={2}
                          className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-[#111827] mb-1">
                            Evaluation Type <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(["self", "peer", "manager"] as const).map((t) => {
                              const active = templateForm.evaluationType === t;
                              const activeCls = {
                                self: "bg-blue-100 text-blue-700 border-blue-300",
                                peer: "bg-[#DCFCE7] text-[#22C55E] border-[#22C55E]/30",
                                manager: "bg-[#EEF2FF] text-[#4F46E5] border-[#4F46E5]/30",
                              }[t];
                              return (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setTemplateForm({ ...templateForm, evaluationType: t })}
                                  className={`px-3 py-2 rounded-lg border text-sm capitalize transition ${
                                    active ? activeCls : "bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] hover:bg-white"
                                  }`}
                                >
                                  {EVAL_TYPE_LABELS[t]}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-[#111827] mb-1">Department</label>
                          <select
                            value={templateForm.departmentId ?? ""}
                            onChange={(e) =>
                              setTemplateForm({
                                ...templateForm,
                                departmentId: e.target.value === "" ? null : Number(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition"
                          >
                            <option value="">All Departments (Default)</option>
                            {departments.map((d) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-[#111827] mb-2">Score Weights (must total 100%)</label>
                        <div className="grid grid-cols-3 gap-3">
                          {(["self", "peer", "manager"] as const).map((role) => {
                            const key = `weight${role.charAt(0).toUpperCase() + role.slice(1)}` as keyof TemplateFormState;
                            return (
                              <div key={role}>
                                <label className="block text-xs text-[#6B7280] capitalize mb-1">{role}</label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min={0} max={100}
                                    value={templateForm[key] as number}
                                    onChange={(e) =>
                                      setTemplateForm({ ...templateForm, [key]: Number(e.target.value) })
                                    }
                                    className="w-full px-3 py-2 pr-7 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition text-right"
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#6B7280]">%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className={`text-xs mt-2 ${
                          templateForm.weightSelf + templateForm.weightPeer + templateForm.weightManager === 100
                            ? "text-[#22C55E]"
                            : "text-[#F59E0B]"
                        }`}>
                          Total: {templateForm.weightSelf + templateForm.weightPeer + templateForm.weightManager}%
                        </p>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowTemplateForm(false)}
                          className="px-5 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={templateSaving}
                          className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-5 py-2 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow disabled:opacity-50 text-sm"
                        >
                          {templateSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Create Template
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Template cards */}
                {templatesLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
                    <LayoutTemplate className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-[#6B7280] mb-4">No templates yet. Create your first one to get started.</p>
                    <button
                      onClick={() => setShowTemplateForm(true)}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-5 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      New Template
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {templates.map((t) => (
                      <div
                        key={t.id}
                        className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:border-[#4F46E5]/30 hover:shadow-sm transition"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-[#4F46E5]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="text-sm text-[#111827]">{t.title}</h3>
                              <Badge
                                variant={t.status === "active" ? "success" : "default"}
                                size="sm"
                              >
                                {t.status}
                              </Badge>
                              {(() => {
                                const et = (t.evaluationType ?? t.evaluation_type ?? "self") as EvalType;
                                return (
                                  <Badge variant={EVAL_TYPE_VARIANTS[et]} size="sm">
                                    {EVAL_TYPE_LABELS[et]}
                                  </Badge>
                                );
                              })()}
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F9FAFB] border border-[#E5E7EB] text-[#6B7280]">
                                {t.department?.name ?? "Default"}
                              </span>
                            </div>
                            {t.description && (
                              <p className="text-xs text-[#6B7280] mb-2">{t.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                              <span>{t.questionCount ?? 0} questions</span>
                              {t.weights && (
                                <span>
                                  Self {t.weights.self}% · Peer {t.weights.peer}% · Manager {t.weights.manager}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleToggleActive(t)}
                              title={t.status === "active" ? "Deactivate" : "Activate"}
                              className={`p-2 rounded-lg transition ${
                                t.status === "active"
                                  ? "text-[#F59E0B] hover:bg-[#FFFBEB]"
                                  : "text-[#22C55E] hover:bg-[#DCFCE7]"
                              }`}
                            >
                              {t.status === "active" ? <PowerOff className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(t)}
                              title="Delete template"
                              className="p-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => selectTemplate(t)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#EEF2FF] text-[#4F46E5] rounded-lg hover:bg-[#4F46E5] hover:text-white transition text-sm"
                            >
                              Edit Questions
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── Question Editor (inside a template) ───────────────────── */}
            {selectedTemplate && (
              <>
                {/* Question form */}
                {showQuestionForm && (
                  <div className="mb-6 bg-white rounded-xl border border-[#E5E7EB] p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-sm text-[#111827]">
                        {editingQuestion ? "Edit Question" : "Add Question"}
                      </h2>
                      <button onClick={resetQuestionForm} className="p-1 text-[#6B7280] hover:bg-[#F9FAFB] rounded">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <form onSubmit={handleQuestionSubmit} className="space-y-4">
                      {/* Text */}
                      <div>
                        <label className="block text-sm text-[#111827] mb-1">
                          Question Text <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={questionForm.text}
                          onChange={(e) => {
                            setQuestionForm({ ...questionForm, text: e.target.value });
                            if (questionFormErrors.text) setQuestionFormErrors({ ...questionFormErrors, text: "" });
                          }}
                          placeholder="Enter your evaluation question..."
                          rows={3}
                          className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                            questionFormErrors.text
                              ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                              : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                          }`}
                        />
                        {questionFormErrors.text && (
                          <div className="mt-1 flex items-center gap-1 text-[#EF4444]">
                            <AlertCircle className="w-4 h-4" />
                            <p className="text-sm">{questionFormErrors.text}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Question type */}
                        <div>
                          <label className="block text-sm text-[#111827] mb-1">Type</label>
                          <select
                            value={questionForm.type}
                            onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value as QuestionType })}
                            className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition"
                          >
                            <option value="rating">Rating (1–5)</option>
                            <option value="text">Short Text</option>
                            <option value="textarea">Long Text</option>
                            <option value="multiple_choice">Multiple Choice (single)</option>
                            <option value="checkbox">Checkbox (multi-select)</option>
                            <option value="yes_no">Yes / No</option>
                            <option value="numeric">Numeric</option>
                          </select>
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-sm text-[#111827] mb-1">
                            Category <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={questionForm.category}
                            onChange={(e) => {
                              setQuestionForm({ ...questionForm, category: e.target.value });
                              if (questionFormErrors.category) setQuestionFormErrors({ ...questionFormErrors, category: "" });
                            }}
                            placeholder="e.g., Goals & Objectives"
                            className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                              questionFormErrors.category
                                ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                                : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                            }`}
                          />
                          {questionFormErrors.category && (
                            <div className="mt-1 flex items-center gap-1 text-[#EF4444]">
                              <AlertCircle className="w-4 h-4" />
                              <p className="text-sm">{questionFormErrors.category}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-[#111827] mb-1">
                            Weight
                          </label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.1"
                            value={questionForm.weight}
                            onChange={(e) =>
                              setQuestionForm({
                                ...questionForm,
                                weight: Math.max(0.01, Number(e.target.value) || 1),
                              })
                            }
                            className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition"
                          />
                          <p className="text-xs text-[#6B7280] mt-1">
                            Relative weight in the final score. Default 1.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-7">
                          <input
                            type="checkbox"
                            id="required"
                            checked={questionForm.required}
                            onChange={(e) =>
                              setQuestionForm({ ...questionForm, required: e.target.checked })
                            }
                            className="w-4 h-4 text-[#4F46E5] rounded"
                          />
                          <label htmlFor="required" className="text-sm text-[#6B7280]">
                            This question is required
                          </label>
                        </div>
                      </div>

                      {isSelectableType(questionForm.type) && (
                        <div className="border border-[#E5E7EB] rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-[#111827]">
                              Options (label + score value)
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setQuestionForm({
                                  ...questionForm,
                                  options: [...questionForm.options, { label: "", value: 0 }],
                                })
                              }
                              className="text-sm text-[#4F46E5] hover:underline"
                            >
                              + Add option
                            </button>
                          </div>
                          {questionForm.options.length === 0 && (
                            <p className="text-xs text-[#6B7280]">
                              No options yet. Add at least one to make this question scorable.
                            </p>
                          )}
                          {questionForm.options.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Option label"
                                value={opt.label}
                                onChange={(e) =>
                                  setQuestionForm({
                                    ...questionForm,
                                    options: questionForm.options.map((o, i) =>
                                      i === idx ? { label: e.target.value, value: o.value } : o
                                    ),
                                  })
                                }
                                className="flex-1 px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                              />
                              <input
                                type="number"
                                step="0.1"
                                placeholder="Value"
                                value={opt.value}
                                onChange={(e) =>
                                  setQuestionForm({
                                    ...questionForm,
                                    options: questionForm.options.map((o, i) =>
                                      i === idx
                                        ? { label: o.label, value: Number(e.target.value) || 0 }
                                        : o
                                    ),
                                  })
                                }
                                className="w-24 px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setQuestionForm({
                                    ...questionForm,
                                    options: questionForm.options.filter((_, i) => i !== idx),
                                  })
                                }
                                className="p-2 text-[#6B7280] hover:text-[#EF4444]"
                                aria-label="Remove option"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={resetQuestionForm}
                          className="px-5 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={questionSaving}
                          className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-5 py-2 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow disabled:opacity-50 text-sm"
                        >
                          {questionSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          {editingQuestion ? "Update" : "Add"} Question
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Questions list */}
                <div className="bg-white rounded-xl border border-[#E5E7EB]">
                  <div className="px-6 py-4 border-b border-[#E5E7EB]">
                    <h2 className="text-sm text-[#111827]">
                      Questions ({filteredQuestions.length})
                    </h2>
                  </div>

                  {qLoading ? (
                    <div className="flex justify-center py-16">
                      <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
                    </div>
                  ) : filteredQuestions.length === 0 ? (
                    <div className="px-6 py-12 text-center text-[#6B7280]">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm mb-3">
                        {questions.length === 0
                          ? "No questions yet. Add your first question to get started."
                          : "No questions for this filter."}
                      </p>
                      {questions.length === 0 && (
                        <button
                          onClick={() => { resetQuestionForm(); setShowQuestionForm(true); }}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2 rounded-lg text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add Question
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E5E7EB]">
                      {filteredQuestions.map((q) => {
                        return (
                          <div key={q.id} className="px-6 py-5 hover:bg-[#F9FAFB] transition">
                            <div className="flex items-start gap-4">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  q.type === "rating"
                                    ? "bg-[#FFFBEB] text-[#F59E0B]"
                                    : "bg-[#ECFEFF] text-[#06B6D4]"
                                }`}
                              >
                                {q.type === "rating" ? (
                                  <Star className="w-5 h-5" />
                                ) : (
                                  <MessageSquare className="w-5 h-5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#111827] mb-2">{q.text}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs text-[#6B7280]">
                                    {q.type === "rating" ? "Rating" : "Text"}
                                  </span>
                                  <span className="text-xs text-[#6B7280]">•</span>
                                  <span className="text-xs text-[#6B7280]">{q.category}</span>
                                  {q.required && (
                                    <>
                                      <span className="text-xs text-[#6B7280]">•</span>
                                      <span className="text-xs text-[#EF4444]">Required</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleEditQuestion(q)}
                                  className="p-2 text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(q)}
                                  className="p-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
