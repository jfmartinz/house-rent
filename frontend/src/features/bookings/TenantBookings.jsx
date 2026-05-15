import React, { useEffect, useState } from "react";
import LoginHeader from "../../components/LoginHeader";

export default function TenantBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const token = localStorage.getItem("token");

  async function readApiResponse(res) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return res.json();
    }

    const text = await res.text();
    return {
      message: text.slice(0, 200) || "Unexpected non-JSON response",
      raw: text,
    };
  }

  useEffect(() => {
    fetchBookings();
    const intervalId = setInterval(() => {
      fetchBookings({ quiet: true });
    }, 5000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchBookings(options = {}) {
    const { quiet = false } = options;
    if (!quiet) {
      setLoading(true);
    }
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/bookings/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.message || "Failed to fetch bookings");
      setBookings(data.bookings || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || "Failed to fetch bookings");
    } finally {
      if (!quiet) {
        setLoading(false);
      }
    }
  }

  return (
    <>
      <LoginHeader />
      <div className="page-shell section-card">
        <div>
          <div className="eyebrow">Bookings</div>
          <h2 className="page-title">My Bookings</h2>
        </div>
        {lastUpdated && !loading && (
          <div
            className="muted"
            style={{ marginBottom: 12, fontSize: 14 }}>
            Auto-updated at {lastUpdated}
          </div>
        )}
        {loading && <div>Loading...</div>}
        {error && (
          <div
            className="empty-state"
            style={{ color: "#b91c1c" }}>
            {error}
          </div>
        )}
        {bookings.length === 0 && !loading ? (
          <div className="empty-state">No bookings yet.</div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking._id}
              className="booking-card">
              <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>
                {booking.userName}
              </div>
              <div>Phone: {booking.phone}</div>
              <div style={{ marginTop: 8 }}>
                <span
                  className={`status-badge status-badge--${booking.bookingStatus}`}>
                  {booking.bookingStatus}
                </span>
              </div>
              {booking.message && (
                <div style={{ marginTop: 10 }}>{booking.message}</div>
              )}
              {booking.property && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 800 }}>
                    {booking.property.propertyType} -{" "}
                    {booking.property.ownerName}
                  </div>
                  <div>{booking.property.propertyAddress}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
