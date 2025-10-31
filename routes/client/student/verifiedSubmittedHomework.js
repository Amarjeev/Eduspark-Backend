const express = require("express");
const verifiedSubmittedHomeworkRouter = express.Router();
const homeworkSchema = require("../../../models/homework");
const homeworkSumbitSchema = require("../../../models/homeworkSumbit");
const {
  verifyTokenByRole,
} = require("../../../middleware/verifyToken/verify_token");

// 📘 Route to verify and fetch submitted homework based on role (student/teacher)
verifiedSubmittedHomeworkRouter.get(
  "/verify-submitted-homework/:role",
  verifyTokenByRole(), // 🔐 Middleware to verify token and role-based access
  async (req, res, next) => {
    try {
      // 🌐 Extract role from route parameter
      const { role } = req.params;

      // 🧾 Extract query filters: class, student ID (if from parent), and selected date
      const { selectedClass, childrenId, selectedDate } = req.query;

      // 🧑‍🏫 Extract info based on role (student/teacher/parent)
      const { udisecode, className, employid } = req[role]; // ⚙️ Dynamic access to role-based data
      const now = new Date(); // 📅 Current timestamp

      // 🛠️ Build dynamic query for submitted homework
      const query = {
        udisecode, // 🏫 School identifier
        className: className || selectedClass, // 🎓 Class from token or query
        studentId: employid || childrenId // 🆔 Student ID from token or query
      };

      // 📤 Fetch submitted homework documents matching the query
      const response = await homeworkSumbitSchema
        .find(query)
        .sort({ createdAt: -1 }) // 🕒 Sort by latest
        .select('homeworkId -_id') // 🧹 Only keep homeworkId
        .lean();

      // 🧾 Extract homework IDs from submissions
      const homeworkIds = response.map(item => item.homeworkId);

      // 📥 Fetch actual homework questions using the homework IDs
      const homeworkQuestions = await homeworkSchema
        .find({ _id: { $in: homeworkIds } })
        .sort({ createdAt: -1 }) // 🕒 Sort by latest
        .lean();

      // 🧹 Filter homeworks created in the last 30 days
      const validHomeworks = homeworkQuestions.filter((hw) => {
        const createdDate = new Date(hw.createdAt);
        const diffInTime = now.getTime() - createdDate.getTime();
        const diffInDays = diffInTime / (1000 * 60 * 60 * 24); // ⏱️ Convert ms to days
        return diffInDays <= 30 && diffInDays >= 0;
      });

      // 📦 Return filtered homework data with time and studentId
      res.status(200).json({
        success: true,
        message: "Homework fetched successfully",
        data: validHomeworks,
        time: now,
        studentId: employid
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = verifiedSubmittedHomeworkRouter;
