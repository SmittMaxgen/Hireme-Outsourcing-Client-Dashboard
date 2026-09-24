import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserCheck,
  CalendarCheck,
  Receipt,
  LogOut,
  Plus,
  X,
  Building2,
  ShieldCheck
} from "lucide-react";

const Sidebar = ({
  activeTab,
  onTabSelect,
  client,
  deployedCount = 0,
  reqsCount = 0,
  pendingLeavesCount = 0,
  invoicesCount = 0,
  candidatesCount = 0,
  onRaiseReqClick,
  isOpen = true,
  onToggle,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: "dashboard",
      label: "Client Overview",
      icon: LayoutDashboard,
    },
    {
      id: "staff",
      label: "Deployed Resources",
      icon: Users,
      count: deployedCount,
      countColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    },
    {
      id: "requisitions",
      label: "Open Requisitions",
      icon: Briefcase,
      count: reqsCount,
      countColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    },
    {
      id: "candidates",
      label: "Candidate Approvals",
      icon: UserCheck,
      count: candidatesCount,
      countColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    {
      id: "attendance",
      label: "Attendance & Leaves",
      icon: CalendarCheck,
      count: pendingLeavesCount,
      countColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    },
    {
      id: "invoices",
      label: "GST Billing & Invoices",
      icon: Receipt,
      count: invoicesCount,
      countColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 text-white font-black text-base">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-white tracking-tight">
                  Hire<span className="text-sky-400">Me</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Client
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Enterprise Portal</p>
            </div>
          </div>

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company Active Focus Badge */}
        <div className="p-3 mx-3 mt-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
              Active Company
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              MSA Active
            </span>
          </div>
          <p className="text-xs font-bold text-white truncate">
            {client?.companyName || "TechCorp Global Solutions"}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            {client?.clientCode || "HM-CLI-0001"}
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabSelect && onTabSelect(item.id);
                  if (window.innerWidth < 1024 && onToggle) onToggle();
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between text-left text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/25 border border-sky-400/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      isActive
                        ? "bg-white/20 text-white border-white/30"
                        : item.countColor || "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Raise Requisition Button */}
          {onRaiseReqClick && (
            <div className="pt-4 px-1">
              <button
                onClick={onRaiseReqClick}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Raise Requisition</span>
              </button>
            </div>
          )}
        </nav>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "C"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {user?.full_name || "Client Manager"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || "manager@client.com"}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
