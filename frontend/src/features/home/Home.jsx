import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page-shell">
      <main className="dashboard-page">
        <section className="hero surface-card">
          <div className="eyebrow">HouseHunt</div>
          <h2>Find and manage rental homes faster</h2>
          <p className="lead muted">
            Search by location, budget, and amenities. Owners can list
            properties and manage inquiries from one simple dashboard.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>Simple</strong>
              <span>Clean owner and tenant flows</span>
            </div>
            <div className="hero-stat">
              <strong>Fast</strong>
              <span>Bookings and listings in one place</span>
            </div>
            <div className="hero-stat">
              <strong>Secure</strong>
              <span>Login, roles, and protected dashboards</span>
            </div>
          </div>

          <div className="cta-row">
            <Link
              to="/register"
              className="button button-primary">
              Get Started
            </Link>
            <Link
              to="/login"
              className="button button-secondary">
              Login
            </Link>
          </div>
        </section>

        <section className="feature-grid">
          <article className="listing-card">
            <div className="listing-card__header">For Property Owners</div>
            <div className="listing-card__info">
              List properties, track applicants, and manage agreements in one
              place.
            </div>
          </article>

          <article className="listing-card">
            <div className="listing-card__header">For Tenants</div>
            <div className="listing-card__info">
              Browse homes, send booking requests, and track your booking
              history.
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
