const express = require("express");
const assignHomeworkRouter = express.Router();
const HomeworkSchema = require("../../../../models/homework");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");
const redisClient = require("../../../../config/redis/redisClient");
const validateHomework = require("../../../../validators/validateHomework");

assignHomeworkRouter.post(
  "/homework/assign",
  verifyTokenByRole("teacher"),
  validateHomework,
  async (req, res,next) => {
    try {
      const { className, subject, createdAt, deadline, content } = req.body;
      const { udisecode, employid, name } = req.teacher;

      const createdDate = new Date(createdAt);
      const deadlineDate = new Date(deadline);

      // Validate dates
      if (isNaN(createdDate) || isNaN(deadlineDate)) {
        return res
          .status(400)
          .json({ error: "Invalid date format in createdAt or deadline." });
      }

      const newHomework = new HomeworkSchema({
        udisecode,
        name,
        employid,
        className,
        subject,
        content,
        createdAt: createdDate,
        deadline: deadlineDate,
      });

      await newHomework.save();

      return res
        .status(201)
        .json({ message: "✅ Homework assigned successfully." });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = assignHomeworkRouter;
