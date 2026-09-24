import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://apidata.hiremejobs.in";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("client_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const clientService = {
  // Get all client enterprises for switcher
  getClients: async () => {
    const res = await api.get("/api/outsourcing/clients");
    return res.data?.data || [];
  },

  createClient: async (clientData) => {
    const res = await api.post("/api/outsourcing/clients", clientData);
    return res.data;
  },

  // Get full client dashboard data
  getClientDashboard: async (clientId = 1) => {
    const res = await api.get(`/api/outsourcing/dashboard/client?clientId=${clientId}`);
    return res.data?.data || null;
  },

  // Requisitions
  getRequirements: async (clientId) => {
    const res = await api.get("/api/outsourcing/requirements", { params: { clientId } });
    return res.data?.data || [];
  },

  createRequirement: async (reqData) => {
    const res = await api.post("/api/outsourcing/requirements", reqData);
    return res.data;
  },

  // Deployed Employees
  getEmployees: async (clientId) => {
    const res = await api.get("/api/outsourcing/employees", { params: { clientId } });
    return res.data?.data || [];
  },

  // Attendance & Leaves
  getAttendance: async (clientId, month, year) => {
    const res = await api.get("/api/outsourcing/attendance", { params: { clientId, month, year } });
    return res.data?.data || [];
  },

  submitTimesheet: async (payload) => {
    const res = await api.post("/api/outsourcing/payroll/run", {
      ...payload,
      defaultStatus: "Calculated"
    });
    return res.data;
  },

  getLeaves: async (clientId) => {
    const res = await api.get("/api/outsourcing/leaves", { params: { clientId } });
    return res.data?.data || [];
  },

  updateLeaveStatus: async (leaveId, status, managerRemarks) => {
    const res = await api.put(`/api/outsourcing/leaves/${leaveId}/status`, {
      status,
      managerRemarks
    });
    return res.data;
  },

  // Candidate Stage Update
  updateCandidateStage: async (candidateId, stage, clientRemarks) => {
    const res = await api.put(`/api/outsourcing/candidates/${candidateId}/stage`, {
      stage,
      clientRemarks
    });
    return res.data;
  },

  // Invoices & Billing
  getInvoices: async (clientId) => {
    const res = await api.get("/api/outsourcing/invoices", { params: { clientId } });
    return res.data?.data || [];
  },

  getPayrolls: async (clientId) => {
    const res = await api.get("/api/outsourcing/payrolls", { params: { clientId } });
    return res.data?.data || [];
  },

  updateInvoicePayment: async (invoiceId, paidAmount, paymentMethod, paymentTransactionRef) => {
    const res = await api.put(`/api/outsourcing/invoices/${invoiceId}/payment`, {
      paidAmount,
      paymentMethod,
      paymentTransactionRef
    });
    return res.data;
  }
};


export default api;
