import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/clientService";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("client_token");
      const storedUser = localStorage.getItem("client_user");
      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      localStorage.removeItem("client_token");
      localStorage.removeItem("client_user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/company-users/login", {
        email: email.trim(),
        password,
      });
      const data = res.data;
      if (!data.success && !data.data) {
        throw new Error(data.message || "Invalid credentials");
      }
      const userData = data.data?.user || data.user;
      const tokens = data.data?.tokens || data.tokens;
      const token = tokens?.accessToken || data.token;

      localStorage.setItem("client_token", token);
      localStorage.setItem("client_user", JSON.stringify(userData));
      setUser(userData);
      toast.success(`Welcome back, ${userData.full_name || "Partner"}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed.";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (registerData) => {
    try {
      const res = await api.post("/company-users/register", registerData);
      const data = res.data;
      if (!data.success && !data.data) {
        throw new Error(data.message || "Registration failed");
      }
      const userData = data.data?.user || data.user;
      const tokens = data.data?.tokens || data.tokens;
      const token = tokens?.accessToken || data.token;

      if (token) {
        localStorage.setItem("client_token", token);
        localStorage.setItem("client_user", JSON.stringify(userData));
        setUser(userData);
      }
      toast.success("Client Company registered successfully!");
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Registration failed.";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
