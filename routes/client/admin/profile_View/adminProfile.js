const express = require("express");
const adminProfileRouter = express.Router();
const adminSchema = require("../../../../models/admin");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");
const bcrypt = require("bcryptjs");

// @route   POST /admin-profileEdit/:item
// @desc    Update specific admin profile fields based on route param
// @access  Private (admin only)
adminProfileRouter.post(
  "/admin-profileEdit/:item",
  verifyTokenByRole("admin"),
  async (req, res,next) => {
    try {
      const { udisecode, employid } = req.admin;
      const {
        name,
        email,
        phonenumber,
        schoolname,
        Password,
        confirmPassword,
        currentPassword,
      } = req.body;

      const item = req.params.item;
      let adminData = null;

      // Fetch admin by ID
      const admin = await adminSchema.findOne({ _id: employid }).lean();

      // Prevent duplicate email if email is being updated
      if (email) {
        const exists = await adminSchema
          .findOne({ email, _id: { $ne: employid } })
          .select("email")
          .lean();

        if (exists) {
          return res.status(409).json({
            success: "exists-email",
            message: "Email is already in use by another account.",
          });
        }
      }

      // Return error if admin not found
      if (!admin) {
        return res
          .status(404)
          .json({ success: false, message: "Admin not found." });
      }

      // Update based on requested item
      switch (item) {
        case "name":
          adminData = name?.trim() || admin.name;
          break;

        case "email":
          adminData = email?.trim() || admin.email;
          break;

        case "phonenumber":
          adminData = phonenumber?.trim() || admin.phonenumber;
          break;

        case "schoolname":
          adminData = schoolname?.trim() || admin.schoolname;
          break;

        case "password":
          // Check for missing password fields
          if (!currentPassword || !Password || !confirmPassword) {
            return res.status(400).json({
              success: false,
              message: "All password fields are required.",
            });
          }

          // Ensure new passwords match
          if (Password !== confirmPassword) {
            return res.status(400).json({
              success: false,
              message: "Passwords do not match.",
            });
          }

          // Verify current password
          const isMatch = await bcrypt.compare(currentPassword, admin.password);
          if (!isMatch) {
            return res.status(400).json({
              success: "current-password-wrong",
              message: "Current password is incorrect.",
            });
          }

          // Hash new password
          const hashedPassword = await bcrypt.hash(Password, 10);
          adminData = hashedPassword;
          break;

        default:
          return res.status(400).json({
            success: false,
            message: "Invalid update item.",
          });
      }

      // Update the specific field in the database
      await adminSchema.findOneAndUpdate(
        { _id: employid },
        { $set: { [item]: adminData } },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: `${item} updated successfully`,
        updatedField: item,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /admin-delete-account
// @desc    Soft delete admin account (requires UDISE code confirmation)
// @access  Private (admin only)
adminProfileRouter.delete(
  "/admin-delete-account",
  verifyTokenByRole("admin"),
  async (req, res,next) => {
    try {
      const { employid, udisecode } = req.admin;
      const { deleteConfirmInput } = req.body;

      // Validate UDISE code input
      if (deleteConfirmInput !== udisecode) {
        return res.status(400).json({
          success: false,
          message:
            "Incorrect code entered. Please enter the correct UDISE code to confirm deletion.",
        });
      }

      // Find admin by ID
      const admin = await adminSchema.findById(employid).select("email");

      // Return error if admin doesn't exist
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin account not found.",
        });
      }

      // Soft delete: mark admin as deleted, store timestamp
      admin.isDeleted = true;
      admin.deletedAt = new Date();
      await admin.save();

      res.status(200).json({
        success: true,
        message: "Admin account deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = adminProfileRouter;
