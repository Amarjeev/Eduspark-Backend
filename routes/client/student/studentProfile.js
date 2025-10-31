const express = require("express");
const studentProfileRouter = express.Router();
const studentSchema = require("../../../models/student");
const examMarkSchema = require("../../../models/examMark");
const {
  verifyTokenByRole,
} = require("../../../middleware/verifyToken/verify_token");

studentProfileRouter.get(
  "/profile/:id/:studentId",
  verifyTokenByRole("parents"),
  async (req, res,next) => {
    // 🧑‍🎓 Get parent details from verified token
    const { email, udisecode } = req.parents;
    const { id, studentId } = req.params;

    try {
      // Run both DB queries in parallel
      const [studentProfile, studentMarks] = await Promise.all([
        studentSchema.findOne({ _id: id, udisecode: udisecode }),
        examMarkSchema.find({ studentId: studentId, udisecode: udisecode }),
      ]);

      // Handle case if student not found
      if (!studentProfile) {
        return res.status(404).json({ message: "Student profile not found" });
      }

      res.json({
        profile: studentProfile,
        marks: studentMarks,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = studentProfileRouter;
