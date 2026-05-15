import React, { useState, useEffect } from "react";
import LoginHeader from "../../components/LoginHeader";
import PropertyCard from "../../components/PropertyCard";

export default function OwnerListings({ showHeader = true }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    propertyType: "",
    propertyAdType: "Rent",
    propertyAddress: "",
    ownerContact: "",
    propertyAmt: "",
    additionalInfo: "",
  });
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

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
    fetchMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchMine() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/properties/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      setListings(data.properties || []);
    } catch (err) {
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!form.propertyType || !form.propertyAddress || !form.ownerContact) {
        setError("Please fill property type, address and owner contact");
        setLoading(false);
        return;
      }

      const payload = {
        ...form,
        ownerContact: Number(form.ownerContact) || 0,
        propertyAmt: Number(form.propertyAmt) || 0,
      };

      let res;
      if (editId) {
        res = await fetch(`http://localhost:5000/api/properties/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("http://localhost:5000/api/properties", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.message || "Failed to save");

      setForm({
        propertyType: "",
        propertyAdType: "Rent",
        propertyAddress: "",
        ownerContact: "",
        propertyAmt: "",
        additionalInfo: "",
      });
      setEditId(null);
      fetchMine();
    } catch (err) {
      setError(err.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  function handleCancelEdit() {
    setEditId(null);
    setForm({
      propertyType: "",
      propertyAdType: "Rent",
      propertyAddress: "",
      ownerContact: "",
      propertyAmt: "",
      additionalInfo: "",
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this listing?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/properties/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await readApiResponse(res);
        throw new Error(data.message || "Failed to delete");
      }
      fetchMine();
    } catch (err) {
      setError(err.message || "Failed to delete");
    }
  }

  if (!user || user.role !== "owner") {
    return (
      <div style={{ padding: 20 }}>
        <LoginHeader />
        <p>Owners only.</p>
      </div>
    );
  }

  return (
    <>
      {showHeader && <LoginHeader />}
      <div className="page-shell section-card">
        <div>
          <div className="eyebrow">Owner workspace</div>
          <h2 className="page-title">Your Listings</h2>
        </div>

        <form
          onSubmit={handleCreate}
          className="listing-form surface-card">
          <input
            placeholder="Property Type"
            value={form.propertyType}
            onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
          />

          <input
            placeholder="Address"
            value={form.propertyAddress}
            onChange={(e) =>
              setForm({ ...form, propertyAddress: e.target.value })
            }
          />

          <input
            placeholder="Owner Contact"
            value={form.ownerContact}
            onChange={(e) => setForm({ ...form, ownerContact: e.target.value })}
          />

          <input
            placeholder="Amount"
            value={form.propertyAmt}
            onChange={(e) => setForm({ ...form, propertyAmt: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading}
            className="button button-primary">
            {editId ? "Save" : "Add"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="button button-secondary">
              Cancel
            </button>
          )}
        </form>

        {loading && <div>Loading...</div>}
        {error && (
          <div
            className="empty-state"
            style={{ color: "#b91c1c" }}>
            {error}
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className="empty-state">You do not have any listings yet.</div>
        )}

        {listings.map((p) => (
          <div
            key={p._id}
            style={{ marginBottom: 16 }}>
            <PropertyCard property={p} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  setForm({
                    propertyType: p.propertyType || "",
                    propertyAdType: p.propertyAdType || "Rent",
                    propertyAddress: p.propertyAddress || "",
                    ownerContact: p.ownerContact || "",
                    propertyAmt: p.propertyAmt || "",
                    additionalInfo: p.additionalInfo || "",
                  });
                  setEditId(p._id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="button button-secondary">
                Edit
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                className="button button-danger">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
