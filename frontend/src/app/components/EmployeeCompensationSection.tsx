import { useCallback, useEffect, useState } from "react";
import { DollarSign, Plus, Edit, Trash2, X, Save } from "lucide-react";
import { Badge } from "./Badge";
import { AsyncState } from "./AsyncState";
import {
  compensationsService,
  type CompensationRecord,
} from "../../services/compensations.service";
import { ApiError } from "../../lib/api";
import { formatDate } from "../../lib/utils";

interface EmployeeCompensationSectionProps {
  employeeId: number;
}

const emptyForm = {
  basic_salary: "",
  housing_allowance: "0",
  transport_allowance: "0",
  other_allowances: "0",
  currency: "USD",
  effective_from: new Date().toISOString().split("T")[0] ?? "",
  effective_to: "",
};

export function EmployeeCompensationSection({ employeeId }: EmployeeCompensationSectionProps) {
  const [items, setItems] = useState<CompensationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CompensationRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await compensationsService.forEmployee(employeeId);
      setItems(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load compensation.");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const active = items.find((c) => c.status === "active");

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (record: CompensationRecord) => {
    setEditing(record);
    setForm({
      basic_salary: String(record.basicSalary),
      housing_allowance: String(record.housingAllowance),
      transport_allowance: String(record.transportAllowance),
      other_allowances: String(record.otherAllowances),
      currency: record.currency,
      effective_from: record.effectiveFrom,
      effective_to: record.effectiveTo ?? "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        employee_id: employeeId,
        basic_salary: parseFloat(form.basic_salary),
        housing_allowance: parseFloat(form.housing_allowance) || 0,
        transport_allowance: parseFloat(form.transport_allowance) || 0,
        other_allowances: parseFloat(form.other_allowances) || 0,
        currency: form.currency,
        effective_from: form.effective_from || new Date().toISOString().split("T")[0] || "",
        effective_to: form.effective_to || null,
        status: "active",
      };

      if (editing) {
        await compensationsService.update(editing.id, payload);
      } else {
        await compensationsService.create(payload);
      }
      setShowModal(false);
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to save compensation.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm("Deactivate this compensation record?")) return;
    try {
      await compensationsService.remove(id);
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to deactivate.");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-[#4F46E5]" />
          <h3 className="text-[#111827]">Compensation</h3>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white text-sm rounded-lg"
        >
          <Plus className="w-4 h-4" />
          {active ? "Update salary" : "Set salary"}
        </button>
      </div>

      <AsyncState loading={loading} error={error} empty={!loading && items.length === 0} emptyMessage="No compensation records yet.">
        {active && (
          <div className="mb-6 p-4 bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[#111827]">Current active package</span>
              <Badge variant="success" size="sm">
                Active
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-[#6B7280]">Basic salary</p>
                <p className="text-[#111827]">
                  {active.currency} {active.basicSalary.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Allowances</p>
                <p className="text-[#111827]">
                  {active.currency} {active.totalAllowances.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Gross monthly</p>
                <p className="text-[#111827] font-medium">
                  {active.currency} {active.grossMonthly.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Effective from</p>
                <p className="text-[#111827]">{formatDate(active.effectiveFrom)}</p>
              </div>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-[#6B7280] uppercase">Period</th>
                  <th className="px-4 py-2 text-left text-xs text-[#6B7280] uppercase">Basic</th>
                  <th className="px-4 py-2 text-left text-xs text-[#6B7280] uppercase">Gross</th>
                  <th className="px-4 py-2 text-left text-xs text-[#6B7280] uppercase">Status</th>
                  <th className="px-4 py-2 text-right text-xs text-[#6B7280] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 text-[#6B7280]">
                      {formatDate(row.effectiveFrom)}
                      {row.effectiveTo ? ` – ${formatDate(row.effectiveTo)}` : " – present"}
                    </td>
                    <td className="px-4 py-3">
                      {row.currency} {row.basicSalary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {row.currency} {row.grossMonthly.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={row.status === "active" ? "success" : "default"} size="sm">
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(row)}
                          className="p-2 text-[#6B7280] hover:text-[#4F46E5] rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {row.status === "active" && (
                          <button
                            onClick={() => void handleDeactivate(row.id)}
                            className="p-2 text-[#6B7280] hover:text-[#EF4444] rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AsyncState>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-lg text-[#111827]">
                {editing ? "Edit compensation" : "Set compensation"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-[#6B7280]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#111827] mb-1">Basic salary *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.basic_salary}
                  onChange={(e) => setForm({ ...form, basic_salary: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#6B7280] mb-1">Housing</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.housing_allowance}
                    onChange={(e) => setForm({ ...form, housing_allowance: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B7280] mb-1">Transport</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.transport_allowance}
                    onChange={(e) => setForm({ ...form, transport_allowance: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B7280] mb-1">Other</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.other_allowances}
                    onChange={(e) => setForm({ ...form, other_allowances: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#111827] mb-1">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#111827] mb-1">Effective from *</label>
                  <input
                    type="date"
                    required
                    value={form.effective_from}
                    onChange={(e) => setForm({ ...form, effective_from: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
