const express = require("express");
const editTeacherProfile = express.Router();
const teacherSchema = require("../../../../models/teacher");
const validateTeacherForm = require("../../../../validators/validateTeacherForm");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");
const bcrypt = require("bcrypt");

// ✅ GET: Retrieve teacher data (all or specific by ID)
editTeacherProfile.get(
  "/admin/teachers/:status",
  verifyTokenByRole("admin"), // Admin authentication middleware
  async (req, res,next) => {
    const { udisecode } = req.admin;
    const { status } = req.params;

    try {
      if (status === "All") {
        // ✅ Get all teachers in the school
        const response = await teacherSchema
          .find({
            udisecode,
            status: { $ne: "deleted" }, // ❌ Ignore teachers marked as 'delete'
          })
          .select(
            "employId subject phonenumber name profilePicUrl email status"
          )
          .lean();

        return res.status(200).send(response);
      } else {
        // ✅ Get specific teacher by ID
        const response = await teacherSchema
          .find({ udisecode, _id: status })
          .select("-password");
        return res.status(200).send(response);
      }
    } catch (error) {
      next(error);
    }
  }
);

// ✅ PUT: Update teacher profile (admin)
editTeacherProfile.put(
  "/admin/update-teacher/:id",
  verifyTokenByRole("admin"), // Admin authentication middleware
  validateTeacherForm("update"), // Validate request body
  async (req, res,next) => {
    try {
      const { id } = req.params;
      const teacherData = req.body;

      // ✅ Update teacher by ID
      const response = await teacherSchema.findByIdAndUpdate(
        id,
        {
          $set: {
            name: teacherData.name,
            email: teacherData.email,
            phonenumber: teacherData.phonenumber,
            subject: teacherData.subject,
            department: teacherData.department,
            govidtype: teacherData.govidtype,
            govidnumber: teacherData.govidnumber,
          },
        },
        { new: true } // Return updated document
      );

      if (!response) {
        return res
          .status(404)
          .json({ success: false, message: "Teacher not found" });
      }

      // ✅ Success response
      res.status(200).json({
        success: true,
        message: "Teacher profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// ✅ DELETE: Delete teacher by ID (Soft Delete)
editTeacherProfile.delete(
  "/admin/delete-teacher/:id/:status",
  verifyTokenByRole("admin"), // 🔒 Admin authentication middleware
  async (req, res,next) => {
    try {
      const { id, status } = req.params;

      // ✅ Soft Delete Logic:
      // Set isDeleted = true for permanent soft-delete
      // status is used for tracking/decorative purpose (e.g., "deleted", "inactive")
      const deleted = await teacherSchema.findByIdAndUpdate(
        id,
        {
          isDeleted: true, // 🗑️ Marks teacher as deleted but retains data
          status, // 🟡 Optional status for admin visibility
        },
        { new: true }
      );

      // ❌ If teacher not found
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      // ✅ Success: Teacher soft-deleted
      res.status(200).json({
        success: true,
        message: "Teacher account deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// ✅ PUT: Teacher updates profile field (email, phone, password, etc.)
editTeacherProfile.put(
  "/teacher-avatar/update-teacher-profile/:id/:item",
  verifyTokenByRole("teacher"), // Teacher authentication middleware
  async (req, res,next) => {
    try {
      const { id, item } = req.params;
      const { udisecode } = req.teacher;
      const teacherData = req.body?.tempValue;

      // ✅ Handle email and phone updates
      if (item === "email" || item === "phonenumber") {
        const trimmedData = teacherData?.trim();

        if (!trimmedData) {
          return res
            .status(400)
            .json({
              error: `${
                item === "email" ? "Email" : "Phone number"
              } is required.`,
            });
        }

        if (item === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(trimmedData)) {
            return res.status(400).json({ error: "Email is invalid." });
          }
        }

        if (item === "phonenumber") {
          const phone = trimmedData.replace(/[\s-]/g, "");
          const phoneRegex = /^\d{7,15}$/;
          if (!phoneRegex.test(phone)) {
            return res.status(400).json({
              error: "Phone number must be 7 to 15 digits (no country code).",
            });
          }
        }
      }

      // ✅ Handle password update
      else if (item === "password") {
        const { current, new: newPassword, confirm } = teacherData || {};

        // Validate new password
        if (!newPassword || newPassword.trim() === "") {
          return res.status(400).json({ error: "New password is required." });
        }

        if (newPassword.length < 5 || newPassword.length > 10) {
          return res
            .status(400)
            .json({ error: "New password must be 5–10 characters long." });
        }

        if (!confirm || confirm !== newPassword) {
          return res.status(400).json({ error: "New passwords do not match." });
        }

        if (!current || current.trim() === "") {
          return res
            .status(400)
            .json({ error: "Current password is required." });
        }

        // ✅ Check current password against DB
        const teacher = await teacherSchema
          .findOne({ _id: id, udisecode })
          .select("+password");

        if (!teacher) {
          return res.status(404).json({ error: "Teacher not found." });
        }

        const isMatch = await bcrypt.compare(current, teacher.password);

        if (!isMatch) {
          return res
            .status(401)
            .json({ error: "Current password is incorrect." });
        }

        // ✅ Password matched — update to new password
        teacher.password = await bcrypt.hash(newPassword, 10);
        await teacher.save();

        return res
          .status(200)
          .json({ success: true, message: "Password updated successfully." });
      }

      // ✅ Update other editable fields
      const response = await teacherSchema.findByIdAndUpdate(
        id,
        { $set: { [item]: teacherData } },
        { new: true }
      );

      if (!response) {
        return res
          .status(404)
          .json({ success: false, message: "Teacher not found" });
      }

      // ✅ Return success message
      res.status(200).json({
        success: true,
        message: "Teacher profile updated successfully",
      });
    } catch (error) {
      // ✅ Handle duplicate email conflict
      if (error.code === 11000 && error.message.includes("email")) {
        return res.status(409).json({
          error:
            "The provided email address is already registered to another teacher. Please use a different email.",
        });
      }
      next(error);
    }
  }
);

module.exports = editTeacherProfile;
