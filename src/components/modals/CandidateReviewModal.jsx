import React, { useState } from "react";
import { X, UserCheck, CheckCircle2, XCircle } from "lucide-react";
import { clientService } from "../../services/clientService";
import toast from "react-hot-toast";

const CandidateReviewModal = ({ isOpen, onClose, candidate, onSuccess }) => {
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !candidate) return null;

  const handleAction = async (stage) => {
    setSubmitting(true);
    try {
      await clientService.updateCandidateStage(
        candidate.id,
        stage,
        remarks || (stage === "Client_Approved" ? "Approved for Onboarding" : "Rejected by Client")
      );
      toast.success(`Candidate marked as ${stage.replace("_", " ")}`);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update candidate status");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Review Candidate Shortlist</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <p className="text-sm font-bold text-white">{candidate.fullName}</p>
            <p className="text-slate-400">{candidate.email} &middot; {candidate.phone}</p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-slate-300">
              <p>Experience: <span className="font-semibold text-white">{candidate.experienceYears} Years</span></p>
              <p>Notice Period: <span className="font-semibold text-white">{candidate.noticePeriodDays} Days</span></p>
              <p>Expected CTC: <span className="font-semibold text-emerald-400">₹{candidate.expectedCtc?.toLocaleString("en-IN") || "N/A"}</span></p>
              <p>Stage: <span className="font-semibold text-sky-400">{candidate.currentStage}</span></p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Client Manager Remarks / Interview Feedback
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Cleared technical round, approved for offer rollout..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              disabled={submitting}
              onClick={() => handleAction("Rejected")}
              className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject Candidate</span>
            </button>
            <button
              disabled={submitting}
              onClick={() => handleAction("Client_Approved")}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve for Onboarding</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateReviewModal;
