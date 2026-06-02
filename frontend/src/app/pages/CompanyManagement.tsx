import { useEffect, useState } from "react";
import { Building, MapPin, Mail, Phone, Briefcase, Users, Globe, Edit, Save, X } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { ApiError } from "../../lib/api";
import { companiesService, type CompanyRecord } from "../../services/companies.service";

export function CompanyManagement() {
  const [company, setCompany] = useState<CompanyRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyRecord>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Fetch the single company (first one in the list)
    companiesService
      .list({ per_page: 1 })
      .then((res) => {
        const firstCompany = res.data[0];
        if (firstCompany) {
          setCompany(firstCompany);
          setFormData(firstCompany);
        } else {
          setError("No company details found.");
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load company."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleEdit = () => {
    if (company) {
      setFormData(company);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setFormData(company || {});
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!company) return;
    setIsSaving(true);
    try {
      const updated = await companiesService.update(company.id, formData);
      setCompany(updated);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save company details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
          <div className="w-10 h-10 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error && !company) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="rounded-lg border border-[#EF4444]/20 bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
            {error}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!company) return null;

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-[#111827]">Company Settings</h1>
              <p className="text-sm text-[#6B7280]">Manage your company details and contact information</p>
            </div>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Edit className="w-4 h-4" />
                Edit Details
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#22C55E] text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
          {error && isEditing && (
            <div className="rounded-lg border border-[#EF4444]/20 bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          {/* Company Information */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <h3 className="text-base text-[#111827] font-medium flex items-center gap-2">
                <Building className="w-5 h-5 text-[#4F46E5]" />
                Basic Information
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Company Name</label>
                  {isEditing ? (
                    <input
                      name="companyName"
                      value={formData.companyName || formData.name || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    />
                  ) : (
                    <p className="text-sm text-[#111827] bg-[#F9FAFB] px-3 py-2 rounded-lg border border-transparent">
                      {company.companyName || company.name || "Not specified"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Industry</label>
                  {isEditing ? (
                    <input
                      name="industry"
                      value={formData.industry || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    />
                  ) : (
                    <p className="text-sm text-[#111827] bg-[#F9FAFB] px-3 py-2 rounded-lg border border-transparent flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#6B7280]" />
                      {company.industry || "Not specified"}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Registration Number</label>
                  {isEditing ? (
                    <input
                      name="registrationNumber"
                      value={formData.registrationNumber || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    />
                  ) : (
                    <p className="text-sm text-[#111827] bg-[#F9FAFB] px-3 py-2 rounded-lg border border-transparent">
                      {company.registrationNumber || "Not specified"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Website</label>
                  {isEditing ? (
                    <input
                      name="website"
                      value={formData.website || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    />
                  ) : (
                    <p className="text-sm text-[#4F46E5] bg-[#F9FAFB] px-3 py-2 rounded-lg border border-transparent flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#6B7280]" />
                      {company.website ? (
                        <a href={`https://${company.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {company.website}
                        </a>
                      ) : (
                        <span className="text-[#111827]">Not specified</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-[#374151] mb-1">Description</label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] resize-y"
                  />
                ) : (
                  <p className="text-sm text-[#111827] bg-[#F9FAFB] px-3 py-2 rounded-lg border border-transparent whitespace-pre-wrap">
                    {company.description || "No description provided."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact & Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Details */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <h3 className="text-base text-[#111827] font-medium flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#4F46E5]" />
                  Contact Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Primary Email</label>
                  {isEditing ? (
                    <input
                      name="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    />
                  ) : (
                    <p className="text-sm text-[#111827] bg-[#F9FAFB] px-3 py-2 rounded-lg border border-transparent flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#6B7280]" />
                      {company.email || "Not specified"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Primary Phone</label>
                  {isEditing ? (
                    <input
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    />
                  ) : (
                    <p className="text-sm text-[#111827] bg-[#F9FAFB] px-3 py-2 rounded-lg border border-transparent flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#6B7280]" />
                      {company.phone || "Not specified"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Contact Person</label>
                  {isEditing ? (
                    <input
                      name="contactName"
                      value={formData.contactName || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    />
                  ) : (
                    <p className="text-sm text-[#111827] bg-[#F9FAFB] px-3 py-2 rounded-lg border border-transparent flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#6B7280]" />
                      {company.contactName || "Not specified"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <h3 className="text-base text-[#111827] font-medium flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#4F46E5]" />
                  Location
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1">Address</label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] resize-y"
                    />
                  ) : (
                    <p className="text-sm text-[#111827] bg-[#F9FAFB] px-3 py-2 rounded-lg border border-transparent whitespace-pre-wrap">
                      {company.address || "Not specified"}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">City</label>
                    {isEditing ? (
                      <input
                        name="city"
                        value={formData.city || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                      />
                    ) : (
                      <p className="text-sm text-[#111827] bg-[#F9FAFB] px-3 py-2 rounded-lg border border-transparent">
                        {company.city || "Not specified"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">Country</label>
                    {isEditing ? (
                      <input
                        name="country"
                        value={formData.country || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                      />
                    ) : (
                      <p className="text-sm text-[#111827] bg-[#F9FAFB] px-3 py-2 rounded-lg border border-transparent">
                        {company.country || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
