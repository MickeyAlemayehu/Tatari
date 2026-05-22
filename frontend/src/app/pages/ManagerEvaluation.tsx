import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, AlertCircle, CheckCircle, Star, Send, User, Clock, Search } from "lucide-react";
import { AppLayout } from "../components/AppLayout";

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  avatar: string;
  status: "pending" | "completed";
  dueDate: string;
}

interface EvaluationQuestion {
  id: string;
  category: string;
  question: string;
  rating: number;
  comments: string;
}

export function ManagerEvaluation() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Employees to evaluate
  const [employees] = useState<Employee[]>([
    { id: 1, name: "Sarah Johnson", position: "Marketing Specialist", department: "Marketing", avatar: "SJ", status: "pending", dueDate: "2026-03-28" },
    { id: 2, name: "Michael Chen", position: "Senior Developer", department: "Engineering", avatar: "MC", status: "pending", dueDate: "2026-03-28" },
    { id: 3, name: "Emily Davis", position: "Product Designer", department: "Design", avatar: "ED", status: "completed", dueDate: "2026-03-28" },
    { id: 4, name: "David Martinez", position: "Backend Developer", department: "Engineering", avatar: "DM", status: "pending", dueDate: "2026-03-28" },
    { id: 5, name: "Jennifer Taylor", position: "Content Writer", department: "Marketing", avatar: "JT", status: "pending", dueDate: "2026-03-28" },
    { id: 6, name: "Amanda White", position: "UI Designer", department: "Design", avatar: "AW", status: "completed", dueDate: "2026-03-28" },
  ]);

  // Selected employee
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>(employees[0]!);

  // Evaluation questions
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([
    {
      id: "goal1",
      category: "Goals & Objectives",
      question: "How effectively did the employee achieve their quarterly goals and targets?",
      rating: 0,
      comments: "",
    },
    {
      id: "goal2",
      category: "Goals & Objectives",
      question: "To what extent did they exceed expectations and demonstrate initiative?",
      rating: 0,
      comments: "",
    },
    {
      id: "competency1",
      category: "Core Competencies",
      question: "Rate their technical skills, expertise, and quality of work.",
      rating: 0,
      comments: "",
    },
    {
      id: "competency2",
      category: "Core Competencies",
      question: "How effectively did they demonstrate problem-solving and decision-making skills?",
      rating: 0,
      comments: "",
    },
    {
      id: "competency3",
      category: "Core Competencies",
      question: "Rate their ability to learn, adapt, and take on new challenges.",
      rating: 0,
      comments: "",
    },
    {
      id: "leadership1",
      category: "Leadership & Initiative",
      question: "How well did they demonstrate leadership and ownership of their work?",
      rating: 0,
      comments: "",
    },
    {
      id: "leadership2",
      category: "Leadership & Initiative",
      question: "Rate their proactivity in identifying and solving problems.",
      rating: 0,
      comments: "",
    },
    {
      id: "collaboration1",
      category: "Collaboration & Communication",
      question: "How effectively did they communicate with team members and stakeholders?",
      rating: 0,
      comments: "",
    },
    {
      id: "collaboration2",
      category: "Collaboration & Communication",
      question: "Rate their teamwork, collaboration, and contribution to team success.",
      rating: 0,
      comments: "",
    },
  ]);

  // Overall feedback
  const [overallStrengths, setOverallStrengths] = useState("");
  const [overallImprovements, setOverallImprovements] = useState("");
  const [developmentPlan, setDevelopmentPlan] = useState("");
  const [promotionRecommendation, setPromotionRecommendation] = useState<"yes" | "no" | "not-yet" | "">("");

  // Validation errors
  const [errors, setErrors] = useState<string[]>([]);

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || emp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Count pending
  const pendingCount = employees.filter(e => e.status === "pending").length;

  // Update rating
  const updateRating = (questionId: string, rating: number) => {
    setQuestions(prev =>
      prev.map(q => (q.id === questionId ? { ...q, rating } : q))
    );
    if (errors.length > 0) setErrors([]);
  };

  // Update comments
  const updateComments = (questionId: string, comments: string) => {
    setQuestions(prev =>
      prev.map(q => (q.id === questionId ? { ...q, comments } : q))
    );
  };

  // Handle employee selection
  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    // Reset form
    setQuestions(prev => prev.map(q => ({ ...q, rating: 0, comments: "" })));
    setOverallStrengths("");
    setOverallImprovements("");
    setDevelopmentPlan("");
    setPromotionRecommendation("");
    setErrors([]);
    setShowSuccess(false);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: string[] = [];

    const unratedQuestions = questions.filter(q => q.rating === 0);
    if (unratedQuestions.length > 0) {
      newErrors.push(`Please provide ratings for all ${questions.length} questions`);
    }

    const questionsWithComments = questions.filter(q => q.comments.trim().length > 0);
    if (questionsWithComments.length < 5) {
      newErrors.push("Please provide detailed comments for at least 5 questions");
    }

    if (overallStrengths.trim().length < 30) {
      newErrors.push("Please provide more detailed strengths feedback (minimum 30 characters)");
    }

    if (overallImprovements.trim().length < 30) {
      newErrors.push("Please provide more detailed improvement feedback (minimum 30 characters)");
    }

    if (developmentPlan.trim().length < 30) {
      newErrors.push("Please provide a detailed development plan (minimum 30 characters)");
    }

    if (!promotionRecommendation) {
      newErrors.push("Please select a promotion recommendation");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const formSection = document.getElementById("evaluation-form");
      formSection?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowSuccess(true);

    console.log("Manager Evaluation:", {
      employee: selectedEmployee,
      questions,
      overallStrengths,
      overallImprovements,
      developmentPlan,
      promotionRecommendation,
      averageRating: (questions.reduce((sum, q) => sum + q.rating, 0) / questions.length).toFixed(2),
    });

    setTimeout(() => {
      setShowSuccess(false);
      // Reset form for next employee
      handleSelectEmployee(employees.find(e => e.status === "pending" && e.id !== selectedEmployee.id) || employees[0]);
    }, 2000);
  };

  // Group questions by category
  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {} as Record<string, EvaluationQuestion[]>);

  // Calculate average rating
  const totalRatings = questions.reduce((sum, q) => sum + q.rating, 0);
  const ratedQuestions = questions.filter(q => q.rating > 0).length;
  const averageRating = ratedQuestions > 0 ? (totalRatings / ratedQuestions).toFixed(1) : "0.0";

  const ratingLabels = ["", "Poor", "Below Average", "Average", "Good", "Excellent"];

  return (
    <AppLayout>
      {/* Main Content */}
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
                <h1 className="text-xl text-[#111827]">Manager Evaluations</h1>
                <p className="text-sm text-[#6B7280]">Q1 2026 Performance Review</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#FFFBEB] border border-[#F59E0B]/20 rounded-lg">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-sm text-[#F59E0B]">
                {pendingCount} pending evaluation{pendingCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </header>

        {/* Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Employee List */}
          <div className="w-80 bg-white border-r border-[#E5E7EB] flex flex-col">
            {/* Search and Filter */}
            <div className="p-4 border-b border-[#E5E7EB] space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search employees..."
                  className="w-full pl-9 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs transition ${
                    filterStatus === "all"
                      ? "bg-[#EEF2FF] text-indigo-700"
                      : "bg-[#F9FAFB] text-[#6B7280] hover:bg-gray-200"
                  }`}
                >
                  All ({employees.length})
                </button>
                <button
                  onClick={() => setFilterStatus("pending")}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs transition ${
                    filterStatus === "pending"
                      ? "bg-[#FFFBEB] text-amber-700"
                      : "bg-[#F9FAFB] text-[#6B7280] hover:bg-gray-200"
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => setFilterStatus("completed")}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs transition ${
                    filterStatus === "completed"
                      ? "bg-[#DCFCE7] text-[#22C55E]"
                      : "bg-[#F9FAFB] text-[#6B7280] hover:bg-gray-200"
                  }`}
                >
                  Done ({employees.filter(e => e.status === "completed").length})
                </button>
              </div>
            </div>

            {/* Employee List */}
            <div className="flex-1 overflow-y-auto">
              {filteredEmployees.length === 0 ? (
                <div className="p-8 text-center">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-[#6B7280]">No employees found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <button
                      key={employee.id}
                      onClick={() => handleSelectEmployee(employee)}
                      className={`w-full p-4 text-left transition hover:bg-[#F9FAFB] ${
                        selectedEmployee.id === employee.id ? "bg-[#EEF2FF]" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                          {employee.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm text-[#111827] truncate">{employee.name}</p>
                            {employee.status === "completed" && (
                              <CheckCircle className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-[#6B7280] truncate mb-1">{employee.position}</p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                              employee.status === "pending"
                                ? "bg-[#FFFBEB] text-amber-700"
                                : "bg-[#DCFCE7] text-[#22C55E]"
                            }`}>
                              {employee.status === "pending" ? (
                                <>
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Completed
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Evaluation Form */}
          <div id="evaluation-form" className="flex-1 overflow-y-auto p-6 bg-background">
            <div className="max-w-3xl mx-auto">
              {/* Success Message */}
              {showSuccess && (
                <div className="mb-6 p-4 bg-[#DCFCE7] border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm text-[#22C55E] mb-1">Success!</h3>
                    <p className="text-sm text-[#22C55E]">
                      Evaluation for {selectedEmployee.name} has been submitted successfully.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#EF4444]/20 rounded-lg">
                  <div className="flex items-start gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
                    <h3 className="text-sm text-[#EF4444]">Please correct the following errors:</h3>
                  </div>
                  <ul className="ml-8 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700 list-disc">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Employee Info */}
                <div className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] rounded-xl p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xl">
                      {selectedEmployee.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4" />
                        <span className="text-sm opacity-90">Evaluating</span>
                      </div>
                      <h2 className="text-xl mb-1">{selectedEmployee.name}</h2>
                      <p className="text-sm opacity-90">
                        {selectedEmployee.position} • {selectedEmployee.department}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating Summary */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm text-[#111827] mb-1">Overall Rating</h2>
                      <p className="text-xs text-[#6B7280]">
                        {ratedQuestions}/{questions.length} questions rated
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl text-[#4F46E5] mb-1">{averageRating}</div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(parseFloat(averageRating))
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Questions by Category */}
                {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => (
                  <div key={category} className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                    <h2 className="text-sm text-[#111827] mb-5 pb-3 border-b border-[#E5E7EB]">
                      {category}
                    </h2>
                    
                    <div className="space-y-6">
                      {categoryQuestions.map((question, index) => (
                        <div key={question.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                          <div className="mb-4">
                            <label className="text-sm text-[#111827] block mb-3">
                              {index + 1}. {question.question}
                            </label>
                            
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => updateRating(question.id, star)}
                                    className="group transition"
                                  >
                                    <Star
                                      className={`w-8 h-8 transition ${
                                        star <= question.rating
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-gray-300 group-hover:text-amber-200"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                              {question.rating > 0 && (
                                <span className="text-sm text-[#6B7280]">
                                  {ratingLabels[question.rating]}
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <label htmlFor={`comments-${question.id}`} className="block text-sm text-[#111827] mb-2">
                              Manager Comments
                            </label>
                            <textarea
                              id={`comments-${question.id}`}
                              value={question.comments}
                              onChange={(e) => updateComments(question.id, e.target.value)}
                              placeholder="Provide specific examples and actionable feedback..."
                              rows={3}
                              className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Overall Assessment */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <h2 className="text-sm text-[#111827] mb-5 pb-3 border-b border-[#E5E7EB]">
                    Overall Assessment
                  </h2>
                  
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="strengths" className="block text-sm text-[#111827] mb-2">
                        Key Strengths & Achievements <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="strengths"
                        value={overallStrengths}
                        onChange={(e) => {
                          setOverallStrengths(e.target.value);
                          if (errors.length > 0) setErrors([]);
                        }}
                        placeholder="Describe their major accomplishments and strongest areas..."
                        rows={4}
                        className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition resize-none"
                      />
                      <p className="text-xs text-[#6B7280] mt-1">{overallStrengths.length} characters (minimum 30)</p>
                    </div>

                    <div>
                      <label htmlFor="improvements" className="block text-sm text-[#111827] mb-2">
                        Areas for Development <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="improvements"
                        value={overallImprovements}
                        onChange={(e) => {
                          setOverallImprovements(e.target.value);
                          if (errors.length > 0) setErrors([]);
                        }}
                        placeholder="Identify areas for improvement and growth opportunities..."
                        rows={4}
                        className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition resize-none"
                      />
                      <p className="text-xs text-[#6B7280] mt-1">{overallImprovements.length} characters (minimum 30)</p>
                    </div>

                    <div>
                      <label htmlFor="developmentPlan" className="block text-sm text-[#111827] mb-2">
                        Development Plan & Next Steps <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-[#6B7280] mb-2">
                        What specific actions or training would help this employee grow?
                      </p>
                      <textarea
                        id="developmentPlan"
                        value={developmentPlan}
                        onChange={(e) => {
                          setDevelopmentPlan(e.target.value);
                          if (errors.length > 0) setErrors([]);
                        }}
                        placeholder="Outline development goals, training needs, and action items..."
                        rows={4}
                        className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition resize-none"
                      />
                      <p className="text-xs text-[#6B7280] mt-1">{developmentPlan.length} characters (minimum 30)</p>
                    </div>

                    <div>
                      <label className="block text-sm text-[#111827] mb-3">
                        Promotion Recommendation <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setPromotionRecommendation("yes");
                            if (errors.length > 0) setErrors([]);
                          }}
                          className={`p-3 border-2 rounded-lg transition text-left ${
                            promotionRecommendation === "yes"
                              ? "border-green-500 bg-[#DCFCE7]"
                              : "border-[#E5E7EB] hover:border-[#E5E7EB]"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              promotionRecommendation === "yes"
                                ? "border-green-600 bg-green-600"
                                : "border-[#E5E7EB]"
                            }`}>
                              {promotionRecommendation === "yes" && (
                                <div className="w-full h-full rounded-full bg-white scale-50" />
                              )}
                            </div>
                            <span className="text-sm text-[#111827]">Yes, Ready</span>
                          </div>
                          <p className="text-xs text-[#6B7280] ml-6">Ready for promotion</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPromotionRecommendation("not-yet");
                            if (errors.length > 0) setErrors([]);
                          }}
                          className={`p-3 border-2 rounded-lg transition text-left ${
                            promotionRecommendation === "not-yet"
                              ? "border-amber-500 bg-[#FFFBEB]"
                              : "border-[#E5E7EB] hover:border-[#E5E7EB]"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              promotionRecommendation === "not-yet"
                                ? "border-amber-600 bg-amber-600"
                                : "border-[#E5E7EB]"
                            }`}>
                              {promotionRecommendation === "not-yet" && (
                                <div className="w-full h-full rounded-full bg-white scale-50" />
                              )}
                            </div>
                            <span className="text-sm text-[#111827]">Not Yet</span>
                          </div>
                          <p className="text-xs text-[#6B7280] ml-6">Needs development</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPromotionRecommendation("no");
                            if (errors.length > 0) setErrors([]);
                          }}
                          className={`p-3 border-2 rounded-lg transition text-left ${
                            promotionRecommendation === "no"
                              ? "border-red-500 bg-[#FEF2F2]"
                              : "border-[#E5E7EB] hover:border-[#E5E7EB]"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              promotionRecommendation === "no"
                                ? "border-red-600 bg-[#EF4444]"
                                : "border-[#E5E7EB]"
                            }`}>
                              {promotionRecommendation === "no" && (
                                <div className="w-full h-full rounded-full bg-white scale-50" />
                              )}
                            </div>
                            <span className="text-sm text-[#111827]">No</span>
                          </div>
                          <p className="text-xs text-[#6B7280] ml-6">Not recommended</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {}}
                      className="px-6 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
                      disabled={isSubmitting}
                    >
                      Save as Draft
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                      <span>{isSubmitting ? "Submitting..." : "Submit Evaluation"}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
