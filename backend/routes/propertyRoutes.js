const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");
const authMiddleware = require("../middleware/authMiddleware");
const requiredRole = require("../middleware/roleMiddleware");

router.get("/", propertyController.getProperties);
router.post("/", propertyController.createProperty);
router.get(
  "/mine",
  authMiddleware,
  requiredRole("owner"),
  propertyController.getMyProperties,
);
router.put(
  "/:id",
  authMiddleware,
  requiredRole("owner"),
  propertyController.updateProperty,
);
router.delete(
  "/:id",
  authMiddleware,
  requiredRole("owner"),
  propertyController.deleteProperty,
);

module.exports = router;
