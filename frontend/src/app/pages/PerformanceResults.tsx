import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Download, Star, TrendingUp, Target, Award, Users, MessageSquare, FileText, User, Briefcase } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

interface CategoryScore {
  category: string;
  self: number;
  peer: number;
  manager: number;
  average: number;
}

interface Comment {
  evaluator: string;
  role: "self" | "peer" | "manager";
  avatar: string;
  strengths: string;
  improvements: string;
  timestamp: string;
}

export function PerformanceResults() {
  const navigate = useNavigate();
  const { employeeId } = useParams();

  // Employee info
  const employeeInfo = {
    name: "Sarah Johnson",
    position: "Marketing Specialist",
    department: "Marketing",
    reviewPeriod: "Q1 2026",
    avatar: "SJ",
  };

  // Overall scores
  const overallScores = {
    final: 4.2,
    self: 4.0,
    peer: 4.3,
    manager: 4.3,
  };

  // Category breakdown
  const categoryScores: CategoryScore[] = [
    { category: "Goals & Objectives", self: 4.0, peer: 4.5, manager: 4.5, average: 4.3 },
    { category: "Core Competencies", self: 3.5, peer: 4.0, manager: 4.0, average: 3.8 },
    { category: "Leadership", self: 4.5, peer: 4.5, manager: 4.0, average: 4.3 },
    { category: "Collaboration", self: 4.0, peer: 4.5, manager: 4.5, average: 4.3 },
  ];

  // Radar chart data
  const radarData = categoryScores.map(cat => ({
    category: cat.category.split(" ")[0], // Shortened for radar
    Self: cat.self,
    Peer: cat.peer,
    Manager: cat.manager,
  }));

  // Comments from evaluators
  const comments: Comment[] = [
    {
      evaluator: "Sarah Johnson (You)",
      role: "self",
      avatar: "SJ",
      strengths: "Successfully launched three major marketing campaigns this quarter with excellent results. Demonstrated strong project management skills and creative thinking. Exceeded social media engagement targets by 40%.",
      improvements: "Would like to develop more advanced data analytics skills to better measure campaign ROI. Need to improve time management when handling multiple projects simultaneously.",
      timestamp: "March 15, 2026",
    },
    {
      evaluator: "Michael Chen",
      role: "peer",
      avatar: "MC",
      strengths: "Sarah is an exceptional collaborator who brings creative ideas to every project. Her communication skills are outstanding, and she always ensures everyone is aligned. She's proactive in seeking feedback and incorporating it into her work.",
      improvements: "Could benefit from more technical knowledge in marketing automation tools. Sometimes takes on too much and could delegate more effectively.",
      timestamp: "March 17, 2026",
    },
    {
      evaluator: "Emily Davis",
      role: "peer",
      avatar: "ED",
      strengths: "Fantastic team player with a positive attitude. Sarah's campaigns are always visually stunning and on-brand. She's great at mentoring junior team members and sharing her knowledge.",
      improvements: "Could work on saying no to additional requests to avoid burnout. Would benefit from deeper strategic thinking about long-term marketing initiatives.",
      timestamp: "March 17, 2026",
    },
    {
      evaluator: "Jennifer Wilson (Manager)",
      role: "manager",
      avatar: "JW",
      strengths: "Sarah has shown exceptional performance this quarter. Her campaign results speak for themselves - consistently exceeding targets and delivering high-quality work. She's developed into a leader on the team and is ready for more responsibility. Her creativity and strategic thinking have significantly contributed to our department's success.",
      improvements: "As Sarah takes on more senior responsibilities, she should focus on developing her analytical skills and learning to balance multiple strategic initiatives. Recommend enrolling in advanced marketing analytics training.",
      timestamp: "March 20, 2026",
    },
  ];

  // Score bar chart data
  const scoreComparisonData = [
    { name: "Self", score: overallScores.self },
    { name: "Peer Avg", score: overallScores.peer },
    { name: "Manager", score: overallScores.manager },
    { name: "Final", score: overallScores.final },
  ];

  // Get rating label
  const getRatingLabel = (score: number) => {
    if (score >= 4.5) return "Exceptional";
    if (score >= 4.0) return "Exceeds Expectations";
    if (score >= 3.5) return "Meets Expectations";
    if (score >= 3.0) return "Needs Improvement";
    return "Unsatisfactory";
  };

  // Get rating color
  const getRatingColor = (score: number) => {
    if (score >= 4.5) return "text-[#4F46E5]";
    if (score >= 4.0) return "text-[#22C55E]";
    if (score >= 3.5) return "text-blue-600";
    if (score >= 3.0) return "text-[#F59E0B]";
    return "text-[#EF4444]";
  };

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
                <h1 className="text-xl text-[#111827]">Performance Review Results</h1>
                <p className="text-sm text-[#6B7280]">{employeeInfo.reviewPeriod} • {employeeInfo.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">View Details</span>
              </button>
              <button className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Employee Info Card */}
            <div className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] rounded-xl p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xl">
                  {employeeInfo.avatar}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl mb-1">{employeeInfo.name}</h2>
                  <p className="text-sm opacity-90">
                    {employeeInfo.position} • {employeeInfo.department}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-75 mb-1">Review Period</div>
                  <div className="text-lg">{employeeInfo.reviewPeriod}</div>
                </div>
              </div>
            </div>

            {/* Final Score Card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full mb-4">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-sm text-[#6B7280] mb-2">Final Performance Score</h2>
                <div className="text-6xl text-[#111827] mb-2">{overallScores.final.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.round(overallScores.final)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className={`inline-block px-4 py-2 rounded-full ${getRatingColor(overallScores.final)} bg-opacity-10`}>
                  <span className={`text-sm ${getRatingColor(overallScores.final)}`}>
                    {getRatingLabel(overallScores.final)}
                  </span>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Self Score */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm text-[#111827]">Self Evaluation</h3>
                    <p className="text-xs text-[#6B7280]">Your assessment</p>
                  </div>
                </div>
                <div className="text-3xl text-[#111827] mb-2">{overallScores.self.toFixed(1)}</div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(overallScores.self)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Peer Score */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <div>
                    <h3 className="text-sm text-[#111827]">Peer Average</h3>
                    <p className="text-xs text-[#6B7280]">2 peer reviews</p>
                  </div>
                </div>
                <div className="text-3xl text-[#111827] mb-2">{overallScores.peer.toFixed(1)}</div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(overallScores.peer)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Manager Score */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-[#4F46E5]" />
                  </div>
                  <div>
                    <h3 className="text-sm text-[#111827]">Manager Evaluation</h3>
                    <p className="text-xs text-[#6B7280]">Direct supervisor</p>
                  </div>
                </div>
                <div className="text-3xl text-[#111827] mb-2">{overallScores.manager.toFixed(1)}</div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(overallScores.manager)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Score Comparison */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-[#4F46E5]" />
                <h2 className="text-sm text-[#111827]">Score Comparison</h2>
              </div>
              <div className="space-y-4">
                {scoreComparisonData.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#111827]">{item.name}</span>
                      <span className="text-sm text-[#111827]">{item.score.toFixed(1)}/5.0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] h-3 rounded-full transition-all"
                        style={{ width: `${(item.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Scores Table */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-sm text-[#111827] mb-4">Detailed Category Scores</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E5E7EB]">
                      <th className="text-left py-3 px-4 text-sm text-[#6B7280]">Category</th>
                      <th className="text-center py-3 px-4 text-sm text-[#6B7280]">Self</th>
                      <th className="text-center py-3 px-4 text-sm text-[#6B7280]">Peer Avg</th>
                      <th className="text-center py-3 px-4 text-sm text-[#6B7280]">Manager</th>
                      <th className="text-center py-3 px-4 text-sm text-[#6B7280]">Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryScores.map((category, index) => (
                      <tr key={index} className="border-b border-gray-100 last:border-0">
                        <td className="py-4 px-4 text-sm text-[#111827]">{category.category}</td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#ECFEFF] text-blue-700 rounded-full text-sm">
                            {category.self.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#DCFCE7] text-[#22C55E] rounded-full text-sm">
                            {category.peer.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-[#4F46E5] rounded-full text-sm">
                            {category.manager.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                            category.average >= 4.0 ? "bg-[#DCFCE7] text-green-800" : "bg-[#FFFBEB] text-amber-800"
                          }`}>
                            <Star className="w-3 h-3" />
                            {category.average.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-[#4F46E5]" />
                <h2 className="text-sm text-[#111827]">Evaluator Feedback</h2>
              </div>
              
              <div className="space-y-6">
                {comments.map((comment, index) => (
                  <div key={index} className="border border-[#E5E7EB] rounded-lg p-5">
                    {/* Evaluator Info */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm ${
                        comment.role === "self" ? "bg-[#ECFEFF]0" :
                        comment.role === "peer" ? "bg-[#DCFCE7]0" :
                        "bg-purple-500"
                      }`}>
                        {comment.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[#111827]">{comment.evaluator}</p>
                        <p className="text-xs text-[#6B7280]">{comment.timestamp}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        comment.role === "self" ? "bg-blue-100 text-blue-700" :
                        comment.role === "peer" ? "bg-[#DCFCE7] text-[#22C55E]" :
                        "bg-[#EEF2FF] text-[#4F46E5]"
                      }`}>
                        {comment.role === "self" ? "Self" : comment.role === "peer" ? "Peer" : "Manager"}
                      </span>
                    </div>

                    {/* Strengths */}
                    <div className="mb-4">
                      <h3 className="text-sm text-[#111827] mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                        Strengths
                      </h3>
                      <p className="text-sm text-[#6B7280] leading-relaxed">{comment.strengths}</p>
                    </div>

                    {/* Areas for Improvement */}
                    <div>
                      <h3 className="text-sm text-[#111827] mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#F59E0B]" />
                        Areas for Development
                      </h3>
                      <p className="text-sm text-[#6B7280] leading-relaxed">{comment.improvements}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary and Next Steps */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#DCFCE7]0 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm text-[#22C55E] mb-2">Congratulations on Exceeding Expectations!</h3>
                  <p className="text-sm text-[#22C55E] mb-3">
                    Your performance this quarter has been outstanding. Your manager has recommended you for advanced marketing analytics training and increased project responsibilities.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs">
                      Promotion Ready
                    </span>
                    <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs">
                      Development Plan Created
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}