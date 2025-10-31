// Import necessary modules
const express = require("express");
const jwt = require("jsonwebtoken");
const teacherSignup = express.Router();
const validateTeacherForm = require("../../../../validators/validateTeacherForm");
const teacherSchema = require("../../../../models/teacher");
const teacherRegistrationEmailTemplate = require("../../../../utils/emails_ui/teacherRegEmailTemplate");
const { sendEmail } = require("../../../../utils/email_Service/sendEmail");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");

// POST route for teacher signup under Admin panel
teacherSignup.post(
  "/admin/teachers/signup",
  verifyTokenByRole("admin"),
  validateTeacherForm("create"),
  async (req, res,next) => {
    try {
      const { udisecode, schoolname } = req.admin;
      // Extract user data from request body
      const userdata = req.body;
      const existingTeacher = await teacherSchema.findOne({
        email: userdata.email,
        udisecode: udisecode, // optionally include school-wise check
      });
      if (existingTeacher) {
        return res.status(400).json({
          success: false,
          field: "email",
          message: "Email already exists. Please use a different email.",
        });
      }

      // Hash the plain text password before saving to database (for security)
      const hashedPassword = await bcrypt.hash(userdata.password, 10);

      // Prepare teacher data to store in the database
      const teacherData = new teacherSchema({
        name: userdata.name,
        email: userdata.email,
        password: hashedPassword,
        phonenumber: userdata.phonenumber,
        subject: userdata.subject,
        department: userdata.department,
        employId: userdata.employId,
        govidtype: userdata.govidtype,
        govidnumber: userdata.govidnumber,
        udisecode: udisecode,
        schoolname: schoolname,
      });

      // Save the teacher data into MongoDB
      await teacherData.save();

      const { html } = teacherRegistrationEmailTemplate({
        name: userdata.name,
        email: userdata.email,
        password: userdata.password,
        subject: userdata.subject,
        department: userdata.department,
        idCode: userdata.employId,
        udisecode: udisecode,
        mobileNumber: userdata.phonenumber,
        schoolName: schoolname,
      });

      await sendEmail(
        userdata.email,
        "Welcome to Eduspark - Your Teacher Account Details",
        "`Welcome to Eduspark!",
        html
      );

      // Send success response after saving teacher
      return res
        .status(201)
        .json({ message: "Teacher registered successfully", status: true });
    } catch (error) {
      next(error);
    }
  }
);

// Export the teacherSignup router to be used in main app
module.exports = teacherSignup;
