import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Star,
  User,
  Users,
  Briefcase,
  Loader2,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import {
  performanceService,
  type EvaluationAssignmentRecord,
  type EvaluationQuestionRecord,
} from "../../services/performance.service";
import { ApiError } from "../../lib/api";
import { buildEvaluationPayload } from "../../lib/evaluation-submit";
import { findAssignment } from "../../lib/evaluation-helpers";

interface Answer {
  questionId: number;
  rating?: number;
  text?: string;
}

// Fallback questions used when no template is linked to the period. The
// fallback set is chosen by the assignment's evaluator_type (the route param).
const FALLBACK_QUESTIONS: Record<string, EvaluationQuestionRecord[]> = {
  self: [
    { id: -1, template_id: 0, text: "How would you rate your overall performance this quarter?", type: "rating", category: "Overall Performance", required: true },
    { id: -2, template_id: 0, text: "What were your major accomplishments this quarter?",        type: "text",   category: "Accomplishments",     required: true },
    { id: -3, template_id: 0, text: "Rate your achievement of quarterly goals",                  type: "rating", category: "Goals Achievement",   required: true },
    { id: -4, template_id: 0, text: "What areas would you like to develop or improve?",          type: "text",   category: "Development Areas",   required: true },
  ],
  peer: [
    { id: -1, template_id: 0, text: "Rate the employee's collaboration and teamwork skills",                      type: "rating", category: "Collaboration",     required: true },
    { id: -2, template_id: 0, text: "Provide specific examples of how this employee contributes to team success", type: "text",   category: "Team Contribution", required: true },
    { id: -3, template_id: 0, text: "How effective is this employee's communication?",                            type: "rating", category: "Communication",     required: true },
    { id: -4, template_id: 0, text: "How would you rate their innovative thinking?",                              type: "rating", category: "Innovation",        required: true },
  ],
  manager: [
    { id: -1, template_id: 0, text: "Rate the employee's achievement of goals and objectives",      type: "rating", category: "Goals & Objectives", required: true },
    { id: -2, template_id: 0, text: "Assess their performance in core competencies",                type: "rating", category: "Core Competencies",  required: true },
    { id: -3, template_id: 0, text: "Evaluate their leadership potential",                          type: "rating", category: "Leadership",         required: true },
    { id: -4, template_id: 0, text: "Describe the employee's strengths and areas for development", type: "text",   category: "Development",        required: true },
  ],
};

