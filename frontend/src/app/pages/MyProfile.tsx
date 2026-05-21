import { useEffect, useState } from "react";
import { User, Mail, Briefcase, Save, Edit2 } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../../contexts/AuthContext";
import { employeesService } from "../../services/employees.service";
import { ApiError } from "../../lib/api";
import { formatDate, initials } from "../../lib/utils";

export function MyProfile() {
  const { employee, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    department: "",
    employeeId: "",
    joinDate: "",
  });

  useEffect(() => {
    if (!employee) return;
    setProfile({
      firstName: employee.first_name,
      lastName: employee.last_name,
      email: employee.email,
      position: employee.position ?? "—",
      department: employee.department?.name ?? "—",
      employeeId: `EMP-${String(employee.id).padStart(3, "0")}`,
      joinDate: formatDate((employee as { created_at?: string }).created_at),
    });
  }, [employee]);

  const handleSave = async () => {
    if (!employee) return;
    setSaving(true);
    setError(null);
    try {
      await employeesService.update(employee.id, {
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        position: profile.position,
      });
      await refreshUser();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!employee) {
    return (
      <AppLayout title="My Profile" subtitle="Manage your personal information">
        <p className="p-6 text-sm text-[#6B7280]">Please sign in to view your profile.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="My Profile" subtitle="Manage your personal information">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 rounded-lg border border-[#EF4444]/20 bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
              {error}
            </div>
          )}
          <div className="bg-white rounded-xl border border-[#E5E7EB] mb-6">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-2xl">
                    {initials(profile.firstName, profile.lastName)}
                  </div>
                  <div>
                    <h2 className="text-2xl text-[#111827] mb-1">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p className="text-[#6B7280]">{profile.position}</p>
                    <p className="text-sm text-[#6B7280]">Employee ID: {profile.employeeId}</p>
                  </div>
                </div>
                <button
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm disabled:opacity-60"
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  {saving ? "Saving..." : isEditing ? "Save" : "Edit"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-[#6B7280]">First name</span>
                <input
                  disabled={!isEditing}
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-[#E5E7EB] rounded-lg disabled:bg-[#F9FAFB]"
                />
              </label>
              <label className="block">
                <span className="text-sm text-[#6B7280]">Last name</span>
                <input
                  disabled={!isEditing}
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-[#E5E7EB] rounded-lg disabled:bg-[#F9FAFB]"
                />
              </label>
              <label className="block">
                <span className="text-sm text-[#6B7280] flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </span>
                <input
                  disabled={!isEditing}
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-[#E5E7EB] rounded-lg disabled:bg-[#F9FAFB]"
                />
              </label>
              <label className="block">
                <span className="text-sm text-[#6B7280] flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Position
                </span>
                <input
                  disabled={!isEditing}
                  value={profile.position}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-[#E5E7EB] rounded-lg disabled:bg-[#F9FAFB]"
                />
              </label>
            </div>
            <p className="text-sm text-[#6B7280]">
              Department: {profile.department} · Joined {profile.joinDate}
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
