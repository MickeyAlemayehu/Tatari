import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Shield } from "lucide-react";
import { changeMyPassword } from "../../services/auth.service";
import { useAuth } from "../../contexts/AuthContext";
import { ApiError } from "../../lib/api";

export function ForceChangePassword() {
  const navigate = useNavigate();
  const { employee, refreshUser } = useAuth();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordStrength = (pw: string): { label: string; color: string; width: string } => {
    if (!pw) return { label: "", color: "bg-[#E5E7EB]", width: "0%" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-[#EF4444]", width: "25%" };
    if (score === 2) return { label: "Fair", color: "bg-[#F59E0B]", width: "50%" };
    if (score === 3) return { label: "Good", color: "bg-[#3B82F6]", width: "75%" };
    return { label: "Strong", color: "bg-[#22C55E]", width: "100%" };
  };

  const strength = passwordStrength(form.newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.currentPassword) {
      setError("Please enter your current (default) password.");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (form.newPassword === form.currentPassword) {
      setError("New password must be different from the current password.");
      return;
    }

    setSaving(true);
    try {
      await changeMyPassword(form.currentPassword, form.newPassword);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F0FF] via-[#F9FAFB] to-[#EEF2FF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-2xl shadow-lg mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#111827]">Change Your Password</h1>
          <p className="text-sm text-[#6B7280] mt-2">
            Welcome, <span className="font-medium text-[#111827]">{employee?.first_name}</span>! For your security, please set a new password before continuing.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-8">
          {/* Warning Banner */}
          <div className="flex items-start gap-3 p-4 bg-[#FFFBEB] border border-[#F59E0B]/30 rounded-xl mb-6">
            <AlertCircle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#92400E]">
              Your account was created with a default password. You must change it to access the system.
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-[#22C55E]" />
              </div>
              <div>
                <p className="text-lg font-semibold text-[#111827]">Password updated successfully!</p>
                <p className="text-sm text-[#6B7280] mt-1">Redirecting you now…</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2 p-3 bg-[#FEF2F2] border border-[#EF4444]/20 rounded-lg text-sm text-[#EF4444]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Current password */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">
                  Current (Default) Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    type={showCurrent ? "text" : "password"}
                    autoComplete="current-password"
                    value={form.currentPassword}
                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                    placeholder="Enter your default password"
                    className="w-full pl-10 pr-10 py-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    type={showNew ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    placeholder="Choose a strong password"
                    className="w-full pl-10 pr-10 py-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength bar */}
                {form.newPassword && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1">
                      Strength: <span className="font-medium">{strength.label}</span> · Min. 8 chars, include uppercase, numbers &amp; symbols for best security.
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Re-enter your new password"
                    className="w-full pl-10 pr-10 py-3 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                  <p className="text-xs text-[#EF4444] mt-1">Passwords do not match.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white py-3 rounded-lg font-medium hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Set New Password
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
