import React, { useState } from "react";
import { X, Briefcase, Plus } from "lucide-react";
import { clientService } from "../../services/clientService";
import toast from "react-hot-toast";

const RaiseRequisitionModal = ({ isOpen, onClose, clientId, onSuccess }) => {
  const [formData, setFormData] = useState({
    jobTitle: "",
    department: "Engineering",
    openPositions: 2,
    experienceRequired: "2-4 Years",
    skillsRequired: "React, Node.js, SQL",
    jobLocation: "Mumbai / Hybrid",
    budgetMin: 45000,
    budgetMax: 70000,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.jobTitle.trim()) {
      toast.error("Please enter a job title");
      return;
    }

    setSubmitting(true);
    try {
      await clientService.createRequirement({
        ...formData,
        clientId: Number(clientId),
      });
      toast.success("Requisition raised successfully!");
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to raise requisition");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Raise New Manpower Requisition</h3>
              <p className="text-xs text-slate-400">Request dedicated resources for your projects</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Job Title / Role Required *
            </label>
            <input
              type="text"
              required
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              placeholder="e.g. Senior Frontend Engineer / QA Analyst"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Operations">Operations</option>
                <option value="Sales & BD">Sales & BD</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Open Positions
              </label>
              <input
                type="number"
                min={1}
                value={formData.openPositions}
                onChange={(e) => setFormData({ ...formData, openPositions: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Experience Level
              </label>
              <input
                type="text"
                value={formData.experienceRequired}
                onChange={(e) => setFormData({ ...formData, experienceRequired: e.target.value })}
                placeholder="e.g. 3-5 Years"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.jobLocation}
                onChange={(e) => setFormData({ ...formData, jobLocation: e.target.value })}
                placeholder="e.g. Mumbai / Remote"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Monthly Budget Min (₹)
              </label>
              <input
                type="number"
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Monthly Budget Max (₹)
              </label>
              <input
                type="number"
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Required Skills
            </label>
            <input
              type="text"
              value={formData.skillsRequired}
              onChange={(e) => setFormData({ ...formData, skillsRequired: e.target.value })}
              placeholder="e.g. React, Python, AWS, Docker"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{submitting ? "Submitting..." : "Submit Requisition"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseRequisitionModal;
