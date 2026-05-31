import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router";
import { Login } from "../app/pages/Login";
import { ForceChangePassword } from "../app/pages/ForceChangePassword";
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
import { PublicJobDetail } from "../app/pages/PublicJobDetail";
import { PublicJobApplication } from "../app/pages/PublicJobApplication";
import { PayrollDashboard } from "../app/pages/PayrollDashboard";
import { PayrollGeneration } from "../app/pages/PayrollGeneration";
import { PayrollImport } from "../app/pages/PayrollImport";
import { PayrollReview } from "../app/pages/PayrollReview";
import { PayrollApproval } from "../app/pages/PayrollApproval";
import { Payslip } from "../app/pages/Payslip";
import { Notifications } from "../app/pages/Notifications";
import { CompanyManagement } from "../app/pages/CompanyManagement";

import { AdminDashboard } from "../app/pages/AdminDashboard";
import { SystemSettings } from "../app/pages/SystemSettings";
import { AuditLogs } from "../app/pages/AuditLogs";
import { Help } from "../app/pages/Help";
import { Profile } from "../app/pages/Profile";
import { NotFound } from "../app/pages/NotFound";
import { admin, authenticated, employee, hr, permitted } from "./guards";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/change-password", element: <ForceChangePassword /> },
  { path: "/select-role", element: <Navigate to="/login" replace /> },
  { path: "/employee/login", element: <EmployeeLogin /> },
  { path: "/hr/login", element: <HRLogin /> },
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/careers", element: <PublicJobListing /> },
  { path: "/careers/:id", element: <PublicJobDetail /> },
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

  { path: "/employees", element: permitted("manage_employees", <EmployeeManagement />) },
  { path: "/employees/new", element: permitted("manage_employees", <CreateEmployee />) },
  { path: "/employees/import", element: permitted("manage_employees", <BulkImport />) },
  { path: "/employees/:id", element: permitted("manage_employees", <EmployeeProfile />) },
  { path: "/departments", element: permitted("manage_employees", <DepartmentManagement />) },
  { path: "/departments/new", element: permitted("manage_employees", <DepartmentForm />) },
  { path: "/departments/:id/edit", element: permitted("manage_employees", <DepartmentForm />) },
  { path: "/leave", element: permitted("approve_leave", <LeaveManagement />) },
  { path: "/leave/:id", element: permitted("approve_leave", <LeaveDetail />) },
  { path: "/performance", element: permitted("manage_performance_reviews", <PerformanceManagement />) },
  { path: "/performance/builder", element: permitted("performance_create", <EvaluationBuilder />) },
  { path: "/performance/structure", element: permitted("performance_create", <EvaluationStructure />) },
  { path: "/performance/results-table", element: permitted("manage_performance_reviews", <PerformanceResultsTable />) },
  { path: "/performance/create", element: permitted("performance_create", <CreateEvaluationPeriod />) },
  { path: "/performance/assign-peers", element: permitted("performance_create", <AssignPeerEvaluators />) },
  { path: "/performance/self-evaluation", element: permitted("performance_evaluate", <SelfEvaluation />) },
  { path: "/performance/peer-evaluation/:id", element: permitted("performance_evaluate", <PeerEvaluation />) },
  { path: "/performance/manager-evaluation", element: permitted("performance_evaluate", <ManagerEvaluation />) },
  { path: "/performance/results/:id", element: permitted("manage_performance_reviews", <PerformanceResults />) },
  { path: "/jobs", element: permitted("manage_employees", <JobVacancies />) },
  { path: "/jobs/new", element: permitted("manage_employees", <CreateJob />) },
  { path: "/jobs/:id", element: permitted("manage_employees", <JobDetails />) },
  { path: "/applicants", element: permitted("manage_employees", <ApplicantManagement />) },
  { path: "/applicants/:id", element: permitted("manage_employees", <ApplicantProfile />) },
  { path: "/payroll", element: permitted("manage_payroll", <PayrollDashboard />) },
  { path: "/payroll/generate", element: permitted("manage_payroll", <PayrollGeneration />) },
  { path: "/payroll/import", element: permitted("manage_payroll", <PayrollImport />) },
  { path: "/payroll/:id/review", element: permitted("manage_payroll", <PayrollReview />) },
  { path: "/payroll/:id/approve", element: permitted("manage_payroll", <PayrollApproval />) },
  { path: "/payslip/:id", element: authenticated(<Payslip />) },

  // Platform admin UI (deferred backend — routes kept behind admin portal)
  { path: "/admin/companies", element: admin(<CompanyManagement />) },

  { path: "/admin/permissions", element: admin(<AdminDashboard />) },
  { path: "/admin/settings", element: admin(<SystemSettings />) },
  { path: "/admin/logs", element: admin(<AuditLogs />) },

  { path: "*", element: <NotFound /> },
]);
