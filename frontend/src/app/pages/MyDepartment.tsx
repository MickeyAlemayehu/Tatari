import { Users, Mail, Phone, MapPin, Briefcase, Building2 } from "lucide-react";
import { AppLayout } from "../components/AppLayout";

export function MyDepartment() {
  const department = {
    name: "Engineering",
    description: "Software development and technical innovation team",
    location: "Building A, 3rd Floor",
    headCount: 24,
  };

  const manager = {
    name: "Sarah Johnson",
    position: "Engineering Manager",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 234-5678",
    avatar: "SJ",
  };

  const teamMembers = [
    {
      id: 1,
      name: "Michael Chen",
      position: "Senior Developer",
      email: "michael.chen@company.com",
      avatar: "MC",
    },
    {
      id: 2,
      name: "Emily Davis",
      position: "Frontend Developer",
      email: "emily.davis@company.com",
      avatar: "ED",
    },
    {
      id: 3,
      name: "James Wilson",
      position: "Backend Developer",
      email: "james.wilson@company.com",
      avatar: "JW",
    },
    {
      id: 4,
      name: "Lisa Anderson",
      position: "DevOps Engineer",
      email: "lisa.anderson@company.com",
      avatar: "LA",
    },
    {
      id: 5,
      name: "Robert Martinez",
      position: "QA Engineer",
      email: "robert.martinez@company.com",
      avatar: "RM",
    },
    {
      id: 6,
      name: "Jennifer Lee",
      position: "UI/UX Designer",
      email: "jennifer.lee@company.com",
      avatar: "JL",
    },
  ];

  return (
    <AppLayout title="My Department" subtitle="Your team and department information">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Department Info Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] mb-6">
            <div className="p-6">
              <div className="flex items-start gap-6">
                {/* Department Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <Building2 className="w-10 h-10" />
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl text-[#111827] mb-2">{department.name}</h2>
                  <p className="text-[#6B7280] mb-4">{department.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <MapPin className="w-4 h-4" />
                      <span>{department.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Users className="w-4 h-4" />
                      <span>{department.headCount} Team Members</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Department Manager */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] mb-6">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-[#111827]">Department Manager</h3>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Manager Avatar */}
                <div className="w-16 h-16 bg-gradient-to-br from-[#06B6D4] to-[#06B6D4] rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <span className="text-xl">{manager.avatar}</span>
                </div>

                <div className="flex-1">
                  <h4 className="text-lg text-[#111827] mb-1">{manager.name}</h4>
                  <p className="text-sm text-[#6B7280] mb-4">{manager.position}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-[#6B7280]" />
                      <a
                        href={`mailto:${manager.email}`}
                        className="text-sm text-[#4F46E5] hover:text-[#4338CA]"
                      >
                        {manager.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-[#6B7280]" />
                      <span className="text-sm text-[#6B7280]">{manager.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-[#111827]">Team Members</h3>
              <p className="text-sm text-[#6B7280]">Your colleagues in {department.name}</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] hover:border-[#4F46E5] transition"
                  >
                    <div className="flex items-start gap-3">
                      {/* Member Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white flex-shrink-0">
                        <span className="text-sm">{member.avatar}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-[#111827] mb-1 truncate">
                          {member.name}
                        </h4>
                        <p className="text-xs text-[#6B7280] mb-2">{member.position}</p>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-[#6B7280] flex-shrink-0" />
                          <a
                            href={`mailto:${member.email}`}
                            className="text-xs text-[#4F46E5] hover:text-[#4338CA] truncate"
                          >
                            {member.email}
                          </a>
                        </div>
                      </div>
                    </div>
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
