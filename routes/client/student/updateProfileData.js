const express = require("express");
const updateProfileDataRouter = express.Router();
const bcrypt = require("bcryptjs");
const studentSchema = require("../../../models/student");
const teacherSchema = require("../../../models/teacher");
const parentSchema = require("../../../models/parent");
const {
  verifyTokenByRole,
} = require("../../../middleware/verifyToken/verify_token");

updateProfileDataRouter.post(
  "/:role/change-password",
  verifyTokenByRole(),
  async (req, res,next) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const { role } = req.params;
      const { _id } = req[role];

      // 1. Validate input fields
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Please fill all password fields.",
        });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from current password.",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "New password and confirm password do not match.",
        });
      }

      if (newPassword.length < 5 || newPassword.length > 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be 5 to 8 characters long.",
        });
      }

      // 2. Select model based on role
      let Model;
      if (role === "student") Model = studentSchema;
      else if (role === "teacher") Model = teacherSchema;
      else if (role === "parent") Model = parentSchema;
      else {
        return res.status(400).json({
          success: false,
          message: "Invalid role specified.",
        });
      }

      // 3. Find user by ID
      const user = await Model.findById(_id).select("password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // 4. Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          status: "C-incorrect",
          message: "Current password is incorrect.",
        });
      }

      // 5. Hash new password and update
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Password changed successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = updateProfileDataRouter;
