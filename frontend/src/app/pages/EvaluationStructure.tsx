import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Edit,
  Star,
  Users,
  User,
  Briefcase,
  Settings,
  Loader2,
  AlertCircle,
  LayoutTemplate,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import {
  performanceService,
  type EvaluationTemplateRecord,
  type EvaluationQuestionRecord,
} from "../../services/performance.service";

type EvalType = "self" | "peer" | "manager";

interface GroupedQuestions {
  self: EvaluationQuestionRecord[];
  peer: EvaluationQuestionRecord[];
  manager: EvaluationQuestionRecord[];
}

interface EvaluationCategory {
  name: string;
  questionCount: number;
}

function deriveCategories(questions: EvaluationQuestionRecord[]): EvaluationCategory[] {
  const map = new Map<string, number>();
  for (const q of questions) {
    const cat = q.category || "General";
    map.set(cat, (map.get(cat) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, questionCount]) => ({ name, questionCount }));
}

const TYPE_CONFIG: Record<
  EvalType,
  {
    label: string;
    icon: React.ReactNode;
    bgColor: string;
    textColor: string;
    barColor: string;
    badgeVariant: "info" | "success" | "default";
  }
> = {
  self: {
    label: "Self Evaluation",
    icon: <User className="w-5 h-5 text-blue-600" />,
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
    barColor: "bg-blue-600",
    badgeVariant: "info",
  },
  peer: {
    label: "Peer Evaluation",
    icon: <Users className="w-5 h-5 text-[#22C55E]" />,
    bgColor: "bg-[#DCFCE7]",
    textColor: "text-[#22C55E]",
    barColor: "bg-[#22C55E]",
    badgeVariant: "success",
  },
  manager: {
    label: "Manager Evaluation",
    icon: <Briefcase className="w-5 h-5 text-[#4F46E5]" />,
    bgColor: "bg-[#EEF2FF]",
    textColor: "text-[#4F46E5]",
    barColor: "bg-[#4F46E5]",
    badgeVariant: "default",
  },
};

function QuestionTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "rating":
      return <Star className="w-3 h-3" />;
    default:
      return null;
  }
}

