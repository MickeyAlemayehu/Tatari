import { createBrowserRouter } from "react-router-dom";
import { RoleSelection } from "../app/pages/RoleSelection";
import { EmployeeLogin } from "../app/pages/EmployeeLogin";
import { HRLogin } from "../app/pages/HRLogin";
import { AdminLogin } from "../app/pages/AdminLogin";
import { Dashboard } from "../app/pages/Dashboard";
import { EmployeeDashboard } from "../app/pages/EmployeeDashboard";
import { HRDashboard } from "../app/pages/HRDashboard";
import { MyProfile } from "../app/pages/MyProfile";
import { MyDepartment } from "../app/pages/MyDepartment";
import { Equipment } from "../app/pages/Equipment";
import { EmployeeSettings } from "../app/pages/EmployeeSettings";
import { EmployeeManagement } from "../app/pages/EmployeeManagement";
import { EmployeeProfile } from "../app/pages/EmployeeProfile";
import { CreateEmployee } from "../app/pages/CreateEmployee";
import { BulkImport } from "../app/pages/BulkImport";
import { DepartmentManagement } from "../app/pages/DepartmentManagement";
import { DepartmentForm } from "../app/pages/DepartmentForm";
import { LeaveManagement } from "../app/pages/LeaveManagement";
import { EmployeeLeaveManagement } from "../app/pages/EmployeeLeaveManagement";
import { LeaveDetail } from "../app/pages/LeaveDetail";
import { PerformanceManagement } from "../app/pages/PerformanceManagement";
import { EmployeePerformance } from "../app/pages/EmployeePerformance";
import { EmployeeEvaluationForm } from "../app/pages/EmployeeEvaluationForm";
import { CreateEvaluationPeriod } from "../app/pages/CreateEvaluationPeriod";
import { EvaluationBuilder } from "../app/pages/EvaluationBuilder";
import { EvaluationStructure } from "../app/pages/EvaluationStructure";
import { PerformanceResultsTable } from "../app/pages/PerformanceResultsTable";
import { AssignPeerEvaluators } from "../app/pages/AssignPeerEvaluators";
import { SelfEvaluation } from "../app/pages/SelfEvaluation";
import { PeerEvaluation } from "../app/pages/PeerEvaluation";
import { ManagerEvaluation } from "../app/pages/ManagerEvaluation";
import { PerformanceResults } from "../app/pages/PerformanceResults";
import { JobVacancies } from "../app/pages/JobVacancies";
import { CreateJob } from "../app/pages/CreateJob";
import { JobDetails } from "../app/pages/JobDetails";
import { ApplicantManagement } from "../app/pages/ApplicantManagement";
import { ApplicantProfile } from "../app/pages/ApplicantProfile";
import { PublicJobListing } from "../app/pages/PublicJobListing";
import { PublicJobApplication } from "../app/pages/PublicJobApplication";
import { PayrollDashboard } from "../app/pages/PayrollDashboard";
import { PayrollGeneration } from "../app/pages/PayrollGeneration";
import { PayrollImport } from "../app/pages/PayrollImport";
import { PayrollReview } from "../app/pages/PayrollReview";
import { PayrollApproval } from "../app/pages/PayrollApproval";
import { Payslip } from "../app/pages/Payslip";
import { Notifications } from "../app/pages/Notifications";
import { AdminCompanyRequests } from "../app/pages/AdminCompanyRequests";
import { CompanyDetails } from "../app/pages/CompanyDetails";
import { RoleManagement } from "../app/pages/RoleManagement";
import { UserManagement } from "../app/pages/UserManagement";
import { SystemSettings } from "../app/pages/SystemSettings";
import { AuditLogs } from "../app/pages/AuditLogs";
import { Help } from "../app/pages/Help";
import { Profile } from "../app/pages/Profile";
import { NotFound } from "../app/pages/NotFound";
import { admin, authenticated, employee, hr } from "./guards";

