import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, Download, FileText, AlertCircle, CheckCircle, X, Info } from "lucide-react";
import { AppLayout } from "../components/AppLayout";

interface PayrollRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  department: string;
  baseSalary: number;
  allowances: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  status: "valid" | "warning" | "error";
  validationMessages: string[];
}

export function PayrollImport() {
  const navigate = useNavigate();
  
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [isImported, setIsImported] = useState(false);
  
  // Sample validation results
  const [validationResults] = useState<PayrollRecord[]>([
    {
      id: 1,
      employeeId: "EMP001",
      employeeName: "Sarah Johnson",
      department: "Engineering",
      baseSalary: 8500,
      allowances: 500,
      bonuses: 1000,
      deductions: 900,
      netPay: 9100,
      status: "valid",
      validationMessages: [],
    },
    {
      id: 2,
      employeeId: "EMP002",
      employeeName: "Michael Chen",
      department: "Engineering",
      baseSalary: 7000,
      allowances: 400,
      bonuses: 0,
      deductions: 740,
      netPay: 6660,
      status: "valid",
      validationMessages: [],
    },
    {
      id: 3,
      employeeId: "EMP003",
      employeeName: "Emily Davis",
      department: "Marketing",
      baseSalary: 7500,
      allowances: 450,
      bonuses: 500,
      deductions: 795,
      netPay: 7655,
      status: "warning",
      validationMessages: ["Bonus amount is higher than average"],
    },
    {
      id: 4,
      employeeId: "EMP999",
      employeeName: "Unknown Employee",
      department: "Sales",
      baseSalary: 0,
      allowances: 0,
      bonuses: 0,
      deductions: 0,
      netPay: 0,
      status: "error",
      validationMessages: ["Employee ID not found in system", "Invalid salary amount"],
    },
    {
      id: 5,
      employeeId: "EMP005",
      employeeName: "Jessica Martinez",
      department: "HR",
      baseSalary: 7200,
      allowances: 420,
      bonuses: 0,
      deductions: -100,
      netPay: 7520,
      status: "error",
      validationMessages: ["Deductions cannot be negative"],
    },
    {
      id: 6,
      employeeId: "EMP006",
      employeeName: "David Wilson",
      department: "Sales",
      baseSalary: 9000,
      allowances: 600,
      bonuses: 1500,
      deductions: 960,
      netPay: 10140,
      status: "warning",
      validationMessages: ["Net pay calculation differs from expected"],
    },
    {
      id: 7,
      employeeId: "EMP007",
      employeeName: "Lisa Anderson",
      department: "Finance",
      baseSalary: 8200,
      allowances: 480,
      bonuses: 800,
      deductions: 870,
      netPay: 8610,
      status: "valid",
      validationMessages: [],
    },
  ]);

  // Calculate validation stats
  const validRecords = validationResults.filter(r => r.status === "valid").length;
  const warningRecords = validationResults.filter(r => r.status === "warning").length;
  const errorRecords = validationResults.filter(r => r.status === "error").length;
  const totalRecords = validationResults.length;
  const totalAmount = validationResults
    .filter(r => r.status !== "error")
    .reduce((sum, r) => sum + r.netPay, 0);

  // Handle file upload
  const handleFileUpload = (uploadedFile: File) => {
    // Validate file type
    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv"
    ];
    
    if (!allowedTypes.includes(uploadedFile.type) && 
        !uploadedFile.name.endsWith('.xlsx') && 
        !uploadedFile.name.endsWith('.xls') && 
        !uploadedFile.name.endsWith('.csv')) {
      alert("Please upload an Excel (.xlsx, .xls) or CSV file");
      return;
    }

    // Validate file size (max 10MB)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setFile(uploadedFile);
    setIsValidated(false);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileUpload(droppedFile);
    }
  };

  // Handle validate
  const handleValidate = () => {
    setIsProcessing(true);
    
    // Simulate validation process
    setTimeout(() => {
      setIsProcessing(false);
      setIsValidated(true);
    }, 1500);
  };

  // Handle import
  const handleImport = () => {
    setIsProcessing(true);
    
    // Simulate import process
    setTimeout(() => {
      setIsProcessing(false);
      setIsImported(true);
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

  // Get status badge
  const getStatusBadge = (status: PayrollRecord["status"]) => {
    const styles = {
      valid: "bg-[#DCFCE7] text-[#22C55E] border-green-200",
      warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
      error: "bg-[#FEF2F2] text-red-700 border-[#EF4444]/20",
    };

    const icons = {
      valid: <CheckCircle className="w-3.5 h-3.5" />,
      warning: <AlertCircle className="w-3.5 h-3.5" />,
      error: <XCircle className="w-3.5 h-3.5" />,
    };

    const labels = {
      valid: "Valid",
      warning: "Warning",
      error: "Error",
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${styles[status]}`}>
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  // Success state
  if (isImported) {
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
                <h1 className="text-xl text-[#111827]">Import Successful</h1>
                <p className="text-sm text-[#6B7280]">Payroll data has been imported</p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="max-w-2xl w-full">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#22C55E] to-[#22C55E] rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-2xl text-[#111827] mb-3">Payroll Data Imported Successfully!</h2>
                <p className="text-sm text-[#6B7280] mb-8">
                  {validRecords + warningRecords} records have been imported into the system.
                </p>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-[#F9FAFB] rounded-xl">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Records Imported</p>
                    <p className="text-xl text-[#111827]">{validRecords + warningRecords}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Employees</p>
                    <p className="text-xl text-[#111827]">{validRecords + warningRecords}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Total Amount</p>
                    <p className="text-xl text-[#22C55E]">{formatCurrency(totalAmount)}</p>
                  </div>
                </div>

                {errorRecords > 0 && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      {errorRecords} record{errorRecords !== 1 ? "s" : ""} with errors were skipped during import.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate("/payroll")}
                    className="flex-1 px-6 py-3 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
                  >
                    Back to Payroll
                  </button>
                  <button
                    onClick={() => {
                      setIsImported(false);
                      setIsValidated(false);
                      setFile(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-3 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
                  >
                    Import Another File
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/payroll")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">Import Payroll Data</h1>
                <p className="text-sm text-[#6B7280]">Upload and validate payroll information from Excel</p>
              </div>
            </div>
            <button
              onClick={() => console.log("Download template")}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download Template</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Upload Section */}
            {!isValidated && (
              <>
                {/* Instructions */}
                <div className="bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm text-[#06B6D4] mb-2">Before You Import</h3>
                      <ul className="space-y-1 text-sm text-blue-800">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>Download the Excel template to ensure your data is formatted correctly</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>Include employee ID, base salary, allowances, bonuses, and deductions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>Make sure all employee IDs exist in the system</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>File size should not exceed 10MB</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Upload Area */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <h2 className="text-base text-[#111827] mb-4">Upload File</h2>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
                      isDragging
                        ? "border-[#4F46E5] bg-[#EEF2FF]"
                        : file
                        ? "border-green-300 bg-[#DCFCE7]"
                        : "border-[#E5E7EB] bg-[#F9FAFB]"
                    }`}
                  >
                    {file ? (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-[#DCFCE7] rounded-lg flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-[#22C55E]" />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="text-center">
                            <p className="text-sm text-[#111827] mb-1">{file.name}</p>
                            <p className="text-xs text-[#6B7280]">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            onClick={() => setFile(null)}
                            className="p-2 hover:bg-[#F9FAFB] rounded-lg transition"
                          >
                            <X className="w-5 h-5 text-[#6B7280]" />
                          </button>
                        </div>
                        <button
                          onClick={handleValidate}
                          disabled={isProcessing}
                          className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-3 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Validating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Validate File
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-16 h-16 mx-auto mb-4 text-[#6B7280]" />
                        <p className="text-sm text-[#111827] mb-2">
                          Drag and drop your Excel file here, or click to browse
                        </p>
                        <p className="text-xs text-[#6B7280] mb-4">
                          Supported formats: XLSX, XLS, CSV (Max 10MB)
                        </p>
                        <input
                          type="file"
                          id="file-upload"
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => {
                            const uploadedFile = e.target.files?.[0];
                            if (uploadedFile) handleFileUpload(uploadedFile);
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="file-upload"
                          className="inline-block px-6 py-2.5 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] cursor-pointer transition"
                        >
                          Choose File
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Validation Results */}
            {isValidated && (
              <>
                {/* Validation Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#6B7280]">Total Records</span>
                      <FileText className="w-5 h-5 text-[#6B7280]" />
                    </div>
                    <div className="text-2xl text-[#111827]">{totalRecords}</div>
                  </div>

                  <div className="bg-white rounded-xl border border-green-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#22C55E]">Valid</span>
                      <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                    </div>
                    <div className="text-2xl text-[#22C55E]">{validRecords}</div>
                  </div>

                  <div className="bg-white rounded-xl border border-yellow-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-yellow-600">Warnings</span>
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="text-2xl text-yellow-900">{warningRecords}</div>
                  </div>

                  <div className="bg-white rounded-xl border border-[#EF4444]/20 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#EF4444]">Errors</span>
                      <XCircle className="w-5 h-5 text-[#EF4444]" />
                    </div>
                    <div className="text-2xl text-[#EF4444]">{errorRecords}</div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-indigo-100 mb-1">Total Payroll Amount</p>
                      <p className="text-3xl">{formatCurrency(totalAmount)}</p>
                      <p className="text-sm text-indigo-100 mt-1">
                        {validRecords + warningRecords} employees
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-8 h-8" />
                    </div>
                  </div>
                </div>

                {/* Error/Warning Alert */}
                {errorRecords > 0 && (
                  <div className="bg-[#FEF2F2] border border-[#EF4444]/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-[#EF4444] mb-1">
                          {errorRecords} record{errorRecords !== 1 ? "s" : ""} contain{errorRecords === 1 ? "s" : ""} errors and will not be imported
                        </p>
                        <p className="text-xs text-red-700">
                          Review and fix the errors below before importing.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation Results Table */}
                <div className="bg-white rounded-xl border border-[#E5E7EB]">
                  <div className="px-6 py-4 border-b border-[#E5E7EB]">
                    <h2 className="text-base text-[#111827]">Validation Results</h2>
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
                          <th className="px-4 py-3 text-right text-xs text-[#6B7280]">Deductions</th>
                          <th className="px-4 py-3 text-right text-xs text-[#6B7280]">Net Pay</th>
                          <th className="px-4 py-3 text-center text-xs text-[#6B7280]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {validationResults.map((record) => (
                          <tr 
                            key={record.id}
                            className={`${
                              record.status === "error" 
                                ? "bg-[#FEF2F2]" 
                                : record.status === "warning"
                                ? "bg-yellow-50"
                                : "bg-white hover:bg-[#F9FAFB]"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="text-sm text-[#111827]">{record.employeeName}</div>
                              <div className="text-xs text-[#6B7280]">{record.employeeId}</div>
                              {record.validationMessages.length > 0 && (
                                <div className="mt-1 space-y-0.5">
                                  {record.validationMessages.map((msg, idx) => (
                                    <p key={idx} className={`text-xs flex items-start gap-1 ${
                                      record.status === "error" ? "text-[#EF4444]" : "text-yellow-600"
                                    }`}>
                                      <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                      {msg}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#111827]">{record.department}</td>
                            <td className="px-4 py-3 text-sm text-[#111827] text-right">
                              {formatCurrency(record.baseSalary)}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#111827] text-right">
                              {formatCurrency(record.allowances)}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#111827] text-right">
                              {formatCurrency(record.bonuses)}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#111827] text-right">
                              {formatCurrency(record.deductions)}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#22C55E] text-right">
                              {formatCurrency(record.netPay)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {getStatusBadge(record.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setIsValidated(false);
                        setFile(null);
                      }}
                      className="flex-1 px-6 py-3 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
                    >
                      Upload Different File
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={isProcessing || errorRecords === totalRecords}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-3 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Import {validRecords + warningRecords} Record{validRecords + warningRecords !== 1 ? "s" : ""}
                        </>
                      )}
                    </button>
                  </div>
                  {errorRecords > 0 && errorRecords < totalRecords && (
                    <p className="mt-3 text-xs text-[#6B7280] text-center">
                      Records with errors will be skipped. Only valid and warning records will be imported.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}