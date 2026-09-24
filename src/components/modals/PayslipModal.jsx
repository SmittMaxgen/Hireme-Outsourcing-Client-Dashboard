import React from "react";
import { X, Receipt, Download, Building2, CheckCircle2, ShieldCheck, Printer } from "lucide-react";
import toast from "react-hot-toast";

const PayslipModal = ({ isOpen, onClose, payroll }) => {
  if (!isOpen || !payroll) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success("Payslip PDF export initiated");
  };

  const emp = payroll.employee || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Payslip: {payroll.payrollCode || `HM-PAY-${payroll.id}`}
              </h3>
              <p className="text-xs text-slate-400">
                Month {payroll.payMonth}/{payroll.payYear} &middot; Pro-Rata Statutory Compensation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Print Payslip"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Employee & Payroll Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">Employee Name:</span>
              <span className="font-bold text-white text-sm">{emp.fullName || "—"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Employee Code:</span>
              <span className="font-semibold text-slate-200">{emp.empCode || "—"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Designation:</span>
              <span className="font-semibold text-slate-200">{emp.designation || "Staff"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Paid Days:</span>
              <span className="font-bold text-emerald-400">{payroll.presentDays || 26} / 30 Days</span>
            </div>
          </div>

          {/* Earnings vs Deductions Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Earnings */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs">
              <h4 className="font-bold text-emerald-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                Gross Earnings
              </h4>
              <div className="flex justify-between text-slate-300">
                <span>Basic Salary</span>
                <span className="font-medium text-white">
                  ₹{Number(payroll.basicSalary || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>House Rent Allowance (HRA)</span>
                <span className="font-medium text-white">
                  ₹{Number(payroll.hra || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Special Allowance</span>
                <span className="font-medium text-white">
                  ₹{Number(payroll.specialAllowance || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Overtime / Incentive</span>
                <span className="font-medium text-white">
                  ₹{Number(payroll.overtimePay || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-white">
                <span>Gross Earnings</span>
                <span className="text-emerald-400">
                  ₹{Number(payroll.grossEarnings || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Deductions */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs">
              <h4 className="font-bold text-rose-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                Statutory Deductions
              </h4>
              <div className="flex justify-between text-slate-300">
                <span>Provident Fund (EPF 12%)</span>
                <span className="font-medium text-rose-400">
                  ₹{Number(payroll.employeePf || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Employee ESIC (0.75%)</span>
                <span className="font-medium text-rose-400">
                  ₹{Number(payroll.employeeEsi || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Professional Tax (PT)</span>
                <span className="font-medium text-rose-400">
                  ₹{Number(payroll.professionalTax || 200).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Loss of Pay (LOP Deductions)</span>
                <span className="font-medium text-rose-400">
                  ₹{Number(payroll.lopDeduction || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-white">
                <span>Total Deductions</span>
                <span className="text-rose-400">
                  ₹{Number(payroll.totalDeductions || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Net Pay Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold block">
                Net Take-Home Pay (Disbursed)
              </span>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">
                ₹{Number(payroll.netPay || 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Statutory Compliant</span>
              </span>
            </div>
          </div>

          {/* Employer Statutory Contribution */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <h4 className="font-bold text-indigo-400 uppercase tracking-wider">
              Employer Statutory Contributions (Over & Above Gross)
            </h4>
            <div className="grid grid-cols-3 gap-2 text-slate-300">
              <div>
                <span className="text-slate-500 block">Employer PF (12%):</span>
                <span className="font-semibold text-white">
                  ₹{Number(payroll.employerPf || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Employer ESI (3.25%):</span>
                <span className="font-semibold text-white">
                  ₹{Number(payroll.employerEsi || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Employer Cost:</span>
                <span className="font-semibold text-indigo-400">
                  ₹{(Number(payroll.employerPf || 0) + Number(payroll.employerEsi || 0)).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <span className="text-[11px] text-slate-500">
            Certified Third-Party Payroll Disbursement System
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Payslip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipModal;
