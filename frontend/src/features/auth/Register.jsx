import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginHeader from "../../components/LoginHeader";
import "../../styles/auth.css";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role: userType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      navigate("/login", { state: { message: data.message } });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginHeader />
      <div className="register-page">
        <div className="register-card">
          <div className="register-top">
            <div className="register-icon">🔒</div>
            <h3 className="register-title">Sign up</h3>
          </div>

          <form
            className="register-form"
            onSubmit={handleSubmit}>
            <input
              className="register-input auth-field"
              placeholder="Renter Full Name/Owner Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <input
              type="email"
              className="register-input auth-field"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              className="register-input auth-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label
              className="muted"
              style={{ fontSize: 13 }}>
              User Type
            </label>
            <select
              className="register-select auth-select"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              required>
              <option value="">Select type</option>
              <option value="owner">Owner</option>
              <option value="tenant">Renter</option>
            </select>

            <div className="register-actions">
              <button
                className="register-button"
                type="submit"
                disabled={loading}>
                {loading ? "Signing up..." : "SIGN UP"}
              </button>
            </div>

            {error && (
              <div
                className="empty-state"
                style={{ color: "#b91c1c" }}>
                {error}
              </div>
            )}

            <div className="register-footer">
              Have an account? <Link to="/login">Sign In</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
