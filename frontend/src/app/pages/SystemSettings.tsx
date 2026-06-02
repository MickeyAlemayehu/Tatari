import { useState } from "react";
import { useNavigate } from "react-router";
import { Save, Mail, Lock, Bell, Globe, DollarSign, Calendar, Database, CheckCircle, AlertCircle, Palette } from "lucide-react";
import { AppLayout } from "../components/AppLayout";

interface SystemSettings {
  // General Settings
  systemName: string;
  defaultLanguage: string;
  timezone: string;

  // Security Settings
  passwordMinLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  requireUppercase: boolean;
  sessionTimeout: number;
  twoFactorAuth: boolean;

  // Notification Settings
  emailNotifications: boolean;
  systemAlerts: boolean;

  // Appearance Settings
  theme: string;
  primaryColor: string;
}

export function SystemSettings() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState<SystemSettings>({
    // General Settings
    systemName: "HR Management System",
    defaultLanguage: "en",
    timezone: "America/Los_Angeles",

    // Security Settings
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    sessionTimeout: 30,
    twoFactorAuth: false,

    // Notification Settings
    emailNotifications: true,
    systemAlerts: true,

    // Appearance Settings
    theme: "light",
    primaryColor: "#4F46E5",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Handle setting change
  const handleChange = (key: keyof SystemSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  // Handle save
  const handleSave = () => {
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setHasChanges(false);

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <AppLayout title="System Settings" subtitle="Configure system-wide preferences">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <button
                onClick={() => navigate("/dashboard")}
                className="hover:text-[#4F46E5] transition"
              >
                Dashboard
              </button>
              <span>/</span>
              <span className="text-[#111827]">System Settings</span>
            </div>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="bg-[#DCFCE7] border border-green-200 rounded-lg px-6 py-4 mb-6">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm">Settings saved successfully!</p>
              </div>
            </div>
          )}

          {/* Unsaved Changes Warning */}
          {hasChanges && !showSuccess && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-6 py-4 mb-6">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">You have unsaved changes. Don't forget to save your settings.</p>
              </div>
            </div>
          )}

          {/* General Settings */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <div>
                <h2 className="text-base text-[#111827]">General Settings</h2>
                <p className="text-sm text-[#6B7280]">Basic system configuration</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-[#111827] mb-2">System Name</label>
                <input
                  type="text"
                  value={settings.systemName}
                  onChange={(e) => handleChange("systemName", e.target.value)}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-[#111827] mb-2">Default Language</label>
                  <select
                    value={settings.defaultLanguage}
                    onChange={(e) => handleChange("defaultLanguage", e.target.value)}
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#111827] mb-2">Time Zone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleChange("timezone", e.target.value)}
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  >
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#FEF2F2] rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div>
                <h2 className="text-base text-[#111827]">Security Settings</h2>
                <p className="text-sm text-[#6B7280]">Configure security and authentication</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-[#111827] mb-2">Minimum Password Length</label>
                <input
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleChange("passwordMinLength", parseInt(e.target.value))}
                  min="6"
                  max="20"
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    checked={settings.requireSpecialChars}
                    onChange={(e) => handleChange("requireSpecialChars", e.target.checked)}
                    className="w-5 h-5 text-[#4F46E5] rounded focus:ring-2 focus:ring-[#4F46E5]"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-[#111827]">Require Special Characters</p>
                    <p className="text-xs text-[#6B7280]">Password must contain at least one special character</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    checked={settings.requireNumbers}
                    onChange={(e) => handleChange("requireNumbers", e.target.checked)}
                    className="w-5 h-5 text-[#4F46E5] rounded focus:ring-2 focus:ring-[#4F46E5]"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-[#111827]">Require Numbers</p>
                    <p className="text-xs text-[#6B7280]">Password must contain at least one number</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    checked={settings.requireUppercase}
                    onChange={(e) => handleChange("requireUppercase", e.target.checked)}
                    className="w-5 h-5 text-[#4F46E5] rounded focus:ring-2 focus:ring-[#4F46E5]"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-[#111827]">Require Uppercase Letters</p>
                    <p className="text-xs text-[#6B7280]">Password must contain at least one uppercase letter</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm text-[#111827] mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange("sessionTimeout", parseInt(e.target.value))}
                  min="5"
                  max="120"
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <label className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-lg cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleChange("twoFactorAuth", e.target.checked)}
                  className="w-5 h-5 text-[#4F46E5] rounded focus:ring-2 focus:ring-[#4F46E5]"
                />
                <div className="flex-1">
                  <p className="text-sm text-[#111827]">Two-Factor Authentication</p>
                  <p className="text-xs text-[#6B7280]">Require 2FA for all users</p>
                </div>
              </label>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-base text-[#111827]">Notification Settings</h2>
                <p className="text-sm text-[#6B7280]">Control system notifications</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-lg cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange("emailNotifications", e.target.checked)}
                  className="w-5 h-5 text-[#4F46E5] rounded focus:ring-2 focus:ring-[#4F46E5]"
                />
                <div className="flex-1">
                  <p className="text-sm text-[#111827]">Email Notifications</p>
                  <p className="text-xs text-[#6B7280]">Enable all email notifications</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-lg cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  checked={settings.systemAlerts}
                  onChange={(e) => handleChange("systemAlerts", e.target.checked)}
                  className="w-5 h-5 text-[#4F46E5] rounded focus:ring-2 focus:ring-[#4F46E5]"
                />
                <div className="flex-1">
                  <p className="text-sm text-[#111827]">System Alerts</p>
                  <p className="text-xs text-[#6B7280]">Receive critical system alerts and updates</p>
                </div>
              </label>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base text-[#111827]">Appearance Settings</h2>
                <p className="text-sm text-[#6B7280]">Customize how the app looks</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-[#111827] mb-2">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleChange("theme", e.target.value)}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#111827] mb-2">Primary Color</label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="w-20 h-12 rounded-lg border border-[#E5E7EB] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="flex-1 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="sticky bottom-6 bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#111827]">Save Changes</p>
                <p className="text-xs text-[#6B7280]">
                  {hasChanges ? "You have unsaved changes" : "No changes to save"}
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-3 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
