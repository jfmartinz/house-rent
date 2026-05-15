import React from "react";
import { useNavigate } from "react-router-dom";
import OwnerListings from "../listings/OwnerListings";
import TenantListings from "../listings/TenantListings";
import LoginHeader from "../../components/LoginHeader";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="page-shell dashboard-page">
      <LoginHeader />
      <section className="dashboard-hero surface-card">
        <div>
          <div className="eyebrow">Welcome back</div>
          <h2>{user.name}</h2>
          <p className="muted">Role: {user.role}</p>
        </div>
      </section>

      {user.role === "owner" ? (
        <section className="dashboard-section">
          <h3>Owner dashboard</h3>
          <p className="muted">
            Here you can manage your listings and view applicants.
          </p>
          <OwnerListings showHeader={false} />
        </section>
      ) : (
        <section className="dashboard-section">
          <h3>Tenant dashboard</h3>
          <p className="muted">
            Here you can search listings and contact owners.
          </p>
          <TenantListings showHeader={false} />
        </section>
      )}
    </div>
  );
};

export default Dashboard;
