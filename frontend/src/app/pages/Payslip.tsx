import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Download, Printer, Mail, Calendar, User, Building, MapPin, DollarSign, FileText, Hash, CheckCircle } from "lucide-react";
import { AppLayout } from "../components/AppLayout";

export function Payslip() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Payslip data
  const payslip = {
    id: "PAY-2026-03-001",
    employeeId: "EMP001",
    employeeName: "Sarah Johnson",
    position: "Senior Software Engineer",
    department: "Engineering",
    email: "sarah.johnson@company.com",
    joinDate: "2024-01-15",
    payPeriod: "March 16 - March 31, 2026",
    payDate: "April 5, 2026",
    paymentMethod: "Bank Transfer",
    bankAccount: "****1234",
    
    // Earnings
    earnings: {
      baseSalary: 8500,
      housingAllowance: 300,
      transportAllowance: 150,
      mealAllowance: 50,
      performanceBonus: 1000,
      overtimePay: 0,
    },
    
    // Deductions
    deductions: {
      incomeTax: 850,
      healthInsurance: 200,
      pension: 425,
      socialSecurity: 0,
      loanDeduction: 0,
      other: 0,
    },
    
    // Totals
    totalEarnings: 10000,
    totalDeductions: 1475,
    netPay: 8525,
    
    // Additional info
    workingDays: 15,
    leaveDays: 0,
    taxableIncome: 8500,
    taxRate: 10,
  };

  // Calculate earnings breakdown
  const earningsBreakdown = [
    { label: "Base Salary", amount: payslip.earnings.baseSalary },
    { label: "Housing Allowance", amount: payslip.earnings.housingAllowance },
    { label: "Transport Allowance", amount: payslip.earnings.transportAllowance },
    { label: "Meal Allowance", amount: payslip.earnings.mealAllowance },
    { label: "Performance Bonus", amount: payslip.earnings.performanceBonus },
    { label: "Overtime Pay", amount: payslip.earnings.overtimePay },
  ].filter(item => item.amount > 0);

  // Calculate deductions breakdown
  const deductionsBreakdown = [
    { label: "Income Tax", amount: payslip.deductions.incomeTax },
    { label: "Health Insurance", amount: payslip.deductions.healthInsurance },
    { label: "Pension Fund", amount: payslip.deductions.pension },
    { label: "Social Security", amount: payslip.deductions.socialSecurity },
    { label: "Loan Deduction", amount: payslip.deductions.loanDeduction },
    { label: "Other Deductions", amount: payslip.deductions.other },
  ].filter(item => item.amount > 0);

  // Handle download
  const handleDownload = () => {
    setIsDownloading(true);
    
    // Simulate download
    setTimeout(() => {
      setIsDownloading(false);
      console.log("Downloading payslip...");
    }, 1000);
  };

  // Handle print
  const handlePrint = () => {
    setIsPrinting(true);
    
    // Simulate print
    setTimeout(() => {
      setIsPrinting(false);
      window.print();
    }, 500);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/payroll")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">Payslip</h1>
                <p className="text-sm text-[#6B7280]">{payslip.payPeriod}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => console.log("Email payslip")}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Email</span>
              </button>
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition disabled:opacity-50"
              >
                {isPrinting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Printing...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 print:p-0">
          <div className="max-w-4xl mx-auto">
            {/* Payslip Document */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm print:shadow-none print:border-0">
              {/* Company Header */}
              <div className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] p-8 print:bg-gradient-to-r print:from-indigo-500 print:to-purple-600">
                <div className="flex items-start justify-between">
                  <div className="text-white">
                    <h2 className="text-2xl mb-2">Company Name</h2>
                    <p className="text-sm text-indigo-100">123 Business Street, Suite 100</p>
                    <p className="text-sm text-indigo-100">San Francisco, CA 94105</p>
                    <p className="text-sm text-indigo-100">contact@company.com | (555) 123-4567</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                      <span className="text-white">PAYSLIP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payslip Details */}
              <div className="p-8">
                {/* Employee Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-[#E5E7EB]">
                  <div>
                    <h3 className="text-sm text-[#6B7280] mb-4">Employee Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 text-[#6B7280] mt-0.5" />
                        <div>
                          <p className="text-xs text-[#6B7280]">Name</p>
                          <p className="text-sm text-[#111827]">{payslip.employeeName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Hash className="w-4 h-4 text-[#6B7280] mt-0.5" />
                        <div>
                          <p className="text-xs text-[#6B7280]">Employee ID</p>
                          <p className="text-sm text-[#111827]">{payslip.employeeId}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Building className="w-4 h-4 text-[#6B7280] mt-0.5" />
                        <div>
                          <p className="text-xs text-[#6B7280]">Department</p>
                          <p className="text-sm text-[#111827]">{payslip.department}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-[#6B7280] mt-0.5" />
                        <div>
                          <p className="text-xs text-[#6B7280]">Position</p>
                          <p className="text-sm text-[#111827]">{payslip.position}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm text-[#6B7280] mb-4">Payment Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-[#6B7280] mt-0.5" />
                        <div>
                          <p className="text-xs text-[#6B7280]">Pay Period</p>
                          <p className="text-sm text-[#111827]">{payslip.payPeriod}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-[#6B7280] mt-0.5" />
                        <div>
                          <p className="text-xs text-[#6B7280]">Payment Date</p>
                          <p className="text-sm text-[#111827]">{payslip.payDate}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-4 h-4 text-[#6B7280] mt-0.5" />
                        <div>
                          <p className="text-xs text-[#6B7280]">Payment Method</p>
                          <p className="text-sm text-[#111827]">{payslip.paymentMethod}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Hash className="w-4 h-4 text-[#6B7280] mt-0.5" />
                        <div>
                          <p className="text-xs text-[#6B7280]">Payslip ID</p>
                          <p className="text-sm text-[#111827]">{payslip.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-[#E5E7EB]">
                  <div className="bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg p-4">
                    <p className="text-xs text-blue-600 mb-1">Working Days</p>
                    <p className="text-2xl text-[#06B6D4]">{payslip.workingDays}</p>
                  </div>
                  <div className="bg-[#DCFCE7] border border-green-200 rounded-lg p-4">
                    <p className="text-xs text-[#22C55E] mb-1">Leave Days</p>
                    <p className="text-2xl text-[#22C55E]">{payslip.leaveDays}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-xs text-[#4F46E5] mb-1">Tax Rate</p>
                    <p className="text-2xl text-purple-900">{payslip.taxRate}%</p>
                  </div>
                </div>

                {/* Earnings & Deductions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Earnings */}
                  <div>
                    <h3 className="text-sm text-[#111827] mb-4 pb-2 border-b-2 border-green-500">Earnings</h3>
                    <div className="space-y-3">
                      {earningsBreakdown.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-[#111827]">{item.label}</span>
                          <span className="text-sm text-[#111827]">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-[#E5E7EB]">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#111827]">Total Earnings</span>
                          <span className="text-base text-[#22C55E]">{formatCurrency(payslip.totalEarnings)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h3 className="text-sm text-[#111827] mb-4 pb-2 border-b-2 border-red-500">Deductions</h3>
                    <div className="space-y-3">
                      {deductionsBreakdown.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-[#111827]">{item.label}</span>
                          <span className="text-sm text-[#111827]">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-[#E5E7EB]">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#111827]">Total Deductions</span>
                          <span className="text-base text-[#EF4444]">-{formatCurrency(payslip.totalDeductions)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Pay */}
                <div className="bg-gradient-to-r from-[#22C55E] to-[#22C55E] rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-sm text-green-100 mb-1">Net Pay (Take Home)</p>
                      <p className="text-4xl">{formatCurrency(payslip.netPay)}</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-400/30">
                    <div className="flex items-center justify-between text-sm text-green-100">
                      <span>Payment to account: {payslip.bankAccount}</span>
                      <span>Paid on {payslip.payDate}</span>
                    </div>
                  </div>
                </div>

                {/* Summary Table */}
                <div className="border border-[#E5E7EB] rounded-lg overflow-hidden mb-8">
                  <table className="w-full">
                    <thead className="bg-[#F9FAFB]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-[#6B7280]">Description</th>
                        <th className="px-4 py-3 text-right text-xs text-[#6B7280]">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm text-[#111827]">Gross Earnings</td>
                        <td className="px-4 py-3 text-sm text-[#111827] text-right">{formatCurrency(payslip.totalEarnings)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-[#111827]">Total Deductions</td>
                        <td className="px-4 py-3 text-sm text-[#EF4444] text-right">-{formatCurrency(payslip.totalDeductions)}</td>
                      </tr>
                      <tr className="bg-[#DCFCE7]">
                        <td className="px-4 py-3 text-base text-[#111827]">Net Pay</td>
                        <td className="px-4 py-3 text-lg text-[#22C55E] text-right">{formatCurrency(payslip.netPay)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Tax Information */}
                <div className="bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg p-6 mb-8">
                  <h3 className="text-sm text-[#06B6D4] mb-4">Tax Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Taxable Income</p>
                      <p className="text-base text-[#06B6D4]">{formatCurrency(payslip.taxableIncome)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Tax Withheld</p>
                      <p className="text-base text-[#06B6D4]">{formatCurrency(payslip.deductions.incomeTax)}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="border-t border-[#E5E7EB] pt-6">
                  <p className="text-xs text-[#6B7280] mb-2">
                    This is a computer-generated payslip and does not require a signature.
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    For any queries regarding your salary, please contact the HR department at hr@company.com or call (555) 123-4567.
                  </p>
                </div>
              </div>

              {/* Print Footer */}
              <div className="hidden print:block p-8 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                <div className="flex items-center justify-between text-xs text-[#6B7280]">
                  <span>Generated on {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  <span>Payslip ID: {payslip.id}</span>
                  <span>Page 1 of 1</span>
                </div>
              </div>
            </div>

            {/* Action Buttons (Bottom) */}
            <div className="mt-6 print:hidden">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate("/payroll")}
                    className="flex-1 px-6 py-3 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
                  >
                    Back to Payroll
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-3 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}