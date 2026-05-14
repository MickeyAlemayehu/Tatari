import { useNavigate, useParams } from "react-router";
import {
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Edit,
  User,
  Award,
  Laptop,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

// Employee database
const employeeDatabase: Record<string, any> = {
  "1": {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1992-05-15",
    employeeId: "EMP-2023-1001",
    department: "Engineering",
    role: "Senior Developer",
    status: "active",
    joinDate: "2023-01-15",
    reportingManager: "Michael Chen",
    address: "123 Main Street, Apt 4B",
    city: "San Francisco",
    state: "California",
    zipCode: "94102",
    avatar: "SJ",
    leaveHistory: [
      {
        id: 1,
        type: "Annual Leave",
        startDate: "2026-04-15",
        endDate: "2026-04-19",
        days: 5,
        status: "approved",
        approvedBy: "Michael Chen",
      },
      {
        id: 2,
        type: "Sick Leave",
        startDate: "2026-03-10",
        endDate: "2026-03-12",
        days: 3,
        status: "approved",
        approvedBy: "Michael Chen",
      },
    ],
    performance: {
      selfEvaluation: 4.2,
      peerEvaluation: 4.5,
      managerEvaluation: 4.3,
      finalScore: 4.3,
      lastReviewDate: "2026-03-15",
    },
    equipment: [
      {
        id: 1,
        name: "MacBook Pro 16-inch",
        category: "Laptop",
        serialNumber: "C02ZH12345678",
        assignedDate: "2023-01-15",
        status: "active",
      },
      {
        id: 2,
        name: "Dell UltraSharp 27-inch Monitor",
        category: "Display",
        serialNumber: "CN-0P2418-74180",
        assignedDate: "2023-01-15",
        status: "active",
      },
    ],
  },
  "2": {
    id: "2",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@company.com",
    phone: "+1 (555) 234-5678",
    dateOfBirth: "1988-08-22",
    employeeId: "EMP-2023-1002",
    department: "Product",
    role: "Product Manager",
    status: "active",
    joinDate: "2023-03-20",
    reportingManager: "Lisa Anderson",
    address: "456 Oak Avenue",
    city: "San Francisco",
    state: "California",
    zipCode: "94103",
    avatar: "MC",
    leaveHistory: [
      {
        id: 1,
        type: "Annual Leave",
        startDate: "2026-05-01",
        endDate: "2026-05-05",
        days: 5,
        status: "pending",
        approvedBy: null,
      },
    ],
    performance: {
      selfEvaluation: 4.5,
      peerEvaluation: 4.7,
      managerEvaluation: 4.6,
      finalScore: 4.6,
      lastReviewDate: "2026-03-20",
    },
    equipment: [
      {
        id: 1,
        name: "MacBook Air M2",
        category: "Laptop",
        serialNumber: "C02AB98765432",
        assignedDate: "2023-03-20",
        status: "active",
      },
    ],
  },
  "3": {
    id: "3",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@company.com",
    phone: "+1 (555) 345-6789",
    dateOfBirth: "1995-03-10",
    employeeId: "EMP-2023-1003",
    department: "Design",
    role: "UX Designer",
    status: "on-leave",
    joinDate: "2023-02-10",
    reportingManager: "Sarah Johnson",
    address: "789 Pine Street",
    city: "San Francisco",
    state: "California",
    zipCode: "94104",
    avatar: "ED",
    leaveHistory: [
      {
        id: 1,
        type: "Maternity Leave",
        startDate: "2026-04-01",
        endDate: "2026-07-01",
        days: 90,
        status: "approved",
        approvedBy: "Sarah Johnson",
      },
    ],
    performance: {
      selfEvaluation: 4.0,
      peerEvaluation: 4.2,
      managerEvaluation: 4.1,
      finalScore: 4.1,
      lastReviewDate: "2026-02-28",
    },
    equipment: [
      {
        id: 1,
        name: "MacBook Pro 14-inch",
        category: "Laptop",
        serialNumber: "C02CD11223344",
        assignedDate: "2023-02-10",
        status: "active",
      },
      {
        id: 2,
        name: "Wacom Tablet",
        category: "Accessory",
        serialNumber: "WAC-12345",
        assignedDate: "2023-02-10",
        status: "active",
      },
    ],
  },
  "4": {
    id: "4",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@company.com",
    phone: "+1 (555) 456-7890",
    dateOfBirth: "1990-11-05",
    employeeId: "EMP-2023-1004",
    department: "Marketing",
    role: "Marketing Specialist",
    status: "active",
    joinDate: "2023-03-28",
    reportingManager: "Lisa Anderson",
    address: "321 Maple Drive",
    city: "San Francisco",
    state: "California",
    zipCode: "94105",
    avatar: "JW",
    leaveHistory: [
      {
        id: 1,
        type: "Annual Leave",
        startDate: "2026-06-15",
        endDate: "2026-06-20",
        days: 6,
        status: "approved",
        approvedBy: "Lisa Anderson",
      },
    ],
    performance: {
      selfEvaluation: 3.8,
      peerEvaluation: 4.0,
      managerEvaluation: 3.9,
      finalScore: 3.9,
      lastReviewDate: "2026-03-28",
    },
    equipment: [
      {
        id: 1,
        name: "Dell XPS 15",
        category: "Laptop",
        serialNumber: "DL-XPS-99887",
        assignedDate: "2023-03-28",
        status: "active",
      },
    ],
  },
};

export function EmployeeProfile() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Get employee data by ID, fallback to employee 1
  const employee = employeeDatabase[id || "1"] || employeeDatabase["1"];

  return (
    <AppLayout title="Employee Profile" subtitle="View employee details">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <button
                onClick={() => navigate("/hr/dashboard")}
                className="hover:text-[#4F46E5] transition"
              >
                Dashboard
              </button>
              <span>/</span>
              <button
                onClick={() => navigate("/employees")}
                className="hover:text-[#4F46E5] transition"
              >
                Employees
              </button>
              <span>/</span>
              <span className="text-[#111827]">
                {employee.firstName} {employee.lastName}
              </span>
            </div>
          </div>

          {/* Profile Header Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">
                  {employee.avatar}
                </div>

                {/* Basic Info */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl text-[#111827]">
                      {employee.firstName} {employee.lastName}
                    </h2>
                    <Badge variant={employee.status === "active" ? "success" : "warning"}>
                      {employee.status === "active" ? "Active" : "On Leave"}
                    </Badge>
                  </div>
                  <p className="text-[#6B7280] mb-4">
                    {employee.role} • {employee.department}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Mail className="w-4 h-4" />
                      {employee.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Phone className="w-4 h-4" />
                      {employee.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(employee.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/employees/${employee.id}/edit`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-[#111827]">Personal Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Employee ID</p>
                  <p className="text-sm text-[#111827]">{employee.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Date of Birth</p>
                  <p className="text-sm text-[#111827]">
                    {new Date(employee.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Address</p>
                  <p className="text-sm text-[#111827]">
                    {employee.address}, {employee.city}, {employee.state} {employee.zipCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-[#111827]">Employment Details</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Department</p>
                  <p className="text-sm text-[#111827]">{employee.department}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Position</p>
                  <p className="text-sm text-[#111827]">{employee.role}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Reporting Manager</p>
                  <p className="text-sm text-[#111827]">{employee.reportingManager}</p>
                </div>
              </div>
            </div>

            {/* Leave History */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#4F46E5]" />
                  <h3 className="text-[#111827]">Leave History</h3>
                </div>
                <button
                  onClick={() => navigate("/leave")}
                  className="text-sm text-[#4F46E5] hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {employee.leaveHistory.map((leave: any) => (
                  <div
                    key={leave.id}
                    className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-[#111827]">{leave.type}</p>
                      <Badge
                        variant={
                          leave.status === "approved"
                            ? "success"
                            : leave.status === "rejected"
                            ? "danger"
                            : "warning"
                        }
                        size="sm"
                      >
                        {leave.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      {new Date(leave.startDate).toLocaleDateString()} -{" "}
                      {new Date(leave.endDate).toLocaleDateString()} ({leave.days} days)
                    </p>
                    {leave.approvedBy && (
                      <p className="text-xs text-[#6B7280] mt-1">Approved by {leave.approvedBy}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Evaluation */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-[#4F46E5]" />
                  <h3 className="text-[#111827]">Performance Evaluation</h3>
                </div>
                <button
                  onClick={() => navigate("/performance")}
                  className="text-sm text-[#4F46E5] hover:underline"
                >
                  View Details
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#6B7280]">Self Evaluation</p>
                    <p className="text-sm text-[#111827]">{employee.performance.selfEvaluation}/5.0</p>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#4F46E5] to-[#4338CA] h-2 rounded-full"
                      style={{
                        width: `${(employee.performance.selfEvaluation / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#6B7280]">Peer Evaluation</p>
                    <p className="text-sm text-[#111827]">{employee.performance.peerEvaluation}/5.0</p>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#06B6D4] to-[#06B6D4] h-2 rounded-full"
                      style={{
                        width: `${(employee.performance.peerEvaluation / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#6B7280]">Manager Evaluation</p>
                    <p className="text-sm text-[#111827]">
                      {employee.performance.managerEvaluation}/5.0
                    </p>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#22C55E] to-[#22C55E] h-2 rounded-full"
                      style={{
                        width: `${(employee.performance.managerEvaluation / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#111827]">Final Score</p>
                    <p className="text-lg text-[#4F46E5]">{employee.performance.finalScore}/5.0</p>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Last reviewed:{" "}
                    {new Date(employee.performance.lastReviewDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Assigned Equipment */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Laptop className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-[#111827]">Assigned Equipment</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {employee.equipment.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-lg flex items-center justify-center">
                        <Laptop className="w-5 h-5 text-white" />
                      </div>
                      <Badge variant="success" size="sm">
                        Active
                      </Badge>
                    </div>
                    <h4 className="text-sm text-[#111827] mb-1">{item.name}</h4>
                    <p className="text-xs text-[#6B7280] mb-2">{item.category}</p>
                    <p className="text-xs text-[#6B7280] font-mono">{item.serialNumber}</p>
                    <p className="text-xs text-[#6B7280] mt-2">
                      Assigned: {new Date(item.assignedDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
