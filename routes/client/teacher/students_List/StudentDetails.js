// Importing required modules
const express = require("express");
const studentControllerRouter = express.Router();
const examMarkSchema = require("../../../../models/examMark");
const attendanceSchema = require("../../../../models/attendance");
const studentSchema = require("../../../../models/student");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");
const redisClient = require("../../../../config/redis/redisClient");

// ==============================
// Route: GET /student/Mark
// Desc: Get marks of a student by studentId and exam date
// ==============================
studentControllerRouter.get(
  "/student/Mark/:role",
  verifyTokenByRole(), // Middleware to verify teacher's token
  async (req, res,next) => {
    try {
      const { role } = req.params;
      const { udisecode } = req[role]; // Extract udise code from authenticated teacher
      const { studentId, selectedDate } = req.query; // Extract query params

      const cacheKey = `eduspark_studentMark_${role}_${studentId}_${selectedDate}`;
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        return res.status(200).json(cached);
      }

      // Fetch exam marks from DB based on filters
      const response = await examMarkSchema.find({
        udisecode: udisecode,
        studentId: studentId,
        examDate: selectedDate,
      });

      await redisClient.set(cacheKey, JSON.stringify(response), { ex: 300 });

      res.send(response); // Send marks as response
    } catch (error) {
 next(error);
    }
  }
);

// ==============================
// Route: GET /student/attendance-history
// Desc: Get attendance history of a student for a specific date
// Access: Protected - Teacher only
// ==============================
studentControllerRouter.get(
  "/student/attendance-history/:role",
  verifyTokenByRole(), // Middleware to verify teacher's token
  async (req, res,next) => {
    try {
      const { role } = req.params;
      const { udisecode } = req[role]; // Extract udise code
      const { studentId, selectedDate } = req.query; // Extract query params

      const cacheKey = `eduspark_attendHistory_${role}_${studentId}_${selectedDate}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        // Send attendance data
        return res.status(200).json({
          cached,
        });
      }

      // Find attendance record for the student on the selected date
      const response = await attendanceSchema.findOne(
        {
          udiseCode: udisecode,
          date: selectedDate,
          "attendanceRecords.id": Number(studentId), // Match student ID in nested array
        },
        {
          teacherName: 1,
          className: 1,
          date: 1,
          attendanceRecords: { $elemMatch: { id: Number(studentId) } }, // Return only matched student's record
        }
      );

      // If no attendance record found
      if (
        !response ||
        !response.attendanceRecords ||
        response.attendanceRecords.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message: "Attendance not found for the given student and date.",
        });
      }
      await redisClient.set(cacheKey, JSON.stringify(response), { ex: 300 });
      // Send attendance data
      return res.status(200).json({
        response,
      });
    } catch (error) {
 next(error);
    }
  }
);


// Export router to use in main app
module.exports = studentControllerRouter;
