import { createBrowserRouter } from "react-router-dom";
import { RoleSelection } from "./pages/RoleSelection.js";
import { EmployeeLogin } from "./pages/EmployeeLogin.js";
import { HRLogin } from "./pages/HRLogin.js";
import { AdminLogin } from "./pages/AdminLogin.js";
import { Dashboard } from "./pages/Dashboard.js";
import { EmployeeDashboard } from "./pages/EmployeeDashboard.js";
import { HRDashboard } from "./pages/HRDashboard.js";
import { MyProfile } from "./pages/MyProfile.js";
import { MyDepartment } from "./pages/MyDepartment.js";
import { Equipment } from "./pages/Equipment.js";
import { EmployeeSettings } from "./pages/EmployeeSettings.js";
import { EmployeeManagement } from "./pages/EmployeeManagement.js";
import { EmployeeProfile } from "./pages/EmployeeProfile.js";
import { CreateEmployee } from "./pages/CreateEmployee.js";
import { BulkImport } from "./pages/BulkImport.js";
import { DepartmentManagement } from "./pages/DepartmentManagement.js";
import { DepartmentForm } from "./pages/DepartmentForm.js";
import { LeaveManagement } from "./pages/LeaveManagement.js";
import { EmployeeLeaveManagement } from "./pages/EmployeeLeaveManagement.js";
import { LeaveDetail } from "./pages/LeaveDetail.js";
import { PerformanceManagement } from "./pages/PerformanceManagement.js";
import { PerformanceEvaluation } from "./pages/PerformanceEvaluation.js";
import { EmployeePerformance } from "./pages/EmployeePerformance.js";
import { EmployeeEvaluationForm } from "./pages/EmployeeEvaluationForm.js";
import { CreateEvaluationPeriod } from "./pages/CreateEvaluationPeriod.js";
import { EvaluationBuilder } from "./pages/EvaluationBuilder.js";
import { EvaluationStructure } from "./pages/EvaluationStructure.js";
import { PerformanceResultsTable } from "./pages/PerformanceResultsTable.js";
import { AssignPeerEvaluators } from "./pages/AssignPeerEvaluators.js";
import { SelfEvaluation } from "./pages/SelfEvaluation.js";
import { PeerEvaluation } from "./pages/PeerEvaluation.js";
import { ManagerEvaluation } from "./pages/ManagerEvaluation.js";
import { PerformanceResults } from "./pages/PerformanceResults.js";
import { JobVacancies } from "./pages/JobVacancies.js";
import { CreateJob } from "./pages/CreateJob.js";
import { JobDetails } from "./pages/JobDetails.js";
import { ApplicantManagement } from "./pages/ApplicantManagement.js";
import { ApplicantProfile } from "./pages/ApplicantProfile.js";
import { PublicJobListing } from "./pages/PublicJobListing.js";
import { PublicJobApplication } from "./pages/PublicJobApplication.js";
import { PayrollDashboard } from "./pages/PayrollDashboard.js";
import { PayrollGeneration } from "./pages/PayrollGeneration.js";
import { PayrollImport } from "./pages/PayrollImport.js";
import { PayrollReview } from "./pages/PayrollReview.js";
import { PayrollApproval } from "./pages/PayrollApproval.js";
import { Payslip } from "./pages/Payslip.js";
import { Notifications } from "./pages/Notifications.js";
import { AdminCompanyRequests } from "./pages/AdminCompanyRequests.js";
import { CompanyDetails } from "./pages/CompanyDetails.js";
import { RoleManagement } from "./pages/RoleManagement.js";
import { UserManagement } from "./pages/UserManagement.js";
import { SystemSettings } from "./pages/SystemSettings.js";
import { AuditLogs } from "./pages/AuditLogs.js";
import { Help } from "./pages/Help.js";
import { Profile } from "./pages/Profile.js";
import { NotFound } from "./pages/NotFound.js";

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