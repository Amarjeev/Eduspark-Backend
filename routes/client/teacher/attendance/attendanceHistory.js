const express = require("express");
const attendanceHistoryRouter = express.Router();
const attendanceSchema = require("../../../../models/attendance");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");

// Route to get attendance history
attendanceHistoryRouter.get(
  "/attendance/history",
  verifyTokenByRole("teacher"),
  async (req, res,next) => {
    try {
      const { date, className, status } = req.query;
      const { udisecode } = req.teacher;

      // Fetch attendance records from MongoDB
      const response = await attendanceSchema
        .find({ udiseCode: udisecode, className: className, date: date })
        .select(`teacherName date attendanceRecords className -_id`)
        .lean();

      if (response.length === 0) {
        return res.status(404).json({
          responseMsg:
            "⚠️ No attendance records found for the selected date and class.",
        });
      }

      // If status is 'All', return the full response
      if (status === "All") {
        res.send(response);
        return;
      }

      // If specific status is provided (e.g., 'Present'), filter and respond
      if (status) {
        const teacherName = response[0].teacherName;
        const date = response[0].date;

        // Create a combined object with teacher and date info
        const combined = {
          id: 1,
          date,
          teacherName,
        };

        // Filter student records by status (e.g., Present only)
        const attendanceRecords = response[0].attendanceRecords;
        const attendanceData = attendanceRecords.filter(
          (s) => s.status === status
        );
        res.send({
          teacherName: combined.teacherName,
          date: combined.date,
          className: className,
          attendanceRecords: attendanceData,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = attendanceHistoryRouter;
