import { useEffect, useState } from "react";
import { Users, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { AsyncState } from "../components/AsyncState";
import { useAuth } from "../../contexts/AuthContext";
import { departmentsService } from "../../services/departments.service";
import { employeesService } from "../../services/employees.service";
import { ApiError } from "../../lib/api";
import { initials } from "../../lib/utils";

export function MyDepartment() {
  const { employee } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [department, setDepartment] = useState({
    name: "",
    description: "",
    location: "—",
    headCount: 0,
  });
  const [manager, setManager] = useState<{
    name: string;
    position: string;
    email: string;
    phone: string;
    avatar: string;
  } | null>(null);
  const [teamMembers, setTeamMembers] = useState<
    { id: number; name: string; position: string; email: string; avatar: string }[]
  >([]);

  useEffect(() => {
    if (!employee?.department_id) {
      setLoading(false);
      setError("You are not assigned to a department.");
      return;
    }

    const deptId = employee.department_id;
    Promise.all([departmentsService.get(deptId), employeesService.list({ per_page: 200 })])
      .then(([dept, employeesRes]) => {
        const team = employeesRes.data.filter((e) => e.department_id === deptId);
        setDepartment({
          name: dept.name,
          description: dept.description ?? "—",
          location: "—",
          headCount: team.length,
        });
        setTeamMembers(
          team.map((e) => ({
            id: e.id,
            name: `${e.first_name} ${e.last_name}`,
            position: e.position ?? "—",
            email: e.email,
            avatar: initials(e.first_name, e.last_name),
          }))
        );
        const mgrName = dept.manager;
        if (mgrName) {
          const mgr = team.find((e) => `${e.first_name} ${e.last_name}` === mgrName);
          setManager({
            name: mgrName,
            position: mgr?.position ?? "Department Manager",
            email: mgr?.email ?? "—",
            phone: "—",
            avatar: mgr
              ? initials(mgr.first_name, mgr.last_name)
              : mgrName.slice(0, 2).toUpperCase(),
          });
        }
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load department.")
      )
      .finally(() => setLoading(false));
  }, [employee?.department_id]);

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
