import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Edit, Trash2, X, Save, Building2 } from "lucide-react";
import { AppLayout } from "../components/AppLayout";

interface Department {
  id: number;
  name: string;
  description: string;
  employeeCount: number;
  manager: string;
}

export function DepartmentManagement() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manager: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });

  const [departments, setDepartments] = useState<Department[]>([
    {
      id: 1,
      name: "Engineering",
      description: "Software development and technical operations",
      employeeCount: 45,
      manager: "Sarah Johnson",
    },
    {
      id: 2,
      name: "Product",
      description: "Product strategy and management",
      employeeCount: 12,
      manager: "Michael Chen",
    },
    {
      id: 3,
      name: "Design",
      description: "User experience and visual design",
      employeeCount: 8,
      manager: "Emily Davis",
    },
    {
      id: 4,
      name: "Human Resources",
      description: "Employee relations and talent management",
      employeeCount: 5,
      manager: "James Wilson",
    },
    {
      id: 5,
      name: "Marketing",
      description: "Brand marketing and communications",
      employeeCount: 15,
      manager: "Lisa Anderson",
    },
    {
      id: 6,
      name: "Sales",
      description: "Sales and business development",
      employeeCount: 20,
      manager: "Jessica Lee",
    },
    {
      id: 7,
      name: "Finance",
      description: "Financial planning and analysis",
      employeeCount: 7,
      manager: "Amanda White",
    },
    {
      id: 8,
      name: "Operations",
      description: "Business operations and logistics",
      employeeCount: 10,
      manager: "David Martinez",
    },
  ]);

  const handleOpenModal = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        description: department.description,
        manager: department.manager,
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        name: "",
        description: "",
        manager: "",
      });
    }
    setErrors({ name: "", description: "" });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDepartment(null);
    setFormData({ name: "", description: "", manager: "" });
    setErrors({ name: "", description: "" });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (editingDepartment) {
      // Update existing department
      setDepartments(
        departments.map((dept) =>
          dept.id === editingDepartment.id
            ? {
                ...dept,
                name: formData.name,
                description: formData.description,
                manager: formData.manager,
              }
            : dept
        )
      );
    } else {
      // Add new department
      const newDepartment: Department = {
        id: Math.max(...departments.map((d) => d.id)) + 1,
        name: formData.name,
        description: formData.description,
        employeeCount: 0,
        manager: formData.manager,
      };
      setDepartments([...departments, newDepartment]);
    }

    handleCloseModal();
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name} department?`)) {
      setDepartments(departments.filter((dept) => dept.id !== id));
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
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            {/* Table */}
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
                <input
                  id="manager"
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  placeholder="Manager name (optional)"
                  className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingDepartment ? "Update" : "Create"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}