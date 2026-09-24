import React, { useState, useEffect } from "react";
import { X, UserCheck, AlertTriangle, Building2, Briefcase, DollarSign } from "lucide-react";
import { outsourcingService } from "../../services/outsourcingService";
import toast from "react-hot-toast";

const AssignStaffModal = ({
  isOpen,
  onClose,
  employees = [],
  clients = [],
  requirements = [],
  initialClientId,
  initialRequirementId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    employeeId: employees[0]?.id || 1,
    clientId: initialClientId || clients[0]?.id || 1,
    requirementId: initialRequirementId || 0,
    designation: "",
    department: "Engineering",
    workLocation: "Mumbai / Hybrid",
    monthlyGross: 55000,
    dateOfJoining: new Date().toISOString().split("T")[0],
    confirmTransfer: false,
    transferReason: "Project reallocation as requested by HR/Client",
  });

  const [conflictWarning, setConflictWarning] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialClientId) {
      setFormData((prev) => ({ ...prev, clientId: initialClientId }));
    }
    if (initialRequirementId) {
      setFormData((prev) => ({ ...prev, requirementId: initialRequirementId }));
    }
  }, [initialClientId, initialRequirementId]);

  useEffect(() => {
    // Check if selected employee is currently deployed with another client
    const selEmp = employees.find((e) => e.id === Number(formData.employeeId));
    if (
      selEmp &&
      selEmp.clientId &&
      selEmp.clientId !== Number(formData.clientId) &&
      selEmp.status === "Active"
    ) {
      const currentClient =
        clients.find((c) => c.id === selEmp.clientId)?.companyName || "another client";
      setConflictWarning(
        `Employee ${selEmp.fullName} (${selEmp.empCode}) is currently actively deployed with "${currentClient}". Please confirm client transfer below.`
      );
    } else {
      setConflictWarning(null);
    }
  }, [formData.employeeId, formData.clientId, employees, clients]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (conflictWarning && !formData.confirmTransfer) {
      toast.error("Please confirm client transfer checkbox before proceeding.");
      return;
    }

    setLoading(true);
    try {
      await outsourcingService.assignEmployee(formData.employeeId, {
        clientId: Number(formData.clientId),
        requirementId: Number(formData.requirementId) || undefined,
        designation: formData.designation,
        department: formData.department,
        workLocation: formData.workLocation,
        monthlyGross: Number(formData.monthlyGross),
        dateOfJoining: formData.dateOfJoining,
        forceTransfer: true,
        transferReason: formData.transferReason,
      });

      toast.success("Resource successfully allocated to client project");
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to allocate resource");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-xl rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Allocate Staff to Client Project</h3>
              <p className="text-xs text-slate-400">Assign resource to client requirement & project position</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Alert */}
        {conflictWarning && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">Active Deployment Conflict</p>
              <p className="mt-0.5">{conflictWarning}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Resource *
              </label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.empCode} - {emp.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Enterprise Client *
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Designation / Job Title
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Lead QA Automation Engineer"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Linked Requisition (Optional)
              </label>
              <select
                value={formData.requirementId}
                onChange={(e) => setFormData({ ...formData, requirementId: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>General Project Allocation</option>
                {requirements
                  .filter((r) => r.clientId === Number(formData.clientId))
                  .map((req) => (
                    <option key={req.id} value={req.id}>
                      {req.jobTitle} ({req.reqCode})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Monthly Gross CTC (₹)
              </label>
              <input
                type="number"
                value={formData.monthlyGross}
                onChange={(e) => setFormData({ ...formData, monthlyGross: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Location
              </label>
              <input
                type="text"
                value={formData.workLocation}
                onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                placeholder="e.g. Pune / Client On-site"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {conflictWarning && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.confirmTransfer}
                  onChange={(e) => setFormData({ ...formData, confirmTransfer: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-semibold">Confirm Official Client Reallocation & Release</span>
              </label>
              {formData.confirmTransfer && (
                <input
                  type="text"
                  value={formData.transferReason}
                  onChange={(e) => setFormData({ ...formData, transferReason: e.target.value })}
                  placeholder="Reason for client transfer..."
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-xs text-white"
                />
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Allocating..." : "Confirm Staff Allocation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignStaffModal;
