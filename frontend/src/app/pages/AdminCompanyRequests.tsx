import { useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle, XCircle, Eye, Building, Calendar, Users, AlertCircle, Clock, Mail, Phone, ArrowLeft, Filter, Search, Briefcase, MapPin, UserCheck, Globe, FileText, X, UserPlus } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

interface CompanyRequest {
  id: number;
  companyName: string;
  industry: string;
  size: string;
  country: string;
  city: string;
  website: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  jobTitle: string;
  employeeCount: number;
  requestDate: string;
  status: "pending" | "approved" | "rejected";
  description: string;
  registrationNumber?: string;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export function AdminCompanyRequests() {
  const navigate = useNavigate();
  
  const [companies, setCompanies] = useState<CompanyRequest[]>([
    {
      id: 1,
      companyName: "TechCorp Solutions",
      industry: "Technology",
      size: "Medium (50-200)",
      country: "United States",
      city: "San Francisco",
      website: "www.techcorp.com",
      contactName: "John Smith",
      contactEmail: "john.smith@techcorp.com",
      contactPhone: "+1 (555) 123-4567",
      jobTitle: "HR Director",
      employeeCount: 150,
      requestDate: "2026-03-20 10:30 AM",
      status: "pending",
      description: "We are a rapidly growing tech company looking to streamline our HR processes with your platform.",
      registrationNumber: "US-TC-2026-001",
    },
    {
      id: 2,
      companyName: "Global Finance Group",
      industry: "Finance",
      size: "Large (200-1000)",
      country: "United Kingdom",
      city: "London",
      website: "www.globalfinance.co.uk",
      contactName: "Emma Thompson",
      contactEmail: "e.thompson@globalfinance.co.uk",
      contactPhone: "+44 20 7123 4567",
      jobTitle: "Chief People Officer",
      employeeCount: 450,
      requestDate: "2026-03-19 02:15 PM",
      status: "pending",
      description: "International finance firm seeking comprehensive HR management solution for our European operations.",
      registrationNumber: "UK-GF-2026-002",
    },
    {
      id: 3,
      companyName: "HealthPlus Medical",
      industry: "Healthcare",
      size: "Medium (50-200)",
      country: "Canada",
      city: "Toronto",
      website: "www.healthplus.ca",
      contactName: "Dr. Sarah Johnson",
      contactEmail: "s.johnson@healthplus.ca",
      contactPhone: "+1 (416) 555-9876",
      jobTitle: "Operations Manager",
      employeeCount: 85,
      requestDate: "2026-03-18 09:45 AM",
      status: "approved",
      description: "Medical clinic network looking to modernize our employee management and payroll systems.",
      registrationNumber: "CA-HP-2026-003",
    },
    {
      id: 4,
      companyName: "RetailMax Inc",
      industry: "Retail",
      size: "Large (200-1000)",
      country: "Australia",
      city: "Sydney",
      website: "www.retailmax.com.au",
      contactName: "Michael Chen",
      contactEmail: "m.chen@retailmax.com.au",
      contactPhone: "+61 2 9876 5432",
      jobTitle: "HR Manager",
      employeeCount: 320,
      requestDate: "2026-03-17 04:20 PM",
      status: "approved",
      description: "Retail chain expanding operations and need scalable HR solution for multiple locations.",
      registrationNumber: "AU-RM-2026-004",
    },
    {
      id: 5,
      companyName: "EduLearn Academy",
      industry: "Education",
      size: "Small (10-50)",
      country: "Singapore",
      city: "Singapore",
      website: "www.edulearn.sg",
      contactName: "Lisa Wong",
      contactEmail: "lisa@edulearn.sg",
      contactPhone: "+65 6123 4567",
      jobTitle: "Administrator",
      employeeCount: 35,
      requestDate: "2026-03-16 11:00 AM",
      status: "rejected",
      description: "Educational institution looking for HR management tools.",
      registrationNumber: "SG-EL-2026-005",
    },
  ]);

  const [selectedFilter, setSelectedFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter companies
  const filteredCompanies = companies.filter(company => {
    const matchesStatus = selectedFilter === "all" || company.status === selectedFilter;
    const matchesSearch = 
      company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Get counts
  const pendingCount = companies.filter(c => c.status === "pending").length;
  const approvedCount = companies.filter(c => c.status === "approved").length;
  const rejectedCount = companies.filter(c => c.status === "rejected").length;

  // Handle approve
  const handleApprove = () => {
    if (!selectedCompany) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      setCompanies(companies.map(c => 
        c.id === selectedCompany.id ? { ...c, status: "approved" } : c
      ));
      setIsProcessing(false);
      setShowApproveModal(false);
      setSelectedCompany(null);
    }, 1000);
  };

  // Handle reject
  const handleReject = () => {
    if (!selectedCompany || !rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    
    setIsProcessing(true);
    
    setTimeout(() => {
      setCompanies(companies.map(c => 
        c.id === selectedCompany.id ? { ...c, status: "rejected" } : c
      ));
      setIsProcessing(false);
      setShowRejectModal(false);
      setSelectedCompany(null);
      setRejectReason("");
    }, 1000);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="warning">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="success">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="danger">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">Company Requests</h1>
                <p className="text-sm text-[#6B7280]">
                  {pendingCount} pending request{pendingCount !== 1 ? "s" : ""} awaiting review
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies..."
                className="pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] w-full sm:w-80"
              />
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-xl p-4 text-white">
              <p className="text-sm text-indigo-100 mb-1">Total Requests</p>
              <p className="text-2xl">{companies.length}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-600 mb-1">Pending</p>
              <p className="text-2xl text-yellow-900">{pendingCount}</p>
            </div>
            <div className="bg-[#DCFCE7] border border-green-200 rounded-xl p-4">
              <p className="text-sm text-[#22C55E] mb-1">Approved</p>
              <p className="text-2xl text-[#22C55E]">{approvedCount}</p>
            </div>
            <div className="bg-[#FEF2F2] border border-[#EF4444]/20 rounded-xl p-4">
              <p className="text-sm text-[#EF4444] mb-1">Rejected</p>
              <p className="text-2xl text-[#EF4444]">{rejectedCount}</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#6B7280]" />
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  selectedFilter === "all"
                    ? "bg-[#EEF2FF] text-[#4F46E5]"
                    : "text-[#6B7280] hover:bg-[#F9FAFB]"
                }`}
              >
                All ({companies.length})
              </button>
              <button
                onClick={() => setSelectedFilter("pending")}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  selectedFilter === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "text-[#6B7280] hover:bg-[#F9FAFB]"
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setSelectedFilter("approved")}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  selectedFilter === "approved"
                    ? "bg-[#DCFCE7] text-[#22C55E]"
                    : "text-[#6B7280] hover:bg-[#F9FAFB]"
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setSelectedFilter("rejected")}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  selectedFilter === "rejected"
                    ? "bg-[#FEF2F2] text-[#EF4444]"
                    : "text-[#6B7280] hover:bg-[#F9FAFB]"
                }`}
              >
                Rejected ({rejectedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Empty State */}
            {filteredCompanies.length === 0 && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
                <div className="w-20 h-20 bg-[#F9FAFB] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-10 h-10 text-[#6B7280]" />
                </div>
                <h3 className="text-lg text-[#111827] mb-2">No Companies Found</h3>
                <p className="text-sm text-[#6B7280]">
                  {searchQuery 
                    ? "No companies match your search criteria."
                    : "No company requests found for this filter."}
                </p>
              </div>
            )}

            {/* Companies List */}
            <div className="space-y-4">
              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className="bg-white rounded-xl border border-[#E5E7EB] hover:border-[#4F46E5]/20 transition-all hover:shadow-md"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b border-[#E5E7EB]">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg text-[#111827] mb-1">{company.companyName}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="w-4 h-4" />
                              {company.industry}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              {company.employeeCount} employees
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              {company.city}, {company.country}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(company.status)}
                        <span className="text-xs text-[#6B7280]">{company.registrationNumber}</span>
                      </div>
                    </div>

                    {/* Company Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-[#6B7280] mb-1">Contact Person</p>
                          <div className="flex items-center gap-2 text-sm text-[#111827]">
                            <UserCheck className="w-4 h-4 text-[#6B7280]" />
                            <span>{company.contactName} - {company.jobTitle}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B7280] mb-1">Email</p>
                          <div className="flex items-center gap-2 text-sm text-[#111827]">
                            <Mail className="w-4 h-4 text-[#6B7280]" />
                            <span>{company.contactEmail}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B7280] mb-1">Phone</p>
                          <div className="flex items-center gap-2 text-sm text-[#111827]">
                            <Phone className="w-4 h-4 text-[#6B7280]" />
                            <span>{company.contactPhone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-[#6B7280] mb-1">Website</p>
                          <div className="flex items-center gap-2 text-sm text-[#4F46E5]">
                            <Globe className="w-4 h-4 text-[#6B7280]" />
                            <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {company.website}
                            </a>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B7280] mb-1">Company Size</p>
                          <div className="flex items-center gap-2 text-sm text-[#111827]">
                            <Users className="w-4 h-4 text-[#6B7280]" />
                            <span>{company.size}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B7280] mb-1">Request Date</p>
                          <div className="flex items-center gap-2 text-sm text-[#111827]">
                            <Calendar className="w-4 h-4 text-[#6B7280]" />
                            <span>{formatDate(company.requestDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4 p-4 bg-[#F9FAFB] rounded-lg">
                      <p className="text-xs text-[#6B7280] mb-1">Company Description</p>
                      <p className="text-sm text-[#111827]">{company.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedCompany(company)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      
                      {company.status === "pending" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowRejectModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#EF4444]/30 text-red-700 rounded-lg hover:bg-[#FEF2F2] transition"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowApproveModal(true);
                            }}
                            className="flex items-center gap-2 bg-gradient-to-r from-[#22C55E] to-[#22C55E] text-white px-4 py-2.5 rounded-lg hover:from-[#22C55E] hover:to-[#22C55E] transition shadow-lg hover:shadow-xl ml-auto"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve Request
                          </button>
                        </>
                      )}

                      {company.status === "approved" && (
                        <div className="ml-auto flex items-center gap-2 text-sm text-[#22C55E]">
                          <CheckCircle className="w-4 h-4" />
                          <span>Company has been onboarded</span>
                        </div>
                      )}

                      {company.status === "rejected" && (
                        <div className="ml-auto flex items-center gap-2 text-sm text-[#EF4444]">
                          <XCircle className="w-4 h-4" />
                          <span>Request was rejected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#22C55E]" />
              </div>
              <div>
                <h3 className="text-lg text-[#111827]">Approve Company Request</h3>
                <p className="text-sm text-[#6B7280]">Confirm approval for {selectedCompany.companyName}</p>
              </div>
            </div>

            <div className="bg-[#DCFCE7] border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-[#22C55E] mb-2">Upon approval, the following will happen:</p>
              <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                <li>Company account will be activated</li>
                <li>Welcome email will be sent to {selectedCompany.contactEmail}</li>
                <li>Company admin portal access will be granted</li>
                <li>{selectedCompany.contactName} will receive login credentials</li>
              </ul>
            </div>

            {/* Company Summary */}
            <div className="mb-6 p-4 bg-[#F9FAFB] rounded-lg">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[#6B7280]">Company</p>
                  <p className="text-[#111827]">{selectedCompany.companyName}</p>
                </div>
                <div>
                  <p className="text-[#6B7280]">Employees</p>
                  <p className="text-[#111827]">{selectedCompany.employeeCount}</p>
                </div>
                <div>
                  <p className="text-[#6B7280]">Industry</p>
                  <p className="text-[#111827]">{selectedCompany.industry}</p>
                </div>
                <div>
                  <p className="text-[#6B7280]">Location</p>
                  <p className="text-[#111827]">{selectedCompany.city}, {selectedCompany.country}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedCompany(null);
                }}
                className="flex-1 px-4 py-2.5 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Approve & Activate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-[#EF4444]" />
              </div>
              <div>
                <h3 className="text-lg text-[#111827]">Reject Company Request</h3>
                <p className="text-sm text-[#6B7280]">Provide a reason for rejection</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-[#111827] mb-2">
                Company Name
              </label>
              <div className="px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#111827]">
                {selectedCompany.companyName}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-[#111827] mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF4444] resize-none"
                placeholder="Please explain why this company request is being rejected. This message will be sent to the contact person..."
              />
              <p className="mt-2 text-xs text-[#6B7280]">
                An email notification with this reason will be sent to {selectedCompany.contactEmail}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedCompany(null);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2.5 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isProcessing}
                className="flex-1 flex items-center justify-center gap-2 bg-[#EF4444] text-white px-4 py-2.5 rounded-lg hover:bg-[#EF4444] transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Reject Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Company Details Modal */}
      {selectedCompany && !showApproveModal && !showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Building className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-white">
                    <h2 className="text-xl mb-1">{selectedCompany.companyName}</h2>
                    <p className="text-sm text-indigo-100">{selectedCompany.registrationNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280]">Status</span>
                {getStatusBadge(selectedCompany.status)}
              </div>

              {/* Company Information */}
              <div>
                <h3 className="text-sm text-[#111827] mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#4F46E5]" />
                  Company Information
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-[#F9FAFB] rounded-lg">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Industry</p>
                    <p className="text-sm text-[#111827]">{selectedCompany.industry}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Company Size</p>
                    <p className="text-sm text-[#111827]">{selectedCompany.size}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Employee Count</p>
                    <p className="text-sm text-[#111827]">{selectedCompany.employeeCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Website</p>
                    <a href={`https://${selectedCompany.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#4F46E5] hover:underline">
                      {selectedCompany.website}
                    </a>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm text-[#111827] mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#4F46E5]" />
                  Location
                </h3>
                <div className="p-4 bg-[#F9FAFB] rounded-lg">
                  <p className="text-sm text-[#111827]">{selectedCompany.city}, {selectedCompany.country}</p>
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <h3 className="text-sm text-[#111827] mb-3 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#4F46E5]" />
                  Contact Person
                </h3>
                <div className="space-y-3 p-4 bg-[#F9FAFB] rounded-lg">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Name & Position</p>
                    <p className="text-sm text-[#111827]">{selectedCompany.contactName} - {selectedCompany.jobTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Email</p>
                    <p className="text-sm text-[#111827]">{selectedCompany.contactEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Phone</p>
                    <p className="text-sm text-[#111827]">{selectedCompany.contactPhone}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm text-[#111827] mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#4F46E5]" />
                  Description
                </h3>
                <div className="p-4 bg-[#F9FAFB] rounded-lg">
                  <p className="text-sm text-[#111827]">{selectedCompany.description}</p>
                </div>
              </div>

              {/* Request Date */}
              <div>
                <h3 className="text-sm text-[#111827] mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4F46E5]" />
                  Request Date
                </h3>
                <div className="p-4 bg-[#F9FAFB] rounded-lg">
                  <p className="text-sm text-[#111827]">{formatDate(selectedCompany.requestDate)}</p>
                </div>
              </div>

              {/* Actions */}
              {selectedCompany.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t border-[#E5E7EB]">
                  <button
                    onClick={() => {
                      setShowRejectModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#EF4444]/30 text-red-700 rounded-lg hover:bg-[#FEF2F2] transition"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setShowApproveModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#22C55E] to-[#22C55E] text-white px-4 py-2.5 rounded-lg hover:from-[#22C55E] hover:to-[#22C55E] transition shadow-lg hover:shadow-xl"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}