export function EvaluationStructure() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<EvaluationTemplateRecord | null>(null);
  const [grouped, setGrouped] = useState<GroupedQuestions>({
    self: [],
    peer: [],
    manager: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch all templates, pick the active one
        const templatesRes = await performanceService.templates();
        const templates = templatesRes.data ?? [];
        const active = templates.find((t) => t.status === "active") ?? null;

        if (cancelled) return;

        if (!active) {
          setTemplate(null);
          setGrouped({ self: [], peer: [], manager: [] });
          setLoading(false);
          return;
        }

        setTemplate(active);

        // 2. Fetch questions for that template
        const questionsRes = await performanceService.questions({
          template_id: active.id,
        });
        const questions = questionsRes.data ?? [];

        if (cancelled) return;

        const g: GroupedQuestions = { self: [], peer: [], manager: [] };
        for (const q of questions) {
          const et = (q.evaluationType ?? q.evaluation_type ?? "").toLowerCase() as EvalType;
          if (et === "self" || et === "peer" || et === "manager") {
            g[et].push(q);
          }
        }

        setGrouped(g);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load evaluation structure.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const weights = template?.weights ?? { self: 0, peer: 0, manager: 0 };

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[#6B7280]">
            <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
            <p className="text-sm">Loading evaluation structure…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-[#111827] font-medium">Could not load structure</p>
            <p className="text-xs text-[#6B7280]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-[#4F46E5] text-white text-sm rounded-lg hover:bg-[#4338CA] transition"
            >
              Retry
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── No active template ───────────────────────────────────────────────
  if (!template) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/performance")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">Evaluation Structure</h1>
                <p className="text-sm text-[#6B7280]">
                  Manage evaluation types, questions, and weighting
                </p>
              </div>
            </div>
          </header>
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-[#EEF2FF] rounded-2xl flex items-center justify-center">
                <LayoutTemplate className="w-8 h-8 text-[#4F46E5]" />
              </div>
              <p className="text-sm font-medium text-[#111827]">No active template</p>
              <p className="text-xs text-[#6B7280] max-w-xs">
                There is no active evaluation template. Go to the Evaluation Builder to create and
                activate one.
              </p>
              <button
                onClick={() => navigate("/performance/builder")}
                className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg"
              >
                <Edit className="w-4 h-4" />
                <span>Open Builder</span>
              </button>
            </div>
          </main>
        </div>
      </AppLayout>
    );
  }

  // ── Main view ────────────────────────────────────────────────────────
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
                <h1 className="text-xl text-[#111827]">Evaluation Structure</h1>
                <p className="text-sm text-[#6B7280]">
                  Active template:{" "}
                  <span className="font-medium text-[#4F46E5]">{template.title}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/performance/builder")}
              className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Questions</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Weight Distribution */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-[#4F46E5]" />
                <h2 className="text-sm text-[#111827]">Final Score Weight Distribution</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(["self", "peer", "manager"] as EvalType[]).map((type) => {
                  const cfg = TYPE_CONFIG[type];
                  const w = weights[type] ?? 0;
                  return (
                    <div key={type} className="border border-[#E5E7EB] rounded-lg p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-10 h-10 ${cfg.bgColor} rounded-lg flex items-center justify-center`}
                        >
                          {cfg.icon}
                        </div>
                        <div>
                          <h3 className="text-sm text-[#111827]">{cfg.label}</h3>
                          <p className="text-2xl text-[#111827]">{w}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${cfg.barColor} h-2 rounded-full transition-all`}
                          style={{ width: `${w}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg">
                <p className="text-sm text-[#06B6D4]">
                  <strong>Note:</strong> The final score is calculated by combining all three
                  evaluation types based on these weights. Total must equal 100%.
                </p>
              </div>
            </div>

            {/* Per-type sections */}
            {(["self", "peer", "manager"] as EvalType[]).map((type) => {
              const cfg = TYPE_CONFIG[type];
              const questions = grouped[type];
              const categories = deriveCategories(questions);
              const w = weights[type] ?? 0;

              return (
                <div key={type} className="bg-white rounded-xl border border-[#E5E7EB]">
                  {/* Section header */}
                  <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${cfg.bgColor} rounded-lg flex items-center justify-center`}
                      >
                        {cfg.icon}
                      </div>
                      <div>
                        <h2 className="text-sm text-[#111827]">{cfg.label}</h2>
                        <p className="text-xs text-[#6B7280]">
                          {questions.length} question{questions.length !== 1 ? "s" : ""} •{" "}
                          {w}% weight
                        </p>
                      </div>
                    </div>
                    <Badge variant={cfg.badgeVariant} size="sm">
                      {questions.length} Questions
                    </Badge>
                  </div>

                  <div className="p-6">
                    {questions.length === 0 ? (
                      <p className="text-sm text-[#6B7280] italic text-center py-4">
                        No questions added for this evaluation type yet.
                      </p>
                    ) : (
                      <>
                        {/* Categories */}
                        {categories.length > 0 && (
                          <>
                            <h3 className="text-sm text-[#111827] mb-4">Categories</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              {categories.map((cat) => (
                                <div
                                  key={cat.name}
                                  className="border border-[#E5E7EB] rounded-lg p-4"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm text-[#111827]">{cat.name}</h4>
                                    <span className="text-xs text-[#6B7280]">
                                      {cat.questionCount} Q
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#6B7280]">
                                    {cat.questionCount} question
                                    {cat.questionCount !== 1 ? "s" : ""}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {/* Questions list */}
                        <h3 className="text-sm text-[#111827] mb-4">Questions</h3>
                        <div className="space-y-3">
                          {questions.map((q, index) => (
                            <div
                              key={q.id}
                              className="flex items-start gap-3 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                            >
                              <div
                                className={`w-8 h-8 ${cfg.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.textColor} text-sm`}
                              >
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#111827]">{q.text}</p>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  {q.category && (
                                    <span className="text-xs text-[#6B7280] bg-white border border-[#E5E7EB] px-2 py-0.5 rounded-full">
                                      {q.category}
                                    </span>
                                  )}
                                  {q.type && (
                                    <span className="text-xs text-[#6B7280] flex items-center gap-1">
                                      <QuestionTypeIcon type={q.type} />
                                      {q.type}
                                    </span>
                                  )}
                                  {q.required && (
                                    <span className="text-xs text-red-500">Required</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
