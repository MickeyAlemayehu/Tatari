import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

interface ImportResult {
  row: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "success" | "error";
  errorMessage?: string;
}

export function BulkImport() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);

  // Handle drag events
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
    if (droppedFile && isValidFileType(droppedFile)) {
      setFile(droppedFile);
      setImportComplete(false);
      setImportResults([]);
    } else {
      alert("Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile);
      setImportComplete(false);
      setImportResults([]);
    } else {
      alert("Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)");
    }
  };

  const isValidFileType = (file: File) => {
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    return validTypes.includes(file.type) || file.name.endsWith(".csv");
  };

  const handleRemoveFile = () => {
    setFile(null);
    setImportComplete(false);
    setImportResults([]);
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const headers = ["Full Name", "Email", "Department", "Role", "Status"];
    const sampleData = [
      ["John Doe", "john.doe@company.com", "Engineering", "Software Developer", "active"],
      ["Jane Smith", "jane.smith@company.com", "Marketing", "Marketing Manager", "active"],
      ["Bob Johnson", "bob.johnson@company.com", "Sales", "Sales Representative", "active"],
    ];

    const csvContent = [
      headers.join(","),
      ...sampleData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);

    // Simulate file processing and import
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock import results
    const mockResults: ImportResult[] = [
      {
        row: 2,
        name: "John Doe",
        email: "john.doe@company.com",
        department: "Engineering",
        role: "Software Developer",
        status: "success",
      },
      {
        row: 3,
        name: "Jane Smith",
        email: "jane.smith@company.com",
        department: "Marketing",
        role: "Marketing Manager",
        status: "success",
      },
      {
        row: 4,
        name: "Bob Johnson",
        email: "invalid-email",
        department: "Sales",
        role: "Sales Representative",
        status: "error",
        errorMessage: "Invalid email format",
      },
      {
        row: 5,
        name: "Alice Williams",
        email: "alice.williams@company.com",
        department: "Engineering",
        role: "Senior Developer",
        status: "success",
      },
      {
        row: 6,
        name: "",
        email: "sarah.jones@company.com",
        department: "Design",
        role: "UX Designer",
        status: "error",
        errorMessage: "Full name is required",
      },
      {
        row: 7,
        name: "Michael Brown",
        email: "michael.brown@company.com",
        department: "Product",
        role: "Product Manager",
        status: "success",
      },
      {
        row: 8,
        name: "Emily Davis",
        email: "emily.davis@company.com",
        department: "InvalidDept",
        role: "Analyst",
        status: "error",
        errorMessage: "Invalid department",
      },
      {
        row: 9,
        name: "David Wilson",
        email: "david.wilson@company.com",
        department: "Finance",
        role: "Financial Analyst",
        status: "success",
      },
    ];

    setImportResults(mockResults);
    setIsImporting(false);
    setImportComplete(true);
  };

  const successCount = importResults.filter((r) => r.status === "success").length;
  const errorCount = importResults.filter((r) => r.status === "error").length;
  const totalCount = importResults.length;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
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
                onClick={() => navigate("/employees")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">Bulk Import Employees</h1>
                <p className="text-sm text-[#6B7280]">
                  Upload a CSV or Excel file to import multiple employees
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 border border-[#E5E7EB] text-[#111827] px-4 py-2.5 rounded-lg hover:bg-[#F9FAFB] transition"
            >
              <Download className="w-5 h-5" />
              <span>Download Template</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Upload Area */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h3 className="text-[#111827] mb-4">Upload File</h3>

              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-12 transition ${
                    isDragging
                      ? "border-[#4F46E5] bg-[#EEF2FF]"
                      : "border-[#E5E7EB] bg-[#F9FAFB]"
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-[#4F46E5]" />
                    </div>
                    <h4 className="text-[#111827] mb-2">
                      {isDragging ? "Drop your file here" : "Drag & drop your file here"}
                    </h4>
                    <p className="text-sm text-[#6B7280] mb-4">
                      or click to browse from your computer
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      Supported formats: CSV, XLSX, XLS (Max 10MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-[#E5E7EB] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                        <FileSpreadsheet className="w-6 h-6 text-[#22C55E]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#111827]">{file.name}</p>
                        <p className="text-xs text-[#6B7280]">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-2 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Import Button */}
              {file && !importComplete && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-5 h-5" />
                    <span>{isImporting ? "Importing..." : "Import Employees"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Instructions */}
            {!importComplete && (
              <div className="bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm text-[#06B6D4] mb-2">Import Instructions</h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Download the template file to see the required format</li>
                      <li>Fill in employee details: Full Name, Email, Department, Role, Status</li>
                      <li>Ensure all required fields are populated</li>
                      <li>Valid departments: Engineering, Product, Design, HR, Marketing, Sales, Finance</li>
                      <li>Valid statuses: active, on-leave, inactive</li>
                      <li>Save your file as CSV or Excel format</li>
                      <li>Upload the file and click "Import Employees"</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Import Results */}
            {importComplete && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl text-[#111827]">{totalCount}</p>
                        <p className="text-sm text-[#6B7280]">Total Records</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                      </div>
                      <div>
                        <p className="text-2xl text-[#111827]">{successCount}</p>
                        <p className="text-sm text-[#6B7280]">Successful Imports</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                      </div>
                      <div>
                        <p className="text-2xl text-[#111827]">{errorCount}</p>
                        <p className="text-sm text-[#6B7280]">Failed Imports</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-xl border border-[#E5E7EB]">
                  <div className="px-6 py-4 border-b border-[#E5E7EB]">
                    <h3 className="text-[#111827]">Import Results</h3>
                    <p className="text-sm text-[#6B7280]">
                      Review the import status for each record
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                            Row
                          </th>
                          <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                            Error
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {importResults.map((result, index) => (
                          <tr
                            key={index}
                            className={result.status === "error" ? "bg-[#FEF2F2]" : ""}
                          >
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              {result.row}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#111827]">
                              {result.name || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              {result.email}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              {result.department}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">
                              {result.role}
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant={result.status === "success" ? "success" : "danger"}
                                size="sm"
                              >
                                {result.status === "success" ? (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Success
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Failed
                                  </span>
                                )}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#EF4444]">
                              {result.errorMessage || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions */}
                  <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setFile(null);
                        setImportComplete(false);
                        setImportResults([]);
                      }}
                      className="px-4 py-2 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
                    >
                      Import Another File
                    </button>
                    <button
                      onClick={() => navigate("/employees")}
                      className="px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg"
                    >
                      View All Employees
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AppLayout>
  );
}