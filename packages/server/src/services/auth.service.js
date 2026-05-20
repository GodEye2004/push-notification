const jwt = require("jsonwebtoken");
const otpRepo = require("../repositories/otp.repo");
const userRepo = require("../repositories/user.repo");
const kavenegarService = require("../utils/kavenegar");

const sendOtp = async (phone) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60000);
  await otpRepo.upsert(phone, code, expiresAt);
  await kavenegarService.sendOTP(phone, code);
};

const verifyOtp = async (phone, code) => {
  const otpDoc = await otpRepo.findValid(phone, code);
  if (!otpDoc) throw new Error("Invalid or expired OTP.");

  await otpRepo.deleteById(otpDoc._id);

  let user = await userRepo.findByPhone(phone);
  if (!user) user = await userRepo.create({ phone });

  const token = jwt.sign(
    { id: user._id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET || "supersecret123",
    { expiresIn: "7d" }
  );

  return { token, user: { phone: user.phone, role: user.role } };
};

const getUser = async (id) => {
  const user = await userRepo.findById(id);
  if (!user) throw new Error("User not found.");
  return user;
};

module.exports = { sendOtp, verifyOtp, getUser };