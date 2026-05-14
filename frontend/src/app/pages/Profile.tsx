import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Mail, Phone, Briefcase, Calendar, MapPin, Edit2, Save, X, User, Lock, Bell, Shield, CheckCircle } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";

export function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "preferences">("personal");

  const [profile, setProfile] = useState({
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 123-4567",
    role: "HR Manager",
    department: "Human Resources",
    location: "New York, USA",
    joinDate: "2024-01-15",
    employeeId: "EMP-001",
    dateOfBirth: "1990-05-15",
    address: "123 Main St, New York, NY 10001",
    emergencyContact: "John Johnson - +1 (555) 987-6543",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    leaveRequestAlerts: true,
    performanceReviewAlerts: true,
    payrollAlerts: true,
    language: "en",
    timezone: "America/New_York",
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      alert("Profile updated successfully!");
    }, 1000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values if needed
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl text-[#111827]">My Profile</h1>
                <p className="text-sm text-[#6B7280]">Manage your account settings</p>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}

            {isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] text-[#111827] rounded-lg hover:bg-[#F9FAFB] transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl text-white font-medium">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h2 className="text-2xl text-[#111827] mb-2">{profile.name}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{profile.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{profile.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatDate(profile.joinDate)}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge variant="success" icon={<CheckCircle className="w-4 h-4" />}>
                      Active Employee
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="border-b border-[#E5E7EB]">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("personal")}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 transition ${
                      activeTab === "personal"
                        ? "border-indigo-600 text-[#4F46E5]"
                        : "border-transparent text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Personal Information
                  </button>
                  <button
                    onClick={() => setActiveTab("security")}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 transition ${
                      activeTab === "security"
                        ? "border-indigo-600 text-[#4F46E5]"
                        : "border-transparent text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    Security
                  </button>
                  <button
                    onClick={() => setActiveTab("preferences")}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 transition ${
                      activeTab === "preferences"
                        ? "border-indigo-600 text-[#4F46E5]"
                        : "border-transparent text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    Preferences
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Personal Information Tab */}
                {activeTab === "personal" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm text-[#111827] mb-2">Full Name</label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-60"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-[#111827] mb-2">Employee ID</label>
                        <input
                          type="text"
                          value={profile.employeeId}
                          disabled
                          className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg opacity-60"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-[#111827] mb-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            disabled={!isEditing}
                            className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-60"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-[#111827] mb-2">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                          <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            disabled={!isEditing}
                            className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-60"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-[#111827] mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-60"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-[#111827] mb-2">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                          <input
                            type="text"
                            value={profile.location}
                            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                            disabled={!isEditing}
                            className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-60"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm text-[#111827] mb-2">Address</label>
                        <input
                          type="text"
                          value={profile.address}
                          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-60"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm text-[#111827] mb-2">Emergency Contact</label>
                        <input
                          type="text"
                          value={profile.emergencyContact}
                          onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] disabled:opacity-60"
                          placeholder="Name - Phone Number"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg text-[#111827] mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-[#111827] mb-2">Current Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[#111827] mb-2">New Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                            placeholder="Enter new password"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[#111827] mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                            placeholder="Confirm new password"
                          />
                        </div>
                        <button className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition">
                          <Lock className="w-4 h-4" />
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#E5E7EB]">
                      <h3 className="text-lg text-[#111827] mb-4">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                        <div>
                          <p className="text-sm text-[#111827] mb-1">Enable 2FA</p>
                          <p className="text-xs text-[#6B7280]">Add an extra layer of security to your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E5E7EB] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === "preferences" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg text-[#111827] mb-4">Notification Settings</h3>
                      <div className="space-y-3">
                        {[
                          { key: "emailNotifications", label: "Email Notifications", description: "Receive notifications via email" },
                          { key: "pushNotifications", label: "Push Notifications", description: "Receive push notifications in browser" },
                          { key: "leaveRequestAlerts", label: "Leave Request Alerts", description: "Get notified about leave request updates" },
                          { key: "performanceReviewAlerts", label: "Performance Review Alerts", description: "Get notified about performance reviews" },
                          { key: "payrollAlerts", label: "Payroll Alerts", description: "Get notified about payroll updates" },
                        ].map((pref) => (
                          <div key={pref.key} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                            <div>
                              <p className="text-sm text-[#111827] mb-1">{pref.label}</p>
                              <p className="text-xs text-[#6B7280]">{pref.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={preferences[pref.key as keyof typeof preferences] as boolean}
                                onChange={(e) => setPreferences({ ...preferences, [pref.key]: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E5E7EB] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#E5E7EB]">
                      <h3 className="text-lg text-[#111827] mb-4">Regional Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-[#111827] mb-2">Language</label>
                          <select
                            value={preferences.language}
                            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                            className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-[#111827] mb-2">Timezone</label>
                          <select
                            value={preferences.timezone}
                            onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                            className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                          >
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="America/Denver">Mountain Time (MT)</option>
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
