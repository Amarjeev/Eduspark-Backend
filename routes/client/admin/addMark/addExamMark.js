const express = require("express");
const examMarkSchema = require("../../../../models/examMark");
const {
  verifyTokenByRole,
} = require("../../../../middleware/verifyToken/verify_token");
const studentSchema = require("../../../../models/student");
const SubjectConfig = require("../../../../models/subjectConfig");
const validateExamMarks = require("../../../../validators/validateExamMarks");
const addExamMarkRoute = express.Router();

addExamMarkRoute.post(
  "/add-marks/:role",
  verifyTokenByRole(),
  async (req, res,next) => {
    try {
      const { studentId } = req.body;
      const { udisecode } = req.admin;

      if (!studentId || studentId.length !== 6) {
        return res
          .status(400)
          .json({ message: "❌ Student ID must be exactly 6 digits" });
      }

      const response = await studentSchema
        .findOne({ udisecode, studentId })
        .select("name className -_id");
      //Subject Fentching
      const subjectData = await SubjectConfig.find({ udisecode }).select(
        "subjects -_id"
      );
      // Use flatMap directly on the array of objects
      const flatSubjects = subjectData.flatMap((item) => item.subjects);

      // ✅ Return response
      if (!response) {
        return res
          .status(404)
          .json({ success: false, message: "❌ Student not found" });
      }
      if (!subjectData) {
        return res
          .status(404)
          .json({ success: false, message: "❌ Subject not found" });
      }

      return res
        .status(200)
        .json({ success: true, student: response, subject: flatSubjects });
    } catch (error) {
      next(error);
    }
  }
);

addExamMarkRoute.post(
  "/add-marks/submit/:role",
  verifyTokenByRole(),
  validateExamMarks,
  async (req, res,next) => {
    try {
      const { udisecode } = req.admin; // From token
      const { examMark } = req.body; // Submitted data

      // Create a new document with udisecode at top level
      const newExamMark = new examMarkSchema({
        udisecode: udisecode,
        studentId: examMark.studentId,
        examName: examMark.examName,
        examDate: examMark.examDate,
        marks: examMark.marks,
      });

      // Save to database
      await newExamMark.save();

      res.status(201).json({ message: "Exam marks submitted successfully!" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = addExamMarkRoute;
