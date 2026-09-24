import React from "react";
import {
  X,
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ShieldCheck,
  CreditCard,
  ArrowRightLeft,
  Briefcase,
  MapPin,
  CheckCircle2,
} from "lucide-react";

const EmployeeDrawer = ({
  isOpen,
  onClose,
  employee,
  onTransferClick,
}) => {
  if (!isOpen || !employee) return null;

  const salary = employee.salaryStructure || {};
  const client = employee.client || {};

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-950 border-l border-slate-800 shadow-2xl h-full flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div>
          <div className="p-6 border-b border-slate-800 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-500/20">
                {employee.fullName?.charAt(0) || "U"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{employee.fullName}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                    {employee.status || "Active"}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {employee.designation} &middot; <span className="text-indigo-400 font-mono">{employee.empCode}</span>
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

          {/* Body Content */}
          <div className="p-6 space-y-6">
            {/* Active Client Deployment */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Active Enterprise Client Allocation</span>
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{client.companyName || "Unassigned"}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>{employee.workLocation || client.city || "Mumbai, India"}</span>
                  </p>
                </div>
                <button
                  onClick={() => onTransferClick && onTransferClick(employee)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Transfer Client</span>
                </button>
              </div>
            </div>

            {/* Contact & Personal */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Contact & Personal Info
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-500 block">Email Address:</span>
                  <span className="font-semibold text-white truncate block">{employee.email}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-500 block">Phone Number:</span>
                  <span className="font-semibold text-white block">{employee.phone || "—"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-500 block">Date of Joining:</span>
                  <span className="font-semibold text-white block">{employee.dateOfJoining || "—"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-500 block">Department:</span>
                  <span className="font-semibold text-white block">{employee.department || "Engineering"}</span>
                </div>
              </div>
            </div>

            {/* Statutory Compliance Identifiers */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Statutory Government Registrations</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-500 block">PAN Number:</span>
                  <span className="font-semibold text-white font-mono">{employee.panNumber || "ABCDE1234F"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-500 block">Aadhaar Number:</span>
                  <span className="font-semibold text-white font-mono">{employee.aadhaarNumber || "1234 5678 9012"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-500 block">EPFO UAN Number:</span>
                  <span className="font-semibold text-indigo-400 font-mono">{employee.uanNumber || "101928374650"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-500 block">ESIC IP Number:</span>
                  <span className="font-semibold text-indigo-400 font-mono">{employee.esiNumber || "310098765432"}</span>
                </div>
              </div>
            </div>

            {/* Salary Breakdown Structure */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Configured Monthly CTC Breakdown</span>
              </h4>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Basic Salary (50%)</span>
                  <span className="font-semibold text-white">₹{Number(salary.basicSalary || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="font-semibold text-white">₹{Number(salary.hra || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Special Allowance</span>
                  <span className="font-semibold text-white">₹{Number(salary.specialAllowance || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Employee PF Deduction (12%)</span>
                  <span className="font-semibold text-rose-400">-₹{Number(salary.employeePf || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Employer PF Contribution (12%)</span>
                  <span className="font-semibold text-indigo-400">+₹{Number(salary.employerPf || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-white text-sm">
                  <span>Monthly Gross Target</span>
                  <span className="text-emerald-400">₹{Number(salary.monthlyGross || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Bank Disbursement */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                <span>Bank Disbursement Account</span>
              </h4>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-500 block">Bank:</span>
                  <span className="font-semibold text-white">{employee.bankName || "HDFC Bank"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Account:</span>
                  <span className="font-semibold text-white">{employee.bankAccountNumber || "50100123456789"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">IFSC:</span>
                  <span className="font-semibold text-white uppercase">{employee.bankIfsc || "HDFC0000123"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDrawer;
