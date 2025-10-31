const express = require("express");
const studentHomeworkRouter = express.Router();
const homeworkSchema = require("../../../models/homework");
const homeworkSumbitSchema = require("../../../models/homeworkSumbit");
const {
  verifyTokenByRole,
} = require("../../../middleware/verifyToken/verify_token");

studentHomeworkRouter.get(
  "/get-homework/:role",
  verifyTokenByRole(),
  async (req, res,next) => {
    try {
      const { studentClassName } = req.query;
      const { role } = req.params;
      const { employid, className, udisecode } = req[role];
      const now = new Date();

      const homeworks = await homeworkSchema
        .find({
          udisecode: udisecode,
          className: studentClassName || className,
        })
        .sort({ createdAt: -1 })
        .lean();

      const validHomeworks = homeworks.filter(
        (hw) => new Date(hw.deadline) > now
      );

      if (homeworks.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No homework found for the selected date",
          data: [],
        });
      }

      res.status(200).json({
        success: true,
        message: "Homework fetched successfully",
        data: validHomeworks,
        time: now,
      });
    } catch (error) {
      next(error);
    }
  }
);

studentHomeworkRouter.post(
  "/post-homework/answer/:role",
  verifyTokenByRole(),
  async (req, res,next) => {
    try {
      const { role } = req.params;
      const { employid, className, udisecode } = req[role];
      const data = req.body;

      // ✅ 1. Check homework status
      if (data.status !== "active") {
        return res
          .status(400)
          .json("⚠️ This homework is expired and cannot be submitted.");
      }

      // ✅ 2. Check if answerText is valid
      if (
        !data.answer ||
        data.answer.length < 10 ||
        data.answer.length > 2000
      ) {
        return res
          .status(400)
          .json("Answer must be between 10 and 2000 characters.");
      }

      if (data.isAnswered === true) {
        const updatedAnswer = await homeworkSumbitSchema.findByIdAndUpdate(
          data.dbID,
          {
            answerText: data.answer,
          },
          { new: true }
        );
        return res.status(201).json({
          success: true,
          message: "✅ Answer submitted successfully.",
        });
      }
      // ✅ 3. Create answer entry
      const answer = new homeworkSumbitSchema({
        udisecode: udisecode,
        studentId: employid,
        className: className,
        teacherId: data.employid,
        homeworkId: data.homeworkId,
        answerText: data.answer,
        isAnswered: true,
      });

      const output = await answer.save();

      // 2. Update Homework document
      await homeworkSchema.findByIdAndUpdate(
        data.homeworkId,
        {
          homeworkSubmitId: output._id,
          isAnswered: true,
        },
        { new: true }
      );

      res.status(201).json({
        success: true,
        message: "✅ Answer submitted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
);

studentHomeworkRouter.get(
  "/get-homework/answer/:role/:id",
  verifyTokenByRole(),
  async (req, res,next) => {
    try {
      const { id } = req.params;

      const response = await homeworkSumbitSchema
        .findById(id)
        .select("answerText");

      if (!response) {
        return res
          .status(404)
          .json({ success: false, message: "Answer not found" });
      }

      res.status(200).json({ success: true, data: response });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = studentHomeworkRouter;
