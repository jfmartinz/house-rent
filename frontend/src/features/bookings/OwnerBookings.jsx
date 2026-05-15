import React, { useEffect, useState } from "react";
import LoginHeader from "../../components/LoginHeader";

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchBookings() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings/owner", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.message || "Failed to fetch bookings");
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.message || "Failed to update");
      fetchBookings();
    } catch (err) {
      setError(err.message || "Failed to update booking");
    }
  }

  return (
    <>
      <LoginHeader />
      <div className="page-shell section-card">
        <div>
          <div className="eyebrow">Owner bookings</div>
          <h2 className="page-title">Your Bookings</h2>
        </div>
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
          bookings.map((b) => (
            <div
              key={b._id}
              className="booking-card">
              <div style={{ fontWeight: 700 }}>
                {b.userName} — {b.phone}
              </div>
              {b.message && <div style={{ marginTop: 6 }}>{b.message}</div>}
              {b.property && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontWeight: 600 }}>
                    {b.property.propertyType} — {b.property.ownerName}
                  </div>
                  <div>{b.property.propertyAddress}</div>
                </div>
              )}
              <div style={{ marginTop: 8 }}>Status: {b.bookingStatus}</div>
              {b.bookingStatus === "pending" ? (
                <div style={{ marginTop: 8 }}>
                  <button
                    onClick={() => updateStatus(b._id, "accepted")}
                    style={{ marginRight: 8 }}>
                    Accept
                  </button>
                  <button onClick={() => updateStatus(b._id, "rejected")}>
                    Reject
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 8, fontWeight: 600 }}>
                  Decision completed
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
