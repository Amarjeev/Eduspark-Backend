const express = require("express");
const forgotPasswordRouter = express.Router();
const adminSchema = require("../../../models/admin");
const teacherSchema = require("../../../models/teacher");
const studentSchema = require("../../../models/student");
const parentSchema = require("../../../models/parent");
const redisClient = require("../../../config/redis/redisClient");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../../../utils/email_Service/sendEmail");
const OtpEmailTemplate = require("../../../utils/emails_ui/password-reset_OTPEmailTemplate");

// 📩 Route to handle password recovery for all roles (admin, teacher, student, parent)
forgotPasswordRouter.post("/forgot-password/:role", async (req, res,next) => {
  try {
    const userRole = req.params.role?.toLowerCase(); // 🔍 Get role from URL param
    const { email, enterdOtp, id, newPassword, confirmPassword } = req.body; // 📥 Destructure request body
    let newEmail = email;

    // ❌ Validate role existence
    if (!userRole) {
      return res
        .status(400)
        .json({ success: false, message: "Role is required in the URL." });
    }

    // 🔁 Handle OTP verification step
    if (enterdOtp) {
      if (!id) {
        return res.status(400).json({
          success: "id-missing",
          message: "Missing user ID. Please try again.",
        });
      }

      // 📦 Fetch OTP and email from Redis
      const data = await redisClient.get(`eduspark_password-reset_OTP:${id}`);
      const { otp, email } = data;
      newEmail = email;

      // ❌ OTP expired or not found
      if (!otp) {
        return res.status(400).json({
          success: "expire",
          message:
            "OTP has expired or was not found. Please request a new one.",
        });
      }

      // ❌ OTP does not match
      if (otp !== enterdOtp) {
        return res.status(400).json({
          success: false,
          message: "Incorrect OTP. Please try again.",
        });
      }

      // ✅ OTP is valid — delete it from Redis
      await redisClient.del(`eduspark_password-reset_OTP:${id}`);

      // ✅ Respond with verification success
      return res.status(200).json({
        success: true,
        message: "OTP verified successfully.",
        id: id,
      });
    }

    // 📌 Map roles to their respective Mongoose schemas
    const roleSchemaMap = {
      admin: adminSchema,
      teacher: teacherSchema,
      student: studentSchema,
      parent: parentSchema,
    };

    const SelectedSchema = roleSchemaMap[userRole]; // 🏫 Get schema for current role

    // ❌ Invalid role check
    if (!SelectedSchema) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role specified." });
    }

    let response = null;

    // 🔎 Find user record only when requesting OTP (not resetting password yet)
    if (!newPassword && !confirmPassword) {
      response = await SelectedSchema.findOne({ email: newEmail })
        .select("email password")
        .lean();
    }

    // 📤 Handle OTP sending logic
    if (email) {
      if (response) {
        // 📧 Generate OTP and email HTML
        const { otp, html } = OtpEmailTemplate(email, userRole);

        // ❌ If ID is missing in the response
        if (!response?._id) {
          return res.status(400).json({
            success: "id-missing",
            message: "Missing user ID. Please try again.",
          });
        }

        // 🗃️ Save OTP & email in Redis with 2-minute expiration
        await redisClient.set(
          `eduspark_password-reset_OTP:${response._id}`,
          JSON.stringify({ otp: otp.toString(), email }),
          { EX: 120 }
        );

        // 📬 Send OTP email to the user
        await sendEmail(
          email,
          `${userRole} Password Reset OTP - Eduspark`,
          `Your Eduspark password reset OTP is: ${otp}`,
          html
        );

        // ✅ Respond with success and return user ID
        return res
          .status(200)
          .json({ success: true, message: "Email found.", id: response._id });
      } else {
        // ❌ Email not found
        return res.status(404).json({
          success: "not-found",
          message: "Email not found in our records.",
        });
      }
    }

    // 🔒 Handle password reset step
    if (newPassword && confirmPassword) {
      // ❌ Required fields validation
      if (!newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: !newPassword
            ? "New password is required."
            : "Please confirm your password.",
        });
      }

      // 🔐 Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 8 characters, include a lowercase letter and a number.",
        });
      }

      // ❌ Check if passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match.",
        });
      }

      // ❌ Check for missing user ID
      if (!id) {
        return res.status(400).json({
          success: "id-missing",
          message: "Missing user ID. Please try again.",
        });
      }

      // 🔐 Hash the new password before saving
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 🔁 Update password in the database
      const response = await SelectedSchema.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true }
      );

      // ❌ User not found in DB
      if (!response) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // ✅ Password updated successfully
      return res.status(200).json({
        success: true,
        message: "Password reset successfully.",
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = forgotPasswordRouter;
