const Property = require("../schemas/property");
const User = require("../schemas/user");
const Booking = require("../schemas/booking");

exports.getProperties = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const filter = q
      ? {
          $or: [
            { propertyAddress: { $regex: q, $options: "i" } },
            { propertyType: { $regex: q, $options: "i" } },
            { ownerName: { $regex: q, $options: "i" } },
            { additionalInfo: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const properties = await Property.find(filter).limit(100).lean();

    return res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error("Get properties error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch properties" });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const payload = req.body || {};
    // attach ownerId when available (authenticated owner)
    if (req.user && req.user.id) {
      payload.ownerId = req.user.id;
      const owner = await User.findById(req.user.id).select("name").lean();
      if (owner && owner.name) {
        payload.ownerName = owner.name;
      }
    }
    const created = await Property.create(payload);
    return res.status(201).json({ success: true, property: created });
  } catch (error) {
    console.error("Create property error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create property" });
  }
};

exports.getMyProperties = async (req, res) => {
  try {
    const ownerId = req.user && req.user.id;
    if (!ownerId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    // Only return properties where ownerId matches the authenticated user.
    const filter = { ownerId };
    const properties = await Property.find(filter).lean();
    return res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error("Get my properties error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch properties" });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const id = req.params.id;
    const ownerId = req.user && req.user.id;
    const existing = await Property.findById(id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    // allow update only when ownerId matches the authenticated user
    if (!existing.ownerId || String(existing.ownerId) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    Object.assign(existing, req.body);
    if (ownerId) {
      const owner = await User.findById(ownerId).select("name").lean();
      if (owner && owner.name) {
        existing.ownerName = owner.name;
      }
    }
    await existing.save();
    return res.status(200).json({ success: true, property: existing });
  } catch (error) {
    console.error("Update property error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update property" });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const id = req.params.id;
    const ownerId = req.user && req.user.id;
    const existing = await Property.findById(id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    // allow delete only when ownerId matches the authenticated user
    if (!existing.ownerId || String(existing.ownerId) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Prevent deletion when there are pending or accepted bookings for this property
    const activeBooking = await Booking.findOne({
      propertyId: id,
      bookingStatus: { $in: ["pending", "accepted"] },
    }).lean();

    if (activeBooking) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete property with active bookings (pending or accepted)",
      });
    }

    await Property.deleteOne({ _id: id });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete property error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete property" });
  }
};
