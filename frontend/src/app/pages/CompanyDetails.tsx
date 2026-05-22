import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Building,
  Save,
  Edit,
  MapPin,
  Globe,
  Phone,
  Mail,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Settings,
  Briefcase,
  Clock,
  ArrowLeft,
  BarChart3,
  CreditCard,
  Shield,
  FileText,
  DollarSign,
  Activity, } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { ApiError } from "../../lib/api";
import { companiesService, type CompanyRecord } from "../../services/companies.service";

interface Company {
  id: number;
  name: string;
  registrationNumber: string;
  industry: string;
  size: string;
  status: "active" | "inactive" | "suspended" | "pending";
  founded: string;
  registeredDate: string;
  lastActive: string;
  
  // Contact Information
  website: string;
  email: string;
  phone: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  
  // Primary Contact
  primaryContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  
  // Subscription
  subscription: {
    plan: "starter" | "professional" | "enterprise";
    startDate: string;
    renewalDate: string;
    billingCycle: "monthly" | "annual";
    amount: number;
  };
  
  // Metrics
  metrics: {
    totalEmployees: number;
    activeEmployees: number;
    departments: number;
    payrollRuns: number;
    lastPayroll: string;
  };
  
  // Settings
  settings: {
    multiCurrency: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    ssoEnabled: boolean;
  };
}

function toCompany(record: CompanyRecord): Company {
  const registeredDate = record.registeredDate ?? record.requestDate ?? new Date().toISOString();
  const renewalDate = record.expirationDate ?? registeredDate;

  return {
    id: record.id,
    name: record.name ?? record.companyName,
    registrationNumber: record.registrationNumber ?? `COMP-${record.id}`,
    industry: record.industry,
    size: record.size,
    status:
      record.status === "approved"
        ? "active"
        : record.status === "rejected"
        ? "inactive"
        : record.status,
    founded: registeredDate,
    registeredDate,
    lastActive: registeredDate,
    website: record.website,
    email: record.email ?? record.contactEmail,
    phone: record.phone ?? record.contactPhone,
    address: record.address ?? "",
    city: record.city,
    state: "",
    country: record.country,
    postalCode: "",
    primaryContact: {
      name: record.contactName,
      title: record.jobTitle,
      email: record.contactEmail,
      phone: record.contactPhone,
    },
    subscription: {
      plan: "professional",
      startDate: registeredDate,
      renewalDate,
      billingCycle: "annual",
      amount: 0,
    },
    metrics: {
      totalEmployees: record.metrics?.totalEmployees ?? record.employeeCount,
      activeEmployees: record.metrics?.activeEmployees ?? record.employeeCount,
      departments: record.metrics?.departments ?? 0,
      payrollRuns: record.metrics?.payrollRuns ?? 0,
      lastPayroll: record.metrics?.lastPayroll ?? registeredDate,
    },
    settings: {
      multiCurrency: false,
      customBranding: Boolean(record.website),
      apiAccess: false,
      ssoEnabled: false,
    },
  };
}

