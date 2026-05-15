const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");
const requiredRole = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, bookingController.createBooking);
router.get("/mine", authMiddleware, bookingController.getMyBookings);
router.get(
  "/owner",
  authMiddleware,
  requiredRole("owner"),
  bookingController.getOwnerBookings,
);
router.put(
  "/:id",
  authMiddleware,
  requiredRole("owner"),
  bookingController.updateBookingStatus,
);

module.exports = router;
