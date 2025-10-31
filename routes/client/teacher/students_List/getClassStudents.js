const express = require("express");
const getClassStudentsRouter = express.Router();
const studentSchema = require("../../../../models/student");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");
const redisClient = require("../../../../config/redis/redisClient");

// 📚 Get students for a specific class, only for verified teachers
getClassStudentsRouter.get(
  "/student/getClassStudents/:className",
  verifyTokenByRole("teacher"),
  async (req, res,next) => {
    const { className } = req.params;
    const { udisecode } = req.teacher;

    try {
      // 🏫 Query student data from MongoDB
      const response = await studentSchema
        .find({ udisecode: udisecode, className: className })
        .select("name studentId className gender")
        .lean();

      // ⚠️ If no students found, return 404
      if (!response || response.length === 0) {
        return res.status(404).json({
          message: `🙁 No students found for class "${className}".`,
        });
      }

      // ✅ Send student data
      res.send(response);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = getClassStudentsRouter;
