// // 📦 Import required modules
const express = require("express");
const parentSignupRouter = express.Router();
const parentSchema = require("../../../../models/parent");
const studentSchema = require("../../../../models/student");
const validateParentForm = require("../../../../validators/validateParentForm");
const bcrypt = require("bcrypt");
const EmailTemplate = require("../../../../utils/emails_ui/welcomeMessage");
const { sendEmail } = require("../../../../utils/email_Service/sendEmail");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");
// 📌 POST Route: Handle Parent Signup
parentSignupRouter.post(
  "/parent/signup",
  validateParentForm,
  async (req, res,next) => {
    try {
      const { name, email, mobileNumber, password, udisecode } = req.body;

      const existeAccount = await parentSchema
        .findOne({
          email: email,
          udisecode: udisecode,
        })
        .lean();

      if (existeAccount) {
        return res.status(400).json({
          success: "account-existe",
          message: "An account with this email already exists for this school.",
        });
      }

      // 🔍 Validate that the mobile number exists in student records for the given UDISE code
      const validNumber = await studentSchema
        .findOne({
          udisecode: udisecode,
          $or: [
            { mobileNumber: mobileNumber },
            { secondaryMobileNumber: mobileNumber },
          ],
        })
        .select("schoolname")
        .lean();

      if (!validNumber) {
        return res.status(400).json({
          success: "Mob-Notfound",
          message:
            "📵 Mobile number not found. Please use the number registered during admission.",
        });
      }

      // 🔐 Hash the parent's password before storing
      const hashedPassword = await bcrypt.hash(password, 10);

      // 💾 Create new parent record
      const response = new parentSchema({
        name,
        email,
        mobileNumber,
        udisecode,
        password: hashedPassword,
        schoolname: validNumber.schoolname,
      });

      await response.save();

      const { html } = EmailTemplate({
        name,
        schoolName: validNumber.schoolname,
      });

      await sendEmail(
        email,
        `🎉 Welcome to ${validNumber.schoolname} - Eduspark Parent Portal`,
        `Dear Parent,\n\nWelcome to ${validNumber.schoolname}.\n\nYou have successfully signed up for the Eduspark Parent Portal. We're excited to have you onboard!\n\nRegards,\n${validNumber.schoolname} Team`,
        html
      );

      // ✅ Return success response
      return res.status(201).json({
        success: true,
        message: "✅ Signup successful. Welcome email sent!",
      });
    } catch (error) {
      next(error);
    }
  }
);

// Edit parent data
parentSignupRouter.post(
  "/update/parent-profile",
  verifyTokenByRole("parent"),
  async (req, res,next) => {
    try {
      let userData = req.body;
      const { _id } = req.parent;

      // Trim all string values in userData
      for (const key in userData) {
        if (typeof userData[key] === "string") {
          userData[key] = userData[key].trim();
        }
      }

      // Field-wise validations
      for (const [field, value] of Object.entries(userData)) {
        // -----------------------
        // Name validation
        if (field === "name") {
          if (!value)
            return res
              .status(400)
              .json({ message: "Please fill in the name field" });
          if (!/^[A-Za-z\s]+$/.test(value)) {
            return res
              .status(400)
              .json({ message: "Name can only contain letters and spaces" });
          }
          if (value.length < 3)
            return res
              .status(400)
              .json({ message: "Name must be at least 3 characters" });
          if (value.length > 30)
            return res
              .status(400)
              .json({ message: "Name must not exceed 30 characters" });
        }

        // -----------------------
        // Email validation
        if (field === "email") {
          if (!value)
            return res.status(400).json({ message: "Please enter your email" });
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(value)) {
            return res
              .status(400)
              .json({ message: "Please enter a valid email address" });
          }
          if (value.length > 254) {
            return res
              .status(400)
              .json({ message: "Email must not exceed 254 characters" });
          }
        }

        // -----------------------
        // Mobile number validation
        if (field === "mobileNumber") {
          if (!value)
            return res
              .status(400)
              .json({ message: "Mobile number is required" });
          if (!/^[6-9]\d{9}$/.test(value)) {
            return res.status(400).json({
              message:
                "Mobile number must be a valid 10-digit Indian number starting with 6-9",
            });
          }
        }
      }

      // ✅ Check for duplicate email (only if email is being updated)
      if (userData.email) {
        const existingParent = await parentSchema.findOne({
          email: userData.email,
          _id: { $ne: _id },
        });

        if (existingParent) {
          return res.status(400).json({
            success: "E-Duplicate",
            message: "Email already exists. Please use a different one.",
          });
        }
      }

      // ✅ Proceed with update
      const updatedParent = await parentSchema.findByIdAndUpdate(
        _id,
        { $set: userData },
        { new: true }
      );

      if (!updatedParent) {
        return res.status(404).json({ message: "Parent not found" });
      }

      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = parentSignupRouter;
