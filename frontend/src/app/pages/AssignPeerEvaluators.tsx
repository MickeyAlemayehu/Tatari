import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Search,
  UserPlus,
  X,
  Users,
  Briefcase,
  Loader2,
  Info,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { employeesService, type EmployeeRecord } from "../../services/employees.service";
import {
  performanceService,
  type EvaluationPeriodRecord,
  type EvaluationTemplateRecord,
  type EvaluationAssignmentRecord,
} from "../../services/performance.service";
import { ApiError } from "../../lib/api";
import { initials } from "../../lib/utils";

interface EmployeeLite {
  id: number;
  name: string;
  position: string;
  department: string;
  departmentId: number | null;
  avatar: string;
  managerId: number | null;
}

interface PeerRowState {
  evaluatorId: number | null;
  templateId: number | null;
}

interface ManagerState {
  evaluatorId: number | null;
  templateId: number | null;
  autoAssigned: boolean;
}

export function AssignPeerEvaluators() {
  const navigate = useNavigate();

  // ── Data ────────────────────────────────────────────────────────────────
  const [employees, setEmployees] = useState<EmployeeLite[]>([]);
  const [periods, setPeriods] = useState<EvaluationPeriodRecord[]>([]);
  const [templates, setTemplates] = useState<EvaluationTemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Selection ───────────────────────────────────────────────────────────
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeLite | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState("");

  // ── Per-employee panel state ────────────────────────────────────────────
  const [peerRows, setPeerRows] = useState<PeerRowState[]>([]);
  const [manager, setManager] = useState<ManagerState>({
    evaluatorId: null,
    templateId: null,
    autoAssigned: false,
  });
  const [panelLoading, setPanelLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const peerTemplates = useMemo(
    () => templates.filter((t) => (t.evaluationType ?? t.evaluation_type) === "peer"),
    [templates]
  );
  const managerTemplates = useMemo(
    () => templates.filter((t) => (t.evaluationType ?? t.evaluation_type) === "manager"),
    [templates]
  );

  // ── Initial load ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      employeesService.list({ per_page: 200 }),
      performanceService.periods(),
      performanceService.templates(),
    ])
      .then(([empRes, periodRes, tplRes]) => {
        if (cancelled) return;
        setEmployees(
          empRes.data.map((e: EmployeeRecord) => ({
            id: e.id,
            name: `${e.first_name} ${e.last_name}`,
            position: e.position ?? "—",
            department: e.department?.name ?? "—",
            departmentId: e.department?.id ?? null,
            avatar: initials(e.first_name, e.last_name),
            managerId: e.manager_id ?? null,
          }))
        );
        const activePeriods = periodRes.data.filter((p: EvaluationPeriodRecord) => p.status === "active");
        setPeriods(activePeriods);
        setTemplates(tplRes.data);

        if (activePeriods.length > 0) setPeriodId(activePeriods[0].id);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Load assignment panel when employee + period change ────────────────
  useEffect(() => {
    if (!selectedEmployee || !periodId) {
      setPeerRows([]);
      setManager({ evaluatorId: null, templateId: null, autoAssigned: false });
      return;
    }

    setPanelLoading(true);
    setSaveError(null);

    performanceService
      .assignmentsForEmployeeInPeriod({
        evaluation_period_id: periodId,
        employee_id: selectedEmployee.id,
      })
      .then((res) => {
        const existing: EvaluationAssignmentRecord[] = res.data;
        const peers = existing
          .filter((a) => a.type === "peer")
          .map<PeerRowState>((a) => ({
            evaluatorId: a.evaluator?.id ?? null,
            templateId: a.templateId ?? null,
          }));
        const mgr = existing.find((a) => a.type === "manager");

        setPeerRows(peers);

        if (mgr) {
          setManager({
            evaluatorId: mgr.evaluator?.id ?? null,
            templateId: mgr.templateId ?? null,
            autoAssigned: false,
          });
        } else if (selectedEmployee.managerId) {
          // Auto-populate from employee profile
          setManager({
            evaluatorId: selectedEmployee.managerId,
            templateId: null,
            autoAssigned: true,
          });
        } else {
          setManager({ evaluatorId: null, templateId: null, autoAssigned: false });
        }
      })
      .catch(() => {
        // Empty panel
        setPeerRows([]);
        if (selectedEmployee.managerId) {
          setManager({
            evaluatorId: selectedEmployee.managerId,
            templateId: null,
            autoAssigned: true,
          });
        } else {
          setManager({ evaluatorId: null, templateId: null, autoAssigned: false });
        }
      })
      .finally(() => setPanelLoading(false));
  }, [selectedEmployee, periodId]);

  // ── Filtered employee list ──────────────────────────────────────────────
  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.toLowerCase().trim();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
    );
  }, [employees, employeeSearch]);

  const availableEvaluators = useMemo(
    () => employees.filter((e) => e.id !== selectedEmployee?.id),
    [employees, selectedEmployee]
  );

  // ── Mutators ────────────────────────────────────────────────────────────
  const addPeerRow = () =>
    setPeerRows((prev) => [...prev, { evaluatorId: null, templateId: null }]);

  const updatePeerRow = (idx: number, patch: Partial<PeerRowState>) =>
    setPeerRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const removePeerRow = (idx: number) =>
    setPeerRows((prev) => prev.filter((_, i) => i !== idx));

  const updateManager = (patch: Partial<ManagerState>) =>
    setManager((prev) => ({ ...prev, ...patch, autoAssigned: false }));

  const removeManager = () =>
    setManager({ evaluatorId: null, templateId: null, autoAssigned: false });

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // ── Save ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedEmployee || !periodId) return;

    const incompletePeer = peerRows.find((r) => !r.evaluatorId);
    if (incompletePeer) {
      setSaveError("Please pick an evaluator for every peer row, or remove empty rows.");
      return;
    }

    const seen = new Set<number>();
    for (const r of peerRows) {
      if (r.evaluatorId && seen.has(r.evaluatorId)) {
        setSaveError("Duplicate peer evaluator selected — each peer can only appear once.");
        return;
      }
      if (r.evaluatorId) seen.add(r.evaluatorId);
    }

    setSaving(true);
    setSaveError(null);

    try {
      await performanceService.upsertEvaluatorsForEmployee({
        evaluation_period_id: periodId,
        employee_id: selectedEmployee.id,
        peers: peerRows
          .filter((r) => r.evaluatorId)
          .map((r) => ({
            evaluator_id: r.evaluatorId as number,
            template_id: r.templateId,
          })),
        manager: manager.evaluatorId
          ? { evaluator_id: manager.evaluatorId, template_id: manager.templateId }
          : null,
      });
      flash(`Evaluators saved for ${selectedEmployee.name}.`);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to save evaluators.");
    } finally {
      setSaving(false);
    }
  };

  const selectedPeriod = periods.find((p) => p.id === periodId) ?? null;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/performance")}
              className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl text-[#111827]">Assign Evaluators</h1>
              <p className="text-sm text-[#6B7280]">
                Select an evaluation period, then configure peer and manager evaluators per employee.
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {successMsg && (
              <div className="p-4 bg-[#DCFCE7] border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                <p className="text-sm text-[#22C55E]">{successMsg}</p>
              </div>
            )}

            {/* Period selector */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-sm text-[#111827] mb-3">Evaluation Period</h2>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              ) : periods.length === 0 ? (
                <p className="text-sm text-[#6B7280]">
                  No active evaluation periods found.{" "}
                  <button
                    onClick={() => navigate("/performance/create")}
                    className="text-[#4F46E5] underline"
                  >
                    Create one
                  </button>
                  .
                </p>
              ) : (
                <>
                  <select
                    value={periodId ?? ""}
                    onChange={(e) =>
                      setPeriodId(e.target.value === "" ? null : Number(e.target.value))
                    }
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition"
                  >
                    {periods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.status})
                      </option>
                    ))}
                  </select>

                  {selectedPeriod?.templates && selectedPeriod.templates.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedPeriod.templates.map((t) => {
                        const variant: "info" | "success" | "default" =
                          t.evaluationType === "self"
                            ? "info"
                            : t.evaluationType === "peer"
                            ? "success"
                            : "default";
                        return (
                          <span
                            key={t.id}
                            className="text-xs px-2 py-1 rounded-full bg-[#F9FAFB] border border-[#E5E7EB] text-[#6B7280] flex items-center gap-1.5"
                          >
                            <Badge variant={variant} size="sm">
                              {t.evaluationType}
                            </Badge>
                            {t.title} · {t.departmentName ?? "Default"}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Two-column layout: employee list (left) + assignment panel (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Employee list */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-[#E5E7EB] flex flex-col max-h-[700px]">
                <div className="p-4 border-b border-[#E5E7EB]">
                  <h2 className="text-sm text-[#111827] mb-3">Employees</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                    <input
                      type="text"
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      placeholder="Search by name, role, department…"
                      className="w-full pl-9 pr-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7EB]">
                  {filteredEmployees.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[#6B7280]">
                      <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      No employees found.
                    </div>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const selected = selectedEmployee?.id === emp.id;
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => setSelectedEmployee(emp)}
                          className={`w-full text-left p-3 transition flex items-center gap-3 ${
                            selected ? "bg-[#EEF2FF]" : "hover:bg-[#F9FAFB]"
                          }`}
                        >
                          <div className="w-9 h-9 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                            {emp.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#111827] truncate">{emp.name}</p>
                            <p className="text-xs text-[#6B7280] truncate">
                              {emp.position} · {emp.department}
                            </p>
                          </div>
                          {selected && (
                            <CheckCircle className="w-4 h-4 text-[#4F46E5] flex-shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Assignment panel */}
              <div className="lg:col-span-7">
                {!selectedEmployee ? (
                  <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center text-sm text-[#6B7280]">
                    <UserPlus className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    Select an employee on the left to assign their evaluators.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Selected employee header */}
                    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white">
                        {selectedEmployee.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[#111827]">{selectedEmployee.name}</p>
                        <p className="text-xs text-[#6B7280]">
                          {selectedEmployee.position} · {selectedEmployee.department}
                        </p>
                      </div>
                    </div>

                    {panelLoading && (
                      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 flex items-center gap-2 text-sm text-[#6B7280]">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading current assignments…
                      </div>
                    )}

                    {/* Peer evaluators */}
                    {!panelLoading && (
                      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                              <Users className="w-4 h-4 text-[#22C55E]" />
                            </div>
                            <div>
                              <h3 className="text-sm text-[#111827]">Peer Evaluators</h3>
                              <p className="text-xs text-[#6B7280]">
                                Up to 8 peers, each with their own template.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={addPeerRow}
                            disabled={peerRows.length >= 8}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#EEF2FF] text-[#4F46E5] rounded-lg text-sm hover:bg-[#4F46E5] hover:text-white transition disabled:opacity-50"
                          >
                            <UserPlus className="w-4 h-4" />
                            Add Peer
                          </button>
                        </div>

                        {peerRows.length === 0 ? (
                          <p className="text-xs text-[#6B7280] italic py-3 text-center">
                            No peer evaluators yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {peerRows.map((row, idx) => (
                              <div
                                key={idx}
                                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-center"
                              >
                                <select
                                  value={row.evaluatorId ?? ""}
                                  onChange={(e) =>
                                    updatePeerRow(idx, {
                                      evaluatorId:
                                        e.target.value === "" ? null : Number(e.target.value),
                                    })
                                  }
                                  className="px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition"
                                >
                                  <option value="">— Pick evaluator —</option>
                                  {availableEvaluators.map((e) => (
                                    <option key={e.id} value={e.id}>
                                      {e.name} ({e.department})
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={row.templateId ?? ""}
                                  onChange={(e) =>
                                    updatePeerRow(idx, {
                                      templateId:
                                        e.target.value === "" ? null : Number(e.target.value),
                                    })
                                  }
                                  className="px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition"
                                >
                                  <option value="">— Pick peer template —</option>
                                  {peerTemplates.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.title}
                                      {t.department?.name ? ` · ${t.department.name}` : " · Default"}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => removePeerRow(idx)}
                                  className="p-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition"
                                  title="Remove peer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Manager evaluator */}
                    {!panelLoading && (
                      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-[#EEF2FF] rounded-lg flex items-center justify-center">
                              <Briefcase className="w-4 h-4 text-[#4F46E5]" />
                            </div>
                            <div>
                              <h3 className="text-sm text-[#111827]">Manager Evaluator</h3>
                              <p className="text-xs text-[#6B7280]">
                                One manager-level reviewer per employee.
                              </p>
                            </div>
                          </div>
                          {manager.evaluatorId && (
                            <button
                              type="button"
                              onClick={removeManager}
                              className="text-sm text-[#EF4444] hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {manager.autoAssigned && (
                          <div className="mb-3 p-3 bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg flex items-center gap-2 text-xs text-[#4F46E5]">
                            <Info className="w-4 h-4" />
                            Manager auto-populated from employee profile. You can change it.
                          </div>
                        )}

                        {!manager.evaluatorId && !selectedEmployee.managerId && (
                          <div className="mb-3 p-3 bg-[#FFFBEB] border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-700">
                            <AlertCircle className="w-4 h-4" />
                            No manager found in employee profile — please assign manually.
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <select
                            value={manager.evaluatorId ?? ""}
                            onChange={(e) =>
                              updateManager({
                                evaluatorId:
                                  e.target.value === "" ? null : Number(e.target.value),
                              })
                            }
                            className="px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition"
                          >
                            <option value="">— Pick manager —</option>
                            {availableEvaluators.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.name} ({e.department})
                              </option>
                            ))}
                          </select>
                          <select
                            value={manager.templateId ?? ""}
                            onChange={(e) =>
                              updateManager({
                                templateId:
                                  e.target.value === "" ? null : Number(e.target.value),
                              })
                            }
                            className="px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] transition"
                          >
                            <option value="">— Pick manager template —</option>
                            {managerTemplates.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.title}
                                {t.department?.name ? ` · ${t.department.name}` : " · Default"}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Save action */}
                    {!panelLoading && (
                      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex items-center justify-between">
                        {saveError ? (
                          <div className="flex items-center gap-1 text-sm text-[#EF4444]">
                            <AlertCircle className="w-4 h-4" />
                            {saveError}
                          </div>
                        ) : (
                          <p className="text-xs text-[#6B7280]">
                            Saving replaces all current peer + manager assignments for this employee in this period.
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving || !periodId}
                          className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-5 py-2 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow disabled:opacity-50 text-sm"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save Evaluators
                        </button>
                      </div>
                    )}
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
