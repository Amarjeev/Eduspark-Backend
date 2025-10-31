const express = require("express");
const updateStudentAttendanceRouter = express.Router();
const attendanceSchema = require("../../../../models/attendance");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");
const validateAttendanceForm = require("../../../../validators/validateAttendance");

// 📝 Route: Submit student attendance by teacher
// 🔒 Protected Route - Only accessible by users with "teacher" role
updateStudentAttendanceRouter.post(
  "/teacher/updateStudentAttendance",
  verifyTokenByRole("teacher"), // 🔐 Middleware to verify JWT and role
  validateAttendanceForm, // ✅ Custom validator for attendance data
  async (req, res,next) => {
    try {
      // 📦 Destructure submitted fields from request body
      const {
        teacherId,
        teacherName,
        date,
        className,
        attendanceRecords,
        udisecode,
      } = req.body;

      // 🔁 Check for duplicate attendance already submitted
      const checkDuplicate = await attendanceSchema
        .find({
          udisecode: udisecode,
          date: date,
          className: className,
        })
        .lean();

      // ⚠️ If record exists for this class, date, and school, reject submission
      if (checkDuplicate.length > 0) {
        return res.status(409).json({
          date: date,
          duplicate: true,
          message:
            "⚠️ This attendance record already exists for the selected class and date.",
        });
      }

      // 🏗️ Construct a new attendance document
      const newAttendance = new attendanceSchema({
        udisecode: udiseCode,
        teacherId,
        teacherName,
        date,
        className,
        attendanceRecords,
      });

      // 💾 Save to MongoDB
      await newAttendance.save();

      // ✅ Respond with success
      return res
        .status(201)
        .json({ message: "Attendance saved successfully!" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = updateStudentAttendanceRouter;
