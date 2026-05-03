import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Download, Send, Edit, Eye, Users, DollarSign, Calendar, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { AppLayout } from "../components/AppLayout";

interface Employee {
  id: number;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  baseSalary: number;
  allowances: {
    housing: number;
    transport: number;
    meal: number;
  };
  bonuses: number;
  deductions: {
    tax: number;
    insurance: number;
    pension: number;
    other: number;
  };
  grossPay: number;
  totalDeductions: number;
  netPay: number;
}

export function PayrollReview() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  // Payroll period data
  const payrollPeriod = {
    id: 1,
    name: "March 2026 - Period 2",
    startDate: "2026-03-16",
    endDate: "2026-03-31",
    payDate: "2026-04-05",
    status: "processing",
  };

  // Employee payroll data
  const [employees] = useState<Employee[]>([
    {
      id: 1,
      employeeId: "EMP001",
      name: "Sarah Johnson",
      department: "Engineering",
      position: "Senior Software Engineer",
      baseSalary: 8500,
      allowances: {
        housing: 300,
        transport: 150,
        meal: 50,
      },
      bonuses: 1000,
      deductions: {
        tax: 850,
        insurance: 200,
        pension: 425,
        other: 0,
      },
      grossPay: 10000,
      totalDeductions: 1475,
      netPay: 8525,
    },
    {
      id: 2,
      employeeId: "EMP002",
      name: "Michael Chen",
      department: "Engineering",
      position: "Frontend Developer",
      baseSalary: 7000,
      allowances: {
        housing: 250,
        transport: 100,
        meal: 50,
      },
      bonuses: 500,
      deductions: {
        tax: 700,
        insurance: 200,
        pension: 350,
        other: 0,
      },
      grossPay: 7900,
      totalDeductions: 1250,
      netPay: 6650,
    },
    {
      id: 3,
      employeeId: "EMP003",
      name: "Emily Davis",
      department: "Marketing",
      position: "Marketing Manager",
      baseSalary: 7500,
      allowances: {
        housing: 280,
        transport: 120,
        meal: 50,
      },
      bonuses: 800,
      deductions: {
        tax: 750,
        insurance: 200,
        pension: 375,
        other: 0,
      },
      grossPay: 8750,
      totalDeductions: 1325,
      netPay: 7425,
    },
    {
      id: 4,
      employeeId: "EMP004",
      name: "David Wilson",
      department: "Sales",
      position: "Sales Director",
      baseSalary: 9000,
      allowances: {
        housing: 350,
        transport: 200,
        meal: 50,
      },
      bonuses: 1500,
      deductions: {
        tax: 950,
        insurance: 200,
        pension: 450,
        other: 100,
      },
      grossPay: 11100,
      totalDeductions: 1700,
      netPay: 9400,
    },
    {
      id: 5,
      employeeId: "EMP005",
      name: "Jessica Martinez",
      department: "HR",
      position: "HR Manager",
      baseSalary: 7200,
      allowances: {
        housing: 270,
        transport: 100,
        meal: 50,
      },
      bonuses: 600,
      deductions: {
        tax: 720,
        insurance: 200,
        pension: 360,
        other: 0,
      },
      grossPay: 8220,
      totalDeductions: 1280,
      netPay: 6940,
    },
    {
      id: 6,
      employeeId: "EMP006",
      name: "Robert Taylor",
      department: "Finance",
      position: "Financial Analyst",
      baseSalary: 7800,
      allowances: {
        housing: 290,
        transport: 130,
        meal: 50,
      },
      bonuses: 700,
      deductions: {
        tax: 780,
        insurance: 200,
        pension: 390,
        other: 0,
      },
      grossPay: 9070,
      totalDeductions: 1370,
      netPay: 7700,
    },
  ]);

  // Calculate totals
  const totalEmployees = employees.length;
  const totalBaseSalary = employees.reduce((sum, e) => sum + e.baseSalary, 0);
  const totalAllowances = employees.reduce((sum, e) => 
    sum + e.allowances.housing + e.allowances.transport + e.allowances.meal, 0
  );
  const totalBonuses = employees.reduce((sum, e) => sum + e.bonuses, 0);
  const totalGrossPay = employees.reduce((sum, e) => sum + e.grossPay, 0);
  const totalDeductions = employees.reduce((sum, e) => sum + e.totalDeductions, 0);
  const totalNetPay = employees.reduce((sum, e) => sum + e.netPay, 0);

  // Deduction breakdown
  const deductionBreakdown = {
    tax: employees.reduce((sum, e) => sum + e.deductions.tax, 0),
    insurance: employees.reduce((sum, e) => sum + e.deductions.insurance, 0),
    pension: employees.reduce((sum, e) => sum + e.deductions.pension, 0),
    other: employees.reduce((sum, e) => sum + e.deductions.other, 0),
  };

  // Toggle row expansion
  const toggleRow = (id: number) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // Handle approve
  const handleApprove = () => {
    setIsApproving(true);
    
    // Simulate approval process
    setTimeout(() => {
      setIsApproving(false);
      setIsApproved(true);
    }, 2000);
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
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Success state
  if (isApproved) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-[#E5E7EB]">
          <div className="px-6 py-5 border-b border-[#E5E7EB]">
            <h2 className="text-sm text-[#111827]">HR System</h2>
          </div>
          <nav className="px-4 py-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition mb-1"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/payroll")}
              className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#EEF2FF] text-[#4F46E5] rounded-lg transition mb-1"
            >
              Payroll
            </button>
          </nav>
        </aside>

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
                <h1 className="text-xl text-[#111827]">Payroll Approved</h1>
                <p className="text-sm text-[#6B7280]">The payroll has been approved successfully</p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="max-w-2xl w-full">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#22C55E] to-[#22C55E] rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-2xl text-[#111827] mb-3">Payroll Approved Successfully!</h2>
                <p className="text-sm text-[#6B7280] mb-8">
                  {payrollPeriod.name} has been approved and is ready for payment processing.
                </p>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-[#F9FAFB] rounded-xl">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Employees</p>
                    <p className="text-xl text-[#111827]">{totalEmployees}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Payment Date</p>
                    <p className="text-xl text-[#111827]">{formatDate(payrollPeriod.payDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Total Amount</p>
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
                    onClick={() => console.log("Process payment")}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-3 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
                  >
                    <Send className="w-5 h-5" />
                    Process Payment
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-[#E5E7EB]">
        <div className="px-6 py-5 border-b border-[#E5E7EB]">
          <h2 className="text-sm text-[#111827]">HR System</h2>
        </div>
        <nav className="px-4 py-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition mb-1"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/employees")}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition mb-1"
          >
            Employees
          </button>
          <button
            onClick={() => navigate("/payroll")}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#EEF2FF] text-[#4F46E5] rounded-lg transition mb-1"
          >
            Payroll
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/payroll")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">Review Payroll</h1>
                <p className="text-sm text-[#6B7280]">{payrollPeriod.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => console.log("Export")}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="flex items-center gap-2 bg-gradient-to-r from-[#22C55E] to-[#22C55E] text-white px-4 py-2.5 rounded-lg hover:from-[#22C55E] hover:to-[#22C55E] transition shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isApproving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Approve Payroll</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Period Information */}
            <div className="bg-white rounded-xl border border-[#4F46E5]/20 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-[#4F46E5]" />
                  </div>
                  <div>
                    <h3 className="text-base text-[#111827] mb-1">{payrollPeriod.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
                      <span>Period: {formatDate(payrollPeriod.startDate)} - {formatDate(payrollPeriod.endDate)}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      <span>Payment Date: {formatDate(payrollPeriod.payDate)}</span>
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-blue-100 text-blue-700 border border-[#06B6D4]/20">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Pending Review
                </span>
              </div>
            </div>

            {/* Total Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Employees */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#6B7280]">Employees</span>
                  <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#4F46E5]" />
                  </div>
                </div>
                <div className="text-3xl text-[#111827]">{totalEmployees}</div>
              </div>

              {/* Gross Pay */}
              <div className="bg-white rounded-xl border border-[#06B6D4]/20 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-blue-600">Gross Pay</span>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl text-[#06B6D4]">{formatCurrency(totalGrossPay)}</div>
              </div>

              {/* Total Deductions */}
              <div className="bg-white rounded-xl border border-[#EF4444]/20 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#EF4444]">Deductions</span>
                  <div className="w-10 h-10 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-[#EF4444]" />
                  </div>
                </div>
                <div className="text-3xl text-[#EF4444]">-{formatCurrency(totalDeductions)}</div>
              </div>

              {/* Net Pay */}
              <div className="bg-white rounded-xl border border-green-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#22C55E]">Net Pay</span>
                  <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                  </div>
                </div>
                <div className="text-3xl text-[#22C55E]">{formatCurrency(totalNetPay)}</div>
              </div>
            </div>

            {/* Deduction Breakdown */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-base text-[#111827] mb-4">Deduction Breakdown</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#FEF2F2] border border-[#EF4444]/20 rounded-lg p-4">
                  <p className="text-xs text-[#EF4444] mb-1">Income Tax</p>
                  <p className="text-xl text-[#EF4444]">{formatCurrency(deductionBreakdown.tax)}</p>
                  <p className="text-xs text-[#EF4444] mt-1">
                    {((deductionBreakdown.tax / totalDeductions) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <div className="bg-[#FEF2F2] border border-[#EF4444]/20 rounded-lg p-4">
                  <p className="text-xs text-[#EF4444] mb-1">Health Insurance</p>
                  <p className="text-xl text-[#EF4444]">{formatCurrency(deductionBreakdown.insurance)}</p>
                  <p className="text-xs text-[#EF4444] mt-1">
                    {((deductionBreakdown.insurance / totalDeductions) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <div className="bg-[#FEF2F2] border border-[#EF4444]/20 rounded-lg p-4">
                  <p className="text-xs text-[#EF4444] mb-1">Pension</p>
                  <p className="text-xl text-[#EF4444]">{formatCurrency(deductionBreakdown.pension)}</p>
                  <p className="text-xs text-[#EF4444] mt-1">
                    {((deductionBreakdown.pension / totalDeductions) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <div className="bg-[#FEF2F2] border border-[#EF4444]/20 rounded-lg p-4">
                  <p className="text-xs text-[#EF4444] mb-1">Other Deductions</p>
                  <p className="text-xl text-[#EF4444]">{formatCurrency(deductionBreakdown.other)}</p>
                  <p className="text-xs text-[#EF4444] mt-1">
                    {totalDeductions > 0 ? ((deductionBreakdown.other / totalDeductions) * 100).toFixed(1) : 0}% of total
                  </p>
                </div>
              </div>
            </div>

            {/* Salary Components Summary */}
            <div className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] rounded-xl p-6 text-white">
              <h2 className="text-base mb-4">Salary Components</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-indigo-100 mb-1">Base Salary</p>
                  <p className="text-2xl">{formatCurrency(totalBaseSalary)}</p>
                </div>
                <div>
                  <p className="text-sm text-indigo-100 mb-1">Allowances</p>
                  <p className="text-2xl">+{formatCurrency(totalAllowances)}</p>
                </div>
                <div>
                  <p className="text-sm text-indigo-100 mb-1">Bonuses</p>
                  <p className="text-2xl">+{formatCurrency(totalBonuses)}</p>
                </div>
                <div>
                  <p className="text-sm text-indigo-100 mb-1">Gross Pay</p>
                  <p className="text-2xl">{formatCurrency(totalGrossPay)}</p>
                </div>
              </div>
            </div>

            {/* Employee Salary Table */}
            <div className="bg-white rounded-xl border border-[#E5E7EB]">
              <div className="px-6 py-4 border-b border-[#E5E7EB]">
                <h2 className="text-base text-[#111827]">Employee Salary Details</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-[#6B7280]">Employee</th>
                      <th className="px-4 py-3 text-left text-xs text-[#6B7280]">Department</th>
                      <th className="px-4 py-3 text-right text-xs text-[#6B7280]">Base Salary</th>
                      <th className="px-4 py-3 text-right text-xs text-[#6B7280]">Allowances</th>
                      <th className="px-4 py-3 text-right text-xs text-[#6B7280]">Bonuses</th>
                      <th className="px-4 py-3 text-right text-xs text-[#6B7280]">Gross Pay</th>
                      <th className="px-4 py-3 text-right text-xs text-[#6B7280]">Deductions</th>
                      <th className="px-4 py-3 text-right text-xs text-[#6B7280]">Net Pay</th>
                      <th className="px-4 py-3 text-center text-xs text-[#6B7280]">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <>
                        <tr key={employee.id} className="hover:bg-[#F9FAFB]">
                          <td className="px-4 py-4">
                            <div className="text-sm text-[#111827]">{employee.name}</div>
                            <div className="text-xs text-[#6B7280]">{employee.employeeId}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-[#111827]">{employee.department}</div>
                            <div className="text-xs text-[#6B7280]">{employee.position}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-[#111827] text-right">
                            {formatCurrency(employee.baseSalary)}
                          </td>
                          <td className="px-4 py-4 text-sm text-[#22C55E] text-right">
                            +{formatCurrency(employee.allowances.housing + employee.allowances.transport + employee.allowances.meal)}
                          </td>
                          <td className="px-4 py-4 text-sm text-[#22C55E] text-right">
                            +{formatCurrency(employee.bonuses)}
                          </td>
                          <td className="px-4 py-4 text-sm text-[#111827] text-right">
                            {formatCurrency(employee.grossPay)}
                          </td>
                          <td className="px-4 py-4 text-sm text-[#EF4444] text-right">
                            -{formatCurrency(employee.totalDeductions)}
                          </td>
                          <td className="px-4 py-4 text-base text-[#111827] text-right">
                            {formatCurrency(employee.netPay)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => toggleRow(employee.id)}
                              className="p-2 text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition"
                            >
                              {expandedRows.includes(employee.id) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded Row Details */}
                        {expandedRows.includes(employee.id) && (
                          <tr>
                            <td colSpan={9} className="px-4 py-4 bg-[#F9FAFB]">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Allowances Breakdown */}
                                <div>
                                  <h4 className="text-xs text-[#6B7280] mb-3">Allowances Breakdown</h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-[#111827]">Housing Allowance</span>
                                      <span className="text-[#22C55E]">+{formatCurrency(employee.allowances.housing)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-[#111827]">Transport Allowance</span>
                                      <span className="text-[#22C55E]">+{formatCurrency(employee.allowances.transport)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-[#111827]">Meal Allowance</span>
                                      <span className="text-[#22C55E]">+{formatCurrency(employee.allowances.meal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm pt-2 border-t border-[#E5E7EB]">
                                      <span className="text-[#111827]">Total Allowances</span>
                                      <span className="text-[#22C55E]">
                                        +{formatCurrency(employee.allowances.housing + employee.allowances.transport + employee.allowances.meal)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Deductions Breakdown */}
                                <div>
                                  <h4 className="text-xs text-[#6B7280] mb-3">Deductions Breakdown</h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-[#111827]">Income Tax</span>
                                      <span className="text-[#EF4444]">-{formatCurrency(employee.deductions.tax)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-[#111827]">Health Insurance</span>
                                      <span className="text-[#EF4444]">-{formatCurrency(employee.deductions.insurance)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-[#111827]">Pension</span>
                                      <span className="text-[#EF4444]">-{formatCurrency(employee.deductions.pension)}</span>
                                    </div>
                                    {employee.deductions.other > 0 && (
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-[#111827]">Other Deductions</span>
                                        <span className="text-[#EF4444]">-{formatCurrency(employee.deductions.other)}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between text-sm pt-2 border-t border-[#E5E7EB]">
                                      <span className="text-[#111827]">Total Deductions</span>
                                      <span className="text-[#EF4444]">-{formatCurrency(employee.totalDeductions)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#F9FAFB] border-t-2 border-[#E5E7EB]">
                    <tr>
                      <td colSpan={2} className="px-4 py-4 text-sm text-[#111827]">
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Total ({totalEmployees} employees)
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#111827] text-right">
                        {formatCurrency(totalBaseSalary)}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#22C55E] text-right">
                        +{formatCurrency(totalAllowances)}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#22C55E] text-right">
                        +{formatCurrency(totalBonuses)}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#111827] text-right">
                        {formatCurrency(totalGrossPay)}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#EF4444] text-right">
                        -{formatCurrency(totalDeductions)}
                      </td>
                      <td className="px-4 py-4 text-base text-[#111827] text-right">
                        {formatCurrency(totalNetPay)}
                      </td>
                      <td className="px-4 py-4"></td>
                    </tr>
                  </tfoot>
                </table>
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
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#22C55E] to-[#22C55E] text-white px-6 py-3 rounded-lg hover:from-[#22C55E] hover:to-[#22C55E] transition shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {isApproving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Approving Payroll...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Approve Payroll
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}