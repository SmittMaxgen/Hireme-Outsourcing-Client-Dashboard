import React, { useState } from "react";
import { X, Calendar, User, Clock, DollarSign, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { clientService } from "../../services/clientService";
import toast from "react-hot-toast";

const AddMonthlyTimesheetModal = ({ isOpen, onClose, clientId, deployedStaff = [], onSuccess }) => {
  const [selectedEmpId, setSelectedEmpId] = useState(deployedStaff[0]?.id ? String(deployedStaff[0]?.id) : "ALL");
  const [payMonth, setPayMonth] = useState(new Date().getMonth() + 1);
  const [payYear, setPayYear] = useState(new Date().getFullYear());
  const [totalMonthDays, setTotalMonthDays] = useState(30);
  const [presentDays, setPresentDays] = useState(26);
  const [paidLeaves, setPaidLeaves] = useState(0);
  const [lopDays, setLopDays] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const calculatedPaidDays = Math.min(
    Number(totalMonthDays) || 30,
    (Number(presentDays) || 0) + (Number(paidLeaves) || 0) + 4
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId) {
      toast.error("Client ID missing");
      return;
    }

    if (deployedStaff.length === 0) {
      toast.error("No deployed workers found to submit timesheet for.");
      return;
    }

    setSubmitting(true);
    try {
      let targetStaff = [];
      if (selectedEmpId === "ALL") {
        targetStaff = deployedStaff;
      } else {
        const emp = deployedStaff.find((s) => String(s.id) === String(selectedEmpId));
        if (emp) targetStaff = [emp];
      }

      const timesheetEntries = targetStaff.map((emp) => ({
        employeeId: emp.id,
        totalMonthDays: Number(totalMonthDays) || 30,
        presentDays: Number(presentDays) || 26,
        halfDays: 0,
        paidLeaves: Number(paidLeaves) || 0,
        holidays: 0,
        weeklyOffs: 4,
        lopDays: Number(lopDays) || 0,
        overtimeHours: Number(overtimeHours) || 0,
        bonus: Number(bonus) || 0,
        remarks: remarks || "Submitted by Client Manager",
        status: "Calculated"
      }));

      await clientService.submitTimesheet({
        clientId,
        payMonth: Number(payMonth),
        payYear: Number(payYear),
        timesheetEntries,
      });

      toast.success(
        `Monthly Attendance Sheet for ${targetStaff.length} resource(s) submitted to HR successfully!`
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit monthly sheet to HR");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Add Monthly Attendance & Salary Sheet</h3>
              <p className="text-[11px] text-slate-400">Submit monthly worker attendance to HR for payroll & payout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Employee Selector */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Select Deployed Worker / Resource <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-sky-500 focus:outline-none"
            >
              <option value="ALL">All Active Deployed Staff ({deployedStaff.length} Resources)</option>
              {deployedStaff.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.empCode}) - {emp.designation}
                </option>
              ))}
            </select>
          </div>

          {/* Month & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Billing / Salary Month</label>
              <select
                value={payMonth}
                onChange={(e) => setPayMonth(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sky-400 font-bold focus:border-sky-500 focus:outline-none"
              >
                {[
                  { num: 1, name: "January" },
                  { num: 2, name: "February" },
                  { num: 3, name: "March" },
                  { num: 4, name: "April" },
                  { num: 5, name: "May" },
                  { num: 6, name: "June" },
                  { num: 7, name: "July" },
                  { num: 8, name: "August" },
                  { num: 9, name: "September" },
                  { num: 10, name: "October" },
                  { num: 11, name: "November" },
                  { num: 12, name: "December" },
                ].map((m) => (
                  <option key={m.num} value={m.num} className="bg-slate-900 text-white">
                    {m.name} ({m.num})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Salary Year</label>
              <select
                value={payYear}
                onChange={(e) => setPayYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sky-400 font-bold focus:border-sky-500 focus:outline-none"
              >
                <option value={2026} className="bg-slate-900 text-white">2026</option>
                <option value={2025} className="bg-slate-900 text-white">2025</option>
              </select>
            </div>
          </div>

          {/* Days Input Grid */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Total Month Days</label>
              <input
                type="number"
                min="28"
                max="31"
                value={totalMonthDays}
                onChange={(e) => setTotalMonthDays(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-center focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Present Days</label>
              <input
                type="number"
                min="0"
                max="31"
                value={presentDays}
                onChange={(e) => setPresentDays(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-center focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Paid Leaves</label>
              <input
                type="number"
                min="0"
                max="15"
                value={paidLeaves}
                onChange={(e) => setPaidLeaves(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-center focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-rose-400 mb-1">LOP (Unpaid Days)</label>
              <input
                type="number"
                min="0"
                max="31"
                value={lopDays}
                onChange={(e) => setLopDays(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-rose-300 font-mono text-center focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-amber-400 mb-1">Overtime (Hours)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-amber-300 font-mono text-center focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-emerald-400 mb-1">Bonus / Incentive (₹)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={bonus}
                onChange={(e) => setBonus(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 font-mono text-right focus:border-emerald-500 focus:outline-none"
                placeholder="₹0"
              />
            </div>
          </div>

          {/* Paid Days Summary Badge */}
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between">
            <span className="text-slate-300 font-medium">Calculated Paid Days (incl. 4 Weekly Offs):</span>
            <span className="text-sm font-bold text-sky-400 font-mono">
              {calculatedPaidDays} / {totalMonthDays} Days
            </span>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Client Manager Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Completed all monthly deliverables satisfactorily"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || deployedStaff.length === 0}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-sky-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? "Submitting to HR..." : "Submit Monthly Sheet to HR"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMonthlyTimesheetModal;
