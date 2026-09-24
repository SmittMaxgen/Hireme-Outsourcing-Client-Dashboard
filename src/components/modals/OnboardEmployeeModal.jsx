import React, { useState, useEffect } from "react";
import { X, UserPlus, Calculator, DollarSign, Building2, ShieldCheck } from "lucide-react";
import { outsourcingService } from "../../services/outsourcingService";
import toast from "react-hot-toast";

const OnboardEmployeeModal = ({ isOpen, onClose, clients = [], onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    designation: "",
    department: "Engineering",
    clientId: clients[0]?.id || 1,
    dateOfJoining: new Date().toISOString().split("T")[0],
    monthlyGross: 45000,
    panNumber: "",
    aadhaarNumber: "",
    uanNumber: "",
    esiNumber: "",
    bankName: "HDFC Bank",
    bankAccountNumber: "",
    bankIfsc: "HDFC0000123",
  });

  const [salaryPreview, setSalaryPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clients.length > 0 && !formData.clientId) {
      setFormData((prev) => ({ ...prev, clientId: clients[0].id }));
    }
  }, [clients]);

  useEffect(() => {
    fetchSalaryPreview(formData.monthlyGross);
  }, [formData.monthlyGross]);

  const fetchSalaryPreview = async (gross) => {
    const val = Number(gross) || 0;
    if (val <= 0) return;
    try {
      const data = await outsourcingService.previewSalary(val);
      if (data) setSalaryPreview(data);
    } catch {
      // Fallback calculation if preview endpoint unavailable
      const basic = Math.round(val * 0.5);
      const hra = Math.round(basic * 0.4);
      const special = Math.max(0, val - basic - hra);
      const empPf = Math.round(basic * 0.12);
      const empEsi = val <= 21000 ? Math.round(val * 0.0075) : 0;
      const pt = 200;
      const net = val - (empPf + empEsi + pt);
      const erPf = Math.round(basic * 0.12);
      const erEsi = val <= 21000 ? Math.round(val * 0.0325) : 0;
      setSalaryPreview({
        basicSalary: basic,
        hra,
        specialAllowance: special,
        monthlyGross: val,
        employeePf: empPf,
        employeeEsi: empEsi,
        professionalTax: pt,
        netTakeHome: net,
        employerPf: erPf,
        employerEsi: erEsi,
        monthlyCtc: val + erPf + erEsi,
      });
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.designation) {
      toast.error("Please fill in full name, email and designation.");
      return;
    }

    setLoading(true);
    try {
      await outsourcingService.createEmployee(
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          designation: formData.designation,
          department: formData.department,
          clientId: Number(formData.clientId),
          dateOfJoining: formData.dateOfJoining,
          panNumber: formData.panNumber || `ABCPS${Math.floor(1000 + Math.random() * 9000)}D`,
          aadhaarNumber: formData.aadhaarNumber || `1234 5678 ${Math.floor(1000 + Math.random() * 9000)}`,
          uanNumber: formData.uanNumber || `101${Math.floor(100000000 + Math.random() * 900000000)}`,
          esiNumber: formData.esiNumber || `3100${Math.floor(100000000 + Math.random() * 900000000)}`,
          bankName: formData.bankName,
          bankAccountNumber: formData.bankAccountNumber || `50100${Math.floor(10000000 + Math.random() * 90000000)}`,
          bankIfsc: formData.bankIfsc,
          status: "Active",
        },
        {
          monthlyGross: Number(formData.monthlyGross),
        }
      );
      toast.success(`Resource ${formData.fullName} successfully onboarded`);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to onboard employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="glass-panel w-full max-w-3xl rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Onboard Contract Staff & Configure CTC</h3>
              <p className="text-xs text-slate-400">Deploy candidate to client with statutory payroll breakdown</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Personal & Deployment */}
          <div>
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
              1. Resource & Deployment Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Vikramaditya Singh"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. vikram@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Designation / Role *
                </label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Sr. React Developer"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assigned Client Company *
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
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Date of Joining
                </label>
                <input
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Salary & Real-time Statutory Computation */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                <span>2. CTC & Statutory Compensation Structuring</span>
              </h4>
              <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Auto-calculated EPFO / ESIC
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Monthly Gross CTC Target (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="10000"
                  step="1000"
                  value={formData.monthlyGross}
                  onChange={(e) => setFormData({ ...formData, monthlyGross: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-500/50 rounded-xl text-sm font-bold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  placeholder="e.g. 1234 5678 9012"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Live Breakdown Box */}
            {salaryPreview && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Basic (50%)</span>
                  <span className="font-semibold text-white">₹{salaryPreview.basicSalary?.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">HRA (40% of Basic)</span>
                  <span className="font-semibold text-white">₹{salaryPreview.hra?.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Special Allowance</span>
                  <span className="font-semibold text-white">₹{salaryPreview.specialAllowance?.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-emerald-400 font-medium block">Net In-Hand (Est.)</span>
                  <span className="font-bold text-emerald-400 text-sm">₹{salaryPreview.netTakeHome?.toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block">Employee PF (12%)</span>
                  <span className="text-rose-400 font-medium">₹{salaryPreview.employeePf?.toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block">Employer PF (12%)</span>
                  <span className="text-indigo-400 font-medium">₹{salaryPreview.employerPf?.toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block">Prof. Tax (PT)</span>
                  <span className="text-rose-400 font-medium">₹{salaryPreview.professionalTax || 200}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block">Monthly Company CTC</span>
                  <span className="font-bold text-white text-sm">₹{salaryPreview.monthlyCtc?.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bank details */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
              3. Bank Disbursement Account
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  placeholder="e.g. 50100123456789"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={formData.bankIfsc}
                  onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value })}
                  placeholder="e.g. HDFC0000123"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Onboarding Staff..." : "Confirm Staff Onboarding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardEmployeeModal;