export function CompanyDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [activeTab, setActiveTab] = useState<"overview" | "subscription" | "activity" | "settings">("overview");
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    companiesService
      .get(Number(id))
      .then((record) => setCompany(toCompany(record)))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load company."))
      .finally(() => setIsLoading(false));
  }, [id]);

  // Activity timeline
  const activities = [
    {
      id: 1,
      type: "payroll",
      title: "Payroll Processed",
      description: "March 2026 - Period 2 payroll successfully processed for 145 employees",
      timestamp: "2026-03-21 10:00 AM",
      icon: CheckCircle,
      color: "text-[#22C55E]",
      bg: "bg-[#DCFCE7]",
    },
    {
      id: 2,
      type: "user",
      title: "New Employee Added",
      description: "Sarah Johnson joined Engineering department",
      timestamp: "2026-03-20 03:30 PM",
      icon: UserCheck,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      id: 3,
      type: "system",
      title: "System Configuration Updated",
      description: "Multi-currency support enabled",
      timestamp: "2026-03-19 11:15 AM",
      icon: Settings,
      color: "text-[#4F46E5]",
      bg: "bg-[#EEF2FF]",
    },
    {
      id: 4,
      type: "department",
      title: "Department Created",
      description: "New department 'Product Design' created with 5 members",
      timestamp: "2026-03-18 09:00 AM",
      icon: Briefcase,
      color: "text-[#4F46E5]",
      bg: "bg-[#EEF2FF]",
    },
  ];

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm bg-[#DCFCE7] text-[#22C55E] border border-green-200">
            <CheckCircle className="w-4 h-4" />
            Active
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm bg-[#F9FAFB] text-[#111827] border border-[#E5E7EB]">
            <Clock className="w-4 h-4" />
            Inactive
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm bg-[#FEF2F2] text-red-700 border border-[#EF4444]/20">
            <AlertCircle className="w-4 h-4" />
            Suspended
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm bg-yellow-100 text-yellow-700 border border-yellow-200">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
    }
  };

  // Get plan badge
  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "starter":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 border border-[#06B6D4]/20">
            Starter
          </span>
        );
      case "professional":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#EEF2FF] text-indigo-700 border border-[#4F46E5]/20">
            Professional
          </span>
        );
      case "enterprise":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#EEF2FF] text-[#4F46E5] border border-purple-200">
            Enterprise
          </span>
        );
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
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
          <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error || !company) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="rounded-lg border border-[#EF4444]/20 bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
            {error ?? "Company not found."}
          </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/admin/companies")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">Company Details</h1>
                <p className="text-sm text-[#6B7280]">{company.registrationNumber}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Company Header Card */}
        <div className="bg-white border-b border-[#E5E7EB] px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Company Logo/Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Building className="w-10 h-10 text-white" />
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl text-[#111827] mb-2">{company.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        {company.industry}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {company.size}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {company.city}, {company.country}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(company.status)}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg p-3">
                    <p className="text-xs text-blue-600 mb-1">Total Employees</p>
                    <p className="text-xl text-[#06B6D4]">{company.metrics.totalEmployees}</p>
                  </div>
                  <div className="bg-[#DCFCE7] border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-[#22C55E] mb-1">Active Users</p>
                    <p className="text-xl text-[#22C55E]">{company.metrics.activeEmployees}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-xs text-[#4F46E5] mb-1">Departments</p>
                    <p className="text-xl text-purple-900">{company.metrics.departments}</p>
                  </div>
                  <div className="bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg p-3">
                    <p className="text-xs text-[#4F46E5] mb-1">Payroll Runs</p>
                    <p className="text-xl text-[#111827]">{company.metrics.payrollRuns}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-[#E5E7EB] px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-3 text-sm transition border-b-2 ${
                  activeTab === "overview"
                    ? "border-[#4F46E5] text-[#4F46E5]"
                    : "border-transparent text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                Overview
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
                {/* Company Information */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-[#4F46E5]" />
                    </div>
                    <h3 className="text-base text-[#111827]">Company Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Company Name</label>
                        <p className="text-sm text-[#111827]">{company.name}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Registration Number</label>
                        <p className="text-sm text-[#111827]">{company.registrationNumber}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Industry</label>
                        <p className="text-sm text-[#111827]">{company.industry}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Company Size</label>
                        <p className="text-sm text-[#111827]">{company.size}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Founded</label>
                        <p className="text-sm text-[#111827]">{formatDate(company.founded)}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Registered Date</label>
                        <p className="text-sm text-[#111827]">{formatDate(company.registeredDate)}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Last Active</label>
                        <p className="text-sm text-[#111827]">{company.lastActive}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Status</label>
                        {getStatusBadge(company.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-base text-[#111827]">Contact Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Website</label>
                        <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#4F46E5] hover:underline">
                          <Globe className="w-4 h-4" />
                          {company.website}
                        </a>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Email</label>
                        <div className="flex items-center gap-2 text-sm text-[#111827]">
                          <Mail className="w-4 h-4 text-[#6B7280]" />
                          {company.email}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Phone</label>
                        <div className="flex items-center gap-2 text-sm text-[#111827]">
                          <Phone className="w-4 h-4 text-[#6B7280]" />
                          {company.phone}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Address</label>
                        <div className="flex items-start gap-2 text-sm text-[#111827]">
                          <MapPin className="w-4 h-4 text-[#6B7280] mt-0.5" />
                          <div>
                            <p>{company.address}</p>
                            <p>{company.city}, {company.state} {company.postalCode}</p>
                            <p>{company.country}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Contact */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-[#4F46E5]" />
                    </div>
                    <h3 className="text-base text-[#111827]">Primary Contact</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Name</label>
                        <p className="text-sm text-[#111827]">{company.primaryContact.name}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Job Title</label>
                        <p className="text-sm text-[#111827]">{company.primaryContact.title}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Email</label>
                        <p className="text-sm text-[#111827]">{company.primaryContact.email}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Phone</label>
                        <p className="text-sm text-[#111827]">{company.primaryContact.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-[#22C55E]" />
                    </div>
                    <h3 className="text-base text-[#111827]">Usage Metrics</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="p-4 bg-[#F9FAFB] rounded-lg">
                      <p className="text-xs text-[#6B7280] mb-1">Total Employees</p>
                      <p className="text-2xl text-[#111827]">{company.metrics.totalEmployees}</p>
                    </div>
                    <div className="p-4 bg-[#F9FAFB] rounded-lg">
                      <p className="text-xs text-[#6B7280] mb-1">Active Employees</p>
                      <p className="text-2xl text-[#111827]">{company.metrics.activeEmployees}</p>
                    </div>
                    <div className="p-4 bg-[#F9FAFB] rounded-lg">
                      <p className="text-xs text-[#6B7280] mb-1">Departments</p>
                      <p className="text-2xl text-[#111827]">{company.metrics.departments}</p>
                    </div>
                    <div className="p-4 bg-[#F9FAFB] rounded-lg">
                      <p className="text-xs text-[#6B7280] mb-1">Payroll Runs</p>
                      <p className="text-2xl text-[#111827]">{company.metrics.payrollRuns}</p>
                    </div>
                    <div className="p-4 bg-[#F9FAFB] rounded-lg">
                      <p className="text-xs text-[#6B7280] mb-1">Last Payroll</p>
                      <p className="text-sm text-[#111827]">{formatDate(company.metrics.lastPayroll)}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Subscription Tab */}
            {activeTab === "subscription" && (
              <>
                {/* Current Plan */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-[#4F46E5]" />
                    </div>
                    <h3 className="text-base text-[#111827]">Current Subscription</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Plan</label>
                        {getPlanBadge(company.subscription.plan)}
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Billing Cycle</label>
                        <p className="text-sm text-[#111827] capitalize">{company.subscription.billingCycle}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Amount</label>
                        <p className="text-xl text-[#111827]">{formatCurrency(company.subscription.amount)}<span className="text-sm text-[#6B7280]">/{company.subscription.billingCycle === "annual" ? "year" : "month"}</span></p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Start Date</label>
                        <p className="text-sm text-[#111827]">{formatDate(company.subscription.startDate)}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Renewal Date</label>
                        <p className="text-sm text-[#111827]">{formatDate(company.subscription.renewalDate)}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B7280] mb-1">Status</label>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#DCFCE7] text-[#22C55E] border border-green-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Active & Paid
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plan Features */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[#4F46E5]" />
                    </div>
                    <h3 className="text-base text-[#111827]">Plan Features</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-lg">
                      <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
                      <div>
                        <p className="text-sm text-[#111827]">Up to 200 Employees</p>
                        <p className="text-xs text-[#6B7280]">Currently using {company.metrics.totalEmployees}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-lg">
                      <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
                      <div>
                        <p className="text-sm text-[#111827]">Unlimited Payroll Runs</p>
                        <p className="text-xs text-[#6B7280]">{company.metrics.payrollRuns} runs completed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-lg">
                      <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
                      <div>
                        <p className="text-sm text-[#111827]">Advanced Analytics</p>
                        <p className="text-xs text-[#6B7280]">Full reporting suite</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-lg">
                      <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0" />
                      <div>
                        <p className="text-sm text-[#111827]">Priority Support</p>
                        <p className="text-xs text-[#6B7280]">24/7 email & chat</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing History */}
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#22C55E]" />
                      </div>
                      <h3 className="text-base text-[#111827]">Billing History</h3>
                    </div>
                    <button className="text-sm text-[#4F46E5] hover:text-indigo-700">View All</button>
                  </div>

                  <div className="space-y-3">
                    {[
                      { date: "2026-03-15", amount: 4999, status: "paid", invoice: "INV-2026-03" },
                      { date: "2026-02-15", amount: 4999, status: "paid", invoice: "INV-2026-02" },
                      { date: "2026-01-15", amount: 4999, status: "paid", invoice: "INV-2026-01" },
                    ].map((bill, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-[#22C55E]" />
                          </div>
                          <div>
                            <p className="text-sm text-[#111827]">{formatDate(bill.date)}</p>
                            <p className="text-xs text-[#6B7280]">{bill.invoice}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[#111827]">{formatCurrency(bill.amount)}</p>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[#DCFCE7] text-[#22C55E]">
                            <CheckCircle className="w-3 h-3" />
                            Paid
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-base text-[#111827]">Recent Activity</h3>
                </div>

                <div className="space-y-4">
                  {activities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-start gap-4 p-4 bg-[#F9FAFB] rounded-lg hover:bg-[#F9FAFB] transition">
                        <div className={`w-10 h-10 ${activity.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#111827] mb-1">{activity.title}</p>
                          <p className="text-sm text-[#6B7280] mb-2">{activity.description}</p>
                          <p className="text-xs text-[#6B7280]">{activity.timestamp}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-[#4F46E5]" />
                  </div>
                  <h3 className="text-base text-[#111827]">System Settings</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-[#6B7280]" />
                      <div>
                        <p className="text-sm text-[#111827]">Multi-Currency Support</p>
                        <p className="text-xs text-[#6B7280]">Enable payments in multiple currencies</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      company.settings.multiCurrency 
                        ? "bg-[#DCFCE7] text-[#22C55E]" 
                        : "bg-[#F9FAFB] text-[#111827]"
                    }`}>
                      {company.settings.multiCurrency ? "Enabled" : "Disabled"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-[#6B7280]" />
                      <div>
                        <p className="text-sm text-[#111827]">Custom Branding</p>
                        <p className="text-xs text-[#6B7280]">Use company logo and colors</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      company.settings.customBranding 
                        ? "bg-[#DCFCE7] text-[#22C55E]" 
                        : "bg-[#F9FAFB] text-[#111827]"
                    }`}>
                      {company.settings.customBranding ? "Enabled" : "Disabled"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-[#6B7280]" />
                      <div>
                        <p className="text-sm text-[#111827]">API Access</p>
                        <p className="text-xs text-[#6B7280]">Integrate with third-party systems</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      company.settings.apiAccess 
                        ? "bg-[#DCFCE7] text-[#22C55E]" 
                        : "bg-[#F9FAFB] text-[#111827]"
                    }`}>
                      {company.settings.apiAccess ? "Enabled" : "Disabled"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-[#6B7280]" />
                      <div>
                        <p className="text-sm text-[#111827]">Single Sign-On (SSO)</p>
                        <p className="text-xs text-[#6B7280]">Enable SSO authentication</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      company.settings.ssoEnabled 
                        ? "bg-[#DCFCE7] text-[#22C55E]" 
                        : "bg-[#F9FAFB] text-[#111827]"
                    }`}>
                      {company.settings.ssoEnabled ? "Enabled" : "Disabled"}
                    </span>
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
