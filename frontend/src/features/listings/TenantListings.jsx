import React, { useState, useEffect } from "react";
import PropertyCard from "../../components/PropertyCard";
import LoginHeader from "../../components/LoginHeader";

export default function TenantListings({ showHeader = true }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    userName: "",
    phone: "",
    message: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchListings(q = "") {
    setLoading(true);
    setError("");
    try {
      const url = `http://localhost:5000/api/properties?q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch listings");
      setResults(data.properties || []);
    } catch (err) {
      setError(err.message || "Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchListings(query);
  }

  function handleBook(property) {
    setSelectedProperty(property);
    setBookingError("");
    setBookingSuccess("");
    setBookingForm({
      userName: user?.name || "",
      phone: "",
      message: "",
    });
  }

  function closeBookingForm() {
    setSelectedProperty(null);
    setBookingError("");
    setBookingSuccess("");
  }

  async function submitBooking(e) {
    e.preventDefault();
    if (!selectedProperty) return;

    setBookingLoading(true);
    setBookingError("");
    setBookingSuccess("");

    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: selectedProperty._id,
          userName: bookingForm.userName,
          phone: bookingForm.phone,
          message: bookingForm.message,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { message: await res.text() };

      if (!res.ok) throw new Error(data.message || "Failed to create booking");

      setBookingSuccess("Booking request sent. The owner will review it soon.");
      setBookingForm({
        userName: user?.name || "",
        phone: "",
        message: "",
      });
    } catch (err) {
      setBookingError(err.message || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  }

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <LoginHeader />
        <p>Please log in to view listings.</p>
      </div>
    );
  }

  if (user.role !== "tenant") {
    return (
      <div style={{ padding: 20 }}>
        <LoginHeader />
        <p>This page is for tenants only.</p>
      </div>
    );
  }

  return (
    <>
      {showHeader && <LoginHeader />}
      <div className="page-shell section-card">
        <div>
          <div className="eyebrow">Browse</div>
          <h2 className="page-title">Search Listings</h2>
          <p className="muted">Find a place and send a request to the owner.</p>
        </div>
        <form
          onSubmit={handleSearch}
          className="listing-form">
          <input
            placeholder="Search by address, type, or info"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button
            type="submit"
            className="button button-primary">
            Search
          </button>
        </form>

        {error && (
          <div
            className="empty-state"
            style={{ color: "#b91c1c" }}>
            {error}
          </div>
        )}

        <h3 className="section-title">All Available Listings</h3>
        {loading && <div>Loading...</div>}
        {results.length === 0 && !loading ? (
          <div className="empty-state">No listings found.</div>
        ) : (
          results.map((p) => (
            <PropertyCard
              key={p._id}
              property={p}
              onBook={handleBook}
            />
          ))
        )}

        {selectedProperty && (
          <div className="booking-modal">
            <div className="booking-modal__panel">
              <h3 style={{ marginTop: 0 }}>Book this property</h3>
              <div
                className="muted"
                style={{ marginBottom: 12 }}>
                {selectedProperty.propertyType} -{" "}
                {selectedProperty.propertyAddress}
              </div>
              <form onSubmit={submitBooking}>
                <input
                  placeholder="Your name"
                  value={bookingForm.userName}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, userName: e.target.value })
                  }
                  className="auth-field"
                  required
                />
                <input
                  placeholder="Phone number"
                  value={bookingForm.phone}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, phone: e.target.value })
                  }
                  className="auth-field"
                  required
                />
                <textarea
                  placeholder="Message to owner"
                  value={bookingForm.message}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, message: e.target.value })
                  }
                  className="auth-field"
                  style={{ minHeight: 100 }}
                />

                {bookingError && (
                  <div style={{ color: "#c62828", marginBottom: 10 }}>
                    {bookingError}
                  </div>
                )}
                {bookingSuccess && (
                  <div style={{ color: "#2e7d32", marginBottom: 10 }}>
                    {bookingSuccess}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="button button-primary booking-action">
                    {bookingLoading ? "Sending..." : "Send Request"}
                  </button>
                  <button
                    type="button"
                    onClick={closeBookingForm}
                    className="button button-secondary booking-action">
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
