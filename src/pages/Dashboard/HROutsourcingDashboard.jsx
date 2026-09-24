import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { outsourcingService } from "../../services/outsourcingService";
import AddClientModal from "../../components/modals/AddClientModal";
import OnboardEmployeeModal from "../../components/modals/OnboardEmployeeModal";
import AssignStaffModal from "../../components/modals/AssignStaffModal";
import TransferStaffModal from "../../components/modals/TransferStaffModal";
import DelegateRequisitionModal from "../../components/modals/DelegateRequisitionModal";
import PayslipModal from "../../components/modals/PayslipModal";
import EmployeeDrawer from "../../components/modals/EmployeeDrawer";
import {
  Building2,
  Users,
  Briefcase,
  Calculator,
  Receipt,
  UserMinus,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowRightLeft,
  DollarSign,
  UserPlus,
  ChevronRight,
  MapPin,
  Mail,
  Phone,
  Play,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

const HROutsourcingDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [clients, setClients] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [exits, setExits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState("ALL");

  // Modals state
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedTransferEmployee, setSelectedTransferEmployee] = useState(null);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [selectedDelegateReq, setSelectedDelegateReq] = useState(null);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [selectedEmployeeProfile, setSelectedEmployeeProfile] = useState(null);

  // Payroll run states
  const [payrollRunning, setPayrollRunning] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());

  const { user } = useAuth();

  useEffect(() => {
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      let userAssignedClients = null;
      const hrId = user?.id || user?.company_user_id || user?.companyUserId;
      if (hrId) {
        try {
          const hrProfile = await outsourcingService.getHRAssignedClients(hrId);
          if (hrProfile) {
            const rawClients =
              hrProfile.clients ||
              hrProfile.assignedClients ||
              hrProfile.assignedOutsourcingClients ||
              (Array.isArray(hrProfile) ? hrProfile : null);

            if (Array.isArray(rawClients)) {
              userAssignedClients = rawClients;
            }
          }
        } catch (e) {
          console.warn("Could not fetch HR assigned clients:", e.message);
        }
      }

      const [clientsData, reqsData, empsData, payrollsData, invoicesData, exitsData] =
        await Promise.all([
          outsourcingService.getClients().catch(() => []),
          outsourcingService.getRequirements().catch(() => []),
          outsourcingService.getEmployees().catch(() => []),
          outsourcingService.getPayrolls().catch(() => []),
          outsourcingService.getInvoices().catch(() => []),
          outsourcingService.getExits().catch(() => []),
        ]);

      // Strict dynamic scoping to assigned companies
      let finalClients = [];
      if (userAssignedClients !== null) {
        finalClients = userAssignedClients;
      } else if (!user) {
        finalClients = clientsData || [];
      } else {
        finalClients = [];
      }

      const allowedClientIds = finalClients.map((c) => Number(c.id)).filter(Boolean);
      setClients(finalClients);

      // Filter all data to allowed client IDs
      const filteredEmps = allowedClientIds.length > 0
        ? (empsData || []).filter((e) => allowedClientIds.includes(Number(e.clientId || e.client?.id)))
        : [];

      const filteredReqs = allowedClientIds.length > 0
        ? (reqsData || []).filter((r) => allowedClientIds.includes(Number(r.clientId || r.client?.id)))
        : [];

      const filteredPayrolls = allowedClientIds.length > 0
        ? (payrollsData || []).filter((p) => allowedClientIds.includes(Number(p.clientId || p.employee?.clientId || p.client?.id)))
        : [];

      const filteredInvoices = allowedClientIds.length > 0
        ? (invoicesData || []).filter((i) => allowedClientIds.includes(Number(i.clientId || i.client?.id)))
        : [];

      const filteredExits = allowedClientIds.length > 0
        ? (exitsData || []).filter((ex) => allowedClientIds.includes(Number(ex.clientId || ex.employee?.clientId || ex.client?.id)))
        : [];

      setEmployees(filteredEmps);
      setRequirements(filteredReqs);
      setPayrolls(filteredPayrolls);
      setInvoices(filteredInvoices);
      setExits(filteredExits);
    } catch (err) {
      console.error("Data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async () => {
    setPayrollRunning(true);
    try {
      await outsourcingService.runMonthlyPayroll(payrollMonth, payrollYear);
      toast.success(`Payroll generated for Month ${payrollMonth}/${payrollYear}`);
      await loadAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to run payroll");
    } finally {
      setPayrollRunning(false);
    }
  };

  const handleGenerateInvoice = async (clientId) => {
    if (!clientId) {
      toast.error("Please select a company to generate an invoice.");
      return;
    }
    try {
      await outsourcingService.generateInvoice({
        clientId,
        billingMonth: payrollMonth,
        billingYear: payrollYear,
      });
      toast.success("GST Invoice generated successfully");
      await loadAllData();
      setActiveTab("invoices");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate invoice");
    }
  };

  const handleMarkInvoicePaid = async (invoiceId, amount) => {
    try {
      await outsourcingService.updateInvoicePayment(
        invoiceId,
        amount,
        "Bank Transfer / NEFT",
        `TXN-${Math.floor(100000 + Math.random() * 900000)}`
      );
      toast.success("Payment recorded successfully");
      await loadAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record payment");
    }
  };

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (selectedCompanyFilter !== "ALL" && emp.clientId !== Number(selectedCompanyFilter))
        return false;
      if (statusFilter !== "ALL" && emp.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          emp.fullName?.toLowerCase().includes(q) ||
          emp.empCode?.toLowerCase().includes(q) ||
          emp.designation?.toLowerCase().includes(q) ||
          emp.client?.companyName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [employees, selectedCompanyFilter, statusFilter, searchQuery]);

  // Filtered requirements
  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      if (selectedCompanyFilter !== "ALL" && req.clientId !== Number(selectedCompanyFilter))
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          req.jobTitle?.toLowerCase().includes(q) ||
          req.reqCode?.toLowerCase().includes(q) ||
          req.client?.companyName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [requirements, selectedCompanyFilter, searchQuery]);

  // Total monthly salary calculation
  const totalMonthlySalary = useMemo(() => {
    return employees.reduce(
      (acc, e) => acc + (e.salaryStructure?.monthlyGross || 0),
      0
    );
  }, [employees]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Clean Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabSelect={setActiveTab}
        clientsCount={clients.length}
        employeesCount={employees.length}
        requirementsCount={requirements.length}
        payrollsCount={payrolls.length}
        invoicesCount={invoices.length}
        exitsCount={exits.length}
        onOnboardClick={() => setShowOnboardModal(true)}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar
          activeTab={activeTab}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onSyncData={loadAllData}
          loadingSync={loading}
        />

        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* ========================================================================= */}
          {/* 1. DASHBOARD OVERVIEW TAB */}
          {/* ========================================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Top 4 Clear Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveTab("clients")}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Assigned Companies</span>
                    <Building2 className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{clients.length}</h3>
                  <p className="text-xs text-indigo-400 font-medium">Click to view companies &rarr;</p>
                </div>

                <div
                  onClick={() => setActiveTab("employees")}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Total Staff</span>
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{employees.length}</h3>
                  <p className="text-xs text-emerald-400 font-medium">Click to manage staff &rarr;</p>
                </div>

                <div
                  onClick={() => setActiveTab("requirements")}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Open Requirements</span>
                    <Briefcase className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{requirements.length}</h3>
                  <p className="text-xs text-amber-400 font-medium">Click to view requisitions &rarr;</p>
                </div>

                <div
                  onClick={() => setActiveTab("payroll")}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Monthly Gross Salary</span>
                    <DollarSign className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-400">
                    ₹{totalMonthlySalary.toLocaleString("en-IN")}
                  </h3>
                  <p className="text-xs text-purple-400 font-medium">Click to run payroll &rarr;</p>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Quick Operations</h3>
                  <p className="text-xs text-slate-400">Common actions for your assigned accounts</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowOnboardModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Onboard Employee</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("payroll")}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Calculator className="w-4 h-4 text-purple-400" />
                    <span>Run Payroll</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("invoices")}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <span>Create Invoice</span>
                  </button>
                </div>
              </div>

              {/* Assigned Companies Snapshot */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Your Assigned Companies</h3>
                  <button
                    onClick={() => setActiveTab("clients")}
                    className="text-xs text-indigo-400 hover:underline font-semibold"
                  >
                    View All &rarr;
                  </button>
                </div>

                {clients.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No companies assigned yet by Super Admin.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {clients.map((c) => {
                      const staffCount = employees.filter((e) => e.clientId === c.id).length;
                      const reqCount = requirements.filter((r) => r.clientId === c.id).length;
                      return (
                        <div
                          key={c.id}
                          className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm">
                              {c.companyName?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">{c.companyName}</h4>
                              <p className="text-xs text-slate-400">
                                {c.city || "Mumbai"} &middot; {c.contactPerson || "HR Lead"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-emerald-400 block">
                              {staffCount} Staff
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {reqCount} Open Req
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. MY ASSIGNED COMPANIES TAB */}
          {/* ========================================================================= */}
          {activeTab === "clients" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Assigned Companies</h3>
                  <p className="text-xs text-slate-400">Companies you are authorized to manage</p>
                </div>
              </div>

              {clients.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
                  <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm font-semibold">No companies assigned to your HR account.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.map((c) => {
                    const count = employees.filter((e) => e.clientId === c.id).length;
                    const reqCount = requirements.filter((r) => r.clientId === c.id).length;
                    return (
                      <div
                        key={c.id}
                        className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center">
                              {c.companyName?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white leading-snug">{c.companyName}</h4>
                              <p className="text-xs text-slate-400">{c.city || "Mumbai"}, India</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-300">
                          <p className="flex justify-between">
                            <span className="text-slate-500">Contact:</span>
                            <span className="font-medium text-white">{c.contactPerson || "HR Manager"}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-500">Email:</span>
                            <span className="font-medium text-white">{c.email}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-500">GSTIN:</span>
                            <span className="font-mono text-slate-300">{c.gstNumber || "N/A"}</span>
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-emerald-400 font-semibold">{count} Staff &middot; {reqCount} Reqs</span>
                          <button
                            onClick={() => {
                              setSelectedCompanyFilter(c.id);
                              setActiveTab("employees");
                            }}
                            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            <span>View Staff &rarr;</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. EMPLOYEES TAB */}
          {/* ========================================================================= */}
          {activeTab === "employees" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Employee Roster</h3>
                  <p className="text-xs text-slate-400">Deployed staff under your assigned companies</p>
                </div>
                <button
                  onClick={() => setShowOnboardModal(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Onboard New Employee</span>
                </button>
              </div>

              {/* Simple Search & Filter Bar */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search employee by name, code, designation..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={selectedCompanyFilter}
                  onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">All Companies ({clients.length})</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="On_Leave">On Leave</option>
                  <option value="Notice_Period">Notice Period</option>
                </select>
              </div>

              {/* Clean Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">Monthly Gross</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No employees found.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-bold text-white">{emp.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{emp.empCode}</p>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-medium">
                            {emp.client?.companyName || "Assigned Company"}
                          </td>
                          <td className="py-3 px-4 text-slate-300">{emp.designation}</td>
                          <td className="py-3 px-4 font-semibold text-emerald-400">
                            ₹{(emp.salaryStructure?.monthlyGross || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {emp.status || "Active"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedEmployeeProfile(emp)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                                title="View Profile"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTransferEmployee(emp);
                                  setShowTransferModal(true);
                                }}
                                className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors cursor-pointer"
                                title="Transfer Staff"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. JOB REQUIREMENTS TAB */}
          {/* ========================================================================= */}
          {activeTab === "requirements" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Job Requirements</h3>
                  <p className="text-xs text-slate-400">Client hiring mandates and vacancy status</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                      <th className="py-3 px-4">Job Title</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Positions</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredRequirements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No job requirements found.
                        </td>
                      </tr>
                    ) : (
                      filteredRequirements.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-bold text-white">{req.jobTitle}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{req.reqCode}</p>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-medium">
                            {req.client?.companyName || "Assigned Company"}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{req.department || "General"}</td>
                          <td className="py-3 px-4 font-bold text-indigo-400">
                            {req.filledPositions || 0} / {req.openPositions || 1} Filled
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {req.status || "Open"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedDelegateReq(req);
                                setShowDelegateModal(true);
                              }}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Assign / Deploy
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. MONTHLY PAYROLL TAB */}
          {/* ========================================================================= */}
          {activeTab === "payroll" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">Monthly Payroll Processing</h3>
                  <p className="text-xs text-slate-400">Calculate pro-rata monthly salaries and generate payslips</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={payrollMonth}
                    onChange={(e) => setPayrollMonth(Number(e.target.value))}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        Month {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={payrollYear}
                    onChange={(e) => setPayrollYear(Number(e.target.value))}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300"
                  >
                    <option value={2026}>2026</option>
                    <option value={2025}>2025</option>
                  </select>
                  <button
                    onClick={handleRunPayroll}
                    disabled={payrollRunning}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{payrollRunning ? "Processing..." : "Run Monthly Payroll"}</span>
                  </button>
                </div>
              </div>

              {/* Payroll Records Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Month / Year</th>
                      <th className="py-3 px-4">Paid Days</th>
                      <th className="py-3 px-4">Gross Salary</th>
                      <th className="py-3 px-4">Net Payable</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Payslip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {payrolls.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          No payroll records generated yet. Click "Run Monthly Payroll" above.
                        </td>
                      </tr>
                    ) : (
                      payrolls.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-white">
                            {p.employee?.fullName || "Staff"}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {p.employee?.client?.companyName || "Assigned Company"}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{p.payMonth}/{p.payYear}</td>
                          <td className="py-3 px-4 font-medium text-slate-300">{p.paidDays || 30} Days</td>
                          <td className="py-3 px-4 font-semibold text-slate-200">
                            ₹{(p.grossEarnings || p.basicPaid || 45000).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-400">
                            ₹{(p.netSalary || 40000).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {p.status || "Paid"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedPayslip(p)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              View Payslip
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. INVOICES & BILLING TAB */}
          {/* ========================================================================= */}
          {activeTab === "invoices" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Invoices & Billing</h3>
                  <p className="text-xs text-slate-400">18% GST invoices generated for your assigned companies</p>
                </div>
                {clients.length > 0 && (
                  <button
                    onClick={() => handleGenerateInvoice(clients[0]?.id)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Generate Invoice for {clients[0]?.companyName}</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Company</th>
                      <th className="py-3 px-4">Month</th>
                      <th className="py-3 px-4">Total Amount (18% GST)</th>
                      <th className="py-3 px-4">Paid Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No invoices generated yet.
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                          <td className="py-3 px-4 text-slate-300 font-medium">{inv.client?.companyName || "Assigned Company"}</td>
                          <td className="py-3 px-4 text-slate-400">{inv.billingMonth}/{inv.billingYear}</td>
                          <td className="py-3 px-4 font-bold text-emerald-400">
                            ₹{(inv.totalAmount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-300">
                            ₹{(inv.paidAmount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                inv.status === "Paid"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {inv.status || "Pending"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {inv.status !== "Paid" && (
                              <button
                                onClick={() => handleMarkInvoicePaid(inv.id, inv.totalAmount)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. EXITS & RESIGNATIONS TAB */}
          {/* ========================================================================= */}
          {activeTab === "exits" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Exits & Resignations</h3>
                  <p className="text-xs text-slate-400">Staff resignations, notice periods, and asset handovers</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Last Working Day</th>
                      <th className="py-3 px-4">Handover</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {exits.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No active exit or resignation requests.
                        </td>
                      </tr>
                    ) : (
                      exits.map((ex) => (
                        <tr key={ex.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-white">
                            {ex.employee?.fullName || "Staff Member"}
                          </td>
                          <td className="py-3 px-4 text-slate-300">{ex.reason || "Resignation"}</td>
                          <td className="py-3 px-4 text-slate-400">{ex.lastWorkingDay || "2026-10-15"}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400">
                              {ex.assetHandoverDone ? "Completed" : "Pending"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              {ex.status || "Under_Notice"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <AddClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onSuccess={loadAllData}
      />

      <OnboardEmployeeModal
        isOpen={showOnboardModal}
        onClose={() => setShowOnboardModal(false)}
        clients={clients}
        onSuccess={loadAllData}
      />

      <AssignStaffModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        employees={employees}
        clients={clients}
        requirements={requirements}
        onSuccess={loadAllData}
      />

      <TransferStaffModal
        isOpen={showTransferModal}
        onClose={() => {
          setShowTransferModal(false);
          setSelectedTransferEmployee(null);
        }}
        employee={selectedTransferEmployee}
        clients={clients}
        onSuccess={loadAllData}
      />

      <DelegateRequisitionModal
        isOpen={showDelegateModal}
        onClose={() => {
          setShowDelegateModal(false);
          setSelectedDelegateReq(null);
        }}
        requirement={selectedDelegateReq}
        clients={clients}
        onSuccess={loadAllData}
      />

      <PayslipModal
        isOpen={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        payroll={selectedPayslip}
      />

      <EmployeeDrawer
        isOpen={!!selectedEmployeeProfile}
        onClose={() => setSelectedEmployeeProfile(null)}
        employee={selectedEmployeeProfile}
        onTransferClick={(emp) => {
          setSelectedEmployeeProfile(null);
          setSelectedTransferEmployee(emp);
          setShowTransferModal(true);
        }}
      />
    </div>
  );
};

export default HROutsourcingDashboard;
