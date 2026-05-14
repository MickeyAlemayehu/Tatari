import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Edit,
  List,
  Star,
  MessageSquare,
  Users,
  User,
  Briefcase,
  Settings,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

interface EvaluationCategory {
  id: number;
  name: string;
  weight: number;
  questionCount: number;
}

export function EvaluationStructure() {
  const navigate = useNavigate();

  // Evaluation weights
  const [weights, setWeights] = useState({
    self: 30,
    peer: 30,
    manager: 40,
  });

  // Categories for each evaluation type
  const selfCategories: EvaluationCategory[] = [
    { id: 1, name: "Overall Performance", weight: 25, questionCount: 2 },
    { id: 2, name: "Accomplishments", weight: 30, questionCount: 1 },
    { id: 3, name: "Goals Achievement", weight: 25, questionCount: 1 },
    { id: 4, name: "Development Areas", weight: 20, questionCount: 1 },
  ];

  const peerCategories: EvaluationCategory[] = [
    { id: 1, name: "Collaboration", weight: 35, questionCount: 2 },
    { id: 2, name: "Team Contribution", weight: 30, questionCount: 1 },
    { id: 3, name: "Communication", weight: 20, questionCount: 1 },
    { id: 4, name: "Innovation", weight: 15, questionCount: 1 },
  ];

  const managerCategories: EvaluationCategory[] = [
    { id: 1, name: "Goals & Objectives", weight: 30, questionCount: 2 },
    { id: 2, name: "Core Competencies", weight: 25, questionCount: 2 },
    { id: 3, name: "Leadership", weight: 20, questionCount: 1 },
    { id: 4, name: "Development", weight: 25, questionCount: 1 },
  ];

  // Sample questions by type
  const selfQuestions = [
    "How would you rate your overall performance this quarter?",
    "What were your major accomplishments this quarter?",
    "Did you achieve your quarterly goals?",
    "What areas would you like to develop?",
  ];

  const peerQuestions = [
    "Rate the employee's collaboration and teamwork skills",
    "Provide specific examples of how this employee contributes to team success",
    "How effective is this employee's communication?",
    "How would you rate their innovative thinking?",
  ];

  const managerQuestions = [
    "Rate the employee's achievement of goals and objectives",
    "Assess their performance in core competencies",
    "Evaluate their leadership potential",
    "Describe the employee's strengths and areas for development",
  ];

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
                  Manage evaluation types, questions, and weighting
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

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Evaluation Weight Distribution */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-[#4F46E5]" />
                <h2 className="text-sm text-[#111827]">Final Score Weight Distribution</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-[#E5E7EB] rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm text-[#111827]">Self Evaluation</h3>
                      <p className="text-2xl text-[#111827]">{weights.self}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${weights.self}%` }}
                    />
                  </div>
                </div>

                <div className="border border-[#E5E7EB] rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#22C55E]" />
                    </div>
                    <div>
                      <h3 className="text-sm text-[#111827]">Peer Evaluation</h3>
                      <p className="text-2xl text-[#111827]">{weights.peer}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#22C55E] h-2 rounded-full transition-all"
                      style={{ width: `${weights.peer}%` }}
                    />
                  </div>
                </div>

                <div className="border border-[#E5E7EB] rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-[#4F46E5]" />
                    </div>
                    <div>
                      <h3 className="text-sm text-[#111827]">Manager Evaluation</h3>
                      <p className="text-2xl text-[#111827]">{weights.manager}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#4F46E5] h-2 rounded-full transition-all"
                      style={{ width: `${weights.manager}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg">
                <p className="text-sm text-[#06B6D4]">
                  <strong>Note:</strong> The final score is calculated by combining all three
                  evaluation types based on these weights. Total must equal 100%.
                </p>
              </div>
            </div>

            {/* Self Evaluation Structure */}
            <div className="bg-white rounded-xl border border-[#E5E7EB]">
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm text-[#111827]">Self Evaluation</h2>
                    <p className="text-xs text-[#6B7280]">
                      {selfQuestions.length} questions • {weights.self}% weight
                    </p>
                  </div>
                </div>
                <Badge variant="info" size="sm">
                  {selfQuestions.length} Questions
                </Badge>
              </div>

              <div className="p-6">
                <h3 className="text-sm text-[#111827] mb-4">Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {selfCategories.map((category) => (
                    <div
                      key={category.id}
                      className="border border-[#E5E7EB] rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm text-[#111827]">{category.name}</h4>
                        <span className="text-xs text-[#6B7280]">{category.weight}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${category.weight}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#6B7280]">
                        {category.questionCount} question
                        {category.questionCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  ))}
                </div>

                <h3 className="text-sm text-[#111827] mb-4">Questions</h3>
                <div className="space-y-3">
                  {selfQuestions.map((question, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600 text-sm">
                        {index + 1}
                      </div>
                      <p className="text-sm text-[#111827] flex-1">{question}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Peer Evaluation Structure */}
            <div className="bg-white rounded-xl border border-[#E5E7EB]">
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <div>
                    <h2 className="text-sm text-[#111827]">Peer Evaluation</h2>
                    <p className="text-xs text-[#6B7280]">
                      {peerQuestions.length} questions • {weights.peer}% weight
                    </p>
                  </div>
                </div>
                <Badge variant="success" size="sm">
                  {peerQuestions.length} Questions
                </Badge>
              </div>

              <div className="p-6">
                <h3 className="text-sm text-[#111827] mb-4">Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {peerCategories.map((category) => (
                    <div
                      key={category.id}
                      className="border border-[#E5E7EB] rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm text-[#111827]">{category.name}</h4>
                        <span className="text-xs text-[#6B7280]">{category.weight}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                        <div
                          className="bg-[#22C55E] h-1.5 rounded-full transition-all"
                          style={{ width: `${category.weight}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#6B7280]">
                        {category.questionCount} question
                        {category.questionCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  ))}
                </div>

                <h3 className="text-sm text-[#111827] mb-4">Questions</h3>
                <div className="space-y-3">
                  {peerQuestions.map((question, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                    >
                      <div className="w-8 h-8 bg-[#DCFCE7] rounded-lg flex items-center justify-center flex-shrink-0 text-[#22C55E] text-sm">
                        {index + 1}
                      </div>
                      <p className="text-sm text-[#111827] flex-1">{question}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Manager Evaluation Structure */}
            <div className="bg-white rounded-xl border border-[#E5E7EB]">
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-[#4F46E5]" />
                  </div>
                  <div>
                    <h2 className="text-sm text-[#111827]">Manager Evaluation</h2>
                    <p className="text-xs text-[#6B7280]">
                      {managerQuestions.length} questions • {weights.manager}% weight
                    </p>
                  </div>
                </div>
                <Badge variant="default" size="sm">
                  {managerQuestions.length} Questions
                </Badge>
              </div>

              <div className="p-6">
                <h3 className="text-sm text-[#111827] mb-4">Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {managerCategories.map((category) => (
                    <div
                      key={category.id}
                      className="border border-[#E5E7EB] rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm text-[#111827]">{category.name}</h4>
                        <span className="text-xs text-[#6B7280]">{category.weight}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                        <div
                          className="bg-[#4F46E5] h-1.5 rounded-full transition-all"
                          style={{ width: `${category.weight}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#6B7280]">
                        {category.questionCount} question
                        {category.questionCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  ))}
                </div>

                <h3 className="text-sm text-[#111827] mb-4">Questions</h3>
                <div className="space-y-3">
                  {managerQuestions.map((question, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                    >
                      <div className="w-8 h-8 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0 text-[#4F46E5] text-sm">
                        {index + 1}
                      </div>
                      <p className="text-sm text-[#111827] flex-1">{question}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
