const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

router.post("/send-otp", ctrl.sendOtp);
router.post("/verify-otp", ctrl.verifyOtp);
router.get("/me", authMiddleware, ctrl.me);

module.exports = router;