export function EmployeeEvaluationForm() {
  const navigate = useNavigate();
  const { type, id } = useParams();

  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [showSuccess, setShowSuccess]     = useState(false);
  const [answers, setAnswers]             = useState<Answer[]>([]);
  const [errors, setErrors]               = useState<{ [key: number]: string }>({});
  const [submitError, setSubmitError]     = useState<string | null>(null);
  const [assignment, setAssignment]       = useState<EvaluationAssignmentRecord | null>(null);
  const [questions, setQuestions]         = useState<EvaluationQuestionRecord[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [templateTitle, setTemplateTitle] = useState<string | null>(null);

  // Load the assignment
  useEffect(() => {
    if (!id) return;
    performanceService
      .myAssignments()
      .then((res) => setAssignment(findAssignment(res.data, id) ?? null))
      .catch(() => {});
  }, [id]);

  // Once we have the assignment, fetch template questions
  useEffect(() => {
    if (!id) return;
    setQuestionsLoading(true);
    performanceService
      .questionsForAssignment(Number(id))
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setQuestions(res.data);
          setTemplateTitle(res.template?.title ?? null);
        } else {
          // No template linked — use fallback questions
          setQuestions(FALLBACK_QUESTIONS[type ?? "self"] ?? []);
        }
      })
      .catch(() => {
        setQuestions(FALLBACK_QUESTIONS[type ?? "self"] ?? []);
      })
      .finally(() => setQuestionsLoading(false));
  }, [id, type]);

  const getEvaluationDetails = () => {
    const emp = assignment?.employee;
    const periodName =
      typeof assignment?.period === "object" ? assignment.period?.name : assignment?.period;
    switch (type) {
      case "self":
        return {
          title: "Self Evaluation",
          icon: User,
          color: "bg-blue-100 text-blue-600",
          targetName: emp?.name ?? "Myself",
          targetPosition: emp?.position ?? "—",
          description: `Evaluate your own performance${periodName ? ` for ${periodName}` : ""}`,
        };
      case "peer":
        return {
          title: "Peer Evaluation",
          icon: Users,
          color: "bg-[#DCFCE7] text-[#22C55E]",
          targetName: emp?.name ?? "Peer",
          targetPosition: emp?.position ?? "—",
          description: "Provide feedback on your peer's performance",
        };
      case "manager":
        return {
          title: "Manager Evaluation",
          icon: Briefcase,
          color: "bg-[#EEF2FF] text-[#4F46E5]",
          targetName: emp?.name ?? "Team Member",
          targetPosition: emp?.position ?? "—",
          description: "Evaluate your team member's performance",
        };
      default:
        return {
          title: "Evaluation",
          icon: Star,
          color: "bg-[#F9FAFB] text-[#6B7280]",
          targetName: emp?.name ?? "Employee",
          targetPosition: emp?.position ?? "—",
          description: "Complete the evaluation",
        };
    }
  };

  const details = getEvaluationDetails();
  const Icon = details.icon;

  const handleRatingChange = (questionId: number, rating: number) => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) return prev.map((a) => a.questionId === questionId ? { ...a, rating } : a);
      return [...prev, { questionId, rating }];
    });
    if (errors[questionId]) {
      const e = { ...errors };
      delete e[questionId];
      setErrors(e);
    }
  };

  const handleTextChange = (questionId: number, text: string) => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) return prev.map((a) => a.questionId === questionId ? { ...a, text } : a);
      return [...prev, { questionId, text }];
    });
    if (errors[questionId]) {
      const e = { ...errors };
      delete e[questionId];
      setErrors(e);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: number]: string } = {};
    let isValid = true;

    questions.forEach((q) => {
      if (q.required) {
        const answer = answers.find((a) => a.questionId === q.id);
        if (!answer) {
          newErrors[q.id] = "This field is required";
          isValid = false;
        } else if (q.type === "rating" && !answer.rating) {
          newErrors[q.id] = "Please provide a rating";
          isValid = false;
        } else if (q.type === "text" && (!answer.text || answer.text.trim().length < 10)) {
          newErrors[q.id] = "Please provide at least 10 characters";
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!id) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = buildEvaluationPayload(answers);
      await performanceService.submitEvaluation(Number(id), {
        answers: payload.answers,
        ...(payload.score    !== undefined ? { score: payload.score }       : {}),
        ...(payload.comments !== undefined ? { comments: payload.comments } : {}),
      });
      setShowSuccess(true);
      setTimeout(() => navigate("/employee/performance?tab=tasks"), 1500);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Failed to submit evaluation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const periodName =
    typeof assignment?.period === "object" ? assignment?.period?.name : (assignment?.period ?? "Q1 2026");

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/employee/performance?tab=tasks")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">{details.title}</h1>
                <p className="text-sm text-[#6B7280]">{details.description}</p>
              </div>
            </div>
            <Badge variant="warning" size="sm">In Progress</Badge>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Success */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-[#DCFCE7] border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm text-[#22C55E] mb-1">Success!</h3>
                  <p className="text-sm text-[#22C55E]">Evaluation submitted successfully. Redirecting...</p>
                </div>
              </div>
            )}

            {/* Submit Error */}
            {submitError && (
              <div className="mb-6 p-4 bg-[#FEF2F2] border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#EF4444]">{submitError}</p>
              </div>
            )}

            {/* Subject Card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${details.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-lg text-[#111827] mb-1">
                    {type === "self" ? "Evaluating: Myself" : `Evaluating: ${details.targetName}`}
                  </h2>
                  <p className="text-sm text-[#6B7280]">{details.targetPosition}</p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Review Period: {periodName}
                    {templateTitle && (
                      <span className="ml-2 px-1.5 py-0.5 bg-[#EEF2FF] text-[#4F46E5] rounded text-xs">
                        {templateTitle}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Questions loading */}
            {questionsLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm text-[#111827] mb-1">
                          {question.text}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                        <p className="text-xs text-[#6B7280]">{question.category}</p>
                      </div>
                    </div>

                    {question.type === "rating" ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map((rating) => {
                            const answer = answers.find((a) => a.questionId === question.id);
                            const isSelected = answer?.rating === rating;
                            return (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => handleRatingChange(question.id, rating)}
                                className={`w-12 h-12 rounded-lg border-2 transition flex items-center justify-center ${
                                  isSelected
                                    ? "border-[#4F46E5] bg-[#4F46E5] text-white"
                                    : "border-[#E5E7EB] text-[#6B7280] hover:border-[#4F46E5]"
                                }`}
                              >
                                <span className="text-lg">{rating}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#6B7280] mb-2">
                          <span>Poor</span>
                          <span>Excellent</span>
                        </div>
                        {errors[question.id] && (
                          <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                            <AlertCircle className="w-4 h-4" />
                            <p className="text-sm">{errors[question.id]}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <textarea
                          value={answers.find((a) => a.questionId === question.id)?.text || ""}
                          onChange={(e) => handleTextChange(question.id, e.target.value)}
                          placeholder="Enter your feedback here..."
                          rows={5}
                          className={`w-full px-4 py-3 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                            errors[question.id]
                              ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                              : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                          }`}
                        />
                        {errors[question.id] && (
                          <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                            <AlertCircle className="w-4 h-4" />
                            <p className="text-sm">{errors[question.id]}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Actions */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      disabled
                      className="flex items-center gap-2 px-6 py-3 border border-[#E5E7EB] text-[#9CA3AF] rounded-lg cursor-not-allowed"
                    >
                      <Save className="w-5 h-5" />
                      Save as Draft
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigate("/employee/performance?tab=tasks")}
                        className="px-6 py-3 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-3 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        <span>{isSubmitting ? "Submitting..." : "Submit Evaluation"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Info */}
            <div className="mt-6 p-4 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg">
              <p className="text-sm text-[#06B6D4]">
                <strong>Note:</strong> Your responses will be kept confidential and used only for
                performance review purposes. Please provide honest and constructive feedback.
              </p>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
