const router = require("express").Router();
const { authMiddleware } = require("../middleware/auth.middleware");
const ctrl = require("../controllers/notification.controller");

router.post("/send-notification", authMiddleware, ctrl.send);
router.get("/pending-notifications/:device_id", ctrl.getPending);
router.get("/api/status", ctrl.getStatus);

module.exports = router;