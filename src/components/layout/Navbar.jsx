import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Menu,
  Building2,
  RefreshCw,
  Plus,
  LogOut,
} from "lucide-react";

const TAB_TITLES = {
  dashboard: { title: "Enterprise Client Portal", subtitle: "Overview of your deployed contract staffing and manpower metrics" },
  staff: { title: "Deployed Staff Roster", subtitle: "Resources assigned to your projects and active billing" },
  requisitions: { title: "Open Manpower Requisitions", subtitle: "Your active hiring mandates, target profiles, and positions" },
  candidates: { title: "Candidate Shortlist & Approvals", subtitle: "Review candidate profiles, schedule interviews, and provide sign-offs" },
  attendance: { title: "Attendance & Leave Approvals", subtitle: "Monthly attendance logs and pending resource leave approvals" },
  invoices: { title: "GST Billing & Tax Invoices", subtitle: "18% GST itemized monthly invoices and payment receipts" },
};

const Navbar = ({
  activeTab,
  client,
  clients = [],
  selectedClientId,
  onSelectClient,
  onToggleSidebar,
  onSyncData,
  onRaiseReqClick,
  loadingSync = false,
}) => {
  const { user, logout } = useAuth();
  const currentTabInfo = TAB_TITLES[activeTab] || {
    title: "Client Enterprise Portal",
    subtitle: "Staffing operations and resource tracking",
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Mobile Toggle + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white lg:hidden cursor-pointer"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {currentTabInfo.title}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Company Badge + Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {client && (
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
              <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-white font-bold tracking-tight">
                  {client.companyName || user?.company_name || "Enterprise Client"}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                  {client.clientCode || "HM-CLI"}
                </span>
              </div>
            </div>
          )}

          {onRaiseReqClick && (
            <button
              onClick={onRaiseReqClick}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-sky-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Raise Requisition</span>
            </button>
          )}

          {onSyncData && (
            <button
              onClick={onSyncData}
              disabled={loadingSync}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loadingSync ? "animate-spin" : ""}`} />
            </button>
          )}

          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
