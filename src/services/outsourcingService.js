import api from "./api";

export const outsourcingService = {
  // Dashboards
  getSuperAdminDashboard: async () => {
    const res = await api.get("/api/outsourcing/dashboard/admin");
    return res.data;
  },

  getClientDashboard: async (clientId = 1) => {
    const res = await api.get(`/api/outsourcing/dashboard/client?clientId=${clientId}`);
    return res.data;
  },

  // Clients
  getClients: async (params = {}) => {
    const res = await api.get("/api/outsourcing/clients", { params });
    return res.data?.data || [];
  },

  createClient: async (clientData) => {
    const res = await api.post("/api/outsourcing/clients", clientData);
    return res.data;
  },

  updateClient: async (id, clientData) => {
    const res = await api.put(`/api/outsourcing/clients/${id}`, clientData);
    return res.data;
  },

  // Contracts
  getContracts: async () => {
    const res = await api.get("/api/outsourcing/contracts");
    return res.data?.data || [];
  },

  createContract: async (contractData) => {
    const res = await api.post("/api/outsourcing/contracts", contractData);
    return res.data;
  },

  // Requirements / Requisitions
  getRequirements: async (params = {}) => {
    const res = await api.get("/api/outsourcing/requirements", { params });
    return res.data?.data || [];
  },

  createRequirement: async (reqData) => {
    const res = await api.post("/api/outsourcing/requirements", reqData);
    return res.data;
  },

  updateRequirement: async (id, reqData) => {
    const res = await api.put(`/api/outsourcing/requirements/${id}`, reqData);
    return res.data;
  },

  assignRequirement: async (id, payload) => {
    const res = await api.put(`/api/outsourcing/requirements/${id}/assign`, payload);
    return res.data;
  },

  // Candidates
  addCandidate: async (candidateData) => {
    const res = await api.post("/api/outsourcing/candidates", candidateData);
    return res.data;
  },

  // Employees & Salary
  getEmployees: async (params = {}) => {
    const res = await api.get("/api/outsourcing/employees", { params });
    return res.data?.data || [];
  },

  createEmployee: async (employeeData, salaryData) => {
    const res = await api.post("/api/outsourcing/employees", {
      employeeData,
      salaryData,
    });
    return res.data;
  },

  assignEmployee: async (employeeId, payload) => {
    const res = await api.put(`/api/outsourcing/employees/${employeeId}/assign`, payload);
    return res.data;
  },

  previewSalary: async (monthlyGross) => {
    const res = await api.post("/api/outsourcing/salary/preview", { monthlyGross });
    return res.data?.data || null;
  },

  // Attendance & Leaves
  getAttendance: async (params = {}) => {
    const res = await api.get("/api/outsourcing/attendance", { params });
    return res.data?.data || [];
  },

  getLeaves: async (params = {}) => {
    const res = await api.get("/api/outsourcing/leaves", { params });
    return res.data?.data || [];
  },

  updateLeaveStatus: async (id, status, managerRemarks) => {
    const res = await api.put(`/api/outsourcing/leaves/${id}/status`, {
      status,
      managerRemarks,
    });
    return res.data;
  },

  // Payroll
  runMonthlyPayroll: async (payMonth, payYear, clientId) => {
    const res = await api.post("/api/outsourcing/payroll/run", {
      payMonth,
      payYear,
      clientId,
    });
    return res.data;
  },

  getPayrolls: async (params = {}) => {
    const res = await api.get("/api/outsourcing/payrolls", { params });
    return res.data?.data || [];
  },

  updatePayrollStatus: async (id, status, paymentReference, paymentDate) => {
    const res = await api.put(`/api/outsourcing/payrolls/${id}/status`, {
      status,
      paymentReference,
      paymentDate,
    });
    return res.data;
  },

  // Invoices & Billing
  generateInvoice: async ({ clientId, billingMonth, billingYear, contractId }) => {
    const res = await api.post("/api/outsourcing/invoices/generate", {
      clientId,
      billingMonth,
      billingYear,
      contractId,
    });
    return res.data;
  },

  getInvoices: async (params = {}) => {
    const res = await api.get("/api/outsourcing/invoices", { params });
    return res.data?.data || [];
  },

  updateInvoicePayment: async (id, paidAmount, paymentMethod, paymentTransactionRef) => {
    const res = await api.put(`/api/outsourcing/invoices/${id}/payment`, {
      paidAmount,
      paymentMethod,
      paymentTransactionRef,
    });
    return res.data;
  },

  // Exits
  getExits: async () => {
    const res = await api.get("/api/outsourcing/exits");
    return res.data?.data || [];
  },

  createExitRequest: async (exitData) => {
    const res = await api.post("/api/outsourcing/exits", exitData);
    return res.data;
  },

  updateExitStatus: async (id, payload) => {
    const res = await api.put(`/api/outsourcing/exits/${id}/status`, payload);
    return res.data;
  },

  // HR Assigned Clients
  getHRAssignedClients: async (hrUserId) => {
    const res = await api.get(`/api/outsourcing/hr/${hrUserId}/assigned-clients`);
    return res.data?.data || res.data || null;
  },
};
