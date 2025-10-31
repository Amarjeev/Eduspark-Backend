const express = require("express");
const adminSignupRoute = express.Router();
const validateAdminForm = require("../../../../validators/validateAdminForm");
const adminSchema = require("../../../../models/admin");
const adminEmailTemplate = require("../../../../utils/emails_ui/adminEmailTemplate");
const { sendEmail } = require("../../../../utils/email_Service/sendEmail");
const bcrypt = require("bcrypt");

adminSignupRoute.post("/admin/signup", validateAdminForm, async (req, res ,next) => {
  try {
    const data = req.body;

    // 1. Check for duplicate user (by UDISE code + email)
    const existingAdmin = await adminSchema
      .findOne({
        udisecode: data.udisecode,
        email: data.email,
      })
      .lean();

    if (existingAdmin) {
      return res.status(409).json({
        success: "duplicate",
        message: "An admin with this UDISE code and email already exists.",
      });
    }

    // 2. Encrypt password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Create admin object
    const newAdmin = new adminSchema({
      role: data.role || "admin",
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phonenumber: data.phoneNumber,
      schoolType: data.schoolType,
      udisecode: data.udisecode,
      schoolname: data.schoolname,
      address: data.address,
      state: data.state,
    });

    // 4. Save to DB
    await newAdmin.save();
    let idType;
    if (data.schoolType === "Government") {
      idType = "UDISE";
    } else {
      idType = "Institute";
    }

    const { html } = adminEmailTemplate(
      data.name,
      data.email,
      data.udisecode,
      idType
    );

    await sendEmail(
      data.email,
      "🎉 Welcome to EduSpark - Your Admin Account Details",
      `Welcome to EduSpark, ${data.name}! Your admin account has been successfully created.`,
      html
    );

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully.",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = adminSignupRoute;
