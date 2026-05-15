const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");
const propertyController = require("../controllers/propertyController");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.me);

// public search
router.get("/properties", propertyController.getProperties);

// owner-only create / manage
router.post(
  "/properties",
  authMiddleware,
  require("../middleware/roleMiddleware")("owner"),
  propertyController.createProperty,
);
router.get(
  "/properties/mine",
  authMiddleware,
  propertyController.getMyProperties,
);
router.put(
  "/properties/:id",
  authMiddleware,
  require("../middleware/roleMiddleware")("owner"),
  propertyController.updateProperty,
);
router.delete(
  "/properties/:id",
  authMiddleware,
  require("../middleware/roleMiddleware")("owner"),
  propertyController.deleteProperty,
);

module.exports = router;
