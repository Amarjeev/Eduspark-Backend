const express = require("express");
const teacherDutyScheduleRouter = express.Router();
const timetableSchema = require("../../../../models/timetable");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");

// Middleware to protect the route (if you're using token-based access)

// ✅ Route to get today's teacher duty schedule
teacherDutyScheduleRouter.get(
  "/teachers/duties/today",
  verifyTokenByRole("teacher"),
  async (req, res,next) => {
    const { udisecode, employid } = req.teacher;
    try {
      const response = await timetableSchema.aggregate([
        {
          $match: {
            udisecode: udisecode,
            "entries.teacherId": employid,
          },
        },
        {
          $project: {
            entries: {
              $filter: {
                input: "$entries",
                as: "entry",
                cond: {
                  $eq: ["$$entry.teacherId", employid],
                },
              },
            },
          },
        },
      ]);

      res.status(200).json(response[0]?.entries || []);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = teacherDutyScheduleRouter;
