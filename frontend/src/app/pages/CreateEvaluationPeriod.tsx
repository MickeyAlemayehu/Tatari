import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, Plus, Trash2, AlertCircle, CheckCircle, Percent, Info } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { performanceService } from "../../services/performance.service";
import { ApiError } from "../../lib/api";

interface WeightCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export function CreateEvaluationPeriod() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Weight configuration
  const [weights, setWeights] = useState<WeightCriteria[]>([
    {
      id: "goals",
      name: "Goals & Objectives",
      description: "Achievement of set goals and targets",
      weight: 40,
    },
    {
      id: "competencies",
      name: "Core Competencies",
      description: "Skills and abilities demonstration",
      weight: 30,
    },
    {
      id: "values",
      name: "Company Values",
      description: "Alignment with company culture",
      weight: 20,
    },
    {
      id: "collaboration",
      name: "Collaboration",
      description: "Teamwork and communication",
      weight: 10,
    },
  ]);

  // Validation errors
  const [errors, setErrors] = useState({
    name: "",
    startDate: "",
    endDate: "",
    weights: "",
  });

  // Calculate total weight
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);

  // Validation function
  const validateForm = () => {
    const newErrors = {
      name: "",
      startDate: "",
      endDate: "",
      weights: "",
    };

    let isValid = true;

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Evaluation period name is required";
      isValid = false;
    } else if (name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
      isValid = false;
    }

    // Start date validation
    if (!startDate) {
      newErrors.startDate = "Start date is required";
      isValid = false;
    }

    // End date validation
    if (!endDate) {
      newErrors.endDate = "End date is required";
      isValid = false;
    } else if (startDate && new Date(endDate) <= new Date(startDate)) {
      newErrors.endDate = "End date must be after start date";
      isValid = false;
    }

    // Weight validation
    if (totalWeight !== 100) {
      newErrors.weights = "Total weight must equal 100%";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle weight change
  const handleWeightChange = (id: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(100, numValue));
    
    setWeights(prev =>
      prev.map(w => w.id === id ? { ...w, weight: clampedValue } : w)
    );
    
    // Clear weight error when user adjusts
    if (errors.weights) {
      setErrors({ ...errors, weights: "" });
    }
  };

  // Auto-distribute weights
  const autoDistributeWeights = () => {
    const equalWeight = Math.floor(100 / weights.length);
    const remainder = 100 - (equalWeight * weights.length);
    
    setWeights(prev =>
      prev.map((w, index) => ({
        ...w,
        weight: index === 0 ? equalWeight + remainder : equalWeight,
      }))
    );
    
    setErrors({ ...errors, weights: "" });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await performanceService.createPeriod({
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
        status: "active",
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

  // Clear error when user starts typing
  const handleFieldChange = (field: string, value: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: "" });
    }

    switch (field) {
      case "name":
        setName(value);
        break;
      case "startDate":
        setStartDate(value);
        break;
      case "endDate":
        setEndDate(value);
        break;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <AppLayout>
      {/* Main Content */}
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

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {/* Success Message */}
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

            {/* Form */}
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
                    {/* Start Date */}
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

                    {/* End Date */}
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

                  {/* Duration Display */}
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

              {/* Weight Configuration */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm text-[#111827]">Weight Configuration</h2>
                    <p className="text-xs text-[#6B7280] mt-1">
                      Assign weights to evaluation criteria (must total 100%)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={autoDistributeWeights}
                    className="text-sm text-[#4F46E5] hover:text-indigo-700 px-3 py-1.5 border border-[#4F46E5]/20 rounded-lg hover:bg-[#EEF2FF] transition"
                  >
                    Auto-distribute
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  {weights.map((criteria) => (
                    <div
                      key={criteria.id}
                      className="border border-[#E5E7EB] rounded-lg p-4 hover:border-[#E5E7EB] transition"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-sm text-[#111827] mb-1">{criteria.name}</h3>
                          <p className="text-xs text-[#6B7280]">{criteria.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={criteria.weight}
                              onChange={(e) => handleWeightChange(criteria.id, e.target.value)}
                              className="w-20 px-3 py-2 pr-8 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition text-right"
                            />
                            <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Weight Bar */}
                      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] h-2 rounded-full transition-all"
                          style={{ width: `${criteria.weight}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Weight Display */}
                <div className={`p-4 rounded-lg border-2 ${
                  totalWeight === 100
                    ? "bg-[#DCFCE7] border-green-500"
                    : totalWeight < 100
                    ? "bg-[#FFFBEB] border-amber-500"
                    : "bg-[#FEF2F2] border-red-500"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {totalWeight === 100 ? (
                        <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
                      )}
                      <span className={`text-sm ${
                        totalWeight === 100 ? "text-[#22C55E]" : "text-[#F59E0B]"
                      }`}>
                        Total Weight
                      </span>
                    </div>
                    <span className={`text-2xl ${
                      totalWeight === 100
                        ? "text-[#22C55E]"
                        : totalWeight < 100
                        ? "text-[#F59E0B]"
                        : "text-[#EF4444]"
                    }`}>
                      {totalWeight}%
                    </span>
                  </div>
                  {totalWeight !== 100 && (
                    <p className={`text-xs mt-2 ${
                      totalWeight < 100 ? "text-amber-700" : "text-red-700"
                    }`}>
                      {totalWeight < 100
                        ? `${100 - totalWeight}% remaining to allocate`
                        : `Exceeds by ${totalWeight - 100}%`}
                    </p>
                  )}
                </div>

                {errors.weights && (
                  <div className="mt-3 flex items-center gap-1 text-[#EF4444]">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{errors.weights}</p>
                  </div>
                )}
              </div>

              {/* Form Actions */}
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
                    <Save className="w-5 h-5" />
                    <span>{isSubmitting ? "Saving..." : "Save Evaluation Period"}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg">
              <p className="text-sm text-[#06B6D4]">
                <strong>Tip:</strong> Weight configuration determines how much each criteria
                contributes to the final evaluation score. Make sure the total equals 100% before
                saving.
              </p>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}