import { useCallback, useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Save, Building2, CheckCircle } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { AsyncState } from "../components/AsyncState";
import { departmentsService, type DepartmentRecord } from "../../services/departments.service";
import { employeesService, type EmployeeRecord } from "../../services/employees.service";
import { ApiError } from "../../lib/api";

type Department = DepartmentRecord;

export function DepartmentManagement() {
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    manager_id: number | null;
  }>({
    name: "",
    description: "",
    manager_id: null,
  });
  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptRes, empRes] = await Promise.all([
        departmentsService.list(),
        employeesService.list({ per_page: 1000 }),
      ]);
      setDepartments(deptRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load departments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const handleOpenModal = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        description: department.description ?? "",
        manager_id: department.manager_id ?? null,
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        name: "",
        description: "",
        manager_id: null,
      });
    }
    setErrors({ name: "", description: "" });
    setSubmitError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDepartment(null);
    setFormData({ name: "", description: "", manager_id: null });
    setErrors({ name: "", description: "" });
    setSubmitError(null);
  };

  const validateForm = () => {
    const newErrors = { name: "", description: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Department name is required";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Department name must be at least 2 characters";
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setSubmitError(null);
    try {
      if (editingDepartment) {
        await departmentsService.update(editingDepartment.id, {
          name: formData.name,
          description: formData.description,
          manager_id: formData.manager_id,
        });
      } else {
        await departmentsService.create({
          name: formData.name,
          description: formData.description,
          manager_id: formData.manager_id,
        });
      }
      const verb = editingDepartment ? "updated" : "created";
      await load();
      handleCloseModal();
      setSuccessMessage(`Department ${verb} successfully.`);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Failed to save department.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name} department?`)) return;
    try {
      await departmentsService.remove(id);
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete department.");
    }
  };

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-[#111827]">Department Management</h1>
              <p className="text-sm text-[#6B7280]">
                Manage departments and their information
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-4 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Add Department</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {successMessage && (
            <div className="mb-6 p-4 bg-[#DCFCE7] border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-[#22C55E]">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-[#22C55E] hover:opacity-75"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <AsyncState loading={loading} error={error} empty={!loading && departments.length === 0}>
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-[#6B7280] uppercase tracking-wider">
                      Employees
                    </th>
                    <th className="px-6 py-3 text-right text-xs text-[#6B7280] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {departments.map((department) => (
                    <tr key={department.id} className="hover:bg-[#F9FAFB] transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-[#4F46E5]" />
                          </div>
                          <div>
                            <p className="text-sm text-[#111827]">{department.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280] max-w-md">
                        {department.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">
                        {department.manager || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 bg-[#F9FAFB] text-[#111827] rounded-full text-sm">
                          {department.employeeCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(department)}
                            className="p-2 text-[#6B7280] hover:bg-[#ECFEFF] hover:text-blue-600 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(department.id, department.name)}
                            className="p-2 text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#EF4444] rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E5E7EB]">
              <p className="text-sm text-[#6B7280]">
                Total Departments: <span className="text-[#111827]">{departments.length}</span>
              </p>
            </div>
          </div>
          </AsyncState>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-lg text-[#111827]">
                {editingDepartment ? "Edit Department" : "Add New Department"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-[#6B7280] hover:text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {submitError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#EF4444]/20 rounded-lg text-sm text-[#EF4444]">
                  {submitError}
                </div>
              )}
              {/* Department Name */}
              <div>
                <label htmlFor="name" className="block text-sm text-[#111827] mb-2">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="e.g., Engineering, Marketing"
                  className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition ${
                    errors.name
                      ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                      : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-[#EF4444]">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm text-[#111827] mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (errors.description) setErrors({ ...errors, description: "" });
                  }}
                  placeholder="Brief description of the department"
                  rows={3}
                  className={`w-full px-4 py-2.5 bg-[#F9FAFB] border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                    errors.description
                      ? "border-[#EF4444]/30 focus:ring-[#EF4444]"
                      : "border-[#E5E7EB] focus:ring-[#4F46E5] focus:border-transparent"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-[#EF4444]">{errors.description}</p>
                )}
              </div>

              {/* Manager */}
              <div>
                <label htmlFor="manager" className="block text-sm text-[#111827] mb-2">
                  Department Manager
                </label>
                <select
                  id="manager"
                  value={formData.manager_id ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      manager_id: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                >
                  <option value="">No manager</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                      {emp.position ? ` — ${emp.position}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-6 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? "Saving..." : editingDepartment ? "Update" : "Create"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}