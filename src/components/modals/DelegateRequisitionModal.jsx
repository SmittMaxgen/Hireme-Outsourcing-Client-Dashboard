import React, { useState, useEffect } from "react";
import { X, Briefcase, Building2, Users } from "lucide-react";
import { outsourcingService } from "../../services/outsourcingService";
import toast from "react-hot-toast";

const DelegateRequisitionModal = ({
  isOpen,
  onClose,
  requirement,
  clients = [],
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    targetClientId: clients[0]?.id || 1,
    department: "Engineering",
    targetPositions: 2,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (requirement) {
      setFormData({
        targetClientId: requirement.clientId || clients[0]?.id || 1,
        department: requirement.department || "Engineering",
        targetPositions: requirement.openPositions || 2,
      });
    }
  }, [requirement, clients]);

  if (!isOpen || !requirement) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await outsourcingService.assignRequirement(requirement.id, {
        clientId: Number(formData.targetClientId),
        department: formData.department,
        openPositions: Number(formData.targetPositions),
      });

      toast.success("Requisition updated & allocated successfully");
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update requisition");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Manage & Delegate Requisition</h3>
              <p className="text-xs text-slate-400">
                {requirement.jobTitle} ({requirement.reqCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Assigned Client Enterprise *
            </label>
            <select
              value={formData.targetClientId}
              onChange={(e) => setFormData({ ...formData, targetClientId: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Open Openings
              </label>
              <input
                type="number"
                min="1"
                value={formData.targetPositions}
                onChange={(e) => setFormData({ ...formData, targetPositions: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

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
              {loading ? "Updating..." : "Save Requisition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DelegateRequisitionModal;