export const router = createBrowserRouter([
  { path: "/", element: <RoleSelection /> },
  { path: "/select-role", element: <RoleSelection /> },
  { path: "/employee/login", element: <EmployeeLogin /> },
  { path: "/hr/login", element: <HRLogin /> },
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/careers", element: <PublicJobListing /> },
  { path: "/careers/:id/apply", element: <PublicJobApplication /> },
  { path: "/help", element: <Help /> },

  { path: "/employee/dashboard", element: employee(<EmployeeDashboard />) },
  { path: "/employee/profile", element: employee(<MyProfile />) },
  { path: "/employee/department", element: employee(<MyDepartment />) },
  { path: "/employee/leave", element: employee(<EmployeeLeaveManagement />) },
  { path: "/employee/performance", element: employee(<EmployeePerformance />) },
  { path: "/employee/evaluation/:type/:id", element: employee(<EmployeeEvaluationForm />) },
  { path: "/employee/performance/results/:id", element: employee(<PerformanceResults />) },
  { path: "/employee/equipment", element: employee(<Equipment />) },
  { path: "/employee/payslip/:id", element: employee(<Payslip />) },
  { path: "/employee/notifications", element: employee(<Notifications />) },
  { path: "/employee/settings", element: employee(<EmployeeSettings />) },

  { path: "/hr/dashboard", element: hr(<HRDashboard />) },
  { path: "/admin/dashboard", element: admin(<Dashboard />) },

  { path: "/profile", element: authenticated(<Profile />) },
  { path: "/notifications", element: authenticated(<Notifications />) },

  { path: "/employees", element: hr(<EmployeeManagement />) },
  { path: "/employees/new", element: hr(<CreateEmployee />) },
  { path: "/employees/import", element: hr(<BulkImport />) },
  { path: "/employees/:id", element: hr(<EmployeeProfile />) },
  { path: "/departments", element: hr(<DepartmentManagement />) },
  { path: "/departments/new", element: hr(<DepartmentForm />) },
  { path: "/departments/:id/edit", element: hr(<DepartmentForm />) },
  { path: "/leave", element: hr(<LeaveManagement />) },
  { path: "/leave/:id", element: hr(<LeaveDetail />) },
  { path: "/performance", element: hr(<PerformanceManagement />) },
  { path: "/performance/builder", element: hr(<EvaluationBuilder />) },
  { path: "/performance/structure", element: hr(<EvaluationStructure />) },
  { path: "/performance/results-table", element: hr(<PerformanceResultsTable />) },
  { path: "/performance/create", element: hr(<CreateEvaluationPeriod />) },
  { path: "/performance/assign-peers", element: hr(<AssignPeerEvaluators />) },
  { path: "/performance/self-evaluation", element: hr(<SelfEvaluation />) },
  { path: "/performance/peer-evaluation/:id", element: hr(<PeerEvaluation />) },
  { path: "/performance/manager-evaluation", element: hr(<ManagerEvaluation />) },
  { path: "/performance/results/:id", element: hr(<PerformanceResults />) },
  { path: "/jobs", element: hr(<JobVacancies />) },
  { path: "/jobs/new", element: hr(<CreateJob />) },
  { path: "/jobs/:id", element: hr(<JobDetails />) },
  { path: "/applicants", element: hr(<ApplicantManagement />) },
  { path: "/applicants/:id", element: hr(<ApplicantProfile />) },
  { path: "/payroll", element: hr(<PayrollDashboard />) },
  { path: "/payroll/generate", element: hr(<PayrollGeneration />) },
  { path: "/payroll/import", element: hr(<PayrollImport />) },
  { path: "/payroll/:id/review", element: hr(<PayrollReview />) },
  { path: "/payroll/:id/approve", element: hr(<PayrollApproval />) },
  { path: "/payslip/:id", element: authenticated(<Payslip />) },

  // Platform admin UI (deferred backend — routes kept behind admin portal)
  { path: "/admin/companies", element: admin(<AdminCompanyRequests />) },
  { path: "/admin/companies/:id", element: admin(<CompanyDetails />) },
  { path: "/admin/roles", element: admin(<RoleManagement />) },
  { path: "/admin/users", element: admin(<UserManagement />) },
  { path: "/admin/settings", element: admin(<SystemSettings />) },
  { path: "/admin/logs", element: admin(<AuditLogs />) },

  { path: "*", element: <NotFound /> },
]);
