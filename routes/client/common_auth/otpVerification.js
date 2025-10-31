// 📦 Import required modules
const express = require("express");
const otpVerificationRouter = express.Router();
const redisClient = require("../../../config/redis/redisClient"); // 🧠 Redis client
const generateToken = require("../../../utils/tokenCreate/token");

/**
 * 📌 Route: POST /:role/verify-otp
 * -----------------------------------
 * 🔍 Purpose: Verifies the OTP sent to the user based on their role.
 * ✅ Supports: Parent and Teacher roles.
 */
otpVerificationRouter.post("/:role/verify-otp", async (req, res,next) => {
  try {
    // 🔗 Extract role from params and user data from body
    const { role } = req.params;
    const { fullOtp, email, uidsecode } = req.body;
    const userInfo = { email, uidsecode };

    // ⚠️ Validate input
    if (!fullOtp || !email || !role) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields: role, email, or OTP.",
      });
    }

    // 🧾 Retrieve stored OTP from Redis
    const storedOtp = await redisClient.get(`eduspark_${role}_OTP:${email}`);

    // 🔐 Check if OTP matches
    if (storedOtp == fullOtp) {
      const token = await generateToken(userInfo, role);

      res.cookie(`${role}_token`, token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      // ✅ OTP retrieved, now delete it from Redis
      await redisClient.del(`eduspark_${role}_OTP:${email}`);

      return res.status(200).json({
        status: true,
        message: "OTP verified successfully.",
      });
    } else {
      return res.status(400).json({
        status: "wrongOtp",
        message: "Invalid or expired OTP.",
      });
    }
  } catch (error) {
    next(error);
  }
});

// 📤 Export router
module.exports = otpVerificationRouter;
