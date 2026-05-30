import { useEffect, useState } from "react";
import { User, Mail, Briefcase, Save, Edit2, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../../contexts/AuthContext";
import { employeesService } from "../../services/employees.service";
import { changeMyPassword } from "../../services/auth.service";
import { ApiError } from "../../lib/api";
import { formatDate, initials } from "../../lib/utils";

export function MyProfile() {
  const { employee, refreshUser, hasPermission } = useAuth();
  const canEditProfile = hasPermission("manage_employees");

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

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    if (!passwordSuccess) return;
    const t = setTimeout(() => setPasswordSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [passwordSuccess]);

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!passwordForm.currentPassword) {
      setPasswordError("Enter your current password.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError("New password must differ from the current password.");
      return;
    }

    setPasswordSaving(true);
    try {
      await changeMyPassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordSuccess("Password updated successfully.");
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Failed to update password.");
    } finally {
      setPasswordSaving(false);
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
          {employee.must_change_password && (
            <div className="mb-4 rounded-lg border border-[#F59E0B]/20 bg-[#FFFBEB] px-4 py-3 text-sm text-[#D97706] font-medium flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              You must change your default password to continue using the application.
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
                {canEditProfile && (
                  <button
                    onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm disabled:opacity-60"
                  >
                    {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    {saving ? "Saving..." : isEditing ? "Save" : "Edit"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-[#6B7280] flex items-center gap-1">
                  <User className="w-3 h-3" /> First name
                </span>
                <input
                  disabled={!canEditProfile || !isEditing}
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-[#E5E7EB] rounded-lg disabled:bg-[#F9FAFB]"
                />
              </label>
              <label className="block">
                <span className="text-sm text-[#6B7280]">Last name</span>
                <input
                  disabled={!canEditProfile || !isEditing}
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
                  disabled={!canEditProfile || !isEditing}
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
                  disabled={!canEditProfile || !isEditing}
                  value={profile.position}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-[#E5E7EB] rounded-lg disabled:bg-[#F9FAFB]"
                />
              </label>
            </div>
            <p className="text-sm text-[#6B7280]">
              Department: {profile.department} · Joined {profile.joinDate}
            </p>
            {!canEditProfile && (
              <p className="text-xs text-[#6B7280]">
                Profile details are managed by HR. Contact your manager if anything is incorrect.
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-[#4F46E5]" />
              <h3 className="text-lg text-[#111827]">Change Password</h3>
            </div>
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-[#DCFCE7] border border-green-200 rounded-lg flex items-start gap-2 text-sm text-[#22C55E]">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="mb-4 rounded-lg border border-[#EF4444]/20 bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
                {passwordError}
              </div>
            )}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <label className="block">
                <span className="text-sm text-[#6B7280]">Current password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="mt-1 w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-[#6B7280]">New password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-[#6B7280]">Confirm new password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {passwordSaving ? "Saving..." : "Update password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
