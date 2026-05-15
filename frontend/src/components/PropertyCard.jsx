import React from "react";

export default function PropertyCard({ property, onBook }) {
  if (!property) return null;

  const {
    propertyAddress,
    propertyType,
    propertyAmt,
    ownerName,
    ownerContact,
    additionalInfo,
  } = property;

  return (
    <article className="listing-card">
      <div className="listing-card__header">
        {propertyType} — {ownerName || "Owner"}
      </div>
      <div className="listing-card__meta">{propertyAddress}</div>
      <div className="listing-card__price">₱ {propertyAmt || 0}</div>
      {additionalInfo && (
        <div className="listing-card__info">{additionalInfo}</div>
      )}
      {ownerContact && (
        <div className="listing-card__contact">Contact: {ownerContact}</div>
      )}
      {onBook && (
        <button
          className="button button-success listing-card__action"
          onClick={() => onBook(property)}>
          Book Now
        </button>
      )}
    </article>
  );
}
