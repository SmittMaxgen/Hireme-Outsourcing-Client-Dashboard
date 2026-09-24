import React, { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../context/AuthContext";
import { clientService } from "../../services/clientService";
import RaiseRequisitionModal from "../../components/modals/RaiseRequisitionModal";
import CandidateReviewModal from "../../components/modals/CandidateReviewModal";
import AddMonthlyTimesheetModal from "../../components/modals/AddMonthlyTimesheetModal";
import {
  Building2,
  Users,
  Briefcase,
  CalendarCheck,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  Eye,
  MapPin,
  Mail,
  Phone,
  FileCheck2,
  Send,
  Calculator,
  AlertCircle,
  FileText,
  DollarSign
} from "lucide-react";
import toast from "react-hot-toast";

const ClientPortalDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Monthly Timesheet state
  const [timesheetMonth, setTimesheetMonth] = useState(new Date().getMonth() + 1);
  const [timesheetYear, setTimesheetYear] = useState(new Date().getFullYear());
  const [timesheetData, setTimesheetData] = useState({});
  const [submittingTimesheet, setSubmittingTimesheet] = useState(false);
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);

  // Modals
  const [showReqModal, setShowReqModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadClientsList();
  }, [user]);

  useEffect(() => {
    if (selectedClientId) {
      loadClientDashboard(selectedClientId);
    }
  }, [selectedClientId, timesheetMonth, timesheetYear]);

  const loadClientsList = async () => {
    try {
      const data = await clientService.getClients();
      setClients(data);

      let matchedClient = null;
      if (user?.email) {
        matchedClient = data.find(
          (c) => c.email?.toLowerCase() === user.email.toLowerCase()
        );
      }
      if (!matchedClient && user?.company_name) {
        matchedClient = data.find(
          (c) => c.companyName?.toLowerCase() === user.company_name.toLowerCase()
        );
      }

      if (matchedClient) {
        setSelectedClientId(matchedClient.id);
      } else if (user?.company_name || user?.email) {
        try {
          const newClientRes = await clientService.createClient({
            companyName: user.company_name || "Enterprise Client",
            contactPerson: user.full_name || "Operations Lead",
            email: user.email,
            phone: user.mobile || "9876543210",
            address: "Corporate Office",
            city: "Ahmedabad",
            state: "Gujarat",
            industry: "Enterprise Solutions",
            status: "Active",
            paymentTermsDays: 30,
          });
          const created = newClientRes?.data;
          if (created && created.id) {
            setClients((prev) => [created, ...prev]);
            setSelectedClientId(created.id);
          }
        } catch (err) {
          console.error("Auto-provision client error:", err);
          if (data && data.length > 0) setSelectedClientId(data[0].id);
        }
      } else if (data && data.length > 0) {
        setSelectedClientId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadClientDashboard = async (clientId) => {
    setLoading(true);
    try {
      const [dashRes, leavesRes, attRes, payrollsRes] = await Promise.all([
        clientService.getClientDashboard(clientId),
        clientService.getLeaves(clientId),
        clientService.getAttendance(clientId, timesheetMonth, timesheetYear),
        clientService.getPayrolls(clientId),
      ]);

      if (dashRes) setDashboardData(dashRes);
      if (leavesRes) setLeaves(leavesRes);
      if (attRes) setAttendances(attRes);
      if (payrollsRes) setPayrolls(payrollsRes);
    } catch (err) {
      console.error("Client dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimesheetChange = (empId, field, val) => {
    setTimesheetData((prev) => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {
          totalMonthDays: 30,
          presentDays: 26,
          paidLeaves: 0,
          lopDays: 0,
          overtimeHours: 0,
          bonus: 0,
          remarks: "",
        }),
        [field]: val,
      },
    }));
  };

  const handleSubmitTimesheet = async (e) => {
    e?.preventDefault?.();
    if (!selectedClientId) {
      toast.error("No client selected");
      return;
    }

    const staffList = dashboardData?.deployedEmployees || [];
    if (staffList.length === 0) {
      toast.error("No active staff deployed to submit attendance for.");
      return;
    }

    setSubmittingTimesheet(true);
    try {
      const entries = staffList.map((emp) => {
        const input = timesheetData[emp.id] || {};
        const totalMonthDays = Number(input.totalMonthDays !== undefined ? input.totalMonthDays : 30);
        const presentDays = Number(input.presentDays !== undefined ? input.presentDays : 26);
        const paidLeaves = Number(input.paidLeaves || 0);
        const lopDays = Number(input.lopDays || 0);
        const overtimeHours = Number(input.overtimeHours || 0);
        const bonus = Number(input.bonus || 0);
        const remarks = input.remarks || "";

        return {
          employeeId: emp.id,
          totalMonthDays,
          presentDays,
          halfDays: 0,
          paidLeaves,
          holidays: 0,
          weeklyOffs: 4,
          lopDays,
          overtimeHours,
          bonus,
          remarks,
          status: "Calculated"
        };
      });

      await clientService.submitTimesheet({
        clientId: selectedClientId,
        payMonth: timesheetMonth,
        payYear: timesheetYear,
        timesheetEntries: entries,
      });

      toast.success(
        `Monthly Attendance & Salary Sheet for ${String(timesheetMonth).padStart(2, "0")}/${timesheetYear} submitted to HR successfully!`
      );
      await loadClientDashboard(selectedClientId);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit timesheet to HR");
    } finally {
      setSubmittingTimesheet(false);
    }
  };

  const handleApproveLeave = async (leaveId, status) => {
    try {
      await clientService.updateLeaveStatus(
        leaveId,
        status,
        status === "Client_Approved" ? "Approved by Client Manager" : "Rejected by Client Manager"
      );
      toast.success(`Leave marked as ${status.replace("_", " ")}`);
      await loadClientDashboard(selectedClientId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update leave status");
    }
  };

  const handleRecordPayment = async (invId, amount) => {
    try {
      await clientService.updateInvoicePayment(
        invId,
        amount,
        "Corporate Net Banking",
        `CLI-TXN-${Math.floor(100000 + Math.random() * 900000)}`
      );
      toast.success("Payment recorded successfully");
      await loadClientDashboard(selectedClientId);
    } catch (err) {
      toast.error("Failed to record payment");
    }
  };

  const currentClient = dashboardData?.client || clients.find((c) => c.id === selectedClientId) || {
    companyName: user?.company_name || "Smit Enterprise",
    clientCode: "HM-CLI-0006",
  };

  const deployedStaff = dashboardData?.deployedEmployees || [];
  const requirements = dashboardData?.requirements || [];
  const invoices = dashboardData?.invoices || [];
  const pendingLeaves = leaves.filter((l) => l.status === "Pending");

  // All shortlisted candidates from requirements
  const allCandidates = requirements.flatMap((r) =>
    (r.candidates || []).map((c) => ({ ...c, requirementTitle: r.jobTitle }))
  );

  const filteredStaff = deployedStaff.filter((emp) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      emp.fullName?.toLowerCase().includes(q) ||
      emp.empCode?.toLowerCase().includes(q) ||
      emp.designation?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabSelect={setActiveTab}
        client={currentClient}
        deployedCount={deployedStaff.length}
        reqsCount={requirements.length}
        pendingLeavesCount={pendingLeaves.length}
        invoicesCount={invoices.length}
        candidatesCount={allCandidates.length}
        onRaiseReqClick={() => setShowReqModal(true)}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar
          activeTab={activeTab}
          client={currentClient}
          clients={clients}
          selectedClientId={selectedClientId}
          onSelectClient={setSelectedClientId}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onSyncData={() => loadClientDashboard(selectedClientId)}
          onRaiseReqClick={() => setShowReqModal(true)}
          loadingSync={loading}
        />

        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: CLIENT OVERVIEW */}
          {/* ========================================================================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveTab("staff")}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Active Staff Deployed</span>
                    <Users className="w-5 h-5 text-sky-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{deployedStaff.length}</h3>
                  <p className="text-xs text-sky-400 font-medium">100% attendance compliance</p>
                </div>

                <div
                  onClick={() => setActiveTab("requisitions")}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Open Requisitions</span>
                    <Briefcase className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{requirements.length}</h3>
                  <p className="text-xs text-indigo-400 font-medium">Shortlisting in progress</p>
                </div>

                <div
                  onClick={() => setActiveTab("attendance")}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Pending Leave Approvals</span>
                    <CalendarCheck className="w-5 h-5 text-rose-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-rose-400">{pendingLeaves.length}</h3>
                  <p className="text-xs text-slate-400 font-medium">Requires manager sign-off</p>
                </div>

                <div
                  onClick={() => setActiveTab("invoices")}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Latest Month Billing</span>
                    <Receipt className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-400">
                    ₹{invoices[0]?.totalAmount ? invoices[0].totalAmount.toLocaleString("en-IN") : "70,800"}
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium">
                    {invoices[0]?.status === "Paid" ? "Paid / Cleared" : "Pending Payment"}
                  </p>
                </div>
              </div>

              {/* Deployed Resources on-site snapshot */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Deployed Resources On-Site</h3>
                  <button
                    onClick={() => setActiveTab("staff")}
                    className="text-xs text-sky-400 hover:underline font-semibold"
                  >
                    View All &rarr;
                  </button>
                </div>

                {deployedStaff.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No resources currently deployed for this company.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {deployedStaff.slice(0, 3).map((emp) => (
                      <div
                        key={emp.id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-sm">
                            {emp.fullName?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{emp.fullName}</h4>
                            <p className="text-[11px] text-slate-400">{emp.designation}</p>
                            <p className="text-[10px] text-slate-500">{emp.department || "Core Engineering"}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Leave Approvals Action Card */}
              {pendingLeaves.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-rose-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
                      <h3 className="text-sm font-bold text-white">Pending Resource Leave Approvals</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("attendance")}
                      className="text-xs text-rose-400 hover:underline font-semibold"
                    >
                      Manage &rarr;
                    </button>
                  </div>

                  <div className="divide-y divide-slate-800/80">
                    {pendingLeaves.map((lv) => (
                      <div key={lv.id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-white">{lv.employee?.fullName || "Staff Member"}</p>
                          <p className="text-[11px] text-slate-400">
                            {lv.leaveType} ({lv.totalDays} Days) &middot; {lv.startDate} to {lv.endDate}
                          </p>
                          <p className="text-[11px] text-slate-500 italic mt-0.5">"{lv.reason}"</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveLeave(lv.id, "Rejected")}
                            className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproveLeave(lv.id, "Client_Approved")}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: DEPLOYED RESOURCES */}
          {/* ========================================================================= */}
          {activeTab === "staff" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Deployed Resources On-Site</h3>
                  <p className="text-xs text-slate-400">Third-party contract staff assigned to your enterprise</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources by name, designation, code..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                      <th className="py-3 px-4">Resource</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Work Location</th>
                      <th className="py-3 px-4">Joining Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No deployed resources found.
                        </td>
                      </tr>
                    ) : (
                      filteredStaff.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-bold text-white">{emp.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{emp.empCode}</p>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-medium">{emp.designation}</td>
                          <td className="py-3 px-4 text-slate-400">{emp.department || "Engineering"}</td>
                          <td className="py-3 px-4 text-slate-300">{emp.workLocation || "Mumbai"}</td>
                          <td className="py-3 px-4 text-slate-400">{emp.dateOfJoining}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {emp.status || "Active"}
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

          {/* ========================================================================= */}
          {/* TAB 3: OPEN REQUISITIONS */}
          {/* ========================================================================= */}
          {activeTab === "requisitions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Open Manpower Requisitions</h3>
                  <p className="text-xs text-slate-400">Manage hiring mandates for your organization</p>
                </div>
                <button
                  onClick={() => setShowReqModal(true)}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Raise Requisition</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                      <th className="py-3 px-4">Requisition Title</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Experience</th>
                      <th className="py-3 px-4">Budget Bracket</th>
                      <th className="py-3 px-4">Positions Filled</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {requirements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No active requisitions. Click "+ Raise Requisition" to create one.
                        </td>
                      </tr>
                    ) : (
                      requirements.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-bold text-white">{req.jobTitle}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{req.reqCode}</p>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{req.department}</td>
                          <td className="py-3 px-4 text-slate-400">{req.experienceRequired}</td>
                          <td className="py-3 px-4 text-emerald-400 font-medium">
                            ₹{req.budgetMin?.toLocaleString("en-IN")} - ₹{req.budgetMax?.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4 font-bold text-sky-400">
                            {req.filledPositions || 0} / {req.openPositions || 1} Filled
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                              {req.status || "Open"}
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

          {/* ========================================================================= */}
          {/* TAB 4: CANDIDATE APPROVALS */}
          {/* ========================================================================= */}
          {activeTab === "candidates" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Candidate Shortlist & Approvals</h3>
                <p className="text-xs text-slate-400">Review candidate profiles shortlisted by HireMe staffing team</p>
              </div>

              {allCandidates.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm font-semibold">No candidates currently in shortlist pipeline.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allCandidates.map((cand) => (
                    <div key={cand.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">{cand.fullName}</h4>
                          <p className="text-xs text-sky-400 font-medium">{cand.requirementTitle}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {cand.currentStage || "Shortlisted"}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-300">
                        <p><span className="text-slate-500">Experience:</span> {cand.experienceYears} Years</p>
                        <p><span className="text-slate-500">Notice Period:</span> {cand.noticePeriodDays} Days</p>
                        <p><span className="text-slate-500">Expected CTC:</span> ₹{cand.expectedCtc?.toLocaleString("en-IN")}</p>
                      </div>

                      <button
                        onClick={() => setSelectedCandidate(cand)}
                        className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Review & Sign-Off
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: ATTENDANCE & MONTHLY SALARY SHEET */}
          {/* ========================================================================= */}
          {activeTab === "attendance" && (
            <div className="space-y-6">
              {/* Header & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-sky-400" />
                    <span>Monthly Attendance & Salary Sheet Submission</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Fill monthly working days, leaves, and overtime for your deployed resources. Submitted sheets are reviewed by HR for pro-rata payout & billing.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-400">Month:</span>
                    <select
                      value={timesheetMonth}
                      onChange={(e) => setTimesheetMonth(Number(e.target.value))}
                      className="bg-transparent text-xs text-sky-400 font-bold focus:outline-none cursor-pointer"
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
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                    <span className="text-[11px] font-semibold text-slate-400">Year:</span>
                    <select
                      value={timesheetYear}
                      onChange={(e) => setTimesheetYear(Number(e.target.value))}
                      className="bg-transparent text-xs text-sky-400 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value={2026} className="bg-slate-900 text-white">2026</option>
                      <option value={2025} className="bg-slate-900 text-white">2025</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setShowTimesheetModal(true)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 border border-sky-500/30 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Monthly Sheet</span>
                  </button>

                  <button
                    onClick={handleSubmitTimesheet}
                    disabled={submittingTimesheet || deployedStaff.length === 0}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingTimesheet ? "Submitting to HR..." : "Submit Sheet to HR"}</span>
                  </button>
                </div>
              </div>

              {/* Monthly Timesheet Table for Assigned Workers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Deployed Staff Timesheet Entries ({deployedStaff.length} Resources)
                  </h4>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowTimesheetModal(true)}
                      className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add / Fill Sheet</span>
                    </button>
                    <span className="text-[11px] text-slate-500">
                      Standard: 30 Calendar Days | 4 Weekly Offs Included
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/70">
                        <th className="py-3 px-4">Staff / Role</th>
                        <th className="py-3 px-3 w-24">Month Days</th>
                        <th className="py-3 px-3 w-28">Present Days</th>
                        <th className="py-3 px-3 w-28">Paid Leaves</th>
                        <th className="py-3 px-3 w-28">LOP (Unpaid)</th>
                        <th className="py-3 px-3 w-28">Overtime (Hrs)</th>
                        <th className="py-3 px-3 w-32">Bonus / Incentives (₹)</th>
                        <th className="py-3 px-4">Paid Days Preview</th>
                        <th className="py-3 px-4">Client Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {deployedStaff.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-slate-500">
                            No deployed workers found for your enterprise.
                          </td>
                        </tr>
                      ) : (
                        deployedStaff.map((emp) => {
                          const input = timesheetData[emp.id] || {
                            totalMonthDays: 30,
                            presentDays: 26,
                            paidLeaves: 0,
                            lopDays: 0,
                            overtimeHours: 0,
                            bonus: 0,
                            remarks: "",
                          };

                          const totalDays = Number(input.totalMonthDays !== undefined ? input.totalMonthDays : 30);
                          const presentDays = Number(input.presentDays !== undefined ? input.presentDays : 26);
                          const paidLeaves = Number(input.paidLeaves || 0);
                          const calculatedPaidDays = Math.min(totalDays, presentDays + paidLeaves + 4);

                          // Match existing submitted payroll if any
                          const existingPayroll = payrolls.find(
                            (p) =>
                              Number(p.employeeId) === Number(emp.id) &&
                              Number(p.payMonth) === Number(timesheetMonth) &&
                              Number(p.payYear) === Number(timesheetYear)
                          );

                          return (
                            <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xs">
                                    {emp.fullName?.charAt(0) || "W"}
                                  </div>
                                  <div>
                                    <p className="font-bold text-white">{emp.fullName}</p>
                                    <p className="text-[10px] text-sky-400 font-mono">{emp.empCode} • {emp.designation}</p>
                                    {emp.dateOfJoining && (
                                      <p className="text-[9px] text-slate-500">Joined: {emp.dateOfJoining}</p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <input
                                  type="number"
                                  min="28"
                                  max="31"
                                  value={input.totalMonthDays !== undefined ? input.totalMonthDays : 30}
                                  onChange={(e) => handleTimesheetChange(emp.id, "totalMonthDays", e.target.value)}
                                  className="w-16 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-center focus:border-sky-500 focus:outline-none"
                                />
                              </td>

                              <td className="py-3 px-3">
                                <input
                                  type="number"
                                  min="0"
                                  max="31"
                                  value={input.presentDays !== undefined ? input.presentDays : 26}
                                  onChange={(e) => handleTimesheetChange(emp.id, "presentDays", e.target.value)}
                                  className="w-20 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-center focus:border-sky-500 focus:outline-none"
                                />
                              </td>

                              <td className="py-3 px-3">
                                <input
                                  type="number"
                                  min="0"
                                  max="15"
                                  value={input.paidLeaves !== undefined ? input.paidLeaves : 0}
                                  onChange={(e) => handleTimesheetChange(emp.id, "paidLeaves", e.target.value)}
                                  className="w-20 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-center focus:border-sky-500 focus:outline-none"
                                />
                              </td>

                              <td className="py-3 px-3">
                                <input
                                  type="number"
                                  min="0"
                                  max="31"
                                  value={input.lopDays !== undefined ? input.lopDays : 0}
                                  onChange={(e) => handleTimesheetChange(emp.id, "lopDays", e.target.value)}
                                  className="w-20 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-rose-300 font-mono text-center focus:border-rose-500 focus:outline-none"
                                />
                              </td>

                              <td className="py-3 px-3">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={input.overtimeHours !== undefined ? input.overtimeHours : 0}
                                  onChange={(e) => handleTimesheetChange(emp.id, "overtimeHours", e.target.value)}
                                  className="w-20 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-amber-300 font-mono text-center focus:border-amber-500 focus:outline-none"
                                />
                              </td>

                              <td className="py-3 px-3">
                                <input
                                  type="number"
                                  min="0"
                                  step="500"
                                  value={input.bonus !== undefined ? input.bonus : 0}
                                  onChange={(e) => handleTimesheetChange(emp.id, "bonus", e.target.value)}
                                  className="w-24 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono text-right focus:border-emerald-500 focus:outline-none"
                                  placeholder="₹0"
                                />
                              </td>

                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                    {calculatedPaidDays} / {totalDays} Days
                                  </span>
                                  {existingPayroll && (
                                    <div className="pt-1">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          existingPayroll.status === "Paid"
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                            : existingPayroll.status === "Approved"
                                            ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                            : existingPayroll.status === "HR_Verified"
                                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                        }`}
                                      >
                                        HR Status: {existingPayroll.status?.replace("_", " ")}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <input
                                  type="text"
                                  value={input.remarks || ""}
                                  onChange={(e) => handleTimesheetChange(emp.id, "remarks", e.target.value)}
                                  placeholder="Monthly note / feedback..."
                                  className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:border-sky-500 focus:outline-none"
                                />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submitted Salary Sheets Status History */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <span>Submitted Salary Sheets & HR Processing Status</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Live Status from HR Portal</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/70">
                        <th className="py-3 px-4">Payroll Code</th>
                        <th className="py-3 px-4">Employee</th>
                        <th className="py-3 px-4">Month / Year</th>
                        <th className="py-3 px-4">Paid Days</th>
                        <th className="py-3 px-4">Gross Salary</th>
                        <th className="py-3 px-4">Net Payout</th>
                        <th className="py-3 px-4">HR Salary Status</th>
                        <th className="py-3 px-4">Disbursement Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {payrolls.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-500">
                            No monthly salary sheets submitted yet. Fill the timesheet above and click "Submit Sheet to HR".
                          </td>
                        </tr>
                      ) : (
                        payrolls.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-white">{p.payrollCode}</td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-white">{p.employee?.fullName || "Staff"}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{p.employee?.empCode || "-"}</p>
                            </td>
                            <td className="py-3 px-4 text-slate-300 font-medium">
                              {String(p.payMonth).padStart(2, "0")}/{p.payYear}
                            </td>
                            <td className="py-3 px-4 text-slate-200 font-mono">{p.paidDays || 30} Days</td>
                            <td className="py-3 px-4 font-semibold text-slate-300">
                              ₹{(p.grossEarnings || p.basicPaid || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-4 font-bold text-emerald-400">
                              ₹{(p.netSalary || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                  p.status === "Paid"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : p.status === "Approved"
                                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                    : p.status === "HR_Verified"
                                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                    : p.status === "Hold"
                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}
                              >
                                {p.status === "Paid" && <CheckCircle2 className="w-3 h-3" />}
                                {p.status === "Calculated" && <Clock className="w-3 h-3" />}
                                {p.status === "HR_Verified" ? "Verified by HR" : p.status?.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                              {p.paymentReference ? (
                                <span className="text-emerald-400">{p.paymentReference}</span>
                              ) : (
                                <span className="text-slate-500 italic">Pending Payout</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pending Leaves Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span>Staff Leave Requests & Approvals</span>
                  </h4>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                        <th className="py-3 px-4">Employee</th>
                        <th className="py-3 px-4">Leave Type</th>
                        <th className="py-3 px-4">Dates</th>
                        <th className="py-3 px-4">Total Days</th>
                        <th className="py-3 px-4">Reason</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {leaves.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500">
                            No leave requests recorded.
                          </td>
                        </tr>
                      ) : (
                        leaves.map((lv) => (
                          <tr key={lv.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-bold text-white">
                              {lv.employee?.fullName || "Staff Member"}
                            </td>
                            <td className="py-3 px-4 text-slate-300">{lv.leaveType}</td>
                            <td className="py-3 px-4 text-slate-400">{lv.startDate} to {lv.endDate}</td>
                            <td className="py-3 px-4 font-medium text-slate-200">{lv.totalDays} Days</td>
                            <td className="py-3 px-4 text-slate-400 italic max-w-xs truncate">{lv.reason}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  lv.status === "Client_Approved"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : lv.status === "Pending"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}
                              >
                                {lv.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {lv.status === "Pending" && (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleApproveLeave(lv.id, "Rejected")}
                                    className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => handleApproveLeave(lv.id, "Client_Approved")}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: GST BILLING & INVOICES */}
          {/* ========================================================================= */}
          {activeTab === "invoices" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">GST Tax Invoices & Billing</h3>
                <p className="text-xs text-slate-400">Monthly 18% GST invoices generated for staff deployments</p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Billing Month</th>
                      <th className="py-3 px-4">Total Amount (18% GST)</th>
                      <th className="py-3 px-4">Paid Amount</th>
                      <th className="py-3 px-4">Balance Due</th>
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
                          <td className="py-3 px-4 text-slate-400">{inv.billingMonth}/{inv.billingYear}</td>
                          <td className="py-3 px-4 font-bold text-emerald-400">
                            ₹{(inv.totalAmount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-300">
                            ₹{(inv.paidAmount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4 font-semibold text-rose-400">
                            ₹{((inv.totalAmount || 0) - (inv.paidAmount || 0)).toLocaleString("en-IN")}
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
                                onClick={() => handleRecordPayment(inv.id, inv.totalAmount)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                              >
                                Pay Online
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
        </main>
      </div>

      {/* Modals */}
      <RaiseRequisitionModal
        isOpen={showReqModal}
        onClose={() => setShowReqModal(false)}
        clientId={selectedClientId}
        onSuccess={() => loadClientDashboard(selectedClientId)}
      />

      <CandidateReviewModal
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate}
        onSuccess={() => loadClientDashboard(selectedClientId)}
      />

      <AddMonthlyTimesheetModal
        isOpen={showTimesheetModal}
        onClose={() => setShowTimesheetModal(false)}
        clientId={selectedClientId}
        deployedStaff={deployedStaff}
        onSuccess={() => loadClientDashboard(selectedClientId)}
      />
    </div>
  );
};

export default ClientPortalDashboard;
