const authService = require("../services/auth.service");

const sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number is required." });
  try {
    await authService.sendOtp(phone);
    res.json({ message: "OTP sent successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: "Phone and code are required." });
  try {
    const result = await authService.verifyOtp(phone, code);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const me = async (req, res) => {
  try {
    const user = await authService.getUser(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { sendOtp, verifyOtp, me };