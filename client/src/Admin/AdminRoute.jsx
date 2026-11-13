import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api";

function AdminRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;
    const token = window.sessionStorage.getItem("internarea_admin_token");
    if (!token) {
      setStatus("unauthorized");
      return () => { active = false; };
    }

    api.get("/api/admin/me")
      .then(() => { if (active) setStatus("authorized"); })
      .catch(() => {
        window.sessionStorage.removeItem("internarea_admin_token");
        if (active) setStatus("unauthorized");
      });

    return () => { active = false; };
  }, []);

  if (status === "checking") return <div className="admin-panel-wrap"><p>Checking admin session...</p></div>;
  if (status === "unauthorized") return <Navigate to="/adminLogin" replace />;
  return children;
}

export default AdminRoute;
