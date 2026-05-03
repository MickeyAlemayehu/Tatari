import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, AlertCircle, CheckCircle, Star, Send } from "lucide-react";
import { AppLayout } from "../components/AppLayout";

interface EvaluationQuestion {
  id: string;
  category: string;
  question: string;
  rating: number;
  comments: string;
}

export function PeerEvaluation() {
  const navigate = useNavigate();
  const { peerId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // The peer being evaluated (in a real app, this would come from route params or API)
  const peerData = {
    name: "Sarah Johnson",
    position: "Marketing Specialist",
    department: "Marketing",
    avatar: "SJ",
  };

  // Evaluation questions
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([
    {
      id: "goal1",
      category: "Goals & Objectives",
      question: "How effectively did this colleague achieve their goals and contribute to team objectives?",
      rating: 0,
      comments: "",
    },
    {
      id: "goal2",
      category: "Goals & Objectives",
      question: "To what extent did they demonstrate initiative and exceed expectations?",
      rating: 0,
      comments: "",
    },
    {
      id: "competency1",
      category: "Core Competencies",
      question: "How would you rate their technical skills and expertise?",
      rating: 0,
      comments: "",
    },
    {
      id: "competency2",
      category: "Core Competencies",
      question: "How effectively did they demonstrate problem-solving and critical thinking?",
      rating: 0,
      comments: "",
    },
    {
      id: "competency3",
      category: "Core Competencies",
      question: "Rate their ability to adapt to challenges and learn new skills.",
      rating: 0,
      comments: "",
    },
    {
      id: "values1",
      category: "Company Values",
      question: "How well did they demonstrate professionalism and ethical behavior?",
      rating: 0,
      comments: "",
    },
    {
      id: "values2",
      category: "Company Values",
      question: "To what extent did they contribute to a positive team culture?",
      rating: 0,
      comments: "",
    },
    {
      id: "collaboration1",
      category: "Collaboration",
      question: "How effectively did they communicate with you and other team members?",
      rating: 0,
      comments: "",
    },
    {
      id: "collaboration2",
      category: "Collaboration",
      question: "Rate their collaboration and teamwork on shared projects.",
      rating: 0,
      comments: "",
    },
    {
      id: "collaboration3",
      category: "Collaboration",
      question: "How receptive were they to feedback and different perspectives?",
      rating: 0,
      comments: "",
    },
  ]);

  // Overall feedback
  const [overallStrengths, setOverallStrengths] = useState("");
  const [overallImprovements, setOverallImprovements] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<string[]>([]);

  // Update rating
  const updateRating = (questionId: string, rating: number) => {
    setQuestions(prev =>
      prev.map(q => (q.id === questionId ? { ...q, rating } : q))
    );
    // Clear errors when user interacts
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // Update comments
  const updateComments = (questionId: string, comments: string) => {
    setQuestions(prev =>
      prev.map(q => (q.id === questionId ? { ...q, comments } : q))
    );
  };

  // Validate form
  const validateForm = () => {
    const newErrors: string[] = [];

    // Check if all questions have ratings
    const unratedQuestions = questions.filter(q => q.rating === 0);
    if (unratedQuestions.length > 0) {
      newErrors.push(`Please provide ratings for all ${questions.length} questions`);
    }

    // Check if at least some comments are provided
    const questionsWithComments = questions.filter(q => q.comments.trim().length > 0);
    if (questionsWithComments.length < 4) {
      newErrors.push("Please provide detailed comments for at least 4 questions");
    }

    // Check overall feedback
    if (overallStrengths.trim().length < 20) {
      newErrors.push("Please describe their strengths in more detail (minimum 20 characters)");
    }

    if (overallImprovements.trim().length < 20) {
      newErrors.push("Please describe areas for improvement in more detail (minimum 20 characters)");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setShowSuccess(true);

    // Log evaluation data
    console.log("Peer Evaluation:", {
      peer: peerData,
      questions,
      overallStrengths,
      overallImprovements,
      additionalComments,
      averageRating: (questions.reduce((sum, q) => sum + q.rating, 0) / questions.length).toFixed(2),
    });

    // Show success and redirect
    setTimeout(() => {
      navigate("/performance");
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

  // Rating labels
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
                <h1 className="text-xl text-[#111827]">Peer Evaluation</h1>
                <p className="text-sm text-[#6B7280]">Q1 2026 Performance Review</p>
              </div>
            </div>
            {/* Progress Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg">
              <Star className="w-4 h-4 text-[#4F46E5]" />
              <span className="text-sm text-[#111827]">
                {ratedQuestions}/{questions.length} rated
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-[#DCFCE7] border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm text-[#22C55E] mb-1">Success!</h3>
                  <p className="text-sm text-[#22C55E]">
                    Your peer evaluation has been submitted successfully. Redirecting...
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
              {/* Evaluating Employee Info */}
              <div className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] rounded-xl p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xl">
                    {peerData.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4" />
                      <span className="text-sm opacity-90">Evaluating</span>
                    </div>
                    <h2 className="text-xl mb-1">{peerData.name}</h2>
                    <p className="text-sm opacity-90">
                      {peerData.position} • {peerData.department}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg p-4">
                <p className="text-sm text-[#06B6D4]">
                  <strong>Instructions:</strong> Please provide honest and constructive feedback. Rate your colleague on a scale of 1-5 stars for each question, where 1 is Poor and 5 is Excellent. Your responses will remain confidential.
                </p>
              </div>

              {/* Rating Summary */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm text-[#111827] mb-1">Current Average Rating</h2>
                    <p className="text-xs text-[#6B7280]">Based on your responses</p>
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
                        {/* Question */}
                        <div className="mb-4">
                          <label className="text-sm text-[#111827] block mb-3">
                            {index + 1}. {question.question}
                          </label>
                          
                          {/* Star Rating */}
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

                        {/* Comments */}
                        <div>
                          <label htmlFor={`comments-${question.id}`} className="block text-sm text-[#111827] mb-2">
                            Comments {question.comments.trim().length > 0 && (
                              <span className="text-xs text-[#6B7280]">
                                ({question.comments.trim().length} characters)
                              </span>
                            )}
                          </label>
                          <textarea
                            id={`comments-${question.id}`}
                            value={question.comments}
                            onChange={(e) => updateComments(question.id, e.target.value)}
                            placeholder="Provide specific examples and constructive feedback..."
                            rows={3}
                            className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Overall Feedback */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <h2 className="text-sm text-[#111827] mb-5 pb-3 border-b border-[#E5E7EB]">
                  Overall Feedback
                </h2>
                
                <div className="space-y-5">
                  {/* Strengths */}
                  <div>
                    <label htmlFor="strengths" className="block text-sm text-[#111827] mb-2">
                      Key Strengths <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-[#6B7280] mb-2">
                      What does this colleague do particularly well? What are their strongest attributes?
                    </p>
                    <textarea
                      id="strengths"
                      value={overallStrengths}
                      onChange={(e) => {
                        setOverallStrengths(e.target.value);
                        if (errors.length > 0) setErrors([]);
                      }}
                      placeholder="Describe their key strengths and positive contributions..."
                      rows={4}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition resize-none"
                    />
                    <p className="text-xs text-[#6B7280] mt-1">
                      {overallStrengths.length} characters (minimum 20)
                    </p>
                  </div>

                  {/* Areas for Improvement */}
                  <div>
                    <label htmlFor="improvements" className="block text-sm text-[#111827] mb-2">
                      Areas for Development <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-[#6B7280] mb-2">
                      What skills or areas could this colleague develop further? Please be constructive.
                    </p>
                    <textarea
                      id="improvements"
                      value={overallImprovements}
                      onChange={(e) => {
                        setOverallImprovements(e.target.value);
                        if (errors.length > 0) setErrors([]);
                      }}
                      placeholder="Provide constructive suggestions for improvement..."
                      rows={4}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition resize-none"
                    />
                    <p className="text-xs text-[#6B7280] mt-1">
                      {overallImprovements.length} characters (minimum 20)
                    </p>
                  </div>

                  {/* Additional Comments */}
                  <div>
                    <label htmlFor="additionalComments" className="block text-sm text-[#111827] mb-2">
                      Additional Comments (Optional)
                    </label>
                    <p className="text-xs text-[#6B7280] mb-2">
                      Any other feedback or observations you'd like to share?
                    </p>
                    <textarea
                      id="additionalComments"
                      value={additionalComments}
                      onChange={(e) => setAdditionalComments(e.target.value)}
                      placeholder="Share any additional thoughts or context..."
                      rows={4}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Confidentiality Notice */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm text-purple-900 mb-1">Confidentiality Notice</h3>
                  <p className="text-sm text-[#4F46E5]">
                    Your feedback is confidential and will be anonymized before being shared with the employee. Please provide honest, constructive feedback.
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/performance")}
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

            {/* Help Text */}
            <div className="mt-6 p-4 bg-[#FFFBEB] border border-[#F59E0B]/20 rounded-lg">
              <p className="text-sm text-[#F59E0B]">
                <strong>Note:</strong> Once submitted, you will not be able to edit your responses. Please review your feedback carefully before submitting.
              </p>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}