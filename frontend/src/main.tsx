import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { RoleSelection } from "./app/pages/RoleSelection";
import { EmployeeLogin } from "./app/pages/EmployeeLogin";
import { HRLogin } from "./app/pages/HRLogin";
import { AdminLogin }from "./app/pages/AdminLogin";
import { Dashboard }from "./app/pages/Dashboard";
import { EmployeeDashboard } from "./app/pages/EmployeeDashboard";
import { HRDashboard } from "./app/pages/HRDashboard";
import { MyProfile }from "./app/pages/MyProfile";
import { MyDepartment }from "./app/pages/MyDepartment";
import { Equipment } from "./app/pages/Equipment";
import { EmployeeSettings }from "./app/pages/EmployeeSettings";
import { EmployeeManagement } from "./app/pages/EmployeeManagement";
import { EmployeeProfile } from "./app/pages/EmployeeProfile";
import { CreateEmployee } from "./app/pages/CreateEmployee";
import { BulkImport } from "./app/pages/BulkImport";
import { DepartmentManagement } from "./app/pages/DepartmentManagement";
import { DepartmentForm } from "./app/pages/DepartmentForm";
import { LeaveManagement } from "./app/pages/LeaveManagement";
import { EmployeeLeaveManagement } from "./app/pages/EmployeeLeaveManagement";
import { LeaveDetail } from "./app/pages/LeaveDetail";
import { PerformanceManagement } from "./app/pages/PerformanceManagement";
import { PerformanceEvaluation } from "./app/pages/PerformanceEvaluation";
import { EmployeePerformance } from "./app/pages/EmployeePerformance";
import { EmployeeEvaluationForm } from "./app/pages/EmployeeEvaluationForm";
import { CreateEvaluationPeriod } from "./app/pages/CreateEvaluationPeriod";
import { EvaluationBuilder }from "./app/pages/EvaluationBuilder";
import { EvaluationStructure } from "./app/pages/EvaluationStructure";
import { PerformanceResultsTable } from "./app/pages/PerformanceResultsTable";
import { AssignPeerEvaluators } from "./app/pages/AssignPeerEvaluators";
import { SelfEvaluation } from "./app/pages/SelfEvaluation";
import { PeerEvaluation } from "./app/pages/PeerEvaluation";
import { ManagerEvaluation } from "./app/pages/ManagerEvaluation";
import { PerformanceResults } from "./app/pages/PerformanceResults";
import { JobVacancies } from "./app/pages/JobVacancies";
import { CreateJob } from "./app/pages/CreateJob";
import { JobDetails } from "./app/pages/JobDetails";
import { ApplicantManagement } from "./app/pages/ApplicantManagement";
import { ApplicantProfile } from "./app/pages/ApplicantProfile";
import { PublicJobListing } from "./app/pages/PublicJobListing";
import { PublicJobApplication } from "./app/pages/PublicJobApplication";
import { PayrollDashboard } from "./app/pages/PayrollDashboard";
import { PayrollGeneration } from "./app/pages/PayrollGeneration";
import { PayrollImport }from "./app/pages/PayrollImport";
import { PayrollReview } from "./app/pages/PayrollReview";
import { PayrollApproval } from "./app/pages/PayrollApproval";
import { Payslip } from "./app/pages/Payslip";
import { Notifications } from "./app/pages/Notifications";
import { AdminCompanyRequests } from "./app/pages/AdminCompanyRequests";
import { CompanyDetails } from "./app/pages/CompanyDetails";
import { RoleManagement } from "./app/pages/RoleManagement";
import { UserManagement } from "./app/pages/UserManagement";
import { SystemSettings } from "./app/pages/SystemSettings";
import { AuditLogs } from "./app/pages/AuditLogs";
import { Help } from "./app/pages/Help";
import { Profile } from "./app/pages/Profile";
import { NotFound } from "./app/pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RoleSelection />,
  },
  {
  path: "/employee/login",
  element: <EmployeeLogin />,
},
{
  path: "/hr/login",
  element: <HRLogin />,
},
{
  path: "/admin/login",
  element: <AdminLogin />,
},
{
  path: "/careers",
  element: <PublicJobListing />,
},
{
  path: "/careers/:id/apply",
  element: <PublicJobApplication />,
},
 {
  path: "/admin/companies",
  element: <AdminCompanyRequests />,
},
 {
  path: "/admin/companies/:id",
  element: <CompanyDetails />,
},
{
  path: "/admin/roles",
  element: <RoleManagement />,
},
{
  path: "/admin/users",
  element: <UserManagement />,
},
{
  path: "/admin/settings",
  element: <SystemSettings />,
},
{
  path: "/admin/logs",
  element: <AuditLogs />,
},
{
  path: "/help",
  element: <Help />,
},
{
  path: "/employee/dashboard",
  element: <EmployeeDashboard />,
},
{
  path: "/employee/profile",
  element: <MyProfile />,
},



]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);