import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import LoginHeader from "../../components/LoginHeader";
import "../../styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const regMessage =
    location.state && location.state.message ? location.state.message : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginHeader />
      <div className="login-container">
        <div className="login-form-wrapper">
          <div className="login-icon">🔒</div>
          <h2 className="login-title">Login</h2>
          {regMessage && (
            <div
              className="empty-state"
              style={{ color: "#166534" }}>
              {regMessage}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="login-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-field"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-field"
                required
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}>
              {loading ? "Signing in..." : "SIGN IN"}
            </button>
            {error && (
              <div
                className="empty-state"
                style={{ color: "#b91c1c" }}>
                {error}
              </div>
            )}
          </form>

          <div className="login-links">
            <span>
              Forgot password? <Link to="/forgot-password">Click here</Link>
            </span>
            <span>
              Have an account? <Link to="/register">Register</Link>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
