import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Calendar, Users, DollarSign, CheckCircle, AlertCircle, RefreshCw, FileText, Clock, Info } from "lucide-react";
import { AppLayout } from "../components/AppLayout";

interface Employee {
  id: number;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: "active" | "on_leave";
}

export function PayrollGeneration() {
  const navigate = useNavigate();
  
  // Form state
  const [periodType, setPeriodType] = useState<"biweekly" | "monthly">("biweekly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [payDate, setPayDate] = useState("");
  const [includeBonuses, setIncludeBonuses] = useState(true);
  const [includeAllowances, setIncludeAllowances] = useState(true);
  const [autoDeductions, setAutoDeductions] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Employee data
  const [employees] = useState<Employee[]>([
    {
      id: 1,
      name: "Sarah Johnson",
      employeeId: "EMP001",
      department: "Engineering",
      position: "Senior Software Engineer",
      baseSalary: 8500,
      allowances: 500,
      deductions: 900,
      netPay: 8100,
      status: "active",
    },
    {
      id: 2,
      name: "Michael Chen",
      employeeId: "EMP002",
      department: "Engineering",
      position: "Frontend Developer",
      baseSalary: 7000,
      allowances: 400,
      deductions: 740,
      netPay: 6660,
      status: "active",
    },
    {
      id: 3,
      name: "Emily Davis",
      employeeId: "EMP003",
      department: "Marketing",
      position: "Marketing Manager",
      baseSalary: 7500,
      allowances: 450,
      deductions: 795,
      netPay: 7155,
      status: "active",
    },
    {
      id: 4,
      name: "David Wilson",
      employeeId: "EMP004",
      department: "Sales",
      position: "Sales Director",
      baseSalary: 9000,
      allowances: 600,
      deductions: 960,
      netPay: 8640,
      status: "active",
    },
    {
      id: 5,
      name: "Jessica Martinez",
      employeeId: "EMP005",
      department: "HR",
      position: "HR Manager",
      baseSalary: 7200,
      allowances: 420,
      deductions: 762,
      netPay: 6858,
      status: "on_leave",
    },
  ]);

  // Calculate totals
  const activeEmployees = employees.filter(e => e.status === "active");
  const totalGrossPay = activeEmployees.reduce((sum, e) => sum + e.baseSalary + e.allowances, 0);
  const totalDeductions = activeEmployees.reduce((sum, e) => sum + e.deductions, 0);
  const totalNetPay = totalGrossPay - totalDeductions;

  // Handle period type change
  const handlePeriodTypeChange = (type: "biweekly" | "monthly") => {
    setPeriodType(type);
    // Clear dates when changing period type
    setStartDate("");
    setEndDate("");
    setPayDate("");
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!endDate) {
      newErrors.endDate = "End date is required";
    }

    if (!payDate) {
      newErrors.payDate = "Pay date is required";
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    if (endDate && payDate && new Date(payDate) <= new Date(endDate)) {
      newErrors.payDate = "Pay date must be after end date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle generate
  const handleGenerate = () => {
    if (validateForm()) {
      setIsGenerating(true);
      
      // Simulate generation process
      setTimeout(() => {
        setIsGenerating(false);
        setIsGenerated(true);
      }, 2000);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Success state
  if (isGenerated) {
    return (
      <AppLayout>
        {/* Success Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/payroll")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">Payroll Generated Successfully</h1>
                <p className="text-sm text-[#6B7280]">Your payroll has been created</p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="max-w-2xl w-full">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#22C55E] to-[#22C55E] rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-2xl text-[#111827] mb-3">Payroll Generated Successfully!</h2>
                <p className="text-sm text-[#6B7280] mb-8">
                  Payroll for {formatDate(startDate)} to {formatDate(endDate)} has been generated.
                </p>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-[#F9FAFB] rounded-xl">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Employees</p>
                    <p className="text-xl text-[#111827]">{activeEmployees.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Gross Pay</p>
                    <p className="text-xl text-[#111827]">{formatCurrency(totalGrossPay)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Net Pay</p>
                    <p className="text-xl text-[#22C55E]">{formatCurrency(totalNetPay)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate("/payroll")}
                    className="flex-1 px-6 py-3 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
                  >
                    Back to Payroll
                  </button>
                  <button
                    onClick={() => console.log("View details")}
                    className="flex-1 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-3 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/payroll")}
              className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl text-[#111827]">Generate Payroll</h1>
              <p className="text-sm text-[#6B7280]">Create a new payroll period</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Period Configuration */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#4F46E5]" />
                </div>
                <div>
                  <h2 className="text-base text-[#111827]">Period Configuration</h2>
                  <p className="text-sm text-[#6B7280]">Define the payroll period details</p>
                </div>
              </div>

              {/* Period Type */}
              <div className="mb-6">
                <label className="block text-sm text-[#111827] mb-3">
                  Period Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handlePeriodTypeChange("biweekly")}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition ${
                      periodType === "biweekly"
                        ? "border-[#4F46E5] bg-[#EEF2FF] text-indigo-700"
                        : "border-[#E5E7EB] bg-white text-[#111827] hover:border-[#E5E7EB]"
                    }`}
                  >
                    <div className="text-sm mb-1">Bi-weekly</div>
                    <div className="text-xs text-[#6B7280]">Every 2 weeks</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePeriodTypeChange("monthly")}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition ${
                      periodType === "monthly"
                        ? "border-[#4F46E5] bg-[#EEF2FF] text-indigo-700"
                        : "border-[#E5E7EB] bg-white text-[#111827] hover:border-[#E5E7EB]"
                    }`}
                  >
                    <div className="text-sm mb-1">Monthly</div>
                    <div className="text-xs text-[#6B7280]">Once per month</div>
                  </button>
                </div>
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-sm text-[#111827] mb-2">
                    Period Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (errors.startDate) setErrors({ ...errors, startDate: "" });
                    }}
                    className={`w-full px-4 py-3 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition ${
                      errors.startDate ? "border-[#EF4444]/30 bg-[#FEF2F2]" : "border-[#E5E7EB]"
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.startDate}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm text-[#111827] mb-2">
                    Period End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (errors.endDate) setErrors({ ...errors, endDate: "" });
                    }}
                    className={`w-full px-4 py-3 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition ${
                      errors.endDate ? "border-[#EF4444]/30 bg-[#FEF2F2]" : "border-[#E5E7EB]"
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.endDate}
                    </p>
                  )}
                </div>

                {/* Pay Date */}
                <div>
                  <label className="block text-sm text-[#111827] mb-2">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => {
                      setPayDate(e.target.value);
                      if (errors.payDate) setErrors({ ...errors, payDate: "" });
                    }}
                    className={`w-full px-4 py-3 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition ${
                      errors.payDate ? "border-[#EF4444]/30 bg-[#FEF2F2]" : "border-[#E5E7EB]"
                    }`}
                  />
                  {errors.payDate && (
                    <p className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.payDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payroll Options */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#4F46E5]" />
                </div>
                <div>
                  <h2 className="text-base text-[#111827]">Payroll Options</h2>
                  <p className="text-sm text-[#6B7280]">Configure what to include in this payroll</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Include Bonuses */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={includeBonuses}
                    onChange={(e) => setIncludeBonuses(e.target.checked)}
                    className="mt-1 w-5 h-5 text-[#4F46E5] border-[#E5E7EB] rounded focus:ring-2 focus:ring-[#4F46E5]"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-[#111827] mb-1">Include Bonuses</div>
                    <p className="text-xs text-[#6B7280]">Add performance bonuses and incentives to this payroll period</p>
                  </div>
                </label>

                {/* Include Allowances */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={includeAllowances}
                    onChange={(e) => setIncludeAllowances(e.target.checked)}
                    className="mt-1 w-5 h-5 text-[#4F46E5] border-[#E5E7EB] rounded focus:ring-2 focus:ring-[#4F46E5]"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-[#111827] mb-1">Include Allowances</div>
                    <p className="text-xs text-[#6B7280]">Include housing, transport, and other allowances</p>
                  </div>
                </label>

                {/* Auto Deductions */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={autoDeductions}
                    onChange={(e) => setAutoDeductions(e.target.checked)}
                    className="mt-1 w-5 h-5 text-[#4F46E5] border-[#E5E7EB] rounded focus:ring-2 focus:ring-[#4F46E5]"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-[#111827] mb-1">Automatic Deductions</div>
                    <p className="text-xs text-[#6B7280]">Automatically calculate tax, insurance, and other deductions</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Employee Summary */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <div>
                    <h2 className="text-base text-[#111827]">Employee Summary</h2>
                    <p className="text-sm text-[#6B7280]">{activeEmployees.length} active employees in this payroll</p>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg p-4">
                  <p className="text-xs text-[#4F46E5] mb-1">Total Gross Pay</p>
                  <p className="text-2xl text-[#111827]">{formatCurrency(totalGrossPay)}</p>
                </div>
                <div className="bg-[#FEF2F2] border border-[#EF4444]/20 rounded-lg p-4">
                  <p className="text-xs text-[#EF4444] mb-1">Total Deductions</p>
                  <p className="text-2xl text-[#EF4444]">-{formatCurrency(totalDeductions)}</p>
                </div>
                <div className="bg-[#DCFCE7] border border-green-200 rounded-lg p-4">
                  <p className="text-xs text-[#22C55E] mb-1">Total Net Pay</p>
                  <p className="text-2xl text-[#22C55E]">{formatCurrency(totalNetPay)}</p>
                </div>
              </div>

              {/* Employee Table */}
              <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-[#6B7280]">Employee</th>
                        <th className="px-4 py-3 text-left text-xs text-[#6B7280]">Department</th>
                        <th className="px-4 py-3 text-right text-xs text-[#6B7280]">Base Salary</th>
                        <th className="px-4 py-3 text-right text-xs text-[#6B7280]">Allowances</th>
                        <th className="px-4 py-3 text-right text-xs text-[#6B7280]">Deductions</th>
                        <th className="px-4 py-3 text-right text-xs text-[#6B7280]">Net Pay</th>
                        <th className="px-4 py-3 text-center text-xs text-[#6B7280]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {employees.map((employee) => (
                        <tr key={employee.id} className={employee.status === "on_leave" ? "bg-[#F9FAFB]" : "bg-white hover:bg-[#F9FAFB]"}>
                          <td className="px-4 py-3">
                            <div className="text-sm text-[#111827]">{employee.name}</div>
                            <div className="text-xs text-[#6B7280]">{employee.employeeId}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#111827]">{employee.department}</td>
                          <td className="px-4 py-3 text-sm text-[#111827] text-right">{formatCurrency(employee.baseSalary)}</td>
                          <td className="px-4 py-3 text-sm text-[#22C55E] text-right">+{formatCurrency(employee.allowances)}</td>
                          <td className="px-4 py-3 text-sm text-[#EF4444] text-right">-{formatCurrency(employee.deductions)}</td>
                          <td className="px-4 py-3 text-sm text-[#111827] text-right">{formatCurrency(employee.netPay)}</td>
                          <td className="px-4 py-3 text-center">
                            {employee.status === "active" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-[#DCFCE7] text-[#22C55E] border border-green-200">
                                <CheckCircle className="w-3 h-3" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-[#F9FAFB] text-[#111827] border border-[#E5E7EB]">
                                <Clock className="w-3 h-3" />
                                On Leave
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-4 flex items-start gap-2 p-4 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Employees on leave will be excluded from this payroll period. Review the list carefully before generating.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/payroll")}
                  className="flex-1 px-6 py-3 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-3 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generating Payroll...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Generate Payroll
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}