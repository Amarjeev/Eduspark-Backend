const mongoose = require("mongoose");

// 📘 Subdocument schema for each subject's mark info
const MarkSchema = new mongoose.Schema(
  {
    subject: String,       // Name of the subject
    mark: Number,          // Marks obtained
    totalMark: Number,     // Total possible marks for the subject
    grade: String,         // Grade for the subject (optional, e.g., A, B, etc.)
  },
  { _id: true }            // Generate _id for each mark entry
);

// 📘 Main ExamMark schema
const ExamMarkSchema = new mongoose.Schema(
  {
    udisecode: {
      type: String,
      index: true,         // Index for faster queries on UDISE code
    },
    studentId: {
      type: String,        // Reference ID to the student
      required: true,
    },
    examName: {
      type: String,        // Name of the exam (e.g., Mid Term, Final)
      required: true,
    },
    examDate: {
      type: String,        // Date of exam (use Date type if you want real date)
      required: true,
    },
    marks: [MarkSchema],   // Array of marks per subject
  },
  {
    timestamps: true,      // Auto-manage createdAt and updatedAt
  }
);

module.exports = mongoose.model("ExamMark", ExamMarkSchema);
