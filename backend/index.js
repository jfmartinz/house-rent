require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const Property = require("./schemas/property");
const authMiddleware = require("./middleware/authMiddleware");
const requiredRole = require("./middleware/roleMiddleware");
const propertyController = require("./controllers/propertyController");

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error("Missing JWT_SECRET in .env");
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend server is running" });
});

app.get("/debug-route-check", (req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/api/properties", async (req, res) => {
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
});

app.get(
  "/api/properties/mine",
  authMiddleware,
  requiredRole("owner"),
  propertyController.getMyProperties,
);

app.put(
  "/api/properties/:id",
  authMiddleware,
  requiredRole("owner"),
  propertyController.updateProperty,
);

app.delete(
  "/api/properties/:id",
  authMiddleware,
  requiredRole("owner"),
  propertyController.deleteProperty,
);

app.post("/api/properties", async (req, res) => {
  try {
    const created = await Property.create(req.body);
    return res.status(201).json({ success: true, property: created });
  } catch (error) {
    console.error("Create property error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create property" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/api/_routes", (req, res) => {
  try {
    const routes = app._router.stack
      .filter((r) => r.route)
      .map((r) => ({
        path: r.route.path,
        methods: Object.keys(r.route.methods),
      }));
    res.json({ success: true, routes });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

// Debug: print registered routes (safe)
setTimeout(() => {
  try {
    if (!app || !app._router || !app._router.stack) {
      console.log("No express router available yet — skipping route listing.");
      return;
    }
    const routes = app._router.stack
      .filter((r) => r.route)
      .map((r) => ({
        path: r.route.path,
        methods: Object.keys(r.route.methods),
      }));
    console.log("Registered routes:", routes);
  } catch (e) {
    console.error("Failed to list routes", e);
  }
}, 1000);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
