import { useState } from "react";
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
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

interface Question {
  id: number;
  text: string;
  type: "rating" | "text";
  evaluationType: "self" | "peer" | "manager";
  category: string;
  required: boolean;
}

export function EvaluationBuilder() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<"rating" | "text">("rating");
  const [evaluationType, setEvaluationType] = useState<"self" | "peer" | "manager">("self");
  const [category, setCategory] = useState("");
  const [required, setRequired] = useState(true);

  // Form errors
  const [errors, setErrors] = useState({
    questionText: "",
    category: "",
  });

  // Sample questions database
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      text: "How would you rate your overall performance this quarter?",
      type: "rating",
      evaluationType: "self",
      category: "Overall Performance",
      required: true,
    },
    {
      id: 2,
      text: "What were your major accomplishments this quarter?",
      type: "text",
      evaluationType: "self",
      category: "Accomplishments",
      required: true,
    },
    {
      id: 3,
      text: "Rate the employee's collaboration and teamwork skills",
      type: "rating",
      evaluationType: "peer",
      category: "Collaboration",
      required: true,
    },
    {
      id: 4,
      text: "Provide specific examples of how this employee contributes to team success",
      type: "text",
      evaluationType: "peer",
      category: "Team Contribution",
      required: true,
    },
    {
      id: 5,
      text: "Rate the employee's achievement of goals and objectives",
      type: "rating",
      evaluationType: "manager",
      category: "Goals & Objectives",
      required: true,
    },
    {
      id: 6,
      text: "Describe the employee's strengths and areas for development",
      type: "text",
      evaluationType: "manager",
      category: "Development",
      required: true,
    },
  ]);

  // Filter by evaluation type
  const [filterType, setFilterType] = useState<"all" | "self" | "peer" | "manager">("all");

  const filteredQuestions = filterType === "all"
    ? questions
    : questions.filter(q => q.evaluationType === filterType);

  // Validate form
  const validateForm = () => {
    const newErrors = {
      questionText: "",
      category: "",
    };
    let isValid = true;

    if (!questionText.trim()) {
      newErrors.questionText = "Question text is required";
      isValid = false;
    } else if (questionText.trim().length < 10) {
      newErrors.questionText = "Question must be at least 10 characters";
      isValid = false;
    }

    if (!category.trim()) {
      newErrors.category = "Category is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingQuestion) {
      // Update existing question
      setQuestions(prev =>
        prev.map(q =>
          q.id === editingQuestion.id
            ? {
                ...q,
                text: questionText,
                type: questionType,
                evaluationType: evaluationType,
                category: category,
                required: required,
              }
            : q
        )
      );
    } else {
      // Add new question
      const newQuestion: Question = {
        id: Math.max(...questions.map(q => q.id), 0) + 1,
        text: questionText,
        type: questionType,
        evaluationType: evaluationType,
        category: category,
        required: required,
      };
      setQuestions(prev => [...prev, newQuestion]);
    }

    // Reset form
    setQuestionText("");
    setQuestionType("rating");
    setEvaluationType("self");
    setCategory("");
    setRequired(true);
    setEditingQuestion(null);
    setShowForm(false);
    setShowSuccess(true);

    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Handle edit
  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setQuestionText(question.text);
    setQuestionType(question.type);
    setEvaluationType(question.evaluationType);
    setCategory(question.category);
    setRequired(question.required);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = (questionId: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    }
  };

  // Cancel form
  const handleCancel = () => {
    setQuestionText("");
    setQuestionType("rating");
    setEvaluationType("self");
    setCategory("");
    setRequired(true);
    setEditingQuestion(null);
    setShowForm(false);
    setErrors({ questionText: "", category: "" });
  };

  const getEvaluationTypeBadge = (type: string) => {
    switch (type) {
      case "self":
        return <Badge variant="info" size="sm">Self</Badge>;
      case "peer":
        return <Badge variant="success" size="sm">Peer</Badge>;
      case "manager":
        return <Badge variant="default" size="sm">Manager</Badge>;
      default:
        return null;
    }
  };

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
                <p className="text-sm text-[#6B7280]">Create and manage evaluation questions</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Add Question</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-[#DCFCE7] border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm text-[#22C55E] mb-1">Success!</h3>
                  <p className="text-sm text-[#22C55E]">
                    Question {editingQuestion ? "updated" : "created"} successfully.
                  </p>
                </div>
              </div>
            )}

            {/* Question Form */}
            {showForm && (
              <div className="mb-6 bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm text-[#111827]">
                    {editingQuestion ? "Edit Question" : "Create New Question"}
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Question Text */}
                  <div>
                    <label className="block text-sm text-[#111827] mb-2">
                      Question Text <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={questionText}
                      onChange={(e) => {
                        setQuestionText(e.target.value);
                        if (errors.questionText) setErrors({ ...errors, questionText: "" });
                      }}
                      placeholder="Enter your evaluation question..."
                      rows={3}
                      className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                        errors.questionText
                          ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                          : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                      }`}
                    />
                    {errors.questionText && (
                      <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errors.questionText}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Question Type */}
                    <div>
                      <label className="block text-sm text-[#111827] mb-2">
                        Question Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value as "rating" | "text")}
                        className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                      >
                        <option value="rating">Rating Scale (1-5)</option>
                        <option value="text">Text Feedback</option>
                      </select>
                    </div>

                    {/* Evaluation Type */}
                    <div>
                      <label className="block text-sm text-[#111827] mb-2">
                        Evaluation Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={evaluationType}
                        onChange={(e) => setEvaluationType(e.target.value as "self" | "peer" | "manager")}
                        className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                      >
                        <option value="self">Self Evaluation</option>
                        <option value="peer">Peer Evaluation</option>
                        <option value="manager">Manager Evaluation</option>
                      </select>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm text-[#111827] mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          if (errors.category) setErrors({ ...errors, category: "" });
                        }}
                        placeholder="e.g., Goals & Objectives"
                        className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                          errors.category
                            ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                            : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                        }`}
                      />
                      {errors.category && (
                        <div className="mt-2 flex items-center gap-1 text-[#EF4444]">
                          <AlertCircle className="w-4 h-4" />
                          <p className="text-sm">{errors.category}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Required Checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="required"
                      checked={required}
                      onChange={(e) => setRequired(e.target.checked)}
                      className="w-4 h-4 text-[#4F46E5] border-gray-300 rounded focus:ring-[#4F46E5]"
                    />
                    <label htmlFor="required" className="text-sm text-[#6B7280]">
                      This question is required
                    </label>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
                    >
                      <Save className="w-5 h-5" />
                      <span>{editingQuestion ? "Update" : "Create"} Question</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filter */}
            <div className="mb-6 bg-white rounded-xl border border-[#E5E7EB] p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#6B7280]">Filter by:</span>
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    filterType === "all"
                      ? "bg-[#4F46E5] text-white"
                      : "bg-[#F9FAFB] text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  All ({questions.length})
                </button>
                <button
                  onClick={() => setFilterType("self")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    filterType === "self"
                      ? "bg-[#4F46E5] text-white"
                      : "bg-[#F9FAFB] text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  Self ({questions.filter(q => q.evaluationType === "self").length})
                </button>
                <button
                  onClick={() => setFilterType("peer")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    filterType === "peer"
                      ? "bg-[#4F46E5] text-white"
                      : "bg-[#F9FAFB] text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  Peer ({questions.filter(q => q.evaluationType === "peer").length})
                </button>
                <button
                  onClick={() => setFilterType("manager")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    filterType === "manager"
                      ? "bg-[#4F46E5] text-white"
                      : "bg-[#F9FAFB] text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  Manager ({questions.filter(q => q.evaluationType === "manager").length})
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="bg-white rounded-xl border border-[#E5E7EB]">
              <div className="px-6 py-4 border-b border-[#E5E7EB]">
                <h2 className="text-sm text-[#111827]">
                  Questions ({filteredQuestions.length})
                </h2>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {filteredQuestions.length === 0 ? (
                  <div className="px-6 py-12 text-center text-[#6B7280]">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No questions found for this filter.</p>
                  </div>
                ) : (
                  filteredQuestions.map((question) => (
                    <div key={question.id} className="px-6 py-5 hover:bg-[#F9FAFB] transition">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          question.type === "rating"
                            ? "bg-[#FFFBEB] text-[#F59E0B]"
                            : "bg-[#ECFEFF] text-[#06B6D4]"
                        }`}>
                          {question.type === "rating" ? (
                            <Star className="w-5 h-5" />
                          ) : (
                            <MessageSquare className="w-5 h-5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-2">
                            <p className="text-sm text-[#111827] flex-1">{question.text}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {getEvaluationTypeBadge(question.evaluationType)}
                            <span className="text-xs text-[#6B7280]">
                              {question.type === "rating" ? "Rating Scale" : "Text Feedback"}
                            </span>
                            <span className="text-xs text-[#6B7280]">•</span>
                            <span className="text-xs text-[#6B7280]">{question.category}</span>
                            {question.required && (
                              <>
                                <span className="text-xs text-[#6B7280]">•</span>
                                <span className="text-xs text-[#EF4444]">Required</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(question)}
                            className="p-2 text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition"
                            title="Edit Question"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(question.id)}
                            className="p-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
