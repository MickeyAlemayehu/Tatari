import { useEffect, useState } from "react";
import { Users, Mail, Phone, Building2 } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { AsyncState } from "../components/AsyncState";
import { useAuth } from "../../contexts/AuthContext";
import { departmentsService } from "../../services/departments.service";
import { ApiError } from "../../lib/api";
import { initials } from "../../lib/utils";

type ManagerView = {
  name: string;
  position: string;
  email: string;
  phone: string;
  avatar: string;
};

type TeamMember = {
  id: number;
  name: string;
  position: string;
  email: string;
  avatar: string;
};

export function MyDepartment() {
  const { employee } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [department, setDepartment] = useState({
    name: "",
    description: "",
    headCount: 0,
  });
  const [manager, setManager] = useState<ManagerView | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (!employee) return;

    setLoading(true);
    setError(null);

    departmentsService
      .mine()
      .then((dept) => {
        setDepartment({
          name: dept.name,
          description: dept.description ?? "—",
          headCount: dept.employeeCount,
        });

        setTeamMembers(
          dept.team.map((m) => ({
            id: m.id,
            name: `${m.first_name} ${m.last_name}`.trim(),
            position: m.position ?? "—",
            email: m.email ?? "—",
            avatar: initials(m.first_name, m.last_name),
          }))
        );

        if (dept.manager) {
          const [firstName = "", lastName = ""] = dept.manager.name.split(" ");
          setManager({
            name: dept.manager.name,
            position: dept.manager.position ?? "Department Manager",
            email: dept.manager.email ?? "—",
            phone: "—",
            avatar: initials(firstName, lastName) || dept.manager.name.slice(0, 2).toUpperCase(),
          });
        } else {
          setManager(null);
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setError("You are not assigned to a department.");
        } else {
          setError(err instanceof ApiError ? err.message : "Failed to load department.");
        }
      })
      .finally(() => setLoading(false));
  }, [employee]);

  return (
    <AppLayout title="My Department" subtitle="Your team and department information">
      <div className="p-6">
        <AsyncState loading={loading} error={error}>
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl border border-[#E5E7EB] mb-6">
              <div className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    <Building2 className="w-10 h-10" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl text-[#111827] mb-2">{department.name}</h2>
                    <p className="text-[#6B7280] mb-4">{department.description}</p>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Users className="w-4 h-4" />
                      <span>{department.headCount} Team Members</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {manager && (
              <div className="bg-white rounded-xl border border-[#E5E7EB] mb-6">
                <div className="px-6 py-4 border-b border-[#E5E7EB]">
                  <h3 className="text-[#111827]">Department Manager</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-xl">
                      {manager.avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg text-[#111827] mb-1">{manager.name}</h4>
                      <p className="text-sm text-[#6B7280] mb-3">{manager.position}</p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                          <Mail className="w-4 h-4" />
                          <span>{manager.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                          <Phone className="w-4 h-4" />
                          <span>{manager.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-[#E5E7EB]">
              <div className="px-6 py-4 border-b border-[#E5E7EB]">
                <h3 className="text-[#111827]">Team Members</h3>
                <p className="text-sm text-[#6B7280]">
                  {teamMembers.length} colleagues in your department
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 border border-[#E5E7EB] rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-[#EEF2FF] rounded-full flex items-center justify-center text-[#4F46E5]">
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="text-sm text-[#111827]">{member.name}</h4>
                        <p className="text-xs text-[#6B7280]">{member.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AsyncState>
      </div>
    </AppLayout>
  );
}
