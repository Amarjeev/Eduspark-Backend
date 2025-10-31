// Import necessary modules
const express = require("express");
const validateStudentForm = require("../../../../validators/validateStudentForm");
const studentSignupRoute = express.Router();
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");
const studentSchema = require("../../../../models/student");
const bcrypt = require("bcryptjs");
const studentRegEmailTemplate = require("../../../../utils/emails_ui/studentRegEmailTemplate");
const { sendEmail } = require("../../../../utils/email_Service/sendEmail");

// Utility function to generate a dummy password based on name, DOB, and student ID
function generateDummyPassword(name, dob, studentId) {
  const namePart = name?.substring(0, 2) || "St"; // First 2 letters of name
  const dobPart = (dob?.replace(/-/g, "") || "00000000").slice(-4); // Last 4 digits of DOB (YYYYMMDD)
  const idPart = studentId?.slice(-2) || "00"; // Last 2 digits of student ID
  return `${namePart}${dobPart}${idPart}`; // Final password pattern
}

// ============================================
// POST API => Register New Student
// Endpoint: /admin/student/signup
// Middleware: verifyClientToken, validateStudentForm
// ============================================

studentSignupRoute.post(
  "/admin/student/signup",
  verifyTokenByRole("admin"),
  validateStudentForm,
  async (req, res,next) => {
    try {
      const { udisecode, schoolname } = req.admin;
      const studentData = req.body;

      // Generate and hash dummy password for student
      const rawPassword = generateDummyPassword(
        studentData.name,
        studentData.dob,
        studentData.studentId
      );
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      // Trim all string fields in student data
      Object.keys(studentData).forEach((key) => {
        const value = studentData[key];
        if (typeof value === "string" && value.trim !== undefined) {
          studentData[key] = value.trim();
        }
      });

      // Create new student document and save to MongoDB
      const data = new studentSchema({
        udisecode,
        schoolname,
        name: studentData.name,
        password: hashedPassword,
        email: studentData.parentEmail,
        authorizedPersonName: studentData.authorizedPersonName,
        role: studentData.role,
        className: studentData.className,
        dob: studentData.dob,
        gender: studentData.gender,
        govIdType: studentData.govIdType,
        govIdNumber: studentData.govIdNumber,
        studentId: studentData.studentId,
        address: studentData.address,
        pincode: studentData.pincode,
        state: studentData.state,
        mobileNumber: studentData.mobileNumber,
        secondaryMobileNumber: studentData.secondaryMobileNumber,
        admissionDate: studentData.admissionDate,
      });

      await data.save();

      // Send registration email with login credentials
      const { html } = studentRegEmailTemplate({
        name: studentData.name,
        parentEmail: studentData.parentEmail,
        password: rawPassword,
        schoolname: schoolname,
        className: studentData.className,
        role: studentData.role,
        studentId: studentData.studentId,
        mobileNumber: studentData.mobileNumber,
        secondaryMobileNumber: studentData.secondaryMobileNumber,
      });

      await sendEmail(
        studentData.parentEmail,
        "🎓 Eduspark - Student Account Created",
        "Welcome to Eduspark! Your student account has been created.",
        html
      );

      // Send success response
      res.status(201).json({
        message: "Student registered successfully",
        status: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Export the route module
module.exports = studentSignupRoute;
