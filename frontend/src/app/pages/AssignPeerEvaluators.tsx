import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, Users, CheckCircle, X, AlertCircle, Search, UserPlus } from "lucide-react";
import { Badge } from "../components/Badge";
import { AppLayout } from "../components/AppLayout";
import { employeesService } from "../../services/employees.service";
import { performanceService } from "../../services/performance.service";
import { ApiError } from "../../lib/api";
import { initials } from "../../lib/utils";

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  avatar: string;
}

export function AssignPeerEvaluators() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Selected employee to be evaluated
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Selected peer evaluators
  const [selectedPeers, setSelectedPeers] = useState<number[]>([]);
  
  // Search query for peers
  const [searchQuery, setSearchQuery] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({
    employee: "",
    peers: "",
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [periodId, setPeriodId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    employeesService.list({ per_page: 100 }).then((res) => {
      setEmployees(
        res.data.map((e) => ({
          id: e.id,
          name: `${e.first_name} ${e.last_name}`,
          position: e.position ?? "—",
          department: e.department?.name ?? "—",
          avatar: initials(e.first_name, e.last_name),
        }))
      );
    }).catch(() => {});
    performanceService.periods().then((res) => {
      const active = res.data.find((p) => p.status === "active") ?? res.data[0];
      if (active) setPeriodId(active.id);
    }).catch(() => {});
  }, []);

  // Available peers (exclude selected employee)
  const availablePeers = employees.filter(emp => emp.id !== selectedEmployee?.id);

  // Filter peers based on search
  const filteredPeers = availablePeers.filter(peer =>
    peer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    peer.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    peer.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle peer selection
  const togglePeer = (peerId: number) => {
    setSelectedPeers(prev => {
      if (prev.includes(peerId)) {
        return prev.filter(id => id !== peerId);
      } else {
        return [...prev, peerId];
      }
    });
    
    // Clear peers error when selection changes
    if (errors.peers) {
      setErrors({ ...errors, peers: "" });
    }
  };

  // Select all filtered peers
  const selectAllFiltered = () => {
    const filteredIds = filteredPeers.map(p => p.id);
    setSelectedPeers(prev => {
      const newSelection = [...prev];
      filteredIds.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedPeers([]);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      employee: "",
      peers: "",
    };

    let isValid = true;

    if (!selectedEmployee) {
      newErrors.employee = "Please select an employee to be evaluated";
      isValid = false;
    }

    if (selectedPeers.length === 0) {
      newErrors.peers = "Please select at least one peer evaluator";
      isValid = false;
    } else if (selectedPeers.length > 8) {
      newErrors.peers = "Maximum of 8 peer evaluators allowed";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!selectedEmployee || !periodId) {
      setSubmitError(periodId ? "Select an employee." : "No active evaluation period found.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await performanceService.assignPeers({
        evaluation_period_id: periodId,
        employee_id: selectedEmployee.id,
        peer_ids: selectedPeers,
      });
      setShowSuccess(true);
      setTimeout(() => navigate("/performance"), 1500);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Failed to assign peer evaluators.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected peer objects
  const selectedPeerObjects = selectedPeers.map(id => employees.find(e => e.id === id)).filter(Boolean) as Employee[];

  return (
    <AppLayout>
      {/* Main Content */}
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
              <h1 className="text-xl text-[#111827]">Assign Peer Evaluators</h1>
              <p className="text-sm text-[#6B7280]">Select an employee and assign peer reviewers</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-[#DCFCE7] border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm text-[#22C55E] mb-1">Success!</h3>
                  <p className="text-sm text-[#22C55E]">
                    Peer evaluators have been assigned successfully. Redirecting...
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Select Employee to be Evaluated */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                <h2 className="text-sm text-[#111827] mb-4">
                  Select Employee to be Evaluated <span className="text-red-500">*</span>
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {employees.map((employee) => (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setSelectedPeers([]); // Clear peer selections when employee changes
                        if (errors.employee) {
                          setErrors({ ...errors, employee: "" });
                        }
                      }}
                      className={`p-4 border-2 rounded-lg transition text-left ${
                        selectedEmployee?.id === employee.id
                          ? "border-[#4F46E5] bg-[#EEF2FF]"
                          : "border-[#E5E7EB] hover:border-[#E5E7EB] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                          {employee.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#111827] truncate">{employee.name}</p>
                          <p className="text-xs text-[#6B7280] truncate">{employee.position}</p>
                        </div>
                        {selectedEmployee?.id === employee.id && (
                          <CheckCircle className="w-5 h-5 text-[#4F46E5] flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {errors.employee && (
                  <div className="mt-3 flex items-center gap-1 text-[#EF4444]">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{errors.employee}</p>
                  </div>
                )}
              </div>

              {/* Select Peer Evaluators */}
              {selectedEmployee && (
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm text-[#111827]">
                        Select Peer Evaluators <span className="text-red-500">*</span>
                      </h2>
                      <p className="text-xs text-[#6B7280] mt-1">
                        Choose 1-8 colleagues to provide feedback for {selectedEmployee.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={clearAll}
                        disabled={selectedPeers.length === 0}
                        className="text-sm text-[#6B7280] hover:text-[#111827] px-3 py-1.5 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Clear All
                      </button>
                      <button
                        type="button"
                        onClick={selectAllFiltered}
                        className="text-sm text-[#4F46E5] hover:text-indigo-700 px-3 py-1.5 border border-[#4F46E5]/20 rounded-lg hover:bg-[#EEF2FF] transition"
                      >
                        Select All
                      </button>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, position, or department..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {/* Selected Count */}
                  <div className="mb-4 p-3 bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#4F46E5]" />
                      <span className="text-sm text-[#111827]">
                        <strong>{selectedPeers.length}</strong> peer{selectedPeers.length !== 1 ? "s" : ""} selected
                      </span>
                    </div>
                    {selectedPeers.length > 0 && (
                      <span className="text-xs text-[#4F46E5]">
                        {selectedPeers.length}/8 max
                      </span>
                    )}
                  </div>

                  {/* Peer List */}
                  <div className="border border-[#E5E7EB] rounded-lg max-h-96 overflow-y-auto">
                    {filteredPeers.length === 0 ? (
                      <div className="p-8 text-center text-[#6B7280]">
                        <Users className="w-12 h-12 mx-auto mb-3" />
                        <p className="text-sm text-[#6B7280]">No employees found</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {filteredPeers.map((peer) => {
                          const isSelected = selectedPeers.includes(peer.id);
                          const isMaxReached = selectedPeers.length >= 8 && !isSelected;

                          return (
                            <button
                              key={peer.id}
                              type="button"
                              onClick={() => !isMaxReached && togglePeer(peer.id)}
                              disabled={isMaxReached}
                              className={`w-full p-4 transition text-left flex items-center gap-4 ${
                                isSelected
                                  ? "bg-[#EEF2FF]"
                                  : isMaxReached
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-[#F9FAFB]"
                              }`}
                            >
                              {/* Checkbox */}
                              <div
                                className={`w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0 transition ${
                                  isSelected
                                    ? "border-indigo-600 bg-indigo-600"
                                    : "border-[#E5E7EB]"
                                }`}
                              >
                                {isSelected && (
                                  <CheckCircle className="w-4 h-4 text-white" fill="white" />
                                )}
                              </div>

                              {/* Avatar */}
                              <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                                {peer.avatar}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#111827]">{peer.name}</p>
                                <p className="text-xs text-[#6B7280]">
                                  {peer.position} • {peer.department}
                                </p>
                              </div>

                              {/* Same Department Badge */}
                              {peer.department === selectedEmployee.department && (
                                <Badge color="blue">Same Dept</Badge>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {errors.peers && (
                    <div className="mt-3 flex items-center gap-1 text-[#EF4444]">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{errors.peers}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Selected Peers Summary */}
              {selectedPeerObjects.length > 0 && (
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <h2 className="text-sm text-[#111827] mb-4">Selected Peer Evaluators</h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedPeerObjects.map((peer) => (
                      <div
                        key={peer.id}
                        className="flex items-center gap-2 px-3 py-2 bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg"
                      >
                        <div className="w-6 h-6 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-full flex items-center justify-center text-white text-xs">
                          {peer.avatar}
                        </div>
                        <span className="text-sm text-[#111827]">{peer.name}</span>
                        <button
                          type="button"
                          onClick={() => togglePeer(peer.id)}
                          className="ml-1 text-[#4F46E5] hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              {selectedEmployee && (
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("/performance")}
                      className="px-6 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white px-6 py-2.5 rounded-lg hover:from-[#4338CA] hover:to-[#4338CA] transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>{isSubmitting ? "Assigning..." : "Assign Peer Evaluators"}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-[#ECFEFF] border border-[#06B6D4]/20 rounded-lg">
              <p className="text-sm text-[#06B6D4]">
                <strong>Tip:</strong> Select peers from different departments for diverse perspectives.
                Each peer evaluator will receive a notification to complete their review.
              </p>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}