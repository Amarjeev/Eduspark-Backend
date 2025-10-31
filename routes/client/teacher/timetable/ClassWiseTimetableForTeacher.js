const express = require("express");
const ClassWiseTTTeacherRouter = express.Router();
const timetableSchema = require("../../../../models/timetable");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");
const redisClient = require("../../../../config/redis/redisClient");

ClassWiseTTTeacherRouter.get(
  "/teacher/timetable/:className",
  verifyTokenByRole("teacher"),
  async (req, res,next) => {
    try {
      const { className } = req.params;
      const { udisecode } = req.teacher;

      const response = await timetableSchema
        .find({ udisecode: udisecode, className: className })
        .select("entries -_id")
        .lean();

      if (!response || response.length === 0) {
        return res
          .status(404)
          .json({
            message: "No timetable found for this class.",
            emptyData: true,
          });
      }

      res.send(response[0].entries);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = ClassWiseTTTeacherRouter;
