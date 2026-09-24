import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Login from "../pages/Auth/Login";
import HROutsourcingDashboard from "../pages/Dashboard/HROutsourcingDashboard";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected HR Dashboard Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<HROutsourcingDashboard />} />
          <Route path="/dashboard" element={<HROutsourcingDashboard />} />
          <Route path="/outsourcing" element={<HROutsourcingDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
