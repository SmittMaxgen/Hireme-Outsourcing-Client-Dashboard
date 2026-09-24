import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://apidata.hiremejobs.in";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hr_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unauthorized handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect if session expired
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("hr_token");
        localStorage.removeItem("hr_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
