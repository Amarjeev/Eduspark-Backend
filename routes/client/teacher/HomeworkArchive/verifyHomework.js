const express = require("express");
const verifyHomeworkRouter = express.Router();
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

// 📦 Mongoose models
const homeworkSchema = require("../../../../models/homework");
const studentSchema = require("../../../../models/student");
const homeworkSumbitSchema = require("../../../../models/homeworkSumbit");

// 🔐 Middleware for role-based authentication
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");

// 📌 Route: Get homework list for verification (Teacher only)
verifyHomeworkRouter.get(
  "/teacher/homework-verification-list",
  verifyTokenByRole("teacher"), // ✅ Verify teacher token
  async (req, res,next) => {
    try {
      // 🧾 Extract filters from query
      const { selectedClass, selectedSubject, selectedDate } = req.query;
      const { udisecode } = req.teacher; // 🆔 Extract teacher's school code
      const now = new Date(); // 📅 Current timestamp

      // 📦 Build dynamic query
      const query = {
        udisecode, // 🎯 Always filter by UDISE code
      };

      // 🏷️ Add class filter only if selected
      if (selectedClass && selectedClass.trim() !== "") {
        query.className = selectedClass;
      }

      // 📅 Filter by specific date (if selected)
      if (selectedDate?.trim()) {
        const start = new Date(selectedDate);
        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999); // ⏰ End of day
        query.createdAt = { $gte: start, $lte: end };
      }

      // 📚 Add subject filter only if selected and not "undefined"
      if (selectedSubject !== "undefined" && selectedSubject.trim() !== "") {
        query.subject = selectedSubject;
      }

      // 🔍 Fetch all matching homework entries and student list in parallel
      const [homeworks, studentList] = await Promise.all([
        homeworkSchema
          .find(query)
          .sort({ createdAt: -1 }) // 🕒 Sort newest first
          .lean(),

        studentSchema
          .find({ udisecode, className: selectedClass }) // 🎯 Match students by class
          .select("name studentId profilePicUrl") // 🪪 Select only required fields
          .lean(),
      ]);

      // ⛔ Filter homeworks whose deadline has passed
      const validHomeworks = homeworks.filter(
        (hw) => new Date(hw.deadline) < now
      );

      // 📨 If no homework found, respond accordingly
      if (homeworks.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No homework found for the selected date",
          data: [],
        });
      }

      // ✅ Success response
      res.status(200).json({
        success: true,
        message: "Homework fetched successfully",
        data: validHomeworks,
        studentlist: studentList,
        time: now,
      });
    } catch (error) {
      next(error);
    }
  }
);

// 📌 Route: Get submitted answers or student list for a homework
verifyHomeworkRouter.get(
  "/teacher/homework-answer/:role",
  verifyTokenByRole(),
  async (req, res,next) => {
    try {
      const { role } = req.params;
      const { homeworkId, status, studentId } = req.query;
      const { udisecode } = req[role];

      if (!homeworkId || !status) {
        return res
          .status(400)
          .json({ message: "Missing required query parameters" });
      }

      if (status === "get-answerStudentList") {
        const response = await homeworkSumbitSchema
          .find({
            udisecode,
            homeworkId: new ObjectId(homeworkId),
          })
          .select("studentId")
          .lean();

        const studentIdArray = response.map((item) => item.studentId);

        return res.status(200).json({ studentIds: studentIdArray });
      } else if (status === "get-studentSumbitedAnswer") {
        try {
          const sumbitedHomework = await homeworkSumbitSchema
            .find({
              udisecode,
              _id: new ObjectId(homeworkId),
              studentId,
            })
            .lean();

          return res.status(200).json({ data: sumbitedHomework });
        } catch (innerError) {
          next(error);
        }
      }
    } catch (error) {
     next(error);
    }
  }
);

verifyHomeworkRouter.post(
  "/homework/verify-submission",
  verifyTokenByRole("teacher"),
  async (req, res,next) => {
    try {
      const { udisecode } = req.teacher;
      const data = req.body;
      const { homeworkId, answerStatus, teacherComment } = data;

      // 🔒 Validate comment
      const trimmedComment = teacherComment?.trim() || "";

      if (trimmedComment.length > 300) {
        return res.status(400).json({
          message: "Comment is too long. Maximum 300 characters allowed.",
        });
      }

      if (trimmedComment.length < 10) {
        return res.status(400).json({
          message: "Comment is too short. Minimum 10 characters required.",
        });
      }

      if (
        !answerStatus ||
        !["wrong", "correct", "pending"].includes(answerStatus)
      ) {
        return res.status(400).json({
          message: "Please select if the answer is approved or rejected.",
        });
      }

      // ✅ Update homework submission
      const response = await homeworkSumbitSchema.findByIdAndUpdate(
        homeworkId,
        {
          $set: {
            teacherComment: trimmedComment,
            teacherVerified: true,
            VerifiedanswerStatus: answerStatus,
          },
        },
        { new: true }
      );

      if (!response) {
        return res
          .status(404)
          .json({ message: "Homework submission not found." });
      }

      return res.status(200).json({
        message: "✅ Homework answer verified successfully.",
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = verifyHomeworkRouter;
