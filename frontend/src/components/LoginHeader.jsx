import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/header.css";

export default function LoginHeader() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();
  const hideAuthLinks = ["/login", "/register"].includes(location.pathname);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // navigate to login
    navigate("/login", { replace: true });
  }

  return (
    <header className="login-header">
      <div className="login-header-container">
        <h1 className="login-brand">HOUSE HUNT</h1>
        <nav className="login-nav">
          {/* Show Home only when not logged in */}
          {!user && (
            <Link
              className="nav-link"
              to="/">
              Home
            </Link>
          )}

          {user && (
            <>
              <Link
                className="nav-link"
                to="/dashboard">
                Dashboard
              </Link>

              {user.role === "owner" && (
                <Link
                  className="nav-link"
                  to="/owner/bookings">
                  Bookings
                </Link>
              )}

              {user.role === "tenant" && (
                <Link
                  className="nav-link"
                  to="/bookings">
                  My Bookings
                </Link>
              )}

              {/* prominent logout button */}
              <button
                className="button button-danger nav-button"
                onClick={handleLogout}>
                Logout
              </button>
            </>
          )}

          {!user && !hideAuthLinks && (
            <>
              {/* when not logged in, show login/register links to the right */}
              <Link
                className="nav-link"
                to="/login">
                Login
              </Link>
              <Link
                className="nav-link"
                to="/register">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
