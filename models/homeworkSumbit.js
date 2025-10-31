const mongoose = require("mongoose");

const studentHomeworkAnswerSchema = new mongoose.Schema(
  {
    udisecode: { type: String, required: true, index: true },
    studentId: { type: String, required: true },
    teacherId: { type: String, required: true },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    homeworkId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    answerText: {
      type: String,
      default: "",
      minlength: [10, "Answer must be at least 10 characters long."],
      maxlength: [2000, "Answer cannot exceed 2000 characters."],
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
    teacherVerified: { type: Boolean, default: false },
    teacherComment: { type: String, default: "", trim: true },
    VerifiedanswerStatus: {
      type: String,
      enum: ["pending", "wrong", "correct"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "StudentHomeworkAnswer",
  studentHomeworkAnswerSchema
);
