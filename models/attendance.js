// 📦 models/Attendance.js

const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Present", "Absent"],
    required: true,
  },
  comment: {
    type: String,
    default: "",
  },
});

const attendanceSchema = new mongoose.Schema({
    udisecode: {
    type: String,
    required: true,
    index: true
  },
  teacherId: {
    type: String,
    required: true,
  },
  teacherName: {
    type: String,
    required: true,
  },
  date: {
    type: String, // You can use `Date` if using real date objects
    required: true,
  },
  className: {
    type: String,
    required: true,
  },
  attendanceRecords: {
    type: [attendanceRecordSchema],
    required: true,
  },
});

// 📤 Export the model
module.exports = mongoose.model("Attendance", attendanceSchema);
