import { createBrowserRouter } from "react-router-dom";
import { RoleSelection } from "./pages/RoleSelection";
import { EmployeeLogin } from "./pages/EmployeeLogin";
import { HRLogin } from "./pages/HRLogin";
import { AdminLogin } from "./pages/AdminLogin";
import { Dashboard } from "./pages/Dashboard";
import { EmployeeDashboard } from "./pages/EmployeeDashboard";
import { HRDashboard } from "./pages/HRDashboard";
import { MyProfile } from "./pages/MyProfile";
import { MyDepartment } from "./pages/MyDepartment";
import { Equipment } from "./pages/Equipment";
import { EmployeeSettings } from "./pages/EmployeeSettings";
import { EmployeeManagement } from "./pages/EmployeeManagement";
import { EmployeeProfile } from "./pages/EmployeeProfile";
import { CreateEmployee } from "./pages/CreateEmployee";
import { BulkImport } from "./pages/BulkImport";
import { DepartmentManagement } from "./pages/DepartmentManagement";
import { DepartmentForm } from "./pages/DepartmentForm";
import { LeaveManagement } from "./pages/LeaveManagement";
import { EmployeeLeaveManagement } from "./pages/EmployeeLeaveManagement";
import { LeaveDetail } from "./pages/LeaveDetail";
import { PerformanceManagement } from "./pages/PerformanceManagement";
import { PerformanceEvaluation } from "./pages/PerformanceEvaluation";
import { EmployeePerformance } from "./pages/EmployeePerformance";
import { EmployeeEvaluationForm } from "./pages/EmployeeEvaluationForm";
import { CreateEvaluationPeriod } from "./pages/CreateEvaluationPeriod";
import { EvaluationBuilder } from "./pages/EvaluationBuilder";
import { EvaluationStructure } from "./pages/EvaluationStructure";
import { PerformanceResultsTable } from "./pages/PerformanceResultsTable";
import { AssignPeerEvaluators } from "./pages/AssignPeerEvaluators";
import { SelfEvaluation } from "./pages/SelfEvaluation";
import { PeerEvaluation } from "./pages/PeerEvaluation";
import { ManagerEvaluation } from "./pages/ManagerEvaluation";
import { PerformanceResults } from "./pages/PerformanceResults";
import { JobVacancies } from "./pages/JobVacancies";
import { CreateJob } from "./pages/CreateJob";
import { JobDetails } from "./pages/JobDetails";
import { ApplicantManagement } from "./pages/ApplicantManagement";
import { ApplicantProfile } from "./pages/ApplicantProfile";
import { PublicJobListing } from "./pages/PublicJobListing";
import { PublicJobApplication } from "./pages/PublicJobApplication";
import { PayrollDashboard } from "./pages/PayrollDashboard";
import { PayrollGeneration } from "./pages/PayrollGeneration";
import { PayrollImport } from "./pages/PayrollImport";
import { PayrollReview } from "./pages/PayrollReview";
import { PayrollApproval } from "./pages/PayrollApproval";
import { Payslip } from "./pages/Payslip";
import { Notifications } from "./pages/Notifications";
import AdminCompanyRequests from "./pages/AdminCompanyRequests";
import { CompanyDetails } from "./pages/CompanyDetails";
import { RoleManagement } from "./pages/RoleManagement";
import { UserManagement } from "./pages/UserManagement";
import { SystemSettings } from "./pages/SystemSettings";
import { AuditLogs } from "./pages/AuditLogs";
import { Help } from "./pages/Help";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RoleSelection,
  },
  {
    path: "/select-role",
    Component: RoleSelection,
  },
  {
    path: "/employee/login",
    Component: EmployeeLogin,
  },
  {
    path: "/hr/login",
    Component: HRLogin,
  },
  {
    path: "/admin/login",
    Component: AdminLogin,
  },
  {
    path: "/careers",
    Component: PublicJobListing,
  },
  {
    path: "/careers/:id/apply",
    Component: PublicJobApplication,
  },
  {
    path: "/admin/companies",
    Component: AdminCompanyRequests,
  },
  {
    path: "/admin/companies/:id",
    Component: CompanyDetails,
  },
  {
    path: "/admin/roles",
    Component: RoleManagement,
  },
  {
    path: "/admin/users",
    Component: UserManagement,
  },
  {
    path: "/admin/settings",
    Component: SystemSettings,
  },
  {
    path: "/admin/logs",
    Component: AuditLogs,
  },
  {
    path: "/help",
    Component: Help,
  },
  {
    path: "/employee/dashboard",
    Component: EmployeeDashboard,
  },
  {
    path: "/employee/profile",
    Component: MyProfile,
  },
  {
    path: "/employee/department",
    Component: MyDepartment,
  },
  {
    path: "/employee/leave",
    Component: EmployeeLeaveManagement,
  },
  {
    path: "/employee/performance",
    Component: EmployeePerformance,
  },
  {
    path: "/employee/evaluation/:type/:id",
    Component: EmployeeEvaluationForm,
  },
  {
    path: "/employee/performance/results/:id",
    Component: PerformanceResults,
  },
  {
    path: "/employee/equipment",
    Component: Equipment,
  },
  {
    path: "/employee/payslip/:id",
    Component: Payslip,
  },
  {
    path: "/employee/notifications",
    Component: Notifications,
  },
  {
    path: "/employee/settings",
    Component: EmployeeSettings,
  },
  {
    path: "/hr/dashboard",
    Component: HRDashboard,
  },
  {
    path: "/admin/dashboard",
    Component: Dashboard,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/notifications",
    Component: Notifications,
  },
  {
    path: "/employees",
    Component: EmployeeManagement,
  },
  {
    path: "/employees/new",
    Component: CreateEmployee,
  },
  {
    path: "/employees/import",
    Component: BulkImport,
  },
  {
    path: "/employees/:id",
    Component: EmployeeProfile,
  },
  {
    path: "/departments",
    Component: DepartmentManagement,
  },
  {
    path: "/departments/new",
    Component: DepartmentForm,
  },
  {
    path: "/departments/:id/edit",
    Component: DepartmentForm,
  },
  {
    path: "/leave",
    Component: LeaveManagement,
  },
  {
    path: "/leave/:id",
    Component: LeaveDetail,
  },
  {
    path: "/performance",
    Component: PerformanceManagement,
  },
  {
    path: "/performance/builder",
    Component: EvaluationBuilder,
  },
  {
    path: "/performance/structure",
    Component: EvaluationStructure,
  },
  {
    path: "/performance/results-table",
    Component: PerformanceResultsTable,
  },
  {
    path: "/performance/create",
    Component: CreateEvaluationPeriod,
  },
  {
    path: "/performance/assign-peers",
    Component: AssignPeerEvaluators,
  },
  {
    path: "/performance/self-evaluation",
    Component: SelfEvaluation,
  },
  {
    path: "/performance/peer-evaluation/:id",
    Component: PeerEvaluation,
  },
  {
    path: "/performance/manager-evaluation",
    Component: ManagerEvaluation,
  },
  {
    path: "/performance/results/:id",
    Component: PerformanceResults,
  },
  {
    path: "/jobs",
    Component: JobVacancies,
  },
  {
    path: "/jobs/new",
    Component: CreateJob,
  },
  {
    path: "/jobs/:id",
    Component: JobDetails,
  },
  {
    path: "/applicants",
    Component: ApplicantManagement,
  },
  {
    path: "/applicants/:id",
    Component: ApplicantProfile,
  },
  {
    path: "/payroll",
    Component: PayrollDashboard,
  },
  {
    path: "/payroll/generate",
    Component: PayrollGeneration,
  },
  {
    path: "/payroll/import",
    Component: PayrollImport,
  },
  {
    path: "/payroll/:id/review",
    Component: PayrollReview,
  },
  {
    path: "/payroll/:id/approve",
    Component: PayrollApproval,
  },
  {
    path: "/payslip/:id",
    Component: Payslip,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);