// models/classTimetable.js
const mongoose = require("mongoose");

const SingleEntrySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    time: { type: String, required: true },
    subject: { type: String, required: true },
    teacherName: { type: String, required: true },
     className: { type: String, required: true },
    teacherId: {
      type: String,
      required: true,
      match: /^\d{8}$/,
    },
  },
  { _id: true }
);


const ClassTimetableSchema = new mongoose.Schema(
  {
    udisecode: { type: String, required: true, index: true },
    schoolname: { type: String, required: true },
    className: { type: String, required: true },
    entries: [SingleEntrySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClassTimetable", ClassTimetableSchema);
