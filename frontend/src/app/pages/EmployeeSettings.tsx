import { useState } from "react";
import { Lock, Bell, Palette, Globe, Shield, Mail, Save, Volume2 } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { isSoundEnabled, setSoundEnabled } from "../hooks/sound";

export function EmployeeSettings() {
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());
  const [settings, setSettings] = useState({
    emailNotifications: true,
    leaveApprovalNotifications: true,
    performanceReviewNotifications: true,
    payslipNotifications: true,
    language: "en",
    theme: "light",
    twoFactorAuth: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveSettings = () => {
    console.log("Settings saved:", settings);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    console.log("Password changed");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <AppLayout title="Settings" subtitle="Manage your preferences and security">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Notification Settings */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] mb-6">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#4F46E5]" />
              <div>
                <h3 className="text-[#111827]">Notification Preferences</h3>
                <p className="text-sm text-[#6B7280]">Choose what notifications you receive</p>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                  <div>
                    <h4 className="text-sm text-[#111827] mb-1">Email Notifications</h4>
                    <p className="text-xs text-[#6B7280]">Receive all notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) =>
                        setSettings({ ...settings, emailNotifications: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4F46E5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E5E7EB] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                  </label>
                </div>

                {/* Leave Approval Notifications */}
                <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                  <div>
                    <h4 className="text-sm text-[#111827] mb-1">Leave Approval Updates</h4>
                    <p className="text-xs text-[#6B7280]">
                      Get notified when leave requests are approved or rejected
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.leaveApprovalNotifications}
                      onChange={(e) =>
                        setSettings({ ...settings, leaveApprovalNotifications: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4F46E5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E5E7EB] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                  </label>
                </div>

                {/* Performance Review Notifications */}
                <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                  <div>
                    <h4 className="text-sm text-[#111827] mb-1">Performance Reviews</h4>
                    <p className="text-xs text-[#6B7280]">
                      Notifications about upcoming evaluations and results
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.performanceReviewNotifications}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          performanceReviewNotifications: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4F46E5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E5E7EB] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                  </label>
                </div>

                {/* Payslip Notifications */}
                <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                  <div>
                    <h4 className="text-sm text-[#111827] mb-1">Payslip Availability</h4>
                    <p className="text-xs text-[#6B7280]">
                      Get notified when new payslips are available
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.payslipNotifications}
                      onChange={(e) =>
                        setSettings({ ...settings, payslipNotifications: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4F46E5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E5E7EB] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                  </label>
                </div>

                {/* Sound Effects */}
                <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                  <div className="flex items-start gap-2">
                    <Volume2 className="w-4 h-4 text-[#4F46E5] mt-0.5" />
                    <div>
                      <h4 className="text-sm text-[#111827] mb-1">Notification Sounds</h4>
                      <p className="text-xs text-[#6B7280]">
                        Play a short chime when sending or receiving notifications
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soundOn}
                      onChange={(e) => {
                        setSoundOn(e.target.checked);
                        setSoundEnabled(e.target.checked);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4F46E5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E5E7EB] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] mb-6">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-3">
              <Palette className="w-5 h-5 text-[#4F46E5]" />
              <div>
                <h3 className="text-[#111827]">Appearance</h3>
                <p className="text-sm text-[#6B7280]">Customize how the app looks</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language */}
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg bg-white focus:ring-2 focus:ring-[#4F46E5] focus:outline-none transition"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Theme
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg bg-white focus:ring-2 focus:ring-[#4F46E5] focus:outline-none transition"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] mb-6">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#4F46E5]" />
              <div>
                <h3 className="text-[#111827]">Security</h3>
                <p className="text-sm text-[#6B7280]">Manage your account security</p>
              </div>
            </div>
            <div className="p-6">
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg mb-6">
                <div>
                  <h4 className="text-sm text-[#111827] mb-1">Two-Factor Authentication</h4>
                  <p className="text-xs text-[#6B7280]">Add an extra layer of security to your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) =>
                      setSettings({ ...settings, twoFactorAuth: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4F46E5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E5E7EB] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                </label>
              </div>

              {/* Change Password Form */}
              <form onSubmit={handleChangePassword}>
                <h4 className="text-sm text-[#111827] mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Change Password
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#6B7280] mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg bg-white focus:ring-2 focus:ring-[#4F46E5] focus:outline-none transition"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#6B7280] mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg bg-white focus:ring-2 focus:ring-[#4F46E5] focus:outline-none transition"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#6B7280] mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg bg-white focus:ring-2 focus:ring-[#4F46E5] focus:outline-none transition"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white rounded-lg hover:from-[#4338CA] hover:to-[#4F46E5] transition"
                  >
                    <Lock className="w-4 h-4" />
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Save Settings Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white rounded-lg hover:from-[#4338CA] hover:to-[#4F46E5] transition shadow-lg"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
