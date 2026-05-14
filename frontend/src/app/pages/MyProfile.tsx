import { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Save, Edit2 } from "lucide-react";
import { AppLayout } from "../components/AppLayout";

export function MyProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1990-05-15",
    address: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    position: "Senior Developer",
    department: "Engineering",
    employeeId: "EMP-2024-001",
    joinDate: "2022-01-15",
  });

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, this would save to the backend
    console.log("Profile updated:", profile);
  };

  return (
    <AppLayout title="My Profile" subtitle="Manage your personal information">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] mb-6">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-20 h-20 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-2xl">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl text-[#111827] mb-1">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p className="text-[#6B7280]">{profile.position}</p>
                    <p className="text-sm text-[#6B7280]">
                      Employee ID: {profile.employeeId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition ${
                    isEditing
                      ? "bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white"
                      : "border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]"
                  }`}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] mb-6">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-[#111827]">Personal Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2">First Name</label>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[#6B7280]" />
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile({ ...profile, firstName: e.target.value })
                      }
                      disabled={!isEditing}
                      className={`flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg ${
                        isEditing
                          ? "bg-white focus:ring-2 focus:ring-[#4F46E5]"
                          : "bg-[#F9FAFB]"
                      } focus:outline-none transition`}
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2">Last Name</label>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[#6B7280]" />
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile({ ...profile, lastName: e.target.value })
                      }
                      disabled={!isEditing}
                      className={`flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg ${
                        isEditing
                          ? "bg-white focus:ring-2 focus:ring-[#4F46E5]"
                          : "bg-[#F9FAFB]"
                      } focus:outline-none transition`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2">Email</label>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#6B7280]" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={!isEditing}
                      className={`flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg ${
                        isEditing
                          ? "bg-white focus:ring-2 focus:ring-[#4F46E5]"
                          : "bg-[#F9FAFB]"
                      } focus:outline-none transition`}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2">Phone</label>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#6B7280]" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={!isEditing}
                      className={`flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg ${
                        isEditing
                          ? "bg-white focus:ring-2 focus:ring-[#4F46E5]"
                          : "bg-[#F9FAFB]"
                      } focus:outline-none transition`}
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2">Date of Birth</label>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#6B7280]" />
                    <input
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) =>
                        setProfile({ ...profile, dateOfBirth: e.target.value })
                      }
                      disabled={!isEditing}
                      className={`flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg ${
                        isEditing
                          ? "bg-white focus:ring-2 focus:ring-[#4F46E5]"
                          : "bg-[#F9FAFB]"
                      } focus:outline-none transition`}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm text-[#6B7280] mb-2">Address</label>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#6B7280]" />
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      disabled={!isEditing}
                      className={`flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg ${
                        isEditing
                          ? "bg-white focus:ring-2 focus:ring-[#4F46E5]"
                          : "bg-[#F9FAFB]"
                      } focus:outline-none transition`}
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2">City</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg ${
                      isEditing
                        ? "bg-white focus:ring-2 focus:ring-[#4F46E5]"
                        : "bg-[#F9FAFB]"
                    } focus:outline-none transition`}
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2">State</label>
                  <input
                    type="text"
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg ${
                      isEditing
                        ? "bg-white focus:ring-2 focus:ring-[#4F46E5]"
                        : "bg-[#F9FAFB]"
                    } focus:outline-none transition`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-[#111827]">Employment Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Position */}
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2">Position</label>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-[#6B7280]" />
                    <input
                      type="text"
                      value={profile.position}
                      disabled
                      className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#6B7280]"
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2">Department</label>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-[#6B7280]" />
                    <input
                      type="text"
                      value={profile.department}
                      disabled
                      className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#6B7280]"
                    />
                  </div>
                </div>

                {/* Join Date */}
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2">Join Date</label>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#6B7280]" />
                    <input
                      type="date"
                      value={profile.joinDate}
                      disabled
                      className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#6B7280]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg">
                <p className="text-sm text-[#06B6D4]">
                  <strong>Note:</strong> Employment information can only be updated by HR.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
