// 📦 Required modules
const express = require("express");
const resendOtpRouter = express.Router();
const redisClient = require("../../../config/redis/redisClient"); // 🧠 Redis config (make sure the path is correct)
const { sendEmail } = require("../../../utils/email_Service/sendEmail"); // 📧 Utility to send email
const OtpEmailTemplate = require("../../../utils/emails_ui/login_OTPEmailTemplate"); // 📨 OTP email template for teachers
/**
 * 📌 Route: POST /:role/resend-otp
 * ---------------------------------
 * 🔁 Purpose: Resend a fresh OTP to user via email (based on role)
 * 🔐 OTP is stored in Redis for 3 minutes (180 seconds)
 */
resendOtpRouter.post("/:role/resend-otp", async (req, res,next) => {
  try {
    const { role } = req.params;
    const { email } = req.body;

    // ⚠️ Validate inputs
    if (!role || !email) {
      return res.status(400).json({
        success: false,
        message: "Role or email is missing.",
      });
    }

    // 🔢 Generate OTP and HTML email content using template
    const { otp, html } = OtpEmailTemplate(email, role);

    // 🗃️ Store OTP in Redis with 3-minute expiry ⏳
    await redisClient.set(`eduspark_${role}_OTP:${email}`, otp.toString(), { ex: 180 });

    // 📤 Send OTP email
    await sendEmail(
      email,
      `${role} Login OTP - Eduspark`,
      `Your login OTP is: ${otp}`,
      html
    );

    // ✅ Respond with success
    return res.status(200).json({
      success: true,
      message: "OTP has been resent to your email.",
    });
  } catch (error) {
    next(error);
  }
});

// 📤 Export router
module.exports = resendOtpRouter;
