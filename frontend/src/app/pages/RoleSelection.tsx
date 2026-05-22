import { useNavigate } from "react-router";
import { Users, Briefcase, Shield } from "lucide-react";

export function RoleSelection() {
  const navigate = useNavigate();

  const roles = [
    {
      id: "employee",
      title: "Employee",
      description: "Access your personal info, leaves, and performance",
      icon: Users,
      color: "from-[#06B6D4] to-[#06B6D4]",
      path: "/employee/login",
    },
    {
      id: "hr",
      title: "HR",
      description: "Manage employees, recruitment, and evaluations",
      icon: Briefcase,
      color: "from-[#4F46E5] to-[#4338CA]",
      path: "/hr/login",
    },
    {
      id: "admin",
      title: "Admin",
      description: "Full system control and configuration",
      icon: Shield,
      color: "from-[#22C55E] to-[#22C55E]",
      path: "/admin/login",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#EEF2FF] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl text-[#111827] mb-3">Welcome to HR System</h1>
          <p className="text-lg text-[#6B7280]">Select your role to continue</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => navigate(role.path)}
                className="bg-white rounded-2xl p-8 border-2 border-[#E5E7EB] hover:border-[#4F46E5] hover:shadow-2xl transition-all duration-300 text-left group"
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${role.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl text-[#111827] mb-3 group-hover:text-[#4F46E5] transition-colors">
                  {role.title}
                </h2>

                {/* Description */}
                <p className="text-[#6B7280] leading-relaxed">{role.description}</p>

                {/* Arrow */}
                <div className="mt-6 flex items-center text-[#4F46E5] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm mr-2">Continue</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-[#6B7280]">
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
}
