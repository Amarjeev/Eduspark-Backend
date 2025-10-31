const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema(
  {
    udisecode: { type: String, required: true ,index: true },
    employid: { type: String, required: true },
    name: { type: String, required: true },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 1000,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    homeworkSubmitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HomeworkSubmit",
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Homework", homeworkSchema